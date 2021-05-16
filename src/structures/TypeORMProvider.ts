import { Provider } from 'discord-akairo';
import GuildSettings from '../models/GuildSettings';
import { DeleteResult, InsertResult, Repository } from 'typeorm';
import { GuildSettingsJSON } from '../types';
import { defaultGuildSettings } from '../utils/constants';
import { Logger } from 'tslog';
import EventEmitter from 'events';
import { noop } from '../utils';

export enum TypeOrmProviderEvents {
  SettingChanged = 'settingChanged',
  AllSettingsChanged = 'allSettingsChanged',
  SettingDeleted = 'settingDeleted',
  ConfigCleared = 'configCleared',
  SettingsInit = 'settingsInit',
}

export default class TypeORMProvider extends Provider {
  public ['constructor']: typeof TypeORMProvider;
  private readonly log: Logger;
  public readonly eventEmitter = new EventEmitter();

  public constructor(private readonly repo: Repository<GuildSettings>, log: Logger) {
    super();
    this.log = log.getChildLogger({
      name: 'TypeORMProvider',
      prefix: ['[TypeORMProvider]'],
    });
  }

  public async init(): Promise<void> {
    const settings = await this.repo.find();
    for (const setting of settings) {
      this.items.set(setting.config_set, setting.settings);
    }

    this.eventEmitter.emit(TypeOrmProviderEvents.SettingsInit);
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  public get<K extends keyof GuildSettingsJSON, T = undefined>(
    key: K,
    configSet = 0
  ): GuildSettingsJSON[K] | T {
    const configKey = this.constructor.getItemsPrefix(configSet);
    this.log.silly(`Key (${key}) requested in ${configKey}`);
    if (this.items.has(configKey)) {
      const value = this.items.get(configKey)[key];
      return value ?? defaultGuildSettings[key];
    }

    return defaultGuildSettings[key];
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  public async delete(key: string, configIndex = 0): Promise<InsertResult> {
    const configKey = this.constructor.getItemsPrefix(configIndex);
    this.log.debug(`Key: (${key}) was deleted in ${configKey}`);

    const data = this.items.get(configKey) || {};
    // Copy object
    const oldValue = { ...data }[key];

    delete data[key];

    const insertResult = await this.repo
      .createQueryBuilder()
      .insert()
      .into(GuildSettings)
      .values({ config_set: configKey, settings: data })
      .onConflict('("config_set") DO UPDATE SET "settings" =:settings')
      .setParameter('settings', null)
      .execute();

    this.eventEmitter.emit(TypeOrmProviderEvents.SettingDeleted, key, oldValue);

    return insertResult;
  }

  public async setAll(value: GuildSettingsJSON, configIndex = 0): Promise<InsertResult> {
    const configKey = this.constructor.getItemsPrefix(configIndex);
    this.log.debug(`Key: '${configKey}' was set to`, value);

    const oldData = await this.repo.findOne({
      where: {
        config_set: configKey,
      },
    });

    const insertResult = await this.repo
      .createQueryBuilder()
      .insert()
      .into(GuildSettings)
      .values({ config_set: configKey, settings: value })
      .onConflict('("config_set") DO UPDATE SET "settings" = :settings')
      .setParameter('settings', value)
      .execute();

    this.eventEmitter.emit(TypeOrmProviderEvents.AllSettingsChanged, oldData || null);

    return insertResult;
  }

  public async set(
    key: string,
    newValue: unknown,
    configIndex = 0
  ): Promise<InsertResult> {
    const configKey = this.constructor.getItemsPrefix(configIndex);

    this.log.debug(`Key '${key}' in ConfigSet '${configKey} was set to:' `, newValue);

    const data = this.items.get(configKey) || {};
    // Lets copy to a new object so we can pass ref with no issue
    const oldValue = { ...data }[key];

    // Update our values
    data[key] = newValue;
    this.items.set(configKey, data);

    const insertResults = await this.repo
      .createQueryBuilder()
      .insert()
      .into(GuildSettings)
      .values({ config_set: configKey, settings: data })
      .onConflict('("config_set") DO UPDATE SET "settings" = :settings')
      .setParameter('settings', data)
      .execute();

    this.eventEmitter.emit(TypeOrmProviderEvents.SettingChanged, key, oldValue);

    return insertResults;
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  public async clear(configIndex = 0): Promise<DeleteResult> {
    const configKey = this.constructor.getItemsPrefix(configIndex);
    this.log.debug(`Config: ${configKey} was totally cleared`);
    this.items.delete(configKey);

    const oldData = await this.repo.find({
      where: {
        config_set: configKey,
      },
    });

    // We only emit the event if the ConfigSet actually existed
    oldData ? this.eventEmitter.emit(TypeOrmProviderEvents.ConfigCleared) : noop();

    return this.repo.delete(configKey);
  }

  public getAllValues(configIndex = 0): GuildSettingsJSON {
    const configKey = this.constructor.getItemsPrefix(configIndex);
    const data = this.items.get(configKey) || {};

    this.log.silly(
      `All values of ConfigSet '${configKey}' were requested, value returned:`,
      data
    );

    // We spread the defaultGuildSettings which then get overwritten by fetched data
    return { ...defaultGuildSettings, ...data };
  }

  private static getItemsPrefix(index: number): string {
    return `configSet_${index}`;
  }
}

import { Provider } from 'discord-akairo';
import GuildSettings from '../models/GuildSettings';
import { DeleteResult, InsertResult, Repository } from 'typeorm';
import { GuildSettingsJSON } from '../types';
import { defaultSettingMap } from '../utils/constants';
import { Logger } from 'tslog';
import EventEmitter from 'events';

export default class TypeORMProvider extends Provider {
  public ['constructor']: typeof TypeORMProvider;
  private readonly log: Logger;
  public settingsEmitter = new EventEmitter();

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
      return value ?? defaultSettingMap[key];
    }

    return defaultSettingMap[key];
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  public async delete(key: string, configIndex = 0): Promise<InsertResult> {
    const configKey = this.constructor.getItemsPrefix(configIndex);
    const data = this.items.get(configKey) || {};
    this.log.debug(`Key: (${key}) was deleted in ${configKey}`);

    delete data[key];

    return this.repo
      .createQueryBuilder()
      .insert()
      .into(GuildSettings)
      .values({ config_set: configKey, settings: data })
      .onConflict('("config_set") DO UPDATE SET "settings" =:settings')
      .setParameter('settings', null)
      .execute();
  }

  public async setAll(value: GuildSettingsJSON, configIndex = 0): Promise<InsertResult> {
    const configKey = this.constructor.getItemsPrefix(configIndex);
    this.log.debug(`${configKey} was set to`, value);
    return this.repo
      .createQueryBuilder()
      .insert()
      .into(GuildSettings)
      .values({ config_set: configKey, settings: value })
      .onConflict('("config_set") DO UPDATE SET "settings" = :settings')
      .setParameter('settings', value)
      .execute();
  }

  public async set(
    key: string,
    newValue: unknown,
    configIndex = 0
  ): Promise<InsertResult> {
    const configKey = this.constructor.getItemsPrefix(configIndex);
    this.log.debug(`Key was set for ${configKey}`, newValue);
    const data = this.items.get(configKey) || {};
    const oldValue = { ...data }[key];
    data[key] = newValue;
    this.items.set(configKey, data);

    this.settingsEmitter.emit('settingChanged', key, oldValue);

    return this.repo
      .createQueryBuilder()
      .insert()
      .into(GuildSettings)
      .values({ config_set: configKey, settings: data })
      .onConflict('("config_set") DO UPDATE SET "settings" = :settings')
      .setParameter('settings', data)
      .execute();
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  public async clear(configIndex = 0): Promise<DeleteResult> {
    const configKey = this.constructor.getItemsPrefix(configIndex);
    this.log.debug(`Config: ${configKey} was cleared`);
    this.items.delete(configKey);

    this.settingsEmitter.emit('settingsChanged');

    return this.repo.delete(configKey);
  }

  public getAllValues(configIndex = 0): GuildSettingsJSON {
    const configKey = this.constructor.getItemsPrefix(configIndex);
    this.log.silly(`The value of ${configKey} was requested`);
    const data = this.items.get(configKey) || {};

    this.settingsEmitter.emit('settingsChanged');

    return { ...defaultSettingMap, ...data };
  }

  private static getItemsPrefix(index: number): string {
    return `configSet_${index}`;
  }
}

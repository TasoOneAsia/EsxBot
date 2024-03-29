import { Actions } from './Actions';
import { AkairoClient, CommandHandler, ListenerHandler } from 'discord-akairo';
import { Message, MessageEmbed, MessageOptions } from 'discord.js';
import * as ArgumentTypes from '../structures/argumentTypes';
import { Connection } from 'typeorm';
import { ManagerHandler } from '../structures/managers/ManagerHandler';
import Database, { connectionName } from '../structures/Database';
import {
  OWNER_IDS,
  LOG_TO_FILE,
  LOG_VERBOSITY,
  LOG_OUTPUT_PATH,
  DEFAULT_COOLDOWN,
} from '../config';
import { Logger, ILogObject } from 'tslog';
import path from 'path';
import fs from 'fs';
import { makeSimpleEmbed } from '../utils';
import TypeORMProvider from '../structures/TypeORMProvider';
import GuildSettings from '../models/GuildSettings';

declare module 'discord-akairo' {
  interface AkairoClient {
    log: Logger;
    db: Connection;
    commandHandler: CommandHandler;
    listenerHandler: ListenerHandler;
    managerHandler: ManagerHandler;
    _actions: Actions;
    settings: TypeORMProvider;
    isReady: boolean;
  }
}

export default class EsxBot extends AkairoClient {
  public db!: Connection;

  public log: Logger = new Logger({
    name: 'Init',
    displayLoggerName: true,
    minLevel: process.env.NODE_ENV === 'production' ? 'info' : 'silly',
  });

  public isReady = false;

  public listenerHandler: ListenerHandler = new ListenerHandler(this, {
    directory: path.join(__dirname, '..', 'listeners'),
  });

  public managerHandler: ManagerHandler = new ManagerHandler(this, {
    directory: path.join(__dirname, '.', 'managers'),
  });

  public settings!: TypeORMProvider;

  public commandHandler: CommandHandler = new CommandHandler(this, {
    directory: path.join(__dirname, '..', 'commands'),
    prefix: () => this.settings.get('prefix') || '!',
    allowMention: true,
    handleEdits: true,
    storeMessages: true,
    commandUtil: true,
    fetchMembers: true,
    defaultCooldown: DEFAULT_COOLDOWN,
    argumentDefaults: {
      prompt: {
        modifyCancel: () => {
          const embed = new MessageEmbed()
            .setColor('RED')
            .setDescription('Command cancelled!');
          return { embed };
        },
        modifyStart: (msg: Message, str: string): MessageOptions => {
          const embed = new MessageEmbed()
            .setColor('GOLD')
            .setDescription(str)
            .setFooter(
              `Type \`cancel\` to cancel the command or ${
                this.commandHandler.client.settings.get('prefix') || '!'
              }help [command]`,
              msg.author.displayAvatarURL()
            );
          return { embed };
        },
        modifyRetry: (msg: Message, str: string): MessageOptions => {
          const embed = new MessageEmbed()
            .setColor('RED')
            .setDescription(str)
            .setFooter(
              `Type \`cancel\` to cancel the command or ${
                this.commandHandler.client.settings.get('prefix') || '!'
              }help [command]`,
              msg.author.displayAvatarURL()
            );
          return { embed };
        },
        timeout: () => makeSimpleEmbed(`Timed out!`, 'AQUA'),
        ended: (msg: Message) => {
          const embed = new MessageEmbed()
            .setDescription('You have reached the maximum retries')
            .setColor('BLUE')
            .setFooter('Project Error', msg.author.displayAvatarURL());
          return { embed };
        },
        retries: 3,
        time: 3e4,
      },
      otherwise: '',
    },
    ignorePermissions: OWNER_IDS,
  });

  public constructor() {
    super({
      ownerID: OWNER_IDS,
    });
  }

  public async start(): Promise<null> {
    this.log.info('Starting Initialization Sequence');
    await this._init();
    await this.login(process.env.BOT_TOKEN);

    return null;
  }

  private async _init(): Promise<void> {
    this.commandHandler.useListenerHandler(this.listenerHandler);

    this.listenerHandler.setEmitters({
      commandHandler: this.commandHandler,
      listenerHandler: this.listenerHandler,
      process,
    });

    this._actions = new Actions(this);

    for (const [name, func] of Object.entries(ArgumentTypes)) {
      this.commandHandler.resolver.addType(name, func.bind(null, this));
    }

    if (LOG_TO_FILE) {
      this.log.attachTransport(
        {
          silly: this._logToTransport,
          debug: this._logToTransport,
          trace: this._logToTransport,
          info: this._logToTransport,
          warn: this._logToTransport,
          error: this._logToTransport,
          fatal: this._logToTransport,
        },
        LOG_VERBOSITY
      );
    }

    this.log.info('Loading Command Handler');
    this.db = Database.get(connectionName);
    this.log.info('Starting DB Connect and Sync');
    try {
      await this.db.connect();
      // Only sync in development
      if (process.env.NODE_ENV === 'development') {
        await this.db.synchronize();
        this.log.debug('Synchronizing schema as env is development');
      }

      this.log.info('DB Connected');
    } catch (e) {
      this.log.error(e);
    }
    this.log.info('Loading TypeORM Provider');

    this.settings = new TypeORMProvider(this.db.getRepository(GuildSettings), this.log);
    await this.settings.init();

    this.log.info('Loading Command Handler');

    this.commandHandler.loadAll();
    this.log.info('Loading Listener Handler');
    this.listenerHandler.loadAll();
    this.log.info('Loading Manager Handler');
    this.managerHandler.loadAll();

    this.log.info('Loading Complete');
  }

  private _logToTransport(logObj: ILogObject) {
    const outDir = LOG_OUTPUT_PATH;

    const logOut = (logObj: ILogObject, type: 'error' | 'main' | 'debug') => {
      fs.appendFileSync(path.join(outDir, `${type}.log`), JSON.stringify(logObj) + '\n');
    };

    try {
      !fs.existsSync(outDir) && fs.mkdirSync(outDir);
    } catch (e) {
      this.log.error(e);
    }

    switch (logObj.logLevel) {
      case 'debug':
        logOut(logObj, 'debug');
        break;
      case 'error':
        logOut(logObj, 'error');
        break;
      case 'fatal':
        logOut(logObj, 'error');
        break;
      case 'info':
        logOut(logObj, 'main');
        break;
      case 'trace':
        logOut(logObj, 'debug');
        break;
      case 'warn':
        logOut(logObj, 'main');
    }
  }
}

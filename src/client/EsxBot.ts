import { AkairoClient, CommandHandler, ListenerHandler } from 'discord-akairo';
import { Message } from 'discord.js';
import { Connection } from 'typeorm';
import Database from '../structures/Database';
import {
  DEFAULT_PREFIX,
  OWNER_IDS,
  LOG_TO_FILE,
  LOG_VERBOSITY,
  LOG_OUTPUT_PATH,
  BOT_TOKEN,
} from '../config';
import { Logger, ILogObject } from 'tslog';
import path from 'path';
import fs from 'fs';

declare module 'discord-akairo' {
  interface AkairoClient {
    log: Logger;
    db: Connection;
    commandHandler: CommandHandler;
    listenerHandler: ListenerHandler;
  }
}

export default class EsxBot extends AkairoClient {
  public db!: Connection;
  public log!: Logger;

  public listenerHandler: ListenerHandler = new ListenerHandler(this, {
    directory: path.join(__dirname, '..', 'listeners'),
  });
  public commandHandler: CommandHandler = new CommandHandler(this, {
    directory: path.join(__dirname, '..', 'commands'),
    prefix: DEFAULT_PREFIX,
    allowMention: true,
    handleEdits: true,
    commandUtil: true,
    commandUtilLifetime: 3e5,
    defaultCooldown: 6e4,
    argumentDefaults: {
      prompt: {
        modifyStart: (_: Message, str: string): string =>
          `${str}\n\nType \`cancel\` to cancel the commmand...`,
        modifyRetry: (_: Message, str: string): string =>
          `${str}\n\nType \`cancel\` to cancel the commmand...`,
        timeout: 'Command timedout',
        ended: 'You reached the maximum retries, command cancelled.',
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

    this.log = new Logger({
      name: 'BASE',
      displayLoggerName: true,
    });
  }

  public async start(): Promise<string> {
    this.log.info('Starting Initialization Sequence');
    await this._init();
    return this.login(BOT_TOKEN);
  }

  private async _init(): Promise<void> {
    this._attachLoggerTransports();

    this.commandHandler.useListenerHandler(this.listenerHandler);

    this.listenerHandler.setEmitters({
      commandHandler: this.commandHandler,
      listenerHandler: this.listenerHandler,
      process,
    });

    if (LOG_TO_FILE) {
      this.log.attachTransport(
        {
          silly: EsxBot._logToTransport,
          debug: EsxBot._logToTransport,
          trace: EsxBot._logToTransport,
          info: EsxBot._logToTransport,
          warn: EsxBot._logToTransport,
          error: EsxBot._logToTransport,
          fatal: EsxBot._logToTransport,
        },
        LOG_VERBOSITY
      );
    }

    this.log.info('Loading Command Handler');
    this.commandHandler.loadAll();
    this.log.info('Loading Listener Handler');
    this.listenerHandler.loadAll();
    this.log.info('Loading Complete');

    this.db = Database.get(process.env.DB_NAME);
    this.log.info('Starting DB Connect and Sync');
    try {
      await this.db.connect();
      this.log.info('DB Connected and Synced');
    } catch (e) {
      this.log.error(e);
    }
  }

  private _attachLoggerTransports() {
    if (LOG_TO_FILE) {
      this.log.attachTransport(
        {
          silly: EsxBot._logToTransport,
          debug: EsxBot._logToTransport,
          trace: EsxBot._logToTransport,
          info: EsxBot._logToTransport,
          warn: EsxBot._logToTransport,
          error: EsxBot._logToTransport,
          fatal: EsxBot._logToTransport,
        },
        LOG_VERBOSITY
      );
    }
  }

  private static _logToTransport(logObj: ILogObject) {
    const outDir = LOG_OUTPUT_PATH;
    !fs.existsSync(outDir) && fs.mkdirSync(outDir);
    fs.appendFileSync(path.join(outDir, 'logs.txt'), JSON.stringify(logObj) + '\n');
  }
}

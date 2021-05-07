import { Listener, Command, ListenerHandler } from 'discord-akairo';
import { Message } from 'discord.js';
import { Logger } from 'tslog';
import { Repository } from 'typeorm';
import CommandsRan from '../../models/CommandsRan';

export default class CommandListener extends Listener {
  private readonly _logger: Logger;
  private cmdRepo: Repository<CommandsRan>;

  public constructor(handler: ListenerHandler) {
    super('commandStarted', {
      event: 'commandStarted',
      emitter: 'commandHandler',
    });

    this._logger = handler.client.log.getChildLogger({
      name: 'CmdFiredListener',
      prefix: ['[CmdFiredListener]'],
    });

    this.cmdRepo = handler.client.db.getRepository(CommandsRan);
  }
  public async exec(msg: Message, cmd: Command): Promise<void> {
    this._logger.info(`Command: \`${cmd}\` triggered by ${msg.author.tag}. RAW: ${msg}`);
    this._logger.debug('Inserting command into database');

    await this.cmdRepo.insert({
      command: cmd.id,
      group: cmd.categoryID,
      commandRanBy: msg.author.id,
      raw: msg.content,
    });

    this._logger.debug('Command sucessfully inserted into DB');
  }
}

import { Listener, Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class CommandListener extends Listener {
  public constructor() {
    super('commandStarted', {
      event: 'commandStarted',
      emitter: 'commandHandler',
    });
  }
  public exec(msg: Message, cmd: Command): void {
    const logger = this.client.log.getChildLogger({
      name: 'CmdFired',
    });
    logger.info(`Command: \`${cmd}\` triggered by ${msg.author.tag}. RAW: ${msg}`);
  }
}

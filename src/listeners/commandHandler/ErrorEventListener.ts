import { Listener, ListenerHandler } from 'discord-akairo';
import { Logger } from 'tslog';
import { Message, TextChannel } from 'discord.js';
import { makeErrorEmbed } from '../../utils/miscUtils';

export default class ErrorEventListener extends Listener {
  private readonly _logger: Logger;
  public constructor(handler: ListenerHandler) {
    super('error', {
      event: 'error',
      emitter: 'commandHandler',
      category: 'commmandHandler',
    });
    this._logger = handler.client.log.getChildLogger({
      name: 'ErrorEventListener',
      prefix: ['[ErrorEventListener]'],
    });
  }

  public async exec(e: Error): Promise<void> {
    await this._sendErrorToLog(e);
    // this._logger.error(e);
  }

  private async _sendErrorToLog(e: Error): Promise<Message> {
    const logChannel = this.client.channels.cache.get(
      <string>process.env.ADMIN_LOG_CHANNEL_ID
    ) as TextChannel;
    const embed = makeErrorEmbed(e, true);
    return logChannel.send(embed);
  }
}

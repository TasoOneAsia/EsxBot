import { Command, Listener, ListenerHandler } from 'discord-akairo';
import { Message } from 'discord.js';
import { Logger } from 'tslog';

export default class MissingPermListener extends Listener {
  private _logger: Logger;
  constructor(handler: ListenerHandler) {
    super('MissingPerm', {
      event: 'missingPermissions',
      emitter: 'commandHandler',
    });

    this._logger = handler.client.log.getChildLogger({
      name: 'MissingPerm',
      prefix: ['MissingPerm'],
    });
  }

  public async exec(
    msg: Message,
    cmd: Command,
    type: string,
    perm: unknown
  ): Promise<Message> {
    this._logger.debug(`Missing permission event fired by ${msg.author} for ${perm}`);
    return msg.channel.send(
      `**Missing Permission**: You do not have the correct permissions for **${cmd}**`
    );
  }
}

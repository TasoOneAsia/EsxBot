import { Listener, ListenerHandler } from 'discord-akairo';
import { Logger } from 'tslog';
import { Message, User } from 'discord.js';
import StickyMsgManager from '../../client/managers/StickyMsgManager';

export default class StickyMessageListener extends Listener {
  private log: Logger;

  constructor(handler: ListenerHandler) {
    super('stickyMsgListener', {
      event: 'message',
      emitter: 'client',
    });

    this.log = handler.client.log.getChildLogger({
      name: 'stickyMsgListener',
      prefix: ['[StickyMsgListener]'],
    });
  }

  public async exec(msg: Message): Promise<void> {
    const stickyMsgManager = this.client.managerHandler.modules.get(
      'stickyMsgManager'
    ) as StickyMsgManager;

    // Ignore all bot messages from sticky
    if (msg.author.bot) return;

    // Ignore messages if they start with a prefix or mention bot
    if (
      msg.content.startsWith(this.client.settings.get('prefix')) ||
      msg.mentions.has(<User>this.client.user)
    )
      return;

    // Process sticky msg
    if (stickyMsgManager.stickiedChannels.has(msg.channel.id)) {
      const targetMsgId = stickyMsgManager.stickiedChannels.get(msg.channel.id) as string;

      const oldMsg = await msg.channel.messages.fetch(targetMsgId);

      const newMsgContent = oldMsg.content;

      const newMsg = await msg.channel.send(newMsgContent);

      await oldMsg.delete();
      stickyMsgManager.stickiedChannels.set(msg.channel.id, newMsg.id);
    }
  }
}

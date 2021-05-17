import { Listener, ListenerHandler } from 'discord-akairo';
import { Message, TextChannel, MessageEmbed } from 'discord.js';
import { Logger } from 'tslog';
import { discordCodeBlock } from '../../utils/miscUtils';
import { IGNORED_CHANNELS } from '../../config';

export default class MessageDeleteListener extends Listener {
  private log: Logger;

  public constructor(handler: ListenerHandler) {
    super('messageUpdate', {
      event: 'messageUpdate',
      emitter: 'client',
      category: 'client',
    });
    this.log = handler.client.log.getChildLogger({
      name: 'messageUpdate',
    });
  }

  public async exec(oldMsg: Message, newMsg: Message): Promise<Message | void> {
    if (newMsg.partial || newMsg.author.bot || newMsg.author.id === this.client.user?.id)
      return;

    // This will happen on embeds that take time to resolve
    if (newMsg === oldMsg) return;

    for (const channel of IGNORED_CHANNELS) {
      if (channel === oldMsg.channel.id) return;
    }

    this.log.info(
      `Edit Event: ${oldMsg.author.tag} (${oldMsg.author.id}), Original: ${oldMsg.content}, New: ${newMsg.content}, Channel: ${oldMsg.channel}`
    );

    const embed = MessageDeleteListener._createMessageEmbed(oldMsg, newMsg);
    return await this.sendToChannel(embed);
  }

  private static _createMessageEmbed(oldMsg: Message, newMsg: Message): MessageEmbed {
    return new MessageEmbed()
      .setTimestamp()
      .setTitle('Edit Event Occured')
      .setThumbnail(oldMsg.author.displayAvatarURL())
      .addFields([
        {
          name: 'Author Tag',
          value: oldMsg.author.tag,
          inline: true,
        },
        {
          name: 'Author ID',
          value: oldMsg.author.id,
          inline: true,
        },
        {
          name: 'Original Contents',
          value: discordCodeBlock(oldMsg.content),
        },
        {
          name: 'New Contents',
          value: discordCodeBlock(newMsg.content),
        },
        {
          name: 'Channel',
          value: oldMsg.channel,
        },
      ]);
  }

  private async sendToChannel(embed: MessageEmbed): Promise<void> {
    const rawLogChannel = this.client.settings.get('basic-log-channel');

    if (!rawLogChannel) {
      this.log.warn('Basic log channel not setup! Aborting!');
      return;
    }

    const channel = this.client.channels.cache.get(rawLogChannel) as TextChannel;
    try {
      await channel.send(embed);
    } catch (e) {
      this.log.error(e);
    }
  }
}

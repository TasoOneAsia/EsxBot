import { Listener, ListenerHandler } from 'discord-akairo';
import { Message, TextChannel, MessageEmbed } from 'discord.js';
import { Logger } from 'tslog';
import { discordCodeBlock } from '../../utils/miscUtils';
import { IGNORED_CHANNELS } from '../../config';

export default class MessageDeleteListener extends Listener {
  private log: Logger;

  public constructor(handler: ListenerHandler) {
    super('messageDelete', {
      event: 'messageDelete',
      emitter: 'client',
      category: 'client',
    });
    this.log = handler.client.log.getChildLogger({
      name: 'MessageDeleteLog',
    });
  }

  public async exec(msg: Message): Promise<Message | void> {
    if (msg.partial || msg.author.bot || msg.author.id === this.client.user?.id) return;

    for (const channel of IGNORED_CHANNELS) {
      if (channel === msg.channel.id) return;
    }

    this.log.info(
      `Delete Event: ${msg.author.tag} (${msg.author.id}), Content: ${msg.content}, Channel: ${msg.channel}`
    );

    const embed = MessageDeleteListener._createMessageEmbed(msg);
    return await this.sendToLogChannel(embed);
  }

  private static _createMessageEmbed(msg: Message): MessageEmbed {
    return new MessageEmbed()
      .setTimestamp()
      .setTitle('Deletion Event Occured')
      .setThumbnail(msg.author.displayAvatarURL())
      .addFields([
        {
          name: 'Author Tag',
          value: msg.author.tag,
          inline: true,
        },
        {
          name: 'Author ID',
          value: msg.author.id,
          inline: true,
        },
        {
          name: 'Message Contents',
          value: discordCodeBlock(msg.content),
        },
        {
          name: 'Channel',
          value: msg.channel,
        },
      ]);
  }

  private async sendToLogChannel(embed: MessageEmbed) {
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

import { Message, MessageEmbed } from 'discord.js';
import { Command } from 'discord-akairo';
import dayjs from 'dayjs';
import { discordCodeBlock } from '../../utils/miscUtils';

export default class PingCommand extends Command {
  constructor() {
    super('ping', {
      aliases: ['ping'],
      description: {
        content: "Return Bot's latency info",
        usage: 'ping [--keep]',
      },
      category: 'debug',
      ownerOnly: true,
      args: [
        {
          id: 'keepData',
          flag: 'keep',
        },
      ],
    });
  }

  public async exec(msg: Message): Promise<Message | undefined> {
    const pingEmbed = new MessageEmbed()
      .setColor('#ff8f00')
      .setAuthor('Bot Latency Info')
      .setTimestamp()
      .setFooter(msg.author.tag, msg.author.displayAvatarURL());

    const sentMsg = await msg.util?.send(pingEmbed);

    const diffTime = dayjs(sentMsg?.createdAt).diff(msg.createdAt, 'ms');

    pingEmbed.addFields([
      {
        inline: true,
        name: 'RTT:',
        value: discordCodeBlock(diffTime + 'ms'),
      },
      {
        inline: true,
        name: 'HeartBeat:',
        value: discordCodeBlock(Math.round(this.client.ws.ping) + 'ms'),
      },
    ]);

    return msg.util?.send(pingEmbed);
  }
}

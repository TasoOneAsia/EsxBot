import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { discordCodeBlock, byteToGB, msToFormatted } from '../../utils/miscUtils';
import sysInfo from 'systeminformation';

export default class StatusCommand extends Command {
  private _uptimeString: string | undefined;

  constructor() {
    super('status', {
      aliases: ['status', 'stats', 'stat'],
      category: 'Debug',
      description: {
        content: 'Returns stats for Guild and Bot',
        usage: 'status',
        examples: ['status'],
      },
    });
  }

  public async exec(msg: Message): Promise<Message | void> {
    if (!msg.guild) return;
    const embed = await StatusCommand._createStatsEmbed(msg, <number>this.client.uptime);
    return msg.channel.send(embed);
  }

  private static async _createStatsEmbed(
    msg: Message,
    uptime: number
  ): Promise<MessageEmbed> {
    const sysMem = await sysInfo.mem();

    return (
      new MessageEmbed()
        .setTitle('ESX Guild & Bot Stats')
        .setColor('#00c400')
        .setImage(<string>msg.guild?.iconURL())
        .setTimestamp()
        .setFooter(msg.author.tag, msg.author.displayAvatarURL())
        // TODO: Reduce reundant code
        .addFields([
          {
            name: 'Guild Members',
            value: discordCodeBlock(msg.guild?.memberCount),
            inline: true,
          },
          {
            name: 'Uptime',
            value: discordCodeBlock(msToFormatted(uptime)),
            inline: true,
          },
          {
            name: 'WS Latency',
            value: discordCodeBlock(msg.client.ws.ping + 'ms'),
            inline: true,
          },
          {
            name: 'Heap Used',
            value: discordCodeBlock(byteToGB(process.memoryUsage().heapUsed) + ' GB'),
            inline: true,
          },
          {
            name: 'Heap Total',
            value: discordCodeBlock(byteToGB(process.memoryUsage().heapTotal) + ' GB'),
            inline: true,
          },
          {
            name: 'Memory',
            value: discordCodeBlock(byteToGB(sysMem.total) + ' GB'),
            inline: true,
          },
        ])
    );
  }
}

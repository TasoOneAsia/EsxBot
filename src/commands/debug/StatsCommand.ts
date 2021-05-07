import { Command, CommandHandler } from 'discord-akairo';
import { Collection, GuildMember, Message, MessageEmbed } from 'discord.js';
import { Logger } from 'tslog';
import { Repository } from 'typeorm';
import CommandsRan from '../../models/CommandsRan';
import { capitalize, discordCodeBlock } from '../../utils';
import dayjs from 'dayjs';

interface StatsCommandArgs {
  user: GuildMember | null;
  command: Command | null;
}

export default class StatsCommand extends Command {
  private log: Logger;
  private commandsRanRepo: Repository<CommandsRan>;

  public constructor(handler: CommandHandler) {
    super('cmd-stats', {
      category: 'Debug',
      aliases: ['cmd-stats', 'scmd'],
      ownerOnly: true,
      description: {
        content: 'Various statistics for commands ran',
        usage: 'cmd-stats [command] --user=[user]',
        examples: ['cmd-stats', 'cmd-stats curl https://tasoagc.dev'],
      },
      args: [
        {
          id: 'command',
          match: 'phrase',
          type: 'command',
          default: null,
        },
        {
          id: 'user',
          match: 'option',
          flag: '--user=',
          type: 'member',
          default: null,
        },
      ],
    });

    this.log = handler.client.log.getChildLogger({
      name: 'StatsCmd',
      prefix: ['[StatsCmd]'],
    });

    this.commandsRanRepo = handler.client.db.getRepository(CommandsRan);
  }
  public async exec(msg: Message, { command, user }: StatsCommandArgs): Promise<void> {
    if (!command && !user) await this.handleAllCommandsStatsNoUser(msg);
  }

  private async handleAllCommandsStatsNoUser(msg: Message): Promise<Message> {
    const totalCommandNumber = await this.commandsRanRepo.count({
      order: {
        createdOn: 'DESC',
      },
    });
    const commandCountMap = new Collection<string, number>();

    for (const [commandId, command] of this.client.commandHandler.modules) {
      const commandCount = await this.commandsRanRepo.count({
        where: {
          command: commandId,
        },
      });
      commandCountMap.set(command.aliases[0], commandCount);
    }

    const sortedCommands = commandCountMap.sort((a, b) => b - a);

    const returnEmbed = new MessageEmbed()
      .setTitle('Command Statistics')
      .setColor('GOLD')
      .setDescription(`**${totalCommandNumber}** commands ran since **TODO**`)
      .setTimestamp()
      .setThumbnail(<string>msg.guild!.iconURL())
      .setFooter('Finish me Taso!');

    for (const [commandAliasPrimary, count] of sortedCommands) {
      returnEmbed.addField(
        commandAliasPrimary.toUpperCase(),
        discordCodeBlock(count),
        true
      );
    }

    return msg.channel.send(returnEmbed);
  }

  private async handleCommandStats(
    msg: Message,
    cmd: Command,
    user: null | GuildMember
  ): Promise<Message> {
    return msg.channel.send('Handle stats for ');
  }

  // private buildEmbed({ command }) {
  //
  // }
}

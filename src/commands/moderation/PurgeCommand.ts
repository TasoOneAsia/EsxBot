import { GuildMember, Message, MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandHandler, Argument } from 'discord-akairo';
import { Logger } from 'tslog';
import dayjs from 'dayjs';
import { makeSimpleEmbed } from '../../utils';

interface IPurgeArgs {
  amount: number;
  member: GuildMember;
}

export default class PurgeCommand extends Command {
  private log: Logger;
  public constructor(handler: CommandHandler) {
    super('purge', {
      aliases: ['purge', 'delete', 'clear'],
      description: {
        content:
          'Deletes a specific number of messages, optionally from a specific member.',
        usage: 'purge <amount> [member]',
        examples: ['purge 42', 'purge 42 @Spammer#1337'],
      },
      category: 'Moderation',
      clientPermissions: ['MANAGE_MESSAGES'],
      userPermissions: ['MANAGE_MESSAGES'],
      channel: 'guild',
      ratelimit: 2,
      args: [
        {
          id: 'amount',
          type: Argument.range('number', 1, 101),
          prompt: {
            start: (message: Message): string =>
              `${message.author}, how many message would you like to delete?`,
            retry: (message: Message): string =>
              `${message.author}, Please enter a number within 1-100`,
            retries: 2,
          },
        },
        {
          id: 'member',
          type: 'member',
          match: 'phrase',
          default: null,
        },
      ],
    });

    this.log = handler.client.log.getChildLogger({
      name: 'PurgeCmd',
      prefix: ['PurgeCmd'],
    });
  }
  public async exec(msg: Message, { amount, member }: IPurgeArgs): Promise<void> {
    const fetchedMsgs = await msg.channel.messages.fetch({ limit: 100 });

    const originChannel = msg.channel as TextChannel;
    const fourteenDaysAgo = dayjs().set('d', -14);
    const dateFormatted = fourteenDaysAgo.format('MM/DD/YY');

    const returnEmbed = (numMsg: number, member?: GuildMember): MessageEmbed => {
      // TODO: Can be done better but hotfix for now
      return makeSimpleEmbed(
        `Purged **${numMsg} messages** ` +
          (member
            ? `from **${member}** since **${dateFormatted}**`
            : `since **${dateFormatted}**`)
      );
    };

    if (member) {
      const selectMsgs = fetchedMsgs
        .filter(
          (m: Message) =>
            m.author.id === member.id && m.createdAt >= fourteenDaysAgo.toDate()
        )
        .array()
        .slice(0, amount);

      await originChannel.bulkDelete(selectMsgs);

      const embedMsg = await msg.channel.send(returnEmbed(selectMsgs.length, member));

      await embedMsg.delete({
        timeout: 3000,
      });
    }

    const selectMsgs = fetchedMsgs
      .filter((m: Message) => m.createdAt >= fourteenDaysAgo.toDate())
      .array()
      .slice(0, amount + 1);

    await originChannel.bulkDelete(selectMsgs);

    const embedMsg = await msg.channel.send(returnEmbed(selectMsgs.length));

    await embedMsg.delete({
      timeout: 3000,
    });
  }
}

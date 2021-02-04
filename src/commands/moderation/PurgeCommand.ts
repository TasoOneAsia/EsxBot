import { GuildMember, Message, MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandHandler } from 'discord-akairo';
import { Logger } from 'tslog';

interface IPurgeArgs {
  amount: number;
  member: GuildMember;
}

export default class PurgeCommand extends Command {
  private _logger: Logger;
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
      ratelimit: 2,
      args: [
        {
          id: 'amount',
          type: 'integer',
          prompt: {
            start: (message: Message): string =>
              `${message.author}, how many message would you like to delete?`,
            retry: (message: Message): string =>
              `${message.author}, please enter a valid number.`,
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

    this._logger = handler.client.log.getChildLogger({
      name: 'PurgeCmd',
      prefix: ['PurgeCmd'],
    });
  }
  public async exec(
    msg: Message,
    { amount, member }: IPurgeArgs
  ): Promise<Message | void> {
    if (amount < 2 || amount > 99)
      return msg.channel.send('You can only bulk-delete between 1 and 100 messages.');

    try {
      // Execute if provide member arg
      if (member) {
        const fetchedMsg = await msg.channel.messages.fetch({ limit: 100 });
        const filteredMsgs = fetchedMsg
          .filter(
            (m: Message) =>
              m.author.id === member.id && Date.now() - m.createdTimestamp < 1209600000
          )
          .array()
          .slice(0, amount);
        await (msg.channel as TextChannel).bulkDelete(filteredMsgs);
        // No member arg
      } else {
        const fetchedMsg = await msg.channel.messages.fetch({ limit: 100 });
        const filteredMsg = fetchedMsg.array().slice(0, amount);
        await (msg.channel as TextChannel).bulkDelete(filteredMsg);
      }
    } catch (e) {
      this._logger.error(e);
      return msg.channel.send('Internal Error Occured');
    }
  }

  private async _sendToModLog(embed: MessageEmbed) {
    if (!process.env.ADMIN_LOG_CHANNEL_ID)
      throw new Error('LOG_CHANNEL Env variable not defined');

    const channel = this.client.channels.cache.get(
      <string>process.env.ADMIN_LOG_CHANNEL_ID
    ) as TextChannel;
    try {
      await channel.send(embed);
    } catch (e) {
      this._logger.error(e);
    }
  }
}
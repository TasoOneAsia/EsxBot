import { Command, CommandHandler } from 'discord-akairo';
import { Logger } from 'tslog';
import { GuildMember, Message, MessageEmbed } from 'discord.js';
import { discordCodeBlock, actionMessageEmbed, modActionEmbed } from '../../utils';
import dayjs from 'dayjs';

interface IBanAction {
  member: GuildMember;
  reason: string;
  duration: number | 'perma' | null;
}

export default class BanCommand extends Command {
  private readonly _logger: Logger;

  constructor(handler: CommandHandler) {
    super('ban', {
      channel: 'guild',
      aliases: ['ban'],
      description: {
        content: 'Ban a guild member',
        usage: 'ban <user> [reason]',
        examples: ['ban @Taso noob', 'ban 188181246600282113 noob'],
      },
      category: 'Moderation',
      userPermissions: ['BAN_MEMBERS'],
      args: [
        {
          id: 'member',
          type: 'othermembers',
          prompt: {
            start: (msg: Message) => `${msg.author}, provide a valid member to warn`,
            retry: (msg: Message) =>
              `${msg.author}, that member was not resolved. Please try again`,
          },
        },
        {
          id: 'duration',
          type: 'duration',
          prompt: {
            start: (msg: Message) =>
              `${msg.author}, please provide a duration \`1d, 1h, 1m\``,
            retry: (msg: Message) =>
              `${msg.author}, please provide a duration \`1d, 1h, 1m\``,
          },
        },
        {
          id: 'reason',
          match: 'rest',
          default: 'No reason provided',
        },
      ],
    });

    this._logger = handler.client.log.getChildLogger({
      name: 'BanCommand',
      prefix: ['[BanCommand]'],
    });
  }
  // TODO: Cleanup filth
  public async exec(
    msg: Message,
    { member, duration, reason }: IBanAction
  ): Promise<Message | null> {
    try {
      if (!msg.guild) return null;

      msg.delete({ timeout: 3000 });

      if (!duration) return msg.reply('Incorrect date format');

      const unbanDate =
        duration == 'perma' ? null : dayjs().add(duration as number, 'ms');

      this.client._actions.ban(member, unbanDate ? unbanDate.unix() : 0, reason);

      const [dmEmbed, logEmbed] = this._buildEmbeds(
        msg,
        member,
        reason,
        unbanDate ? unbanDate.format('MM/DD/YY') : 'Permanently Banned'
      );

      try {
        await member.send(dmEmbed);
      } catch (e) {
        this._logger.error(`Unable to send direct message to ${member.user.username}`);
      }

      await this.client._actions.sendToModLog(logEmbed);

      const liftMessage = unbanDate
        ? `be lifted on ${unbanDate.format('MM/DD/YY')}`
        : 'never be lifted';
      return msg.channel.send(
        `**${member.user.tag}** was banned for **${reason}**. The ban will ${liftMessage}`
      );
    } catch (e) {
      this._logger.error(e);
      return msg.channel.send('An internal error occured');
    }
  }

  private _buildEmbeds(
    msg: Message,
    member: GuildMember,
    reason: string,
    unbanDate: string
  ): [MessageEmbed, MessageEmbed] {
    const dmEmbed = actionMessageEmbed({
      action: 'ban',
      staffMember: msg.author,
      logger: this._logger,
      member,
      reason,
      fields: [
        {
          name: 'Unban Date:',
          // value: `${discordCodeBlock(unbanDate.format('MM/DD/YY') || 'Perma')}`,
          value: `${discordCodeBlock(unbanDate)}`,
          inline: false,
        },
      ],
    });

    const logEmbed = modActionEmbed({
      action: 'ban',
      staffMember: msg.author,
      reason,
      member,
      logger: this._logger,
      fields: [
        {
          name: 'Unban Date:',
          value: `${discordCodeBlock(unbanDate)}`,
          inline: false,
        },
      ],
    });
    return [dmEmbed, logEmbed];
  }
}

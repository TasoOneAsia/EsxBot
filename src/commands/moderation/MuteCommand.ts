import { Command, CommandHandler } from 'discord-akairo';
import { Logger } from 'tslog';
import { GuildMember, Message } from 'discord.js';
import Infractions from '../../models/Infractions';
import { Repository } from 'typeorm';
import { actionMessageEmbed, makeSimpleEmbed } from '../../utils';

export default class MuteCommand extends Command {
  private _logger: Logger;

  constructor(handler: CommandHandler) {
    super('muteCmd', {
      aliases: ['mute', 'silence'],
      description: {
        content: 'Mutes a user by adding the muted role',
        usage: 'mute [user] <reason>',
        examples: ['mute @Taso Annoying', 'mute 188181246600282113 Bad coder'],
      },
      category: 'Moderation',
      userPermissions: 'BAN_MEMBERS',
      channel: 'guild',
      args: [
        {
          id: 'member',
          type: 'member',
          prompt: {
            start: (msg: Message) => `${msg.author}, provide a valid member to warn`,
            retry: (msg: Message) =>
              `${msg.author}, that member was not resolved. Please try again`,
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
      name: 'MuteCmd',
      prefix: ['[MuteCmd]'],
    });
  }

  public async exec(
    msg: Message,
    { member, reason }: { member: GuildMember; reason: string }
  ): Promise<Message> {
    const infractsRepo: Repository<Infractions> = this.client.db.getRepository(
      Infractions
    );

    const msgAuthor = await msg.guild!.members.fetch(msg.author.id);

    if (msg.author.id === member.id)
      return MuteCommand._sendErrorMessage(msg, 'Cannot mute yourself');

    if (member.roles.highest.position >= msgAuthor.roles.highest.position)
      return MuteCommand._sendErrorMessage(
        msg,
        'This was not allowed due to role hierachy'
      );

    await infractsRepo.insert({
      user: member.id,
      reason: reason,
      infractionType: 'mute',
      guildId: member.guild.id,
      staffMember: msg.author.id,
    });

    this._logger.debug(`Added mute infraction for ${member.id}`);

    const dmEmbed = actionMessageEmbed({
      action: 'warn',
      reason,
      logger: this._logger,
      member: member,
      staffMember: msg.author,
    });

    try {
      // Send DM before mute
      await member.send(dmEmbed);
      this._logger.debug(`Sent ${member.id} a direct message`);
    } catch (e) {
      this._logger.error(
        `Could not send direct message to ${member.user.tag} or could not kick`
      );
    }

    const mutedRole = msg.guild!.roles.cache.get(<string>process.env.MUTE_ROLE_ID);

    if (mutedRole) member.roles.add(mutedRole, reason);

    return msg.channel.send(makeSimpleEmbed(`${member} was muted for \`${reason}\``));
  }

  private static async _sendErrorMessage(msg: Message, e: string): Promise<Message> {
    return await msg.channel.send(makeSimpleEmbed(`**Error**: ${e}`, 'RED'));
  }
}

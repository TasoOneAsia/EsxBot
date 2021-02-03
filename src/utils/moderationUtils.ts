import { EmbedField, GuildMember, MessageEmbed, User } from 'discord.js';
import { Logger } from 'tslog';
import { discordCodeBlock } from './miscUtils';

interface IModLogEmbed {
  action: 'kick' | 'warn' | 'ban';
  reason?: string;
  member: GuildMember;
  staffMember: User;
  fields?: EmbedField[];
  logger: Logger;
}

export const modLogEmbed = ({
  action,
  reason,
  member,
  staffMember,
  fields,
  logger,
}: IModLogEmbed): MessageEmbed => {
  const adminEventLog = logger.getChildLogger({
    prefix: ['AdminLogEvent'],
    name: 'AdminLog',
  });

  adminEventLog.debug(`${action} embed created`);

  const embed = new MessageEmbed()
    .setTimestamp()
    .setTitle(`${action.toUpperCase()} Event`)
    .setThumbnail(member.user.displayAvatarURL())
    .addFields([
      {
        name: 'User',
        value: discordCodeBlock(member.user.tag),
        inline: true,
      },
      {
        name: 'User ID',
        value: discordCodeBlock(member.user.id),
        inline: true,
      },
      {
        name: 'Staff',
        value: discordCodeBlock(staffMember.tag),
      },
    ]);
  if (reason) embed.addField('Reason', discordCodeBlock(reason));

  if (fields) embed.addFields(fields);

  return embed;
};

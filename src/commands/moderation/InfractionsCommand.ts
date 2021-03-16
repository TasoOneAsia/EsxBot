import { Command, CommandHandler } from 'discord-akairo';
import { GuildMember, Message, MessageEmbed, TextChannel } from 'discord.js';
import { Logger } from 'tslog';
import { Repository } from 'typeorm';
import Infractions from '../../models/Infractions';
import { FieldsEmbed } from 'discord-paginationembed';
import dayjs from 'dayjs';
import { discordCodeBlock } from '../../utils';
import { stripIndents } from 'common-tags';

export default class InfractionsCommand extends Command {
  private _logger: Logger;
  constructor(handler: CommandHandler) {
    super('infractions', {
      aliases: ['infractions', 'infracts'],
      userPermissions: 'BAN_MEMBERS',
      category: 'Moderation',
      description: {
        examples: ['infractions @Taso'],
        content: 'Return the current infractions for a Member',
        usage: 'infractions <user>',
      },
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
      ],
    });
    this._logger = handler.client.log.getChildLogger({
      name: 'InfractsCmd',
      prefix: ['[InfractsCmd]'],
    });
  }

  public async exec(
    msg: Message,
    { member }: { member: GuildMember }
  ): Promise<void | Message> {
    const infractionsRepo: Repository<Infractions> = this.client.db.getRepository(
      Infractions
    );

    const infracts = await infractionsRepo.find({
      where: {
        user: member.user.id,
      },
    });

    this._logger.debug('Infracts returned for member', infracts);

    if (!infracts.length)
      return await msg.channel.send(InfractionsCommand.getCommonEmbed(member, infracts));

    const paginatedEmbed = new FieldsEmbed<Infractions>()
      .setArray(infracts)
      .formatField(`Infracts for ${member.user.tag}`, (e) =>
        discordCodeBlock(stripIndents`
          Infraction ID: ${e.infractionID}
          Infraction Type: ${e.infractionType.toUpperCase()}
          Staff Member: ${e.staffMember}
          Reason: ${e.reason}
          on: ${dayjs(e.createdDate).format('DD/MM/YYYY')}
        `)
      )
      .setChannel(msg.channel as TextChannel)
      .setAuthorizedUsers([member.user.id])
      .setElementsPerPage(5)
      .setPageIndicator('footer');

    const accountAge = <Date>member.user.createdAt;
    const joinedAt = <Date>member.joinedAt;

    paginatedEmbed.embed
      .setColor('ORANGE')
      .setDescription(
        stripIndents`
      **Joined Date**: ${dayjs(joinedAt).format('DD/MM/YYYY')}
      **Account Age**: ${dayjs(accountAge).format('DD/MM/YYYY')}
      **Infractions**: ${infracts.length}
      `
      )
      .setFooter('ESX Discord')
      .setTimestamp()
      .setThumbnail(member.user.displayAvatarURL());

    return await paginatedEmbed.build();
  }

  private static getCommonEmbed(
    member: GuildMember,
    infracts: Infractions[]
  ): MessageEmbed {
    const accountAge = <Date>member.user.createdAt;
    const joinedAt = <Date>member.joinedAt;

    return new MessageEmbed()
      .setColor('ORANGE')
      .setDescription(
        stripIndents`
      **Joined Date**: ${dayjs(joinedAt).format('DD/MM/YYYY')}
      **Account Age**: ${dayjs(accountAge).format('DD/MM/YYYY')}
      **Infractions**: ${infracts.length || '0'}  
      `
      )
      .setFooter('ESX Discord')
      .setTimestamp()
      .setThumbnail(member.user.displayAvatarURL());
  }
}

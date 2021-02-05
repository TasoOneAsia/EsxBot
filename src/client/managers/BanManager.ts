import { GuildMember } from 'discord.js';
import { Repository } from 'typeorm';
import { setTimeout as setLongTimeout } from 'long-timeout'; // We have to use a retarded module because setTimeout has a maximum value of a 32bit signed integer
import Infractions from '../../models/Infractions';
import EsxBot from '../EsxBot';

export class BanManager {
  private EsxBot: EsxBot;
  private infractionsRepo: Repository<Infractions>;

  constructor(EsxBot: EsxBot) {
    this.EsxBot = EsxBot;

    this.infractionsRepo = this.EsxBot.db.getRepository(Infractions);

    this.infractionsRepo.find({ infractionType: 'ban' }).then((allBans) => {
      allBans
        .filter((ban) => ban.unbanDate && ban.unbanDate * 1000 <= Date.now())
        .forEach((expiredBan) => {
          this.remove(expiredBan);
        });

      allBans = allBans.filter(
        (ban) => ban.unbanDate && ban.unbanDate * 1000 > Date.now()
      );

      allBans.forEach((ban) => {
        setLongTimeout(() => {
          this.remove(ban);
        }, ban.unbanDate * 1000 - Date.now());
      });
    });
  }

  public async remove(ban: Infractions): Promise<void> {
    this.EsxBot.guilds.cache
      .get(ban.guildId)
      ?.members.unban(ban.user)
      .catch(() => {
        /*NOOP*/
      });
    //TODO: Not sure if this is the best way to delete the iterated row, please fix me if not
    await this.infractionsRepo.delete(ban.infractionID);
  }

  public async add(
    member: GuildMember,
    unbanDate: number,
    staff?: string,
    reason?: string
  ): Promise<void> {
    reason = reason || 'No reason specified';

    const banData = {
      user: member.id,
      guildId: member.guild.id,
      staffMember: staff,
      reason,
      unbanDate: unbanDate,
      infractionType: 'ban',
    };

    const ban = (await this.infractionsRepo.insert(banData)).generatedMaps[0];

    await member.ban({
      days: 1,
      reason,
    });

    if (ban) {
      setLongTimeout(() => {
        this.EsxBot.guilds.cache
          .get(banData.guildId)
          ?.members.unban(banData.user)
          .catch(() => {
            /* NOOP */
          });
        this.infractionsRepo.delete(ban.infractionID);
      }, banData.unbanDate * 1000 - Date.now());
    }
  }
}

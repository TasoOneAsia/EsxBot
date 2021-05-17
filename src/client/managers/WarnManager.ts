import { GuildMember, User } from 'discord.js';
import { MoreThan, Repository } from 'typeorm';
import Infractions from '../../models/Infractions';
import { Manager } from '../../structures/managers/Manager';
import dayjs from 'dayjs';
import { ManagerHandler } from '../../structures/managers/ManagerHandler';

export default class WarnManager extends Manager {
  private infractionsRepo: Repository<Infractions>;

  constructor(handler: ManagerHandler) {
    super('warn', {
      category: 'moderation',
    });

    this.infractionsRepo = handler.client.db.getRepository(Infractions);
  }

  public async add(member: GuildMember, staff: string, reason?: string): Promise<void> {
    await this.infractionsRepo.insert({
      user: member.id,
      guildId: member.guild.id,
      staffMember: staff,
      reason: reason,
      infractionType: 'warn',
    });

    const numberOfWarns = await this.infractionsRepo.find({
      where: {
        user: member.id,
        infractionType: 'warn',
        createdDate: MoreThan(dayjs().subtract(7, 'days').toDate()),
      },
    });

    if (numberOfWarns.length >= 3) {
      await this.client._actions.muteUser(
        member,
        <User>this.client.user,
        'Automatically muted after three warnings'
      );
    }
  }

  public exec(): void {
    this.infractionsRepo = this.client.db.getRepository(Infractions);
  }
}

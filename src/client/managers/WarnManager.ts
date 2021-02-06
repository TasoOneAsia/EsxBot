import { GuildMember } from 'discord.js';
import { Repository } from 'typeorm';
import Infractions from '../../models/Infractions';
import { Manager } from '../../structures/managers/Manager';
export default class WarnManager extends Manager {
  private infractionsRepo!: Repository<Infractions>;

  constructor() {
    super('warn', {
      category: 'moderation',
    });
  }

  public async add(member: GuildMember, staff: string, reason?: string): Promise<void> {
    await this.infractionsRepo.insert({
      user: member.id,
      guildId: member.guild.id,
      staffMember: staff,
      reason: reason,
      infractionType: 'warn',
    });
  }

  public exec() {
    this.infractionsRepo = this.client.db.getRepository(Infractions);
  }
}

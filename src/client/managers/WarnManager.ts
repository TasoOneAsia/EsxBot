import { GuildMember } from 'discord.js';
export class WarnManager {
  public async add(member: GuildMember, reason?: string) {
    reason = reason || 'No reason specified';
    /* Add warning in sqlite */
  }
}

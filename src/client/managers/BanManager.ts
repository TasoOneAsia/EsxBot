import { Guild, GuildMember } from 'discord.js';

export class BanManager {
  /* Add logic for automatic unban */
  constructor() {
    /* Load timers from sqlite and run setTimeout on them. time: (timestampFromDb- Date.now()) */
  }

  public async add(member: GuildMember, duration?: number, reason?: string) {
    reason = reason || 'No reason specified';
    /* Add time in sqlite and run setTimeout */
  }
}

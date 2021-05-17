import { Listener, ListenerHandler } from 'discord-akairo';
import { MessageReaction, User } from 'discord.js';
import { Logger } from 'tslog';
import { DEVELOPER_ROLE_EMOTE, NEWBIE_ROLE_EMOTE } from '../../config';

export default class ReactRemoveRoleListener extends Listener {
  private readonly log: Logger;

  constructor(handler: ListenerHandler) {
    super('reactRoleRemoveListener', {
      event: 'messageReactionRemove',
      emitter: 'client',
    });

    this.log = handler.client.log.getChildLogger({
      name: 'RoleReactRemoveListener',
      prefix: ['[RoleReactRemoveListener]'],
    });
  }

  public async exec(reaction: MessageReaction, member: User): Promise<void> {
    const rawReactId = this.client.settings.get('react-channel');

    if (!rawReactId) {
      this.log.warn('React channel not setup yet! Aborting!');
      return;
    }

    if (reaction.message.channel.id === rawReactId) {
      const rawNewbieId = this.client.settings.get('newbie-role');
      const rawDevId = this.client.settings.get('dev-role');

      if (!rawNewbieId || !rawDevId) {
        this.log.warn('Newbie Role or Dev Role not yet setup! Aborting!');
        return;
      }

      const guildMember = reaction.message.guild?.member(member);

      const newbieRole = reaction.message.guild?.roles.cache.get(rawNewbieId);
      const devRole = reaction.message.guild?.roles.cache.get(rawDevId);

      if (reaction.emoji.name === NEWBIE_ROLE_EMOTE && newbieRole) {
        this.log.debug(`Newbie role removed from ${member.username}`);
        await guildMember?.roles.remove(newbieRole);
      }

      if (reaction.emoji.name === DEVELOPER_ROLE_EMOTE && devRole) {
        this.log.debug(`Dev role removed from ${member.username}`);
        await guildMember?.roles.remove(devRole);
      }
    }
  }
}

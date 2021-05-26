import { Listener, ListenerHandler } from 'discord-akairo';
import { MessageReaction, User } from 'discord.js';
import { Logger } from 'tslog';
import { ACKNOWLEDGE_REACT_EMOTE } from '../../config';

export default class RoleAddReactListener extends Listener {
  private readonly log: Logger;

  constructor(handler: ListenerHandler) {
    super('reactRoleListener', {
      event: 'messageReactionAdd',
      emitter: 'client',
    });

    this.log = handler.client.log.getChildLogger({
      name: 'RoleAddReactListener',
      prefix: ['[RoleAddReactListener]'],
    });
  }

  public async exec(reaction: MessageReaction, member: User): Promise<void> {
    const curReactChannel = this.client.settings.get('react-channel');

    if (!curReactChannel) {
      this.log.warn('No react-channel setting, aborting');
      return;
    }

    if (reaction.message.channel.id === curReactChannel && !member.bot) {
      const guildMember = reaction.message.guild?.member(member);

      const devRoleId = this.client.settings.get('dev-role');

      if (!devRoleId) {
        this.log.warn('No dev role in settings, aborting');
        return;
      }

      const devRole = reaction.message.guild?.roles.cache.get(devRoleId);

      if (reaction.emoji.name === ACKNOWLEDGE_REACT_EMOTE && devRole) {
        this.log.debug(`Dev role applied to ${member.username}`);
        await guildMember?.roles.add(devRole);
      }
    }
  }
}

import { Listener, ListenerHandler } from 'discord-akairo';
import { MessageReaction, User } from 'discord.js';
import { Logger } from 'tslog';
import { DEVELOPER_ROLE_EMOTE, NEWBIE_ROLE_EMOTE } from '../../config';

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

      const newbieRoleId = this.client.settings.get('newbie-role');
      const devRoleId = this.client.settings.get('dev-role');

      if (!newbieRoleId || !devRoleId) {
        this.log.warn('No newbie role or dev role in settings, aborting');
        return;
      }

      const newbieRole = reaction.message.guild?.roles.cache.get(newbieRoleId);

      const devRole = reaction.message.guild?.roles.cache.get(devRoleId);

      if (reaction.emoji.name === NEWBIE_ROLE_EMOTE && newbieRole) {
        this.log.debug(`Newbie role applied to ${member.username}`);
        await guildMember?.roles.add(newbieRole);
      }

      if (reaction.emoji.name === DEVELOPER_ROLE_EMOTE && devRole) {
        this.log.debug(`Dev role applied to ${member.username}`);
        await guildMember?.roles.add(devRole);
      }
    }
  }
}

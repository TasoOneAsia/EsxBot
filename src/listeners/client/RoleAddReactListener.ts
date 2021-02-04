import { Listener, ListenerHandler } from 'discord-akairo';
import { MessageReaction, User } from 'discord.js';
import { Logger } from 'tslog';
import { DEVELOPER_ROLE_EMOTE, NEWBIE_ROLE_EMOTE } from '../../config';

export default class RoleAddReactListener extends Listener {
  private readonly _logger: Logger;

  constructor(handler: ListenerHandler) {
    super('reactRoleListener', {
      event: 'messageReactionAdd',
      emitter: 'client',
    });

    this._logger = handler.client.log.getChildLogger({
      name: 'RoleAddReactListener',
      prefix: ['[RoleAddReactListener]'],
    });
  }

  public async exec(reaction: MessageReaction, member: User): Promise<void> {
    if (reaction.message.channel.id === process.env.REACT_ROLE_CHANNEL) {
      const guildMember = reaction.message.guild?.member(member);

      const newbieRole = reaction.message.guild?.roles.cache.get(
        <string>process.env.NEWBIE_ROLE_ID
      );
      const devRole = reaction.message.guild?.roles.cache.get(
        <string>process.env.DEVELOPER_ROLE_ID
      );

      if (reaction.emoji.name === NEWBIE_ROLE_EMOTE && newbieRole) {
        this._logger.debug(`Newbie role applied to ${member.username}`);
        await guildMember?.roles.add(newbieRole);
      }

      if (reaction.emoji.name === DEVELOPER_ROLE_EMOTE && devRole) {
        this._logger.debug(`Dev role applied to ${member.username}`);
        await guildMember?.roles.add(devRole);
      }
    }
  }
}

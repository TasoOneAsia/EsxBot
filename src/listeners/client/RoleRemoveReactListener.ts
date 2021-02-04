import { Listener, ListenerHandler } from 'discord-akairo';
import { MessageReaction, User } from 'discord.js';
import { Logger } from 'tslog';
import { DEVELOPER_ROLE_EMOTE, NEWBIE_ROLE_EMOTE } from '../../config';

export default class ReactRemoveRoleListener extends Listener {
  private readonly _logger: Logger;

  constructor(handler: ListenerHandler) {
    super('reactRoleRemoveListener', {
      event: 'messageReactionRemove',
      emitter: 'client',
    });

    this._logger = handler.client.log.getChildLogger({
      name: 'RoleReactRemoveListener',
      prefix: ['[RoleReactRemoveListener]'],
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
        this._logger.debug(`Newbie role removed from ${member.username}`);
        await guildMember?.roles.remove(newbieRole);
      }

      if (reaction.emoji.name === DEVELOPER_ROLE_EMOTE && devRole) {
        this._logger.debug(`Dev role removed from ${member.username}`);
        await guildMember?.roles.remove(devRole);
      }
    }
  }
}

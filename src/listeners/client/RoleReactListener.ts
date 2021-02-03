import { Listener, ListenerHandler } from 'discord-akairo';
import { MessageReaction, User } from 'discord.js';
import { Logger } from 'tslog';

export default class RuleReactListener extends Listener {
  private _logger: Logger;
  constructor(handler: ListenerHandler) {
    super('reactRoleListener', {
      event: 'messageReactionAdd',
      emitter: 'client',
    });

    this._logger = handler.client.log.getChildLogger({
      name: 'RoleReactListener',
      prefix: ['[RoleReactListener]'],
    });
  }

  public async exec(reaction: MessageReaction, member: User): Promise<void> {
    const guildMember = reaction.message.guild?.member(member);

    const newbieRole = reaction.message.guild?.roles.cache.get(
      <string>process.env.NEWBIE_ROLE_ID
    );
    const devRole = reaction.message.guild?.roles.cache.get(
      <string>process.env.DEVELOPER_ROLE_ID
    );

    if (reaction.emoji.name === '👍' && newbieRole) {
      this._logger.debug(`Newbie role applied to ${member.username}`);
      await guildMember?.roles.add(newbieRole);
    }

    if (reaction.emoji.name === '👎' && devRole) {
      this._logger.debug(`Dev role applied to ${member.username}`);
      await guildMember?.roles.add(devRole);
    }
  }
}

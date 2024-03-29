import { Listener, ListenerHandler } from 'discord-akairo';
import { Message, MessageEmbed, TextChannel, User } from 'discord.js';
import { Logger } from 'tslog';
import { modActionEmbed, discordCodeBlock } from '../../utils';
import { FILTER_WHITELIST_ROLES } from '../../config';

export default class GuildInvInhibitor extends Listener {
  private readonly _logger: Logger;
  constructor(handler: ListenerHandler) {
    super('guildInvListener', {
      event: 'message',
      emitter: 'client',
    });

    this._logger = handler.client.log.getChildLogger({
      name: 'GuildInvInhibitor',
      prefix: ['[GuildInvInhibitor]'],
    });
  }

  public async exec(msg: Message): Promise<void> {
    if (
      /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-z]/g.test(
        msg.content
      ) &&
      msg.guild
    ) {
      // TODO: Add auto warning
      if (msg.author.id === this.client.user?.id) return;

      const member = msg.guild.member(msg.author);
      // Exit if whitelisted
      for (const role of FILTER_WHITELIST_ROLES) {
        if (member?.roles.cache.has(role)) return;
      }

      this._logger.info(`Blocked message containing guild inv from ${msg.author.id}`);

      await msg.delete();
      if (member) {
        const embed = modActionEmbed({
          action: 'Blocked Invite',
          member,
          logger: this._logger,
          fields: [
            {
              name: 'Message Blocked',
              value: `${discordCodeBlock(msg.content)}`,
              inline: false,
            },
          ],
        });
        await this.client._actions.warn(
          member,
          <User>this.client.user,
          'Posting discord invites for a guild'
        );
        await this._sendToModLog(embed);
      }
    }
  }

  private async _sendToModLog(embed: MessageEmbed) {
    if (!process.env.ADMIN_LOG_CHANNEL_ID)
      throw new Error('ADMIN_LOG_CHANNEL_ID Env variable not defined');

    const channel = this.client.channels.cache.get(
      <string>process.env.ADMIN_LOG_CHANNEL_ID
    ) as TextChannel;
    try {
      await channel.send(embed);
    } catch (e) {
      this._logger.error(e);
    }
  }
}

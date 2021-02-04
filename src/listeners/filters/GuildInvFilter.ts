import { Listener, ListenerHandler } from 'discord-akairo';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { Logger } from 'tslog';
import { modActionEmbed } from '../../utils/moderationUtils';
import { discordCodeBlock } from '../../utils/miscUtils';
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
      )
    ) {
      // TODO: Add auto warning
      const member = msg.guild!.member(msg.author);
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
        await this._sendToModLog(embed);
      }
    }
  }

  private async _sendToModLog(embed: MessageEmbed) {
    if (!process.env.ADMIN_LOG_CHANNEL_ID)
      throw new Error('LOG_CHANNEL Env variable not defined');

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

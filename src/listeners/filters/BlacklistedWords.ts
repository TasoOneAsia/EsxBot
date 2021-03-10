import { Listener, ListenerHandler } from 'discord-akairo';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { Logger } from 'tslog';
import { modActionEmbed, discordCodeBlock } from '../../utils';
import { BLACKLISTED_WORDS, FILTER_WHITELIST_ROLES } from '../../config';

export default class GuildInvInhibitor extends Listener {
  private readonly _logger: Logger;
  constructor(handler: ListenerHandler) {
    super('blacklistWordListener', {
      event: 'message',
      emitter: 'client',
    });

    this._logger = handler.client.log.getChildLogger({
      name: 'blacklistWordListener',
      prefix: ['[blacklistWordListener]'],
    });
  }

  public async exec(msg: Message): Promise<void> {
    if (this._isBlacklisted(msg.content) && msg.guild) {
      // TODO: Add auto warning
      const member = msg.guild.member(msg.author);
      // Exit if whitelisted
      for (const role of FILTER_WHITELIST_ROLES) {
        if (member?.roles.cache.has(role)) return;
      }

      this._logger.info(`Blocked message containing guild inv from ${msg.author.id}`);

      await msg.delete();
      if (member) {
        const embed = modActionEmbed({
          action: 'Blacklisted Word',
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
      throw new Error('ADMIN_LOG_CHANNEL Env variable not defined');

    const channel = this.client.channels.cache.get(
      <string>process.env.ADMIN_LOG_CHANNEL_ID
    ) as TextChannel;
    try {
      await channel.send(embed);
    } catch (e) {
      this._logger.error(e);
    }
  }

  private _isBlacklisted(message: string) {
    return BLACKLISTED_WORDS.find((word: string) => {
      const regex = new RegExp(`\\b${word}\\b`, 'i'); // if the phrase is not alphanumerical,
      return regex.test(message);
    });
  }
}

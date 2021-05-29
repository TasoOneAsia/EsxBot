import { Manager } from '../../structures/managers/Manager';
import { ManagerHandler } from '../../structures/managers/ManagerHandler';
import { Logger } from 'tslog';
import { Guild, Message, MessageEmbed, TextChannel } from 'discord.js';
import { stripIndent } from 'common-tags';
import { ACKNOWLEDGE_REACT_EMOTE } from '../../config';
import { EventEmitter } from 'events';
import { TypeOrmProviderEvents } from '../../structures/TypeORMProvider';
import { GuildSettingsJSON } from '../../types';
import { getGuildIcon } from '../../utils';

export default class SetupRoleReactManager extends Manager {
  private readonly log: Logger;
  private currentChannel: TextChannel | null = null;
  private readonly embedTitleText = `I've acknowledged the rules!`;
  private readonly settingsEmitter: EventEmitter;
  private guildObj: Guild | null = null;

  constructor(handler: ManagerHandler) {
    super('role-react-manager', {
      category: 'Misc',
    });

    this.log = handler.client.log.getChildLogger({
      name: 'SetupRoleReactManager',
      prefix: ['[SetupRoleReactManager]'],
    });

    this.settingsEmitter = handler.client.settings.eventEmitter;
  }

  public async exec(): Promise<void> {
    if (!this.client.isReady) return;
    await this.setupChannels();
  }

  public async onReady(): Promise<void> {
    await this.setupChannels();
  }

  private async setupChannels() {
    if (!this.client.isReady) return;

    this.registerEmitterHandlers();
    const reactChannel = this.client.settings.get('react-channel');

    this.log.debug(reactChannel);

    if (!reactChannel) {
      this.log.warn('React channel not setup yet! Aborting!');
      return;
    }

    await this.cacheReactChannel(reactChannel);
  }

  private registerEmitterHandlers() {
    this.settingsEmitter.on(TypeOrmProviderEvents.AllSettingsChanged, () =>
      this.ensureFreshEmbed().catch((e) =>
        this.log.error(
          `Error handling event ${TypeOrmProviderEvents.AllSettingsChanged}`,
          e
        )
      )
    );

    this.settingsEmitter.on(
      TypeOrmProviderEvents.SettingChanged,
      // Who knows if i need this old value rn
      (key: keyof GuildSettingsJSON) => {
        if (key === 'react-channel') {
          this.ensureFreshEmbed().catch((e) =>
            this.log.error(
              `Error handling event ${TypeOrmProviderEvents.SettingChanged}`,
              e
            )
          );
        }
      }
    );
  }

  public async ensureFreshEmbed(): Promise<void> {
    const reactChannel = this.client.settings.get('react-channel');

    if (!reactChannel) {
      this.log.warn('React channel not setup yet! Aborting!');
      return;
    }

    // Remove before we switch currentChannel ctx
    await this.checkIfBotHasEmbed(true);

    await this.cacheReactChannel(reactChannel);
    await this.sendToChannelAndReact();
  }

  public checkIfBotHasEmbed(removeMsg?: boolean): boolean {
    const botMsgs = this.currentChannel?.messages.cache.filter(
      (value: Message) => value.author.id === this.client.user!.id
    );

    if (botMsgs) {
      const msg = botMsgs.find((v: Message) => v.embeds[0].title === this.embedTitleText);

      if (msg && removeMsg) msg.delete({ timeout: 500 });

      return Boolean(msg);
    }

    return false;
  }

  private async sendToChannelAndReact(): Promise<void> {
    if (!this.currentChannel) {
      this.log.warn('Current channel is null');
      return;
    }

    const sendEmbed = this.getReactRoleEmbed();
    const msg = await this.currentChannel.send(sendEmbed);

    await msg.react(ACKNOWLEDGE_REACT_EMOTE);

    this.log.info('Sent react role embed sucessfully!');
  }

  private getReactRoleEmbed(): MessageEmbed {
    return new MessageEmbed()
      .setTitle(this.embedTitleText)
      .setColor('GOLD')
      .setThumbnail(getGuildIcon(this.guildObj!))
      .setDescription(
        stripIndent`
        **Notice**: *We do not provide any public support in this Discord. If this is what you are looking for please find an ESX Support Community*.
        *We do provide courtesy support to Patreons, in our free time.*

        *Please react to this message with ${ACKNOWLEDGE_REACT_EMOTE} after you have acknowledged the rules*.
      
        *You should receive the \`Developer\` role afterwards, and you will gain access to the rest of the Discord*.
      `
      )
      .setFooter('A message from the ESX Team');
  }

  private async cacheReactChannel(reactChannel: string): Promise<void> {
    const channelFromCache = (await this.client.channels.fetch(
      reactChannel
    )) as TextChannel;

    if (!channelFromCache) throw new Error('Unable to find that channel in cache');

    this.currentChannel = channelFromCache;

    this.guildObj = channelFromCache.guild;

    await channelFromCache.messages.fetch({
      limit: 50,
    });
  }
}

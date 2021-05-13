import { Manager } from '../../structures/managers/Manager';
import { ManagerHandler } from '../../structures/managers/ManagerHandler';
import { Logger } from 'tslog';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { stripIndent } from 'common-tags';
import { DEVELOPER_ROLE_EMOTE, NEWBIE_ROLE_EMOTE } from '../../config';
import EventEmitter from 'events';
import { TypeOrmProviderEvents } from '../../structures/TypeORMProvider';
import { GuildSettingsJSON } from '../../types';

export default class SetupRoleReactManager extends Manager {
  private readonly log: Logger;
  private currentChannel: TextChannel | null = null;
  private readonly embedTitleText = 'React with Your Level';
  private readonly settingsEmitter: EventEmitter;

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
    this.registerEmitterHandlers();
    const reactChannel = this.client.settings.get('react-channel');

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
      (key: keyof GuildSettingsJSON, oldValue: unknown) => {
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

    await msg.react(NEWBIE_ROLE_EMOTE);
    await msg.react(DEVELOPER_ROLE_EMOTE);

    this.log.info('Sent react role embed sucessfully!');
  }

  private getReactRoleEmbed(): MessageEmbed {
    return new MessageEmbed()
      .setTitle(this.embedTitleText)
      .setDescription(
        stripIndent`
        **Please react to this message with the emote you feel represents your skill**

        **Newbie** ${NEWBIE_ROLE_EMOTE} - Newbie to ESX/FiveM without much prior knowledge.
        **Developer** ${DEVELOPER_ROLE_EMOTE} - Well versed with ESX & FiveM and has the skills to develop for it.

        *If you wish to switch roles just remove your previous reaction and add a new one*
      `
      )
      .setFooter('From the ESX Org');
  }

  private async cacheReactChannel(reactChannel: string): Promise<void> {
    const channelFromCache = this.client.channels.cache.get(reactChannel) as TextChannel;

    if (!channelFromCache) throw new Error('Unable to find that channel in cache');

    this.currentChannel = channelFromCache;

    await channelFromCache.messages.fetch({
      limit: 50,
    });
  }
}

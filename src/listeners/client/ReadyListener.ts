import { Listener } from 'discord-akairo';
import { TextChannel } from 'discord.js';

export default class ReadyListener extends Listener {
  public constructor() {
    super('ready', {
      emitter: 'client',
      event: 'ready',
      category: 'client',
    });
  }

  public async exec(): Promise<void> {
    const readyLog = this.client.log.getChildLogger({ name: 'ReadyEvent' });

    readyLog.info(`${this.client.user?.tag} is now online!`);
    //Sets Presence
    this.client.user?.setPresence({
      activity: { type: 'WATCHING', name: 'over ESX Server' },
    });
    await this._setUpReactChannel();
  }

  private async _setUpReactChannel(): Promise<void> {
    const channel = await (this.client.channels.cache.get(
      <string>process.env.REACT_ROLE_CHANNEL
    ) as TextChannel);
    await channel.messages.fetch({ limit: 100 });
  }
}

import { Listener } from 'discord-akairo';

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
      activity: { type: 'WATCHING', name: ' the ESX Discord' },
    });

    this.client.isReady = true;
  }
}

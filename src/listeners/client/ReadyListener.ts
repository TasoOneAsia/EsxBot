import { Listener } from 'discord-akairo';
import * as Config from '../../config';

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

    readyLog.info('Currrent Environment', Config);
    this.client.user?.setPresence({
      activity: { type: 'WATCHING', name: ' the ESX Discord' },
    });

    this.client.isReady = true;
  }
}

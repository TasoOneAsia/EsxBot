import { Listener } from 'discord-akairo';

export default class ErrorEventListener extends Listener {
  public constructor() {
    super('error', {
      event: 'error',
      emitter: 'commandHandler',
      category: 'commmandHandler',
    });
  }

  public exec(e: Error): void {
    const errorLog = this.client.log.getChildLogger({ name: 'GenError' });
    errorLog.error(e);
  }
}

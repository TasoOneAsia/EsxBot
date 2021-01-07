import { Listener } from 'discord-akairo';

export default class UnhandledRejectionListener extends Listener {
  public constructor() {
    super('unhandledRejection', {
      event: 'unhandledRejection',
      emitter: 'process',
    });
  }

  public exec(e: Error): void {
    const errorLog = this.client.log.getChildLogger({ name: 'unhandledRejection' });
    errorLog.error(e);
  }
}

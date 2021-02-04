import { Listener, ListenerHandler } from 'discord-akairo';
import { Logger } from 'tslog';

export default class UnhandledRejectionListener extends Listener {
  private _logger: Logger;

  public constructor(handler: ListenerHandler) {
    super('uncaughtException', {
      event: 'uncaughtException',
      emitter: 'process',
    });

    this._logger = handler.client.log.getChildLogger({
      name: 'UncaughtException',
      prefix: ['[UncaughtException]'],
    });
  }

  public exec(e: Error): void {
    this._logger.error(e);
  }
}

import { AkairoHandler } from 'discord-akairo';
import EsxBot from '../../client/EsxBot';
import { Manager } from './Manager';

interface IManagerHandlerOptions {
  classToHandle?: typeof Manager;
  directory: string;
  extensions?: string[];
}

export class ManagerHandler extends AkairoHandler {
  constructor(
    client: EsxBot,
    {
      directory,
      classToHandle = Manager,
      extensions = ['.js', '.ts'],
    }: IManagerHandlerOptions
  ) {
    if (!(classToHandle.prototype instanceof Manager || classToHandle === Manager)) {
      client.log.error('FUCKING SHIT BROKE FUCKING SHIT');
    }

    super(client, {
      directory,
      classToHandle,
      extensions,
    });

    this.setup();
  }

  private setup() {
    this.client.once('ready', () => {
      for (const manager of this.modules.values()) {
        (<Manager>manager).exec();
      }
    });
  }

  register(manager: Manager, filepath: string) {
    super.register(manager, filepath);
    manager.exec = manager.exec.bind(manager);
    return manager;
  }
}

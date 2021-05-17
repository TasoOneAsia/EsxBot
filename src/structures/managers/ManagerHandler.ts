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
      throw new Error(`INVALID_CLASS_TO_HANDLE: ${classToHandle.name} ${Manager.name});`);
    }

    super(client, {
      directory,
      classToHandle,
      extensions,
    });

    this.setup();
  }

  private setup() {
    this.on('load', (mod) => {
      const module = this.modules.get(mod.id) as Manager | undefined;
      if (module) {
        module.exec();
      }
    });
  }

  register(manager: Manager, filepath: string): Manager {
    super.register(manager, filepath);
    manager.exec = manager.exec.bind(manager);
    return manager;
  }
}

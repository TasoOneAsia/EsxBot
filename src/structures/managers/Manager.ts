import { AkairoModule } from 'discord-akairo';

interface IManagerOptions {
  category?: string;
  categoryId?: string;
}

export class Manager extends AkairoModule {
  constructor(id: string, options: IManagerOptions = {}) {
    super(id, options);
  }

  public exec(): void {
    this.client.log.error('EXEC NOT IMPLEMENTED IN MANAGER');
  }
}

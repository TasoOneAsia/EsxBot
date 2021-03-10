import { AkairoModule } from 'discord-akairo';

interface IManagerOptions {
  category: string;
}

export class Manager extends AkairoModule {
  constructor(id: string, { category }: IManagerOptions) {
    super(id, { category });
  }

  public exec(): void {
    this.client.log.error('EXEC NOT IMPLEMENTED IN MANAGER');
  }
}

import { Command } from 'discord-akairo';

export default class ErrorCommand extends Command {
  constructor() {
    super('error', {
      aliases: ['error'],
      category: 'Debug',
      description: {
        content: 'Throws a debug error',
        usage: 'error',
        examples: ['error'],
      },
      ownerOnly: true,
    });
  }

  public exec(): void {
    throw new Error('Yes hello i am error');
  }
}

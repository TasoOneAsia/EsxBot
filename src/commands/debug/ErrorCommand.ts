import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class StatusCommand extends Command {
  constructor() {
    super('error', {
      aliases: ['error'],
      category: 'Debug',
      description: {
        content: 'Returns stats for Guild and Bot',
        usage: 'status',
        examples: ['status'],
      },
      ownerOnly: true,
    });
  }

  public exec(msg: Message): void {
    throw new Error('Yes hello i am error');
  }
}

import { Command, CommandHandler } from 'discord-akairo';
import { Logger } from 'tslog';
import { GuildMember, Message } from 'discord.js';

interface LMGTFYCommandArgs {
  member: GuildMember;
  query: string;
}

export default class LMGTFYCommand extends Command {
  private readonly log: Logger;

  constructor(handler: CommandHandler) {
    super('lmgtfyCmd', {
      aliases: ['lmgtfy', 'google'],
      channel: 'guild',
      typing: true,
      args: [
        {
          id: 'member',
          prompt: {
            start: `Provide the member to tag`,
            retry: `Invalid member`,
          },
          type: 'member',
        },
        {
          id: 'query',
          prompt: {
            start: `What would you like to query?`,
            retry: `What would you like to query?`,
          },
          match: 'rest',
        },
      ],
    });

    this.log = handler.client.log.getChildLogger({
      name: 'lmgtfyCmd',
      prefix: ['[LMGTFYCmd]'],
    });
  }

  public async exec(
    msg: Message,
    { member, query }: LMGTFYCommandArgs
  ): Promise<Message> {
    const link = LMGTFYCommand.createLink(query);
    await msg.channel.send(`${member}, ${link}`);
    return msg.delete();
  }

  private static createLink(query: string): string {
    const baseLink = 'https://lmgtfy.app/?q=';
    const cleanedQuery = query.replace(/\s/g, '+');
    return baseLink + cleanedQuery;
  }
}

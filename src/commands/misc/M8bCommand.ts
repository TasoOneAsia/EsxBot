import { Message } from 'discord.js';
import { Command, CommandHandler } from 'discord-akairo';
import { makeSimpleEmbed } from '../../utils';
import { Logger } from 'tslog';
import { MagicEightBallResps } from '../../config';
interface IM8bArgs {
  question: string;
}
export default class M8BCommand extends Command {
  private readonly _logger: Logger;
  constructor(handler: CommandHandler) {
    super('m8b', {
      aliases: ['m8b', '8ball'],
      description: {
        content: 'Decides things for you',
        usage: 'm8b [question]',
      },
      category: 'Misc',
      channel: 'guild',
      args: [
        {
          prompt: {
            retry: (msg: Message) => `${msg.author}, ask a question`,
          },
          id: 'question',
          match: 'rest',
        },
      ],
    });

    this._logger = handler.client.log.getChildLogger({
      name: 'M8bCmd',
      prefix: ['[M8bCmd]'],
    });
  }
  public async exec(msg: Message, { question }: IM8bArgs): Promise<Message> {
    const answer =
      MagicEightBallResps[Math.floor(Math.random() * MagicEightBallResps.length)];
    const embed = makeSimpleEmbed(
      `You asked: \`${question}\` \n :8ball: : \`${answer}\``
    );

    return msg.channel.send(embed);
  }
}

import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandHandler } from 'discord-akairo';
import { Logger } from 'tslog';
const replies = [
  `It is certain`,
  `It is decidedly so`,
  `Without a doubt`,
  `Yes, definitely`,
  `You may rely on it`,
  `As I see it, yes`,
  `Most likely`,
  `Outlook good`,
  `Signs point to yes`,
  `Yes`,
  `Reply hazy, try again`,
  `Ask again later`,
  `Better not tell you now`,
  `Cannot predict now`,
  `Concentrate and ask again`,
  `Don't bet on it`,
  `My reply is no`,
  `My sources say no`,
  `Outlook not so good`,
  `Very doubtful`,
];

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
    });

    this._logger = handler.client.log.getChildLogger({
      name: 'M8bCmd',
      prefix: ['[M8bCmd]'],
    });
  }

  public async exec(msg: Message): Promise<Message | undefined> {
    const answer = replies[Math.floor(Math.random() * replies.length)];
    const ques = msg.content.substring(msg.content.indexOf(' ') + 1);
    const embed = new MessageEmbed()
      .setTitle(`You asked: \`${ques}\``)
      .setDescription(`:8ball: : \`${answer}\``)
      .setColor('RANDOM');
    return msg.util?.send(embed);
  }
}

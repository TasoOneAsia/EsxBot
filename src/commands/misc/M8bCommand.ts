import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandHandler } from 'discord-akairo';
import { Logger } from 'tslog';
import { REPLIES } from '../../config';

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
    const answer = REPLIES[Math.floor(Math.random() * REPLIES.length)];
    const ques = msg.content.substring(msg.content.indexOf(' ') + 1);
    const embed = new MessageEmbed()
      .setTitle(`You asked: \`${ques}\``)
      .setDescription(`:8ball: : \`${answer}\``)
      .setColor('RANDOM');
    return msg.channel.send(embed);
  }
}

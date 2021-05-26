import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandHandler } from 'discord-akairo';
import { Logger } from 'tslog';

interface IPollArguments {
  question: string;
  options: string;
}

const reactions: { [key: number]: string } = {
  0: '1⃣',
  1: '2⃣',
  2: '3⃣',
  3: '4⃣',
  4: '5⃣',
  5: '6⃣',
  6: '7⃣',
  7: '8⃣',
  8: '9⃣',
  9: '🔟',
  10: '🏷️',
  11: '🔔',
  12: '⚜️',
  13: '🅰️',
  14: '🅿️',
};

export default class PollCommand extends Command {
  private log: Logger;
  public constructor(handler: CommandHandler) {
    super('poll', {
      aliases: ['poll'],
      description: {
        content: 'Does a fancy poll with fancy reactions.',
        usage: 'poll <question> [answer1] [answer2]',
        examples: [
          'poll "Do I like apples?"',
          'poll "Why this is not working?" "I don\'t know how to code" "Who knows?"',
        ],
      },
      category: 'Moderation',
      clientPermissions: ['MANAGE_MESSAGES'],
      userPermissions: ['MANAGE_MESSAGES'],
      args: [
        {
          id: 'question',
          type: 'string',
          prompt: {
            start: 'Please provide the question of the poll.',
          },
        },
        {
          id: 'options',
          type: 'string',
          match: 'separate',
          prompt: {
            start: [
              'What are the options to choose from? Type them in separate messages (max 15)',
              'Type `stop` when you are done.',
            ],
            limit: 15,
          },
        },
      ],
      channel: 'guild',
    });

    this.log = handler.client.log.getChildLogger({
      name: 'PollCmd',
      prefix: ['PollCmd'],
    });
  }
  public async exec(
    msg: Message,
    { question, options }: IPollArguments
  ): Promise<Message | void> {
    let answers = '';
    for (let i = 0; i < options!.length; i++) {
      answers += `${reactions[i]}  ${options![i]}\n`;
    }

    const name = msg.guild!.member(msg.author)?.displayName || msg.author.tag;

    const msgEmbed = new MessageEmbed()
      .setAuthor(`${name} asked`, msg.author.displayAvatarURL())
      .setColor('#1E90FF')
      .setTitle(question)
      .setDescription(answers)
      .setFooter('Poll was created')
      .setTimestamp();

    const message = await msg.channel.send(msgEmbed);

    for (let i = 0; i < options!.length; i++) {
      await message.react(reactions[i]);
    }
  }
}

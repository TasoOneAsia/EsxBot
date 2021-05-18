import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandHandler } from 'discord-akairo';
import { Logger } from 'tslog';
import { makeSimpleEmbed } from '../../utils';

const reactions: { [key: number]: string } = {
  1: '1⃣',
  2: '2⃣',
  3: '3⃣',
  4: '4⃣',
  5: '5⃣',
  6: '6⃣',
  7: '7⃣',
  8: '8⃣',
  9: '9⃣',
  10: '🔟',
  11: '🏷️',
  12: '🔔',
  13: '⚜️',
  14: '🅰️',
  15: '🅿️',
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
      channel: 'guild',
    });

    this.log = handler.client.log.getChildLogger({
      name: 'PollCmd',
      prefix: ['PollCmd'],
    });
  }
  public async exec(msg: Message): Promise<Message | null> {
    const regex = /"((?:\\.|[^"\\])*)"/g;
    const matches = msg.content.match(regex);

    if (matches!.length <= 0) {
      return PollCommand._sendErrorMessage(msg, 'You need to define the poll.');
    }

    let answers = '';
    if (matches!.length == 1) {
      answers += `${reactions[1]} Yes\n${reactions[2]}  No`;
    } else {
      for (let i = 1; i < matches!.length; i++) {
        answers += `${reactions[i]}  ${matches![i].replace(/^"|"$/g, '')}\n`;
      }
    }

    const msgEmbed = new MessageEmbed()
      .setTitle('ESX Poll')
      .setColor('#1E90FF')
      .setThumbnail(<string>msg.guild?.iconURL());

    msgEmbed.addFields([
      {
        name: 'Question',
        value: matches![0].replace(/^"|"$/g, ''),
        inline: false,
      },
      {
        name: 'Options',
        value: answers,
        inline: false,
      },
    ]);

    const message = await msg.channel.send(msgEmbed);

    if (matches!.length == 1) {
      message.react(reactions[1]);
      message.react(reactions[2]);
    } else {
      for (let i = 1; i < matches!.length; i++) {
        message.react(reactions[i]);
      }
    }

    return null;
  }

  private static async _sendErrorMessage(msg: Message, e: string): Promise<Message> {
    return await msg.channel.send(makeSimpleEmbed(`**Error**: ${e}`, 'RED'));
  }
}

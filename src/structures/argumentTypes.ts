import { Message } from 'discord.js';
import { parseTimeFromString } from '../utils';
import EsxBot from '../client/EsxBot';

export const duration = (EsxBot: EsxBot, message: Message, phrase: string): any => {
  if (!phrase) return null;
  if (phrase == 'perma') return 'perma';

  const duration = parseTimeFromString(phrase);
  if (duration !== null && duration <= 0) return null; // Prevent permanent bans as 0d could return 0 and cause a permanent ban if there we're no proper checks! Also stops time machines

  return duration;
};

export const othermembers = (EsxBot: EsxBot, message: Message, phrase: string): any => {
  if (!phrase) return null;

  const memberType = EsxBot.commandHandler.resolver.type('member');
  const member = memberType(message, phrase);

  if (!member || member.id == message.author.id) return null;
  return member;
};

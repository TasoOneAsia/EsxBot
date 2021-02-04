import { Message } from 'discord.js';
import { parseTimeFromString } from '../utils';
import EsxBot from '../client/EsxBot';

export const duration = (EsxBot: EsxBot, message: Message, phrase: string): any => {
  if (!phrase) return null;
  if (phrase == 'perma') return 'perma';

  return parseTimeFromString(phrase);
};

export const othermembers = (EsxBot: EsxBot, message: Message, phrase: string): any => {
  if (!phrase) return null;

  const memberType = EsxBot.commandHandler.resolver.type('member');
  const member = memberType(message, phrase);

  if (!member || member.id == message.author.id) return null;
  return member;
};

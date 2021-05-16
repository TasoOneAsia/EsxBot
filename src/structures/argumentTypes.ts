/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Message } from 'discord.js';
import { parseTimeFromString } from '../utils';
import EsxBot from '../client/EsxBot';

export const duration = (EsxBot: EsxBot, message: Message, phrase: string): any => {
  if (!phrase) return null;
  if (phrase == 'perma') return 'perma';

  const duration = parseTimeFromString(phrase);
  // Prevent permanent bans as 0d could return 0 and cause a permanent ban if there we're no proper checks! Also stops time machines
  if (duration !== null && duration <= 0) return null;
  if (duration !== null && duration > 5000000000) return 'perma'; // Year 2128

  return duration;
};

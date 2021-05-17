import { Message } from 'discord.js';
import { AkairoHandler } from 'discord-akairo';

export const isAdminOrOwner = <T extends AkairoHandler>(
  msg: Message,
  handler: T
): string | null => {
  if (
    !msg.member!.permissions.has('ADMINISTRATOR') &&
    !handler.client.ownerID.includes(msg.member!.id)
  ) {
    return 'Admin or Owner';
  }
  return null;
};

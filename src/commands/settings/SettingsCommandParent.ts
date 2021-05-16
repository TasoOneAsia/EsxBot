import { ArgumentOptions, Command, CommandHandler, Flag } from 'discord-akairo';
import { Message } from 'discord.js';

export default class SettingsCommandParent extends Command {
  constructor(handler: CommandHandler) {
    super('settings', {
      aliases: ['settings'],
      description: {
        usage: 'settings <get|set|init> <setting>',
      },
      channel: 'guild',
      userPermissions: (msg: Message) => {
        if (
          !msg.member!.permissions.has('ADMINISTRATOR') &&
          !handler.client.ownerID.includes(msg.member!.id)
        ) {
          return 'Admin or Owner';
        }
        return null;
      },
    });
  }

  *args(): IterableIterator<ArgumentOptions | Flag> {
    const command = yield {
      type: [
        ['settings-set', 'set'],
        ['settings-get', 'get'],
        ['settings-init', 'init'],
      ],
      prompt: {
        start: () => `Please use a valid command (set/get/init)`,
        retry: () => `Please use a valid command (set/get/init)`,
      },
    };

    if (command) return Flag.continue(command);
  }
}

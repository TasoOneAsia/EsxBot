import { ArgumentOptions, Command, CommandHandler, Flag } from 'discord-akairo';
import { Message, MessageEmbed, Role, TextChannel } from 'discord.js';
import { Logger } from 'tslog';
import { Repository } from 'typeorm';
import GuildSettings from '../../models/GuildSettings';
import { discordCodeBlock, makeSimpleEmbed } from '../../utils';
import { prefixPromptType } from '../../structures/argumentTypeUtils';
import { GuildSettingsJSON } from '../../types';

export interface SettingsCommandArgs {
  prefix: string;
  basicLogChannel: TextChannel;
  adminLogChannel: TextChannel;
  rulesChannel: TextChannel;
  reactChannel: TextChannel;
  devRole: Role;
  muteRole: Role;
  lockRole: Role;
}

export default class SettingsCommandInit extends Command {
  private log: Logger;
  private settingsRepo: Repository<GuildSettings>;

  constructor(handler: CommandHandler) {
    super('settings-init', {
      aliases: ['init'],
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

    this.settingsRepo = handler.client.db.getRepository(GuildSettings);

    this.log = handler.client.log.getChildLogger({
      name: 'SettingsInit',
      prefix: ['[SettingsInit]'],
    });
  }

  async *args(msg: Message): AsyncGenerator<ArgumentOptions> {
    const guildSettings = this.client.settings.getAllValues();

    if (guildSettings) {
      const embed = makeSimpleEmbed('This is your first time setting up!', 'BLUE');
      await msg.channel.send(embed);
    } else {
      const embed = makeSimpleEmbed(
        'Warning this will overwrite your current config',
        'YELLOW'
      );
      const confirm = yield {
        type: ['confirm', 'cancel'],
        prompt: {
          timeout: 0,
          optional: false,
          start: () => `\`Confirm\` or \`Cancel\``,
          retry: () => `Please type Confirm/Cancel`,
        },
      };
      await msg.channel.send(embed);
      if (confirm === 'confirm') {
        return Flag.cancel();
      }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const prefix: string = yield {
      type: prefixPromptType,
      prompt: {
        timeout: 0,
        start: () => `What do you want to change the prefix to? ($, !, anything)`,
        retry: (msg: Message) =>
          `${msg.author}, this is an invalid prefix (longer than 4 chars)!`,
      },
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const basicLogChannel: TextChannel = yield {
      type: 'textChannel',
      prompt: {
        timeout: 0,
        start: () => `Which channel would you like to assign for the basic logs?`,
        retry: (msg: Message) => `${msg.author}, this is an invalid channel try again`,
      },
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const adminLogChannel: TextChannel = yield {
      type: 'textChannel',
      prompt: {
        timeout: 0,
        start: () => `Which channel would you like to assign for mod logs?`,
        retry: (msg: Message) => `${msg.author}, this is an invalid channel try again`,
      },
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const rulesChannel: TextChannel = yield {
      type: 'textChannel',
      prompt: {
        timeout: 0,
        start: () => `Which channel would you like to assign for rules?`,
        retry: (msg: Message) => `${msg.author}, this is an invalid channel try again`,
      },
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const reactChannel: TextChannel = yield {
      type: 'textChannel',
      prompt: {
        timeout: 0,
        start: () => `Which channel would you like to assign for react roles?`,
        retry: (msg: Message) => `${msg.author}, this is an invalid channel try again`,
      },
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const devRole: Role = yield {
      type: 'role',
      prompt: {
        timeout: 0,
        start: () => `Which role would you like to assign for the develop role handling?`,
        retry: (msg: Message) => `${msg.author}, this is an invalid role try again`,
      },
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const muteRole: Role = yield {
      type: 'role',
      prompt: {
        timeout: 0,
        start: () => `Which role would you like to assign for the mute role handling?`,
        retry: (msg: Message) => `${msg.author}, this is an invalid role try again`,
      },
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const lockRole: Role = yield {
      type: 'role',
      prompt: {
        timeout: 0,
        start: () =>
          `Which role would you like to assign for the maximum lock role handling?`,
        retry: (msg: Message) => `${msg.author}, this is an invalid role try again`,
      },
    };

    const mapArgsToJSON: GuildSettingsJSON = {
      prefix,
      'basic-log-channel': basicLogChannel.id,
      'admin-log-channel': adminLogChannel.id,
      'rules-channel': rulesChannel.id,
      'react-channel': reactChannel.id,
      'dev-role': devRole.id,
      'mute-role': muteRole.id,
      'lock-role': lockRole.id,
    };

    const confirmOptions = yield {
      type: ['confirm', 'exit'],
      prompt: {
        modifyStart: () => {
          const embed = new MessageEmbed()
            .setTitle('Confirm your selection')
            .setColor('GREEN')
            .setFooter('Type `CONFIRM` to confirm or `EXIT` to exit')
            .setDescription(discordCodeBlock(JSON.stringify(mapArgsToJSON, null, 2)));
          return { embed };
        },
        retry: (msg: Message) => `${msg.author}, this is an invalid option try again`,
      },
    };

    if (confirmOptions === 'exit') {
      await msg.util!.send(makeSimpleEmbed('Cancelled init!', 'GREEN'));
      return Flag.cancel();
    }

    return {
      prefix,
      basicLogChannel,
      adminLogChannel,
      rulesChannel,
      reactChannel,
      muteRole,
      devRole,
      lockRole,
    };
  }

  public async exec(
    msg: Message,
    {
      adminLogChannel,
      basicLogChannel,
      rulesChannel,
      reactChannel,
      muteRole,
      devRole,
      lockRole,
      prefix,
    }: SettingsCommandArgs
  ): Promise<Message | void> {
    const mapArgsToJSON: GuildSettingsJSON = {
      prefix,
      'basic-log-channel': basicLogChannel.id,
      'admin-log-channel': adminLogChannel.id,
      'rules-channel': rulesChannel.id,
      'react-channel': reactChannel.id,
      'dev-role': devRole.id,
      'mute-role': muteRole.id,
      'lock-role': lockRole.id,
    };

    this.log.silly('Init Data Resolved', mapArgsToJSON);

    await this.client.settings.setAll(mapArgsToJSON);

    const successEmbed = makeSimpleEmbed('Initialized Settings!', 'GREEN');
    return msg.channel.send(successEmbed);
  }
}

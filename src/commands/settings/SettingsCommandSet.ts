import { Command, CommandHandler } from 'discord-akairo';
import { Message, Role, TextChannel } from 'discord.js';
import { Logger } from 'tslog';
import { GuildInteractSettings } from '../../config';
import { GuildSettingsJSON } from '../../types';
import { makeSimpleEmbed } from '../../utils';

export type ResolvableSetSettingArgTypes = 'role' | 'textChannel' | 'string';

export default class SettingsCommandSet extends Command {
  private log: Logger;

  constructor(handler: CommandHandler) {
    super('settings-set', {
      aliases: ['set'],
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
      args: [
        {
          id: 'setting',
          prompt: {
            start:
              `Invalid Setting. Please try again.\n\n` +
              `Options: \`(${GuildInteractSettings.join(', ')}\`)`,
            retry:
              `Invalid Setting. Please try again.\n\n` +
              `Options: \`(${GuildInteractSettings.join(', ')}\`)`,
          },
          type: GuildInteractSettings,
        },
        {
          // TODO: Make this automatically cast and prompt
          id: 'value',
          prompt: {
            start: `You must pass a value`,
            // retry: (msg: Message) => {
            //   const rawSplit: string[] = msg.cleanContent.split(' ');
            //
            //   const target =
            //     (rawSplit[2] as keyof GuildSettingsJSON) ||
            //     (rawSplit[0] as keyof GuildSettingsJSON);
            //
            //   const type = guildSettingToTypeMap[target] || 'Unknown';
            //
            //   return `The \`${target}\` setting can be this type: \`${type}\``;
            // },
            retry: `You must pass a value`,
          },
        },
      ],
    });

    this.log = handler.client.log.getChildLogger({
      name: 'SettingsSet',
      prefix: ['[SettingsSet]'],
    });
  }

  public async exec(
    msg: Message,
    {
      setting,
      value,
    }: { setting: keyof GuildSettingsJSON; value: Role | TextChannel | string }
  ): Promise<Message> {
    const oldSetting = this.client.settings.get(setting);

    await this.client.settings.set(setting, value);

    const embed = makeSimpleEmbed(
      `Sucessfully changed from \`${oldSetting}\` to \`${value}\``,
      'GOLD'
    );

    return msg.channel.send(embed);
  }
}

import { Command, CommandHandler } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { Logger } from 'tslog';
import { discordCodeBlock, makeSimpleEmbed } from '../../utils';
import { Repository } from 'typeorm';
import GuildSettings from '../../models/GuildSettings';
import { GuildInteractSettings } from '../../config';
import { GuildSettingsJSON } from '../../types';

export default class SettingsCommandGet extends Command {
  private log: Logger;
  private settingsRepo: Repository<GuildSettings>;

  constructor(handler: CommandHandler) {
    super('settings-get', {
      aliases: [],
      description: {
        isSub: true,
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
      args: [
        {
          id: 'setting',
          type: ['', ...GuildInteractSettings],
        },
      ],
    });

    this.settingsRepo = handler.client.db.getRepository(GuildSettings);

    this.log = handler.client.log.getChildLogger({
      name: 'SettingsGet',
      prefix: ['[SettingsGet]'],
    });
  }

  public async exec(
    msg: Message,
    { setting }: { setting: '' | keyof GuildSettingsJSON }
  ): Promise<Message> {
    if (setting) {
      return await this.makeAndSendSingleValue(msg, setting);
    }

    return await this.makeAndSendAllSettings(msg);
  }

  private async makeAndSendSingleValue(
    msg: Message,
    setting: keyof GuildSettingsJSON
  ): Promise<Message> {
    const currentSettingValue = this.client.settings.get(setting);

    const embed = makeSimpleEmbed(
      `The value for \`${setting}\` is currently \`${currentSettingValue}\``
    );

    return await msg.channel.send(embed);
  }

  public async makeAndSendAllSettings(msg: Message): Promise<Message> {
    const allSettings = this.client.settings.getAllValues();

    const embed = new MessageEmbed()
      .setTitle('Current Guild Settings')
      .setDescription(discordCodeBlock(JSON.stringify(allSettings, null, 2)))
      .setTimestamp()
      .setColor('GOLD');

    return msg.channel.send(embed);
  }
}

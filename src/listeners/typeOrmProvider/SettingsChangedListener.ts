import { Listener, ListenerHandler } from 'discord-akairo';
import { Logger } from 'tslog';
import { GuildSettingsJSON } from '../../types';

export default class SettingsChangedListener extends Listener {
  private log: Logger;

  public constructor(handler: ListenerHandler) {
    super('settingsChangedListener', {
      emitter: handler.client.settings.eventEmitter,
      event: 'settingChanged',
    });

    this.log = handler.client.log.getChildLogger({
      name: 'SettingsChangedListener',
      prefix: ['[SettingsChangedListener]'],
    });
  }

  public async exec(key: keyof GuildSettingsJSON): Promise<void> {
    switch (key) {
      case 'react-channel':
    }
  }
}

import { Command, CommandHandler } from 'discord-akairo';
import { Logger } from 'tslog';
import { Message, TextChannel } from 'discord.js';
import StickyMsgManager from '../../client/managers/StickyMsgManager';
import { makeSimpleEmbed } from '../../utils';

interface StickyCommandArgs {
  type: 'add' | 'remove';
  stickyMsg: string | null;
}

export default class StickyCommand extends Command {
  private log: Logger;
  private stickyManager: StickyMsgManager | null = null;

  public constructor(handler: CommandHandler) {
    super('stickyCommand', {
      aliases: ['sticky'],
      description: {
        content: 'Add or remove a sticky to the channel command is sent in',
        usage: 'sticky [add | remove] <msg>',
        examples: ['sticky add This is the sticky message', 'sticky remove'],
      },
      userPermissions: ['BAN_MEMBERS'],
      category: 'Moderation',
      channel: 'guild',
      args: [
        {
          id: 'type',
          type: ['add', 'remove'],
          prompt: {
            start: 'Please provide a valid type (add/remove)',
            retry: 'Invalid sticky subcommand (add/remove)',
          },
        },
        {
          id: 'stickyMsg',
          match: 'restContent',
          default: null,
        },
      ],
    });

    this.log = handler.client.log.getChildLogger({
      name: 'StickyCmd',
      prefix: ['[StickyCmd]'],
    });
  }

  public async exec(msg: Message, { type, stickyMsg }: StickyCommandArgs): Promise<void> {
    if (!this.stickyManager) {
      this.stickyManager = this.client.managerHandler.modules.get(
        'stickyMsgManager'
      ) as StickyMsgManager;
    }

    if (type === 'remove') await this.processRemoveSticky(msg);
    if (type === 'add') {
      // Make sure we have sticky message passed by user
      if (!stickyMsg) {
        await StickyCommand.sendBackErrorEmbed(
          msg,
          'Please try again and include the sticky message'
        );
        return;
      }

      await this.processAddSticky(msg, stickyMsg);
    }
  }

  private static async sendBackErrorEmbed(msg: Message, error: string) {
    const errEmbed = makeSimpleEmbed(`**Error:** ${error}`, 'RED');
    return await msg.channel.send(errEmbed);
  }

  private async processRemoveSticky(msg: Message) {
    const channel = msg.channel as TextChannel;

    if (!this.stickyManager!.stickiedChannels.has(channel.id)) {
      await StickyCommand.sendBackErrorEmbed(
        msg,
        'The current channel has no sticky to remove'
      );
    }

    await this.stickyManager!.deleteStickyFromChannel(channel);

    const successEmbed = makeSimpleEmbed('Removed current sticky from channel', 'GREEN');

    const respEmbed = await msg.channel.send(successEmbed);

    await respEmbed.delete({
      timeout: 3000,
    });
  }

  private async processAddSticky(msg: Message, stickyMsg: string) {
    const targetChannel = msg.channel as TextChannel;

    await this.stickyManager!.addStickyToChannel(targetChannel, stickyMsg);

    const successEmbed = makeSimpleEmbed('Sucessfully added sticky', 'GREEN');

    const respMsg = await msg.channel.send(successEmbed);

    await respMsg.delete({ timeout: 3000 });
  }
}

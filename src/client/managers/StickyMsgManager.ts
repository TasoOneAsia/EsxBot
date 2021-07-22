import { Manager } from '../../structures/managers/Manager';
import { Logger } from 'tslog';
import { ManagerHandler } from '../../structures/managers/ManagerHandler';
import { TextChannel } from 'discord.js';

export default class StickyMsgManager extends Manager {
  public stickiedChannels = new Map<string, string>();
  private log: Logger;

  public constructor(handler: ManagerHandler) {
    super('stickyMsgManager', {
      category: 'other',
    });

    this.log = handler.client.log.getChildLogger({
      name: 'StickyMsgManager',
      prefix: ['[StickyMsgManager]'],
    });
  }

  public exec(): void {
    //noop
  }

  public async addStickyToChannel(channel: TextChannel, msg: string): Promise<void> {
    const doesChannelHaveSticky = this.stickiedChannels.has(channel.id);
    if (doesChannelHaveSticky) await this.deleteStickyFromChannel(channel);

    const formattedStickyMsg = StickyMsgManager.formatStickyMessage(msg);

    // Send initial sticky msg and update map
    const sentStickyMsg = await channel.send(formattedStickyMsg);

    this.log.silly(`Added sticky to channel: ${channel.id}, with msg: ${msg}`);

    this.stickiedChannels.set(channel.id, sentStickyMsg.id);
  }

  public async deleteStickyFromChannel(channel: TextChannel): Promise<void> {
    const lastStickyMsgId = this.stickiedChannels.get(channel.id);

    // Sanity channel exists in map
    if (!lastStickyMsgId)
      throw new Error(`Unable to find sticky message for channel id ${channel.id}`);

    const lastMsg = await channel.messages.fetch(lastStickyMsgId);

    // Sanity that msg exists
    if (!lastMsg)
      throw new Error(`Was unable to resolve sticky message from ID: ${lastStickyMsgId}`);

    // Delete last sticky message
    await lastMsg.delete();

    // Remove from map
    this.stickiedChannels.delete(channel.id);

    this.log.silly(`Deleted sticky from ${channel}`);
  }

  private static formatStickyMessage(msg: string): string {
    return `⚠ __**IMPORTANT STICKY MESSAGE**__ ⚠ \n ${msg}`;
  }
}

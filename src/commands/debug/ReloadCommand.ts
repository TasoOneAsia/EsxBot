import { Command, CommandHandler } from 'discord-akairo';
import { Logger } from 'tslog';
import { Message, MessageEmbed } from 'discord.js';
import { convertNanoToMs, discordCodeBlock } from '../../utils';

type BotHandlers = 'manager' | 'listener' | 'command';

type BotHandleField = `${BotHandlers}Handler`;

interface HandlerReturnData {
  size: number;
  time: number;
}

type HandlerDataTuple = [HandlerReturnData, HandlerReturnData, HandlerReturnData];

export default class ReloadCommand extends Command {
  private log: Logger;

  public constructor(handler: CommandHandler) {
    super('restartCmd', {
      aliases: ['reload'],
      typing: true,
      channel: 'guild',
      ownerOnly: true,
      category: 'Debug',
      description: {
        content: `Will restart the bot's process`,
        usage: 'restart',
        examples: ['restart'],
      },
    });

    this.log = handler.client.log.getChildLogger({
      name: 'ReloadCmd',
      prefix: ['[ReloadCmd]'],
    });
  }

  public async exec(msg: Message): Promise<Message> {
    const handlerReloadStartTime = process.hrtime.bigint();

    const cmdHandler = this.reloadHandler('command');
    const listenerHandler = this.reloadHandler('listener');
    const managerHandler = this.reloadHandler('manager');

    const handlerReloadEndTime = process.hrtime.bigint();

    const totalTime = convertNanoToMs(handlerReloadEndTime - handlerReloadStartTime);
    const embed = ReloadCommand.createReloadEmbed(
      [cmdHandler, listenerHandler, managerHandler],
      totalTime
    );

    return await msg.channel.send(embed);
  }

  private reloadHandler(handler: BotHandlers): HandlerReturnData {
    let handlerType: BotHandleField;

    switch (handler) {
      case 'command':
        handlerType = 'commandHandler';
        break;
      case 'listener':
        handlerType = 'listenerHandler';
        break;
      case 'manager':
        handlerType = 'managerHandler';
        break;
    }

    const resolvedHandler = this.client[handlerType];

    const startTime = process.hrtime.bigint();
    resolvedHandler.reloadAll();
    const endTime = process.hrtime.bigint();

    const loadedInMS = convertNanoToMs(endTime - startTime);

    const handlerSize = resolvedHandler.modules.size;

    this.log.debug(
      `Reloaded ${handlerType} with ${handlerSize} modules in ${loadedInMS}ms`
    );

    return { size: handlerSize, time: loadedInMS };
  }

  private static createReloadEmbed(
    handlerData: HandlerDataTuple,
    startToEndTime: number
  ): MessageEmbed {
    return new MessageEmbed()
      .setColor('GREEN')
      .setDescription(`Sucessfully reloaded all modules in ${startToEndTime}ms`)
      .setTimestamp()
      .addFields([
        {
          name: 'Command Handler',
          value: discordCodeBlock(
            `${handlerData[0].size} modules loaded in ${handlerData[0].time}ms`
          ),
        },
        {
          name: 'Listener Handler',
          value: discordCodeBlock(
            `${handlerData[1].size} modules loaded in ${handlerData[1].time}ms`
          ),
        },
        {
          name: 'Manager Handler',
          value: discordCodeBlock(
            `${handlerData[2].size} modules loaded in ${handlerData[2].time}ms`
          ),
        },
      ]);
  }
}

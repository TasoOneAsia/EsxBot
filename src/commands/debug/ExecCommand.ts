import { Command, CommandHandler } from 'discord-akairo';
import { Message, Util } from 'discord.js';
import { Logger } from 'tslog';
import { exec, ChildProcess } from 'child_process';

export default class ExecCommand extends Command {
  private log: Logger;

  public constructor(handler: CommandHandler) {
    super('exec', {
      aliases: ['exec'],
      description: {
        content: 'Runs shell commands for debug and the meme',
        usage: 'exec <command> [...args]',
        examples: ['exec pwd', 'exec curl https://tasoagc.dev'],
      },
      category: 'Debug',
      ownerOnly: true,
      typing: true,
      args: [
        {
          id: 'input',
          match: 'rest',
          prompt: {
            start: (message: Message) =>
              `${message.author}, what commands do you want to exec?`,
          },
        },
      ],
    });

    this.log = handler.client.log.getChildLogger({
      name: 'ExecCmd',
      prefix: ['[ExecCmd]'],
    });
  }

  public async exec(msg: Message, { input }: { input: string }): Promise<ChildProcess> {
    return exec(input, async (error, stdOut) => {
      let output = (error || stdOut) as string | string[];
      // Split int
      output = Util.splitMessage(`\`\`\`javascript\n${output}\`\`\``);
      for (const line of output) {
        await msg.channel.send(line);
      }
    });
  }
}

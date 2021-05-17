import { Manager } from '../../structures/managers/Manager';
import { ManagerHandler } from '../../structures/managers/ManagerHandler';
import { Logger } from 'tslog';
import path from 'path';
import { promises as fsPromise } from 'fs';

export default class RulesManager extends Manager {
  private log: Logger;
  private rules: undefined | string[];

  private rulesTxtPath = path.join(process.cwd(), 'static', 'other', 'rules.json');

  constructor(handler: ManagerHandler) {
    super('rulesManager', {
      category: 'rules',
    });

    this.log = handler.client.log.getChildLogger({
      name: 'RulesManager',
      prefix: ['[RulesManager]'],
    });
  }

  public async exec(): Promise<void> {
    await this.parseRules();
  }

  private async parseRules() {
    const fileContents = await fsPromise.readFile(this.rulesTxtPath, {
      encoding: 'utf-8',
    });

    this.rules = JSON.parse(fileContents).rules;
  }

  public async getRules(): Promise<string[]> {
    if (!this.rules) await this.parseRules();
    return this.rules as string[];
  }
}

import os from 'os';
import escapeStringRegexp from 'escape-string-regexp';

const extractPathRegex = /\s+at.*[(\s](.*)\)?/;
const pathRegex = /^(?:(?:(?:node|(?:(?:node:)?internal\/[\w/]*|.*node_modules\/(?:babel-polyfill|pirates)\/.*)?\w+)(?:\.js)?:\d+:\d+)|native)/;
const homeDir = typeof os.homedir === 'undefined' ? '' : os.homedir();

export interface ICleanStackOpts {
  /**
   * Prettify the paths
   * @default false
   **/
  readonly pretty?: boolean;
  /**
   * Remove the passed base path from the stack
   **/
  readonly basePath?: string;
}

/**
 * Clean/prettify an error stack
 * @param stack Error stack to handle
 * @param args
 **/
export const cleanStack = (
  stack: string,
  { pretty, basePath }: ICleanStackOpts = {}
): string => {
  const basePathRegex =
    basePath && new RegExp(`(at | \\()${escapeStringRegexp(basePath)}`, 'g');

  return stack
    .replace(/\\/g, '/')
    .split('\n')
    .filter((line) => {
      const pathMatches = line.match(extractPathRegex);
      if (pathMatches === null || !pathMatches[1]) {
        return true;
      }

      const match = pathMatches[1];

      return !pathRegex.test(match);
    })
    .filter((line) => line.trim() !== '')
    .map((line) => {
      if (basePathRegex) {
        line = line.replace(basePathRegex, '$1');
      }

      if (pretty) {
        line = line.replace(extractPathRegex, (m, p1) =>
          m.replace(p1, p1.replace(homeDir, '~'))
        );
      }

      return line;
    })
    .join('\n');
};

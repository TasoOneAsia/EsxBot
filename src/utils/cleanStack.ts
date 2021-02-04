import path from 'path';
import escapeStringRegexp from 'escape-string-regexp';

const extractPathRegex = /\s+at.*[(\s](.*)\)?/g;
const pathRegex = /^(?:(?:(?:node|(?:(?:node:)?internal\/[\w/]*|.*node_modules\/(?:babel-polyfill|pirates)\/.*)?\w+)(?:\.js)?:\d+:\d+)|native)/;
const homeDir = process.cwd().replace(/\\/g, '\\\\');

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
  //const basePathRegex = basePath && new RegExp(`(at | \\()${escapeStringRegexp(basePath)}`, 'g');
  const homeDir = process.cwd().replace(/\\/g, '\\\\');
  return stack.replace(new RegExp(homeDir, 'g'), '~').replace(/\\/g, '/');
};

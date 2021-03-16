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
 **/
export const cleanStack = (stack: string): string => {
  //const basePathRegex = basePath && new RegExp(`(at | \\()${escapeStringRegexp(basePath)}`, 'g');
  return stack.replace(new RegExp(homeDir, 'g'), '~').replace(/\\/g, '/');
};

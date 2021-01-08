// FIXME: Types suck here, will improve after functionality
export const discordCodeBlock = (str: string | number | undefined): string | void => {
  if (str === typeof undefined) return;
  return `\`\`\`\n${str}\n\`\`\``;
};

// Rounded to 3 decimals
export const byteToGB = (bytes: number): string => {
  return (bytes / 1e9).toFixed(2);
};

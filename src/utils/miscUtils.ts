// FIXME: Types suck here, will improve after functionality
export const discordCodeBlock = (str: string | number | undefined): string | void => {
  if (str === typeof undefined) return;
  return `\`\`\`\n${str}\n\`\`\``;
};

// Rounded to 3 decimals
export const byteToGB = (bytes: number): string => {
  return (bytes / 1e9).toFixed(2);
};

export const msToFormatted = (ms: number): string => {
  const d = Math.floor(ms / 86400000);
  const h = Math.floor(ms / 3600000) % 24;
  const m = Math.floor(ms / 60000) % 60;
  const s = Math.floor(ms / 1000) % 60;

  return `${d}d ${h}h ${m}m ${s}s`;
};

export const parseTimeFromString = (str: string): number | null => {
  const validTimes: { [key: string]: number } = { m: 60000, h: 3600000, d: 86400000 };
  const match = str.match(/(-?(?:\d+\.?\d*|\d*\.?\d+)(?:e[-+]?\d+)?)([d,h,m,s])/);
  if (match && validTimes[match[2]]) return parseInt(match[1]) * validTimes[match[2]];
  return null;
};

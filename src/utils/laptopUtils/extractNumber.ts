
export const extractNumber = (text: string, pattern: RegExp): number | undefined => {
  const match = text.match(pattern);
  return match ? parseFloat(match[1]) : undefined;
};

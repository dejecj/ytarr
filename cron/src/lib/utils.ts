export const removeSpecialCharacters = (input: string) => {
  return input
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '_');
}
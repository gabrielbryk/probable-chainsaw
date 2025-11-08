export const normalizeAnswer = (value: string | null | undefined): string =>
  value?.trim().toLowerCase() ?? ''

export const answersMatch = (input: string, expected: string): boolean => {
  return normalizeAnswer(input) === normalizeAnswer(expected)
}

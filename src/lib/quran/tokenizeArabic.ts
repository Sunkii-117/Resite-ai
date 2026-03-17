import { normalizeArabic } from './normalizeArabic';

export function tokenizeArabic(input: string): string[] {
  const normalized = normalizeArabic(input);
  if (!normalized) return [];
  return normalized.split(' ').filter(Boolean);
}

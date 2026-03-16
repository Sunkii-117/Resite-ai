export function normalizeArabic(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/[\u0640]/g, '')
    .replace(/[.,/#!$%^&*;:{}=\-_`~()"'؟،؛«»]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

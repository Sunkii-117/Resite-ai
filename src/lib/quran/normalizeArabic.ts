export function normalizeArabic(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u08D4-\u08E1\u06E5\u06E6]/g, '')
    .replace(/[ـ]/g, '')
    .replace(/[.,/#!$%^&*;:{}=\-_`~()"'؟،؛«»]/g, ' ')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim();
}

const fs = require('fs');
const path = require('path');

const SOURCE_PATH = path.join(process.cwd(), 'public', 'quran', 'mvp_quran.json');
const OUTPUT_PATH = path.join(process.cwd(), 'public', 'quran', 'mvp_phrase_index.json');

function normalizeArabic(input) {
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

function tokenizeArabic(input) {
  const normalized = normalizeArabic(input);
  return normalized ? normalized.split(' ').filter(Boolean) : [];
}

function buildPhraseIndex(ayahs) {
  const index = {};
  for (const ayah of ayahs) {
    const tokens = tokenizeArabic(ayah.arabic_text);
    for (const size of [2, 3]) {
      for (let i = 0; i <= tokens.length - size; i += 1) {
        const phrase = tokens.slice(i, i + size).join(' ');
        if (!index[phrase]) index[phrase] = [];
        if (!index[phrase].includes(ayah.ayah_id)) index[phrase].push(ayah.ayah_id);
      }
    }
  }

  return index;
}

function main() {
  const ayahs = JSON.parse(fs.readFileSync(SOURCE_PATH, 'utf8'));
  const phraseIndex = buildPhraseIndex(ayahs);
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(phraseIndex, null, 2), 'utf8');
  console.log(`Generated ${OUTPUT_PATH} with ${Object.keys(phraseIndex).length} phrases.`);
}

main();

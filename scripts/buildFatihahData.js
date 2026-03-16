const fs = require('fs');
const path = require('path');

const SOURCE_PATH = path.join(process.cwd(), 'public', 'quran', 'fatihah.json');
const OUTPUT_PATH = path.join(process.cwd(), 'public', 'quran', 'fatihah_phrase_index.json');

function normalizeArabic(input) {
  return input
    .normalize('NFKD')
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/[\u0640]/g, '')
    .replace(/[.,/#!$%^&*;:{}=\-_`~()"'؟،؛«»]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenizeArabic(input) {
  if (!input) return [];
  return normalizeArabic(input).split(' ').filter(Boolean);
}

function buildPhraseIndex(ayahs) {
  const index = {};

  for (const ayah of ayahs) {
    const tokens = tokenizeArabic(ayah.arabic_text);
    const sizes = [2, 3];

    for (const size of sizes) {
      for (let i = 0; i <= tokens.length - size; i += 1) {
        const phrase = tokens.slice(i, i + size).join(' ');
        if (!phrase) continue;
        if (!index[phrase]) {
          index[phrase] = [];
        }
        if (!index[phrase].includes(ayah.ayah_id)) {
          index[phrase].push(ayah.ayah_id);
        }
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

const fs = require("fs");
const path = require("path");

const arabicFile = path.join(__dirname, "..", "data", "raw", "quran-arabic.txt");
const englishFile = path.join(__dirname, "..", "data", "raw", "quran-english.txt");
const outputDir = path.join(__dirname, "..", "data", "processed");
const outputFile = path.join(outputDir, "quran_ayah_map.json");

function parseQuranFile(filePath, textKey) {
  const content = fs.readFileSync(filePath, "utf8");

  const lines = content
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const map = new Map();

  for (const line of lines) {
    const parts = line.split("|");

    if (parts.length < 3) {
      console.warn(`Skipping invalid line in ${filePath}: ${line}`);
      continue;
    }

    const surah = Number(parts[0]);
    const ayah = Number(parts[1]);
    const text = parts.slice(2).join("|").trim();
    const ayahId = `${surah}:${ayah}`;

    if (!Number.isInteger(surah) || !Number.isInteger(ayah) || !text) {
      console.warn(`Skipping malformed line in ${filePath}: ${line}`);
      continue;
    }

    if (map.has(ayahId)) {
      throw new Error(`Duplicate ayah_id found in ${filePath}: ${ayahId}`);
    }

    map.set(ayahId, {
      surah,
      ayah,
      [textKey]: text,
    });
  }

  return map;
}

function main() {
  const arabicMap = parseQuranFile(arabicFile, "arabic_text");
  const englishMap = parseQuranFile(englishFile, "english_translation");

  const merged = [];

  for (const [ayahId, arabicEntry] of arabicMap.entries()) {
    const englishEntry = englishMap.get(ayahId);

    if (!englishEntry) {
      throw new Error(`Missing English translation for ayah_id ${ayahId}`);
    }

    merged.push({
      ayah_id: ayahId,
      surah: arabicEntry.surah,
      ayah: arabicEntry.ayah,
      arabic_text: arabicEntry.arabic_text,
      english_translation: englishEntry.english_translation,
    });
  }

  merged.sort((a, b) => {
    if (a.surah !== b.surah) return a.surah - b.surah;
    return a.ayah - b.ayah;
  });

  const seen = new Set();
  for (const entry of merged) {
    if (
      !entry.ayah_id ||
      !Number.isInteger(entry.surah) ||
      !Number.isInteger(entry.ayah) ||
      !entry.arabic_text ||
      !entry.english_translation
    ) {
      throw new Error(`Invalid merged entry: ${JSON.stringify(entry)}`);
    }

    if (seen.has(entry.ayah_id)) {
      throw new Error(`Duplicate ayah_id in merged output: ${entry.ayah_id}`);
    }
    seen.add(entry.ayah_id);
  }

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify(merged, null, 2), "utf8");

  console.log(`Built ${merged.length} ayahs.`);
  console.log(`Saved to ${outputFile}`);

  const sampleAyahId = "1:1";
  const sample = merged.find(entry => entry.ayah_id === sampleAyahId);

  if (sample) {
    console.log("\nSample lookup:");
    console.log(sample.ayah_id);
    console.log(sample.arabic_text);
    console.log(sample.english_translation);
  }
}

main();
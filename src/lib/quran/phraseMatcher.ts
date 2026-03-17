import { normalizeArabic } from './normalizeArabic';
import { tokenizeArabic } from './tokenizeArabic';
import { Ayah, CandidateScoreBreakdown, MatchResult, PhraseIndex, RankedCandidate } from './types';

type MatchParams = {
  transcript: string;
  ayahs: Ayah[];
  phraseIndex: PhraseIndex;
  contextAyahIds?: string[];
};

function getNGrams(tokens: string[], sizes: number[]): string[] {
  const ngrams: string[] = [];
  for (const size of sizes) {
    for (let i = 0; i <= tokens.length - size; i += 1) {
      ngrams.push(tokens.slice(i, i + size).join(' '));
    }
  }
  return Array.from(new Set(ngrams));
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function longestPrefixTokenCount(a: string[], b: string[]): number {
  let count = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i += 1) {
    if (a[i] !== b[i]) break;
    count += 1;
  }
  return count;
}

function scoreCandidate(
  input: string,
  inputTokens: string[],
  ayah: Ayah,
  phraseIndex: PhraseIndex,
  contextAyahIds: string[],
): RankedCandidate {
  const normalizedAyah = normalizeArabic(ayah.arabic_text);
  const ayahTokens = tokenizeArabic(ayah.arabic_text);
  const inputNgrams = getNGrams(inputTokens, [4, 3, 2]);

  const breakdown: CandidateScoreBreakdown = {
    exactBonus: 0,
    prefixBonus: 0,
    prefixLengthScore: 0,
    startPhraseBonus: 0,
    internalPhraseScore: 0,
    tokenPositionScore: 0,
    tailMatchBonus: 0,
    contextBonus: 0,
    mismatchPenalty: 0,
    ambiguityPenalty: 0,
  };

  if (input === normalizedAyah) {
    breakdown.exactBonus = 1.6;
  }

  if (normalizedAyah.startsWith(input)) {
    breakdown.prefixBonus += 1.0;
  }

  const prefixCount = longestPrefixTokenCount(inputTokens, ayahTokens);
  if (prefixCount > 0) {
    breakdown.prefixLengthScore = clamp(prefixCount / Math.max(ayahTokens.length, 1), 0, 1) * 0.95;
  }

  const nextInputToken = inputTokens[prefixCount];
  const nextAyahToken = ayahTokens[prefixCount];
  if (prefixCount > 0 && nextInputToken && nextAyahToken && nextInputToken !== nextAyahToken) {
    breakdown.mismatchPenalty -= 0.45;
  }

  const inputTail = inputTokens.slice(Math.max(0, inputTokens.length - 2)).join(' ');
  const ayahTail = ayahTokens.slice(Math.max(0, ayahTokens.length - 2)).join(' ');
  if (inputTail && ayahTail && inputTail === ayahTail) {
    breakdown.tailMatchBonus = 0.4;
  }

  for (const phrase of inputNgrams) {
    const phraseTokens = phrase.split(' ');
    if (!phraseTokens.length) continue;
    const occurrenceCount = phraseIndex[phrase]?.length || 0;
    const ambiguityPenalty = occurrenceCount > 1 && phraseTokens.length <= 2 ? 0.1 * (occurrenceCount - 1) : 0;

    const ayahText = ayahTokens.join(' ');
    if (!ayahText.includes(phrase)) continue;

    const position = ayahText.indexOf(phrase);
    const startsAtBeginning = position === 0;
    const phraseWeight = phraseTokens.length >= 4 ? 0.55 : phraseTokens.length === 3 ? 0.38 : 0.2;

    if (startsAtBeginning) {
      breakdown.startPhraseBonus += phraseWeight;
      breakdown.tokenPositionScore += 0.25;
    } else {
      breakdown.internalPhraseScore += phraseWeight * 0.45;
      breakdown.tokenPositionScore += 0.08;
    }

    breakdown.ambiguityPenalty -= ambiguityPenalty;
  }

  if (contextAyahIds.includes(ayah.ayah_id)) {
    breakdown.contextBonus = ayah.ayah_id === contextAyahIds[0] ? 0.13 : ayah.ayah_id === contextAyahIds[1] ? 0.1 : 0.06;
  }

  const score = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
  const confidence = clamp(score / 2.7, 0, 0.99);

  let source: RankedCandidate['source'] = 'token_overlap';
  if (breakdown.exactBonus > 0) source = 'exact';
  else if (breakdown.prefixBonus > 0 || breakdown.prefixLengthScore >= 0.45) source = 'prefix';
  else if (breakdown.startPhraseBonus > 0 || breakdown.internalPhraseScore > 0) source = 'substring';

  const reason = [
    breakdown.exactBonus > 0 ? 'exact' : '',
    breakdown.prefixBonus > 0 ? `prefix:${prefixCount}` : '',
    breakdown.tailMatchBonus > 0 ? 'tail-match' : '',
    breakdown.startPhraseBonus > 0 ? 'start-phrase' : '',
    breakdown.internalPhraseScore > 0 ? 'internal-phrase' : '',
    breakdown.contextBonus > 0 ? 'context' : '',
    breakdown.mismatchPenalty < 0 ? 'mismatch-penalty' : '',
    breakdown.ambiguityPenalty < 0 ? 'ambiguity-penalty' : '',
  ].filter(Boolean).join(', ');

  return {
    ayahId: ayah.ayah_id,
    score: Number(score.toFixed(3)),
    confidence: Number(confidence.toFixed(2)),
    reason: reason || 'weak-overlap',
    source,
    breakdown,
  };
}

export function matchTranscriptToAyah({ transcript, ayahs, phraseIndex, contextAyahIds = [] }: MatchParams): MatchResult {
  const normalizedInput = normalizeArabic(transcript);
  const inputTokens = tokenizeArabic(normalizedInput);

  if (inputTokens.length < 2) {
    return { ayahId: null, confidence: 0, source: 'none', topCandidates: [] };
  }

  const candidates = ayahs
    .map((ayah) => scoreCandidate(normalizedInput, inputTokens, ayah, phraseIndex, contextAyahIds))
    .filter((c) => c.score > 0.06)
    .sort((a, b) => b.score - a.score);

  const topCandidates = candidates.slice(0, 3);
  if (!topCandidates.length) {
    return { ayahId: null, confidence: 0, source: 'none', topCandidates: [] };
  }

  return {
    ayahId: topCandidates[0].ayahId,
    confidence: topCandidates[0].confidence,
    source: 'global',
    phrase: topCandidates[0].reason,
    topCandidates,
  };
}

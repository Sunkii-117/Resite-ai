import { matchTranscriptToAyah } from './phraseMatcher';
import { Ayah, MatchResult, PhraseIndex, TrackerState } from './types';

const MIN_CONFIDENCE_TO_SWITCH = 0.7;

function idxById(ayahs: Ayah[], ayahId: string): number {
  return ayahs.findIndex((a) => a.ayah_id === ayahId);
}

export function trackAyah(
  transcript: string,
  state: TrackerState,
  ayahs: Ayah[],
  phraseIndex: PhraseIndex,
): { state: TrackerState; match: MatchResult } {
  const currentIndex = idxById(ayahs, state.currentAyahId);
  const current = ayahs[currentIndex];
  const next = ayahs[currentIndex + 1];
  const previous = ayahs[currentIndex - 1];

  const scoped = [current?.ayah_id, next?.ayah_id, previous?.ayah_id].filter(Boolean) as string[];

  const scopedMatch = matchTranscriptToAyah(transcript, phraseIndex, scoped);

  if (scopedMatch.ayahId && scopedMatch.confidence >= MIN_CONFIDENCE_TO_SWITCH) {
    let source: MatchResult['source'] = 'current';
    if (scopedMatch.ayahId === next?.ayah_id) source = 'next';
    else if (scopedMatch.ayahId === previous?.ayah_id) source = 'previous';

    const keepCurrent = source === 'current' && scopedMatch.confidence < 0.86;
    if (!keepCurrent) {
      return {
        state: {
          currentAyahId: scopedMatch.ayahId,
          confidence: scopedMatch.confidence,
          source,
        },
        match: { ...scopedMatch, source },
      };
    }
  }

  const globalMatch = matchTranscriptToAyah(transcript, phraseIndex);
  if (globalMatch.ayahId && globalMatch.confidence >= 0.86) {
    return {
      state: {
        currentAyahId: globalMatch.ayahId,
        confidence: globalMatch.confidence,
        source: 'global',
      },
      match: { ...globalMatch, source: 'global' },
    };
  }

  return {
    state: {
      ...state,
      confidence: Math.max(state.confidence - 0.03, 0.4),
    },
    match: { ayahId: state.currentAyahId, confidence: state.confidence, source: 'none' },
  };
}

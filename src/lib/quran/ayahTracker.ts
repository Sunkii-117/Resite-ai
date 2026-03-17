import { matchTranscriptToAyah } from './phraseMatcher';
import { Ayah, CandidateSnapshot, MatchResult, PhraseIndex, TrackerState } from './types';

const DECAY_RATE = 0.045;
const REINFORCE_RATE = 0.1;
const ENTER_RECOVERY_THRESHOLD = 0.4;
const RECOVERY_RELOCK_THRESHOLD = 0.76;
const MIN_CONFIDENCE = 0.16;
const SWITCH_MARGIN = 0.14;

function idxById(ayahs: Ayah[], ayahId: string): number {
  return ayahs.findIndex((a) => a.ayah_id === ayahId);
}

function appendCandidate(history: CandidateSnapshot[], next: CandidateSnapshot): CandidateSnapshot[] {
  return [...history.slice(-2), next];
}

function appearsTwiceInLastThree(ayahId: string, history: CandidateSnapshot[]): boolean {
  return history.filter((entry) => entry.ayahId === ayahId).length >= 2;
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
  const contextAyahIds = [current?.ayah_id, next?.ayah_id, previous?.ayah_id].filter(Boolean) as string[];

  const scopedMatch = matchTranscriptToAyah({ transcript, ayahs, phraseIndex, contextAyahIds });
  const top = scopedMatch.topCandidates;

  const winning = top[0];
  const currentCandidate = top.find((c) => c.ayahId === state.currentAyahId);

  const proposed: CandidateSnapshot = {
    ayahId: winning?.ayahId ?? null,
    confidence: winning?.confidence ?? 0,
    source: winning?.ayahId === current?.ayah_id
      ? 'current'
      : winning?.ayahId === next?.ayah_id
        ? 'next'
        : winning?.ayahId === previous?.ayah_id
          ? 'previous'
          : 'global',
  };

  let recentCandidates = appendCandidate(state.recentCandidates, proposed);
  let confidence = state.confidence;
  let currentAyahId = state.currentAyahId;
  let source: MatchResult['source'] = state.source;
  let isRecovering = state.isRecovering;

  if (winning && winning.ayahId === currentAyahId) {
    confidence = Math.min(1, confidence + REINFORCE_RATE * Math.max(winning.confidence, 0.45));
    source = 'current';
  } else if (winning) {
    const consensus = appearsTwiceInLastThree(winning.ayahId, recentCandidates);
    const currentScore = currentCandidate?.score ?? 0;
    const clearScoreWin = winning.score >= currentScore + SWITCH_MARGIN;
    const exactOrStrongPrefix = winning.source === 'exact' || winning.reason.includes('prefix:');

    if (consensus || (clearScoreWin && exactOrStrongPrefix) || winning.confidence >= 0.86) {
      currentAyahId = winning.ayahId;
      confidence = Math.max(winning.confidence, confidence * 0.78);
      source = proposed.source;
      isRecovering = false;
    } else {
      confidence = Math.max(MIN_CONFIDENCE, confidence - DECAY_RATE);
      source = 'none';
    }
  } else {
    confidence = Math.max(MIN_CONFIDENCE, confidence - DECAY_RATE);
    source = 'none';
  }

  if (confidence < ENTER_RECOVERY_THRESHOLD) {
    isRecovering = true;
  }

  if (isRecovering) {
    const recovery = matchTranscriptToAyah({ transcript, ayahs, phraseIndex });
    const recoveryWinner = recovery.topCandidates[0];

    if (recoveryWinner) {
      const recoverySnapshot: CandidateSnapshot = {
        ayahId: recoveryWinner.ayahId,
        confidence: recoveryWinner.confidence,
        source: 'recovery',
      };
      recentCandidates = appendCandidate(recentCandidates, recoverySnapshot);

      const relockConsensus = appearsTwiceInLastThree(recoveryWinner.ayahId, recentCandidates);
      const strongRelock = recoveryWinner.confidence >= 0.9 || recoveryWinner.source === 'exact';

      if (recoveryWinner.confidence >= RECOVERY_RELOCK_THRESHOLD && (relockConsensus || strongRelock)) {
        currentAyahId = recoveryWinner.ayahId;
        confidence = recoveryWinner.confidence;
        source = 'recovery';
        isRecovering = false;
      } else {
        confidence = Math.max(MIN_CONFIDENCE, confidence - DECAY_RATE / 2);
      }
    }
  }

  const nextState: TrackerState = {
    currentAyahId,
    confidence: Number(confidence.toFixed(2)),
    source,
    recentCandidates,
    isRecovering,
    topCandidates: top,
  };

  return {
    state: nextState,
    match: {
      ayahId: currentAyahId,
      confidence: nextState.confidence,
      source,
      phrase: winning?.reason,
      topCandidates: top,
    },
  };
}

import { matchTranscriptToAyah } from './phraseMatcher';
import { Ayah, CandidateSnapshot, MatchResult, PhraseIndex, TrackerState } from './types';

const DECAY_RATE = 0.05;
const REINFORCE_RATE = 0.09;
const ENTER_RECOVERY_THRESHOLD = 0.42;
const RECOVERY_RELOCK_THRESHOLD = 0.8;
const MIN_CONFIDENCE = 0.18;
const SIGNIFICANT_MARGIN = 0.24;

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

  const scopedIds = [current?.ayah_id, next?.ayah_id, previous?.ayah_id].filter(Boolean) as string[];
  const scopedMatch = matchTranscriptToAyah(transcript, phraseIndex, scopedIds);

  let proposed: CandidateSnapshot = {
    ayahId: scopedMatch.ayahId,
    confidence: scopedMatch.confidence,
    source: scopedMatch.ayahId === current?.ayah_id
      ? 'current'
      : scopedMatch.ayahId === next?.ayah_id
        ? 'next'
        : scopedMatch.ayahId === previous?.ayah_id
          ? 'previous'
          : 'none',
  };

  let recentCandidates = appendCandidate(state.recentCandidates, proposed);
  let confidence = state.confidence;
  let currentAyahId = state.currentAyahId;
  let source: MatchResult['source'] = state.source;
  let isRecovering = state.isRecovering;

  const supportsCurrent = proposed.ayahId === state.currentAyahId && proposed.confidence > 0;

  if (supportsCurrent) {
    confidence = Math.min(1, confidence + REINFORCE_RATE * proposed.confidence);
    source = 'current';
  } else {
    const canSwitchByConsensus = proposed.ayahId ? appearsTwiceInLastThree(proposed.ayahId, recentCandidates) : false;
    const canSwitchByStrength = proposed.ayahId ? proposed.confidence >= confidence + SIGNIFICANT_MARGIN : false;

    if (proposed.ayahId && (canSwitchByConsensus || canSwitchByStrength)) {
      currentAyahId = proposed.ayahId;
      confidence = Math.max(proposed.confidence, confidence * 0.75);
      source = proposed.source;
      isRecovering = false;
    } else {
      confidence = Math.max(MIN_CONFIDENCE, confidence - DECAY_RATE);
      source = 'none';
    }
  }

  if (confidence < ENTER_RECOVERY_THRESHOLD) {
    isRecovering = true;
  }

  if (isRecovering) {
    const globalMatch = matchTranscriptToAyah(transcript, phraseIndex);
    const recoveryCandidate: CandidateSnapshot = {
      ayahId: globalMatch.ayahId,
      confidence: globalMatch.confidence,
      source: 'recovery',
    };
    recentCandidates = appendCandidate(recentCandidates, recoveryCandidate);

    const relockByConsensus = globalMatch.ayahId ? appearsTwiceInLastThree(globalMatch.ayahId, recentCandidates) : false;
    const relockByStrength = globalMatch.confidence >= 0.92;

    if (globalMatch.ayahId && globalMatch.confidence >= RECOVERY_RELOCK_THRESHOLD && (relockByConsensus || relockByStrength)) {
      currentAyahId = globalMatch.ayahId;
      confidence = globalMatch.confidence;
      source = 'recovery';
      isRecovering = false;
    } else {
      confidence = Math.max(MIN_CONFIDENCE, confidence - DECAY_RATE / 2);
    }
  }

  const nextState: TrackerState = {
    currentAyahId,
    confidence: Number(confidence.toFixed(2)),
    source,
    recentCandidates,
    isRecovering,
  };

  return {
    state: nextState,
    match: {
      ayahId: currentAyahId,
      confidence: nextState.confidence,
      source,
      phrase: scopedMatch.phrase,
    },
  };
}

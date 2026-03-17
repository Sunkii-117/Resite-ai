export type Ayah = {
  ayah_id: string;
  surah: number;
  ayah: number;
  arabic_text: string;
  english_translation: string;
};

export type PhraseIndex = Record<string, string[]>;

export type CandidateScoreBreakdown = {
  exactBonus: number;
  prefixBonus: number;
  prefixLengthScore: number;
  startPhraseBonus: number;
  internalPhraseScore: number;
  tokenPositionScore: number;
  tailMatchBonus: number;
  contextBonus: number;
  mismatchPenalty: number;
  ambiguityPenalty: number;
};

export type RankedCandidate = {
  ayahId: string;
  score: number;
  confidence: number;
  reason: string;
  source: 'exact' | 'prefix' | 'substring' | 'token_overlap' | 'none';
  breakdown: CandidateScoreBreakdown;
};

export type MatchResult = {
  ayahId: string | null;
  confidence: number;
  source: 'current' | 'next' | 'previous' | 'global' | 'recovery' | 'none';
  phrase?: string;
  topCandidates: RankedCandidate[];
};

export type CandidateSnapshot = {
  ayahId: string | null;
  confidence: number;
  source: MatchResult['source'];
};

export type TrackerState = {
  currentAyahId: string;
  confidence: number;
  source: MatchResult['source'];
  recentCandidates: CandidateSnapshot[];
  isRecovering: boolean;
  topCandidates: RankedCandidate[];
};

export type Ayah = {
  ayah_id: string;
  surah: number;
  ayah: number;
  arabic_text: string;
  english_translation: string;
};

export type PhraseIndex = Record<string, string[]>;

export type MatchResult = {
  ayahId: string | null;
  confidence: number;
  source: 'current' | 'next' | 'previous' | 'global' | 'recovery' | 'none';
  phrase?: string;
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
};

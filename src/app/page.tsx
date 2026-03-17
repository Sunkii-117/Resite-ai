'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AyahPanel } from '@/components/AyahPanel';
import { ControlBar } from '@/components/ControlBar';
import { DebugPanel } from '@/components/DebugPanel';
import { trackAyah } from '@/lib/quran/ayahTracker';
import { normalizeArabic } from '@/lib/quran/normalizeArabic';
import { Ayah, PhraseIndex, TrackerState } from '@/lib/quran/types';
import { BrowserSpeechRecognizer } from '@/lib/speech/browserSpeechRecognizer';

export default function HomePage() {
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [phraseIndex, setPhraseIndex] = useState<PhraseIndex>({});
  const [listening, setListening] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Idle');
  const [recognizedText, setRecognizedText] = useState('');
  const [normalizedText, setNormalizedText] = useState('');
  const [trackerState, setTrackerState] = useState<TrackerState>({
    currentAyahId: '1:1',
    confidence: 0.6,
    source: 'none',
    recentCandidates: [],
    isRecovering: false,
    topCandidates: [],
  });

  const recognizerRef = useRef<BrowserSpeechRecognizer | null>(null);

  useEffect(() => {
    async function loadData() {
      const [quranRes, phraseRes] = await Promise.all([
        fetch('/quran/mvp_quran.json'),
        fetch('/quran/mvp_phrase_index.json'),
      ]);
      setAyahs(await quranRes.json());
      setPhraseIndex(await phraseRes.json());
    }

    loadData().catch(() => setStatusMessage('Failed loading local Quran data.'));
  }, []);

  useEffect(() => {
    recognizerRef.current = new BrowserSpeechRecognizer(
      ({ transcript }) => {
        setRecognizedText(transcript);
        const normalized = normalizeArabic(transcript);
        setNormalizedText(normalized);

        if (!normalized || !ayahs.length || !Object.keys(phraseIndex).length) return;

        setTrackerState((prev) => trackAyah(normalized, prev, ayahs, phraseIndex).state);
      },
      (isListening, message) => {
        setListening(isListening);
        setStatusMessage(message || (isListening ? 'Listening...' : 'Idle'));
      },
    );

    return () => {
      recognizerRef.current?.stop();
      recognizerRef.current = null;
    };
  }, [ayahs, phraseIndex]);

  const currentIndex = useMemo(() => ayahs.findIndex((a) => a.ayah_id === trackerState.currentAyahId), [ayahs, trackerState.currentAyahId]);
  const currentAyah = ayahs[currentIndex] || ayahs[0];
  const previousAyah = currentIndex > 0 ? ayahs[currentIndex - 1] : undefined;
  const nextAyah = currentIndex >= 0 ? ayahs[currentIndex + 1] : undefined;

  const supported = typeof window !== 'undefined' ? Boolean(window.SpeechRecognition || window.webkitSpeechRecognition) : false;
  const recentSummary = trackerState.recentCandidates
    .map((c) => `${c.ayahId ?? '—'}:${c.confidence.toFixed(2)}`)
    .join(' | ');

  return (
    <main style={{ maxWidth: 860, margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ textAlign: 'center' }}>Resite MVP — Stable Small-Surah Tracker</h1>
      <ControlBar
        listening={listening}
        statusMessage={statusMessage}
        supported={supported}
        onStart={() => recognizerRef.current?.start()}
        onStop={() => recognizerRef.current?.stop()}
      />

      {currentAyah && <AyahPanel previousAyah={previousAyah} currentAyah={currentAyah} nextAyah={nextAyah} />}

      <DebugPanel
        recognizedText={recognizedText}
        normalizedText={normalizedText}
        matchedAyah={trackerState.currentAyahId}
        confidence={trackerState.confidence}
        source={trackerState.source}
        isRecovering={trackerState.isRecovering}
        recentCandidatesSummary={recentSummary}
        topCandidates={trackerState.topCandidates}
      />

      <p style={{ marginTop: '1rem', color: '#4b5563', fontSize: '0.9rem' }}>
        Note: Speech recognition quality depends on browser support (best in Chromium-based browsers) and microphone clarity.
      </p>
    </main>
  );
}

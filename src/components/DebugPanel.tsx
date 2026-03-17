import { RankedCandidate } from '@/lib/quran/types';

type DebugPanelProps = {
  recognizedText: string;
  normalizedText: string;
  matchedAyah: string;
  confidence: number;
  source: string;
  isRecovering: boolean;
  recentCandidatesSummary: string;
  topCandidates: RankedCandidate[];
};

export function DebugPanel({
  recognizedText,
  normalizedText,
  matchedAyah,
  confidence,
  source,
  isRecovering,
  recentCandidatesSummary,
  topCandidates,
}: DebugPanelProps) {
  return (
    <section style={{ marginTop: '1rem', border: '1px dashed #d1d5db', borderRadius: 10, padding: '0.85rem', background: '#f9fafb' }}>
      <h3 style={{ marginTop: 0 }}>Debug</h3>
      <p><strong>Recognized:</strong> {recognizedText || '—'}</p>
      <p><strong>Normalized:</strong> {normalizedText || '—'}</p>
      <p><strong>Matched Ayah:</strong> {matchedAyah}</p>
      <p><strong>Confidence:</strong> {confidence.toFixed(2)}</p>
      <p><strong>Tracker Source:</strong> {source}</p>
      <p><strong>Recovery Mode:</strong> {isRecovering ? 'ON' : 'OFF'}</p>
      <p><strong>Recent Candidates:</strong> {recentCandidatesSummary || '—'}</p>
      <div>
        <strong>Top Candidates:</strong>
        {topCandidates.length === 0 ? (
          <p>—</p>
        ) : (
          <ol style={{ marginTop: '0.4rem' }}>
            {topCandidates.map((candidate) => (
              <li key={candidate.ayahId}>
                {candidate.ayahId} — score {candidate.score.toFixed(2)} ({candidate.reason})
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

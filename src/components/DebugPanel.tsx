type DebugPanelProps = {
  recognizedText: string;
  normalizedText: string;
  matchedAyah: string;
  confidence: number;
  source: string;
  isRecovering: boolean;
  recentCandidatesSummary: string;
};

export function DebugPanel({
  recognizedText,
  normalizedText,
  matchedAyah,
  confidence,
  source,
  isRecovering,
  recentCandidatesSummary,
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
    </section>
  );
}

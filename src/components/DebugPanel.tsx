type DebugPanelProps = {
  recognizedText: string;
  normalizedText: string;
  matchedAyah: string;
  confidence: number;
};

export function DebugPanel({ recognizedText, normalizedText, matchedAyah, confidence }: DebugPanelProps) {
  return (
    <section style={{ marginTop: '1rem', border: '1px dashed #d1d5db', borderRadius: 10, padding: '0.85rem', background: '#f9fafb' }}>
      <h3 style={{ marginTop: 0 }}>Debug</h3>
      <p><strong>Recognized:</strong> {recognizedText || '—'}</p>
      <p><strong>Normalized:</strong> {normalizedText || '—'}</p>
      <p><strong>Matched Ayah:</strong> {matchedAyah}</p>
      <p><strong>Confidence:</strong> {confidence.toFixed(2)}</p>
    </section>
  );
}

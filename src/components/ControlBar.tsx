type ControlBarProps = {
  listening: boolean;
  statusMessage: string;
  supported: boolean;
  onStart: () => void;
  onStop: () => void;
};

export function ControlBar({ listening, statusMessage, supported, onStart, onStop }: ControlBarProps) {
  return (
    <section style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
      <button
        type="button"
        onClick={listening ? onStop : onStart}
        disabled={!supported}
        style={{
          background: listening ? '#dc2626' : '#059669',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '0.6rem 1rem',
          fontWeight: 600,
          cursor: supported ? 'pointer' : 'not-allowed',
        }}
      >
        {listening ? 'Stop Listening' : 'Start Listening'}
      </button>
      <div>
        <strong>Status:</strong> {statusMessage}
      </div>
    </section>
  );
}

import { Ayah } from '@/lib/quran/types';

type ArabicAyahProps = {
  ayah: Ayah;
  mode: 'current' | 'context';
};

export function ArabicAyah({ ayah, mode }: ArabicAyahProps) {
  return (
    <p
      dir="rtl"
      lang="ar"
      style={{
        fontSize: mode === 'current' ? '2rem' : '1.2rem',
        opacity: mode === 'current' ? 1 : 0.45,
        textAlign: 'center',
        margin: '0.5rem 0',
        lineHeight: 1.8,
      }}
    >
      {ayah.arabic_text}
    </p>
  );
}

import { Ayah } from '@/lib/quran/types';
import { ArabicAyah } from './ArabicAyah';
import { EnglishTranslation } from './EnglishTranslation';

type AyahPanelProps = {
  previousAyah?: Ayah;
  currentAyah: Ayah;
  nextAyah?: Ayah;
};

export function AyahPanel({ previousAyah, currentAyah, nextAyah }: AyahPanelProps) {
  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: '1rem 1.25rem', background: '#fff' }}>
      {previousAyah && <ArabicAyah ayah={previousAyah} mode="context" />}
      <ArabicAyah ayah={currentAyah} mode="current" />
      {nextAyah && <ArabicAyah ayah={nextAyah} mode="context" />}
      <EnglishTranslation ayah={currentAyah} />
    </section>
  );
}

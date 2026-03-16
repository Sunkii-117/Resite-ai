import { Ayah } from '@/lib/quran/types';

type EnglishTranslationProps = {
  ayah: Ayah;
};

export function EnglishTranslation({ ayah }: EnglishTranslationProps) {
  return (
    <p
      style={{
        marginTop: '1rem',
        textAlign: 'center',
        fontSize: '1.1rem',
        color: '#1f2937',
      }}
    >
      {ayah.english_translation}
    </p>
  );
}

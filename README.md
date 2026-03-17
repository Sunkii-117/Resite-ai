# Resite MVP (Client-side)

A Next.js + TypeScript **client-side** recitation tracker MVP.

## Scope in this stability phase
- Browser speech recognition (`SpeechRecognition`/`webkitSpeechRecognition`)
- Phrase-based matching with improved Arabic normalization
- Multi-chunk confirmation to reduce flicker
- Confidence reinforcement + decay
- Recovery mode with broader search and relock rules
- Quran subset only:
  - Surah 1 (Al-Fatihah)
  - Surah 112 (Al-Ikhlas)
  - Surah 113 (Al-Falaq)
  - Surah 114 (An-Nas)

No backend, no database, no paid APIs, no Whisper.

## Run
```bash
npm install
npm run build:mvp-quran
npm run dev
```

Open `http://localhost:3000`.

## Build for deployment
```bash
npm run build
npm run start
```

Ready for free Vercel deployment.

## Data files
- `public/quran/mvp_quran.json`
- `public/quran/mvp_phrase_index.json`

## Notes
Speech recognition quality depends heavily on browser support and microphone conditions. Chromium-based browsers usually perform best.

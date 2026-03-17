# Resite MVP (Client-side)

A Next.js + TypeScript **client-side** recitation tracker MVP.

## Scope in this stability phase
- Browser speech recognition (`SpeechRecognition`/`webkitSpeechRecognition`)
- Quran subset only: Surah 1, 112, 113, 114
- Reranked matcher with repeated-prefix disambiguation
- Multi-chunk confirmation + confidence reinforcement/decay + recovery mode
- Debug visibility for top candidates and scoring reasons

No backend, no database, no paid APIs, no Whisper.

## Matching behavior highlights
The matcher now separates and scores these signals differently:
- exact normalized ayah match (strongest)
- start-of-ayah prefix match
- longer prefix continuation
- phrase match at ayah start vs internal phrase containment
- mismatch penalty after shared prefix divergence
- ambiguity penalty for common short phrases
- moderate context bonus (current/next/previous), not dominant

This helps disambiguate repeated-prefix cases such as:
- `1:1` vs `1:3` for `الرحمن الرحيم`
- `113:3` vs `113:5` when openings partially overlap

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

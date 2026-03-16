# Resite MVP (Client-side)

A simple Next.js + TypeScript MVP for **Al-Fatihah follow-along**.

It listens to microphone input using browser speech recognition, matches recognized Arabic phrases to Al-Fatihah ayahs, and displays:
- previous ayah (faded)
- current ayah (prominent)
- next ayah (faded)
- English translation for the current ayah
- debug details (recognized text, normalized text, matched ayah, confidence)

## Scope
- Client-side only (no backend, no database)
- Surah Al-Fatihah only
- No tajweed/mistake detection
- No Whisper integration (yet)

## Setup
```bash
npm install
npm run build:fatihah
npm run dev
```

Open `http://localhost:3000`.

## Build for deployment
```bash
npm run build
npm run start
```

This project is ready for free deployment on Vercel.

## Browser support note
Speech recognition quality and availability depend on browser support. Chromium-based browsers typically work best for `SpeechRecognition`/`webkitSpeechRecognition`.

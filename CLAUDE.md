# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at localhost:5173 (also accessible on LAN via 0.0.0.0)
npm run build    # TypeScript check + production build
npm run preview  # Preview production build
```

There is no test or lint script configured.

## Architecture

This is a React + TypeScript PWA for tracking basketball game statistics. Navigation is managed in `src/App.tsx` via a simple `Screen` type (`'roster' | 'game' | 'summary'`) — no router library.

**Screen flow:** RosterScreen → GameScreen → SummaryScreen → (back to RosterScreen for new game)

### State

All game state lives in `src/state/gameState.ts`. The core data model:

- `GameState.events: GameEvent[]` — append-only log of all stat events. Stats are never mutated; they are always derived by `calculatePlayerStats()` / `calculateTeamStats()` at render time.
- `GameState.roster: Player[]` — players for the current game.
- Two separate localStorage keys: `basketball-stats-game` (active game) and `basketball-stats-roster` (saved roster for reuse).

### Voice Input

`src/utils/voiceParser.ts` parses Web Speech API transcripts into `ParsedEvent[]`. The pipeline:
1. `splitIntoClauses()` — splits on "assist by", commas, and "and"
2. `findBestPlayerMatch()` — three-tier matching: jersey number → exact name → fuzzy name (via `string-similarity`, threshold 0.5)
3. `getStatTypeFromText()` — keyword-based stat type detection

`src/components/VoiceInput.tsx` wraps the browser's `SpeechRecognition` API and calls the parser.

### Utilities

- `src/utils/exportCSV.ts` — generates and downloads a CSV file using the Blob API. Filename format: `basketball-stats-YYYY-MM-DD.csv`.

## Planned: Offline Voice Input

The current `VoiceInput.tsx` uses the browser's `SpeechRecognition` API, which requires internet (Chrome/Safari send audio to Google/Apple servers).

The goal is to add a toggle so the user can switch between:
- **Server mode** (current) — Web Speech API, fast, requires internet
- **Local mode** (planned) — Whisper running in-browser via WebAssembly, offline after first load

**Planned implementation for local mode:**
- Library: `@xenova/transformers` (Hugging Face Transformers.js)
- Model: `whisper-tiny` (~40MB) or `whisper-base` (~150MB), cached in browser after first download
- Audio capture: `MediaRecorder` API → audio buffer → Whisper pipeline
- Threading: run model in a Web Worker to avoid blocking the UI
- The parsed transcript output feeds into the existing `voiceParser.ts` pipeline unchanged

The toggle state should persist in `localStorage` so the user's preference is remembered between sessions.

## TypeScript Config

Strict mode is enabled with `noUnusedLocals`, `noUnusedParameters`, and `noFallthroughCasesInSwitch`. The build (`tsc && vite build`) will fail on unused variables.

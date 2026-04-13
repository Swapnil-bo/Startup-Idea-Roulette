# 🎰 STARTUP IDEA ROULETTE

### Spin the wheel. Get a startup. Watch it fail.

> *Product Hunt meets a roast comedy show.* Three slot-machine reels. One local LLM. Zero mercy.

![Python](https://img.shields.io/badge/Python-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React_18-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-Mistral_7B-black?style=for-the-badge&logo=meta&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-v10-FF0055?style=for-the-badge&logo=framer&logoColor=white)

---

## What Is This?

**Startup Idea Roulette** is a single-page web app that generates hilariously doomed startup pitches on demand. You spin three slot-machine-style reels — each landing on a random **Audience**, **Problem**, and **Tech** constraint — then fire those constraints at a local LLM that streams back a complete startup pitch, ending with a brutally honest roast of why the idea will fail.

The AI pitchman has witnessed 300 startup failures and somehow remains employed. He finds the whole thing hilarious but can't stop participating.

---

## The Experience

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│           🎰  STARTUP IDEA ROULETTE  🎰                │
│        Spin the wheel. Get a startup. Watch it fail.    │
│                                                         │
│    ┌──────────┐   ┌──────────┐   ┌──────────┐          │
│    │ AUDIENCE │   │ PROBLEM  │   │   TECH   │          │
│    │ ░░░░░░░░ │   │ ░░░░░░░░ │   │ ░░░░░░░░ │          │
│    │ ████████ │ → │ ████████ │ → │ ████████ │          │
│    │ ░░░░░░░░ │   │ ░░░░░░░░ │   │ ░░░░░░░░ │          │
│    └──────────┘   └──────────┘   └──────────┘          │
│                                                         │
│              [ ◆ GENERATE PITCH ◆ ]                     │
│                                                         │
│    ┌─ STARTUP NAME ────────────────────────────┐        │
│    │  ✨ NapChain Pro ✨                       │        │
│    └───────────────────────────────────────────┘        │
│    ┌─ TAGLINE ─────────────────────────────────┐        │
│    │  "Sleep different. Sleep on-chain."        │        │
│    └───────────────────────────────────────────┘        │
│    ┌─ MVP SPEC ────────────────────────────────┐        │
│    │  • Blockchain-verified nap tracking        │        │
│    │  • AI sleep coach with unsettling voice    │        │
│    │  • NFT sleep certificates                  │        │
│    └───────────────────────────────────────────┘        │
│    ┌─ BUSINESS MODEL ─────────────────────────┐         │
│    │  $12/mo subscription for "premium naps"    │        │
│    └───────────────────────────────────────────┘        │
│    ┌─🔥 WHY IT'LL FAIL ───────────────────────┐        │
│    │  Congratulations, you've invented paying   │        │
│    │  money to close your eyes. The blockchain  │        │
│    │  adds $0 in value and $40/month in gas...  │        │
│    └───────────────────────────────────────────┘        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Features

**The Reels**
- Three independent slot-machine columns with `requestAnimationFrame`-driven physics
- Each reel scrolls at its own speed, decelerates independently, and snaps with a satisfying lock
- Locked reels pulse with a neon purple glow — the casino-meets-VC-pitch-deck energy

**The Pitch**
- Real-time token-by-token streaming from Mistral 7B via Ollama
- Sections render progressively as they arrive — name, tagline, MVP spec, business model
- Each section animates in with Framer Motion as content flows in

**The Roast**
- Visually distinct crimson panel with a 🔥 header and dashed red border
- The AI doesn't pull punches — every roast is specific to *your* exact combination of constraints
- Not a generic risk disclaimer. Think: a friend who loves you but has watched you make terrible decisions for 10 years

**The Aesthetic**
- Dark void background (`#0a0a0f`) with a subtle purple bloom gradient
- Film-grain noise texture overlay for cinematic depth
- Glassmorphism cards with backdrop blur
- Neon glow system: purple, pink, cyan, crimson
- Syne display font + JetBrains Mono for that premium-but-unhinged look

---

## Tech Stack

| Layer | Tech | Why |
|-------|------|-----|
| **Backend** | Python + FastAPI | Async streaming, clean routing, fast |
| **LLM** | Ollama + Mistral 7B Instruct | Runs locally, no API keys, surprisingly good at roasting |
| **Frontend** | React 18 + Vite | Fast HMR, minimal config |
| **Styling** | Tailwind CSS v3 | Utility-first, custom design system |
| **Animation** | Framer Motion v10 | Section reveals, entrance animations |
| **Reel Physics** | Raw `requestAnimationFrame` | CSS transitions can't do velocity-based deceleration |
| **Streaming** | `fetch` + `ReadableStream` | POST body support (EventSource is GET-only) |

---

## Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **Ollama** installed and running — [ollama.com](https://ollama.com)

### 1. Pull the model

```bash
ollama pull mistral:7b-instruct
```

### 2. Start the backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs on `http://localhost:8000`.

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`. The Vite dev server proxies `/api` requests to the backend automatically.

### 4. Open and spin

Navigate to `http://localhost:5173`, click **SPIN**, then **GENERATE PITCH**. Watch the chaos unfold in real time.

---

## Project Structure

```
startup-idea-roulette/
│
├── backend/
│   ├── main.py                 # FastAPI app, CORS, router mount
│   ├── .env                    # OLLAMA_HOST, MODEL_NAME, FRONTEND_ORIGIN
│   ├── requirements.txt        # fastapi, uvicorn, ollama, python-dotenv
│   ├── routers/
│   │   └── pitch.py            # GET /api/spin, GET /api/constraints, POST /api/generate-pitch
│   ├── services/
│   │   └── llm_service.py      # System prompt, user prompt builder, Ollama streaming
│   └── data/
│       └── constraints.py      # 20 audiences × 20 problems × 20 techs = 8,000 combinations
│
├── frontend/
│   ├── index.html              # Google Fonts (Syne, JetBrains Mono)
│   ├── vite.config.js          # /api proxy to backend
│   ├── tailwind.config.js      # Custom neon color palette
│   ├── postcss.config.js       # Tailwind + autoprefixer
│   ├── .env                    # VITE_API_BASE_URL
│   └── src/
│       ├── index.css           # Design system: glows, gradients, noise, keyframes
│       ├── App.jsx             # Main layout, state orchestration
│       ├── hooks/
│       │   ├── useSpinWheel.js     # Reel state, per-wheel timing, constraint fetching
│       │   └── usePitchStream.js   # ReadableStream consumer, section parser
│       └── components/
│           ├── SpinWheel.jsx       # Three-reel slot machine with RAF physics
│           ├── ConstraintDisplay.jsx # Locked constraint badges
│           ├── PitchCard.jsx       # Progressive section renderer
│           ├── PitchSection.jsx    # Animated glass-card panel
│           ├── StreamingText.jsx   # Text with blinking cursor
│           └── RoastBadge.jsx      # Crimson roast panel with 🔥
│
└── CLAUDE.md                   # Full build specification
```

---

## API Endpoints

### `GET /api/constraints`
Returns all constraint lists for the spin wheels.

### `GET /api/spin`
Returns one random constraint per category.

```json
{ "audience": "...", "problem": "...", "tech": "..." }
```

### `POST /api/generate-pitch`
Streams a complete startup pitch from Mistral 7B.

**Request:**
```json
{ "audience": "...", "problem": "...", "tech": "..." }
```

**Response:** `text/plain` stream — tokens arrive one-by-one, parsed client-side into sections by `##` delimiters.

---

## Sample Constraints

**Audiences** — hyper-specific human archetypes:
> *"Crypto bros who still say 'we're early' while staring at a -90% portfolio"*
> *"Couples who are one IKEA trip away from a breakup"*
> *"Software engineers who mass-applied to 500 jobs and automated the cover letters with GPT"*

**Problems** — painfully relatable micro-problems:
> *"Has a notes app full of 'million dollar ideas' that are all terrible"*
> *"Rehearses confrontations in the shower then says 'it's fine' in real life"*
> *"Spends 45 minutes picking a restaurant then orders the same thing every time"*

**Techs** — genuinely useful to gloriously stupid:
> *"A Raspberry Pi duct-taped to something it has no business being attached to"*
> *"Machine learning trained on vibes instead of data"*
> *"An Excel spreadsheet cosplaying as enterprise software"*

20 of each. **8,000 possible combinations.** Each one worse than the last.

---

## Environment Variables

### Backend (`backend/.env`)
```env
OLLAMA_HOST=http://localhost:11434
MODEL_NAME=mistral:7b-instruct
FRONTEND_ORIGIN=http://localhost:5173
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| `neon-purple` | `#9333ea` | Primary accent, audience column, name glow |
| `neon-pink` | `#ec4899` | Tagline, problem column |
| `neon-cyan` | `#06b6d4` | MVP spec, tech column |
| `crimson` | `#7f1d1d` | Roast section background |
| `void` | `#0a0a0f` | Page background base |
| `glass` | `rgba(255,255,255,0.04)` | Card backgrounds |

### Glow System
```css
--glow-purple: 0 0 20px rgba(147,51,234,0.6), 0 0 60px rgba(147,51,234,0.2);
--glow-pink:   0 0 20px rgba(236,72,153,0.6), 0 0 60px rgba(236,72,153,0.2);
--glow-cyan:   0 0 20px rgba(6,182,212,0.6),  0 0 60px rgba(6,182,212,0.2);
--glow-red:    0 0 20px rgba(239,68,68,0.5),   0 0 40px rgba(239,68,68,0.15);
```

---

## How Streaming Works

```
Browser                          FastAPI                         Ollama
  │                                │                               │
  │  POST /api/generate-pitch      │                               │
  │  { audience, problem, tech }   │                               │
  │ ──────────────────────────────>│                               │
  │                                │  ollama.chat(stream=True)     │
  │                                │ ─────────────────────────────>│
  │                                │                               │
  │                                │  <── token by token ──────── │
  │  <── StreamingResponse ────── │                               │
  │                                │                               │
  │  ReadableStream.read()         │                               │
  │  TextDecoder.decode()          │                               │
  │  parseSections(buffer)         │                               │
  │  setSections({...})            │                               │
  │  → React re-render             │                               │
  │    → section panels appear     │                               │
```

The frontend re-parses the **entire accumulated buffer** on every chunk. No incremental state machine needed — just split on `## HEADERS` and map to state. Simple, correct, fast enough.

---

## Built With

Part of the **100 Days of Vibe Coding** challenge.

Built step-by-step with **Claude Code** — 16 incremental commits, one per build phase, from empty directory to full-stack streaming app.

---

<p align="center">
  <i>Every startup idea generated by this app is terrible. That's the point.</i>
</p>

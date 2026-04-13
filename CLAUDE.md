# CLAUDE.md — Startup Idea Roulette

---

## ⚠️ ABSOLUTE RULES — READ BEFORE ANYTHING ELSE

1. **NO git commits.** Zero. The user handles all version control manually. Never run any `git` command.
2. **ONE step at a time.** Build → verify it works → only then move to the next step. Never build two steps in one shot.
3. **No TODOs left in code.** Every function you write must be fully implemented. If you can't finish something, say so explicitly before writing it.
4. **No mocks, no stubs, no fake LLM responses.** Always call real Ollama. No exceptions.
5. **No `alert()`, no stray `console.log`.** All errors must render in the UI as styled components.
6. **No hardcoded ports or URLs in source files.** All environment-sensitive values go through environment variables (defined in the Environment Variables section below).
7. **If a step fails, stop and fix it.** Do not skip forward. Do not paper over errors.

---

## 🎯 What This App Is

**Startup Idea Roulette** is a single-page web app. The user spins three slot-machine-style wheels, each landing on a random constraint — an **Audience**, a **Problem**, and a **Tech**. Those three constraints get fired at a local LLM (Mistral 7B Instruct via Ollama), which streams back a complete, entertaining startup pitch in real time.

The tone is: *Product Hunt meets a roast comedy show*. Chaotic, fast, funny, slightly unhinged. The roast section at the end is non-negotiable — it must be genuinely brutal, not a soft disclaimer.

---

## 🛠️ Tech Stack

### Backend
| Concern | Choice |
|---|---|
| Language | Python |
| Framework | FastAPI |
| LLM | Ollama Python SDK (`ollama` package), model `mistral:7b-instruct` |
| Streaming | `fetch` + `ReadableStream` on the frontend; FastAPI `StreamingResponse` on the backend |
| CORS | Enabled for `http://localhost:5173` only |

### Frontend
| Concern | Choice |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| Animation | Framer Motion **v10** (pin to `^10.18.0` — v11 has breaking API changes) |
| Streaming client | `fetch` + `ReadableStream` — **NOT** `EventSource` (EventSource is GET-only; this endpoint requires a POST body) |
| State | `useState` + `useRef` only. No Redux, no Zustand, no Context API unless explicitly needed. |

### Ports
| Service | Port |
|---|---|
| FastAPI backend | `8000` |
| Vite frontend | `5173` |
| Ollama | `11434` (Ollama default — user manages this separately) |

---

## 🗂️ Folder Structure

```
startup-idea-roulette/
├── backend/
│   ├── main.py
│   ├── routers/
│   │   └── pitch.py
│   ├── services/
│   │   └── llm_service.py
│   ├── data/
│   │   └── constraints.py
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SpinWheel.jsx
│   │   │   ├── ConstraintDisplay.jsx
│   │   │   ├── PitchCard.jsx
│   │   │   ├── PitchSection.jsx
│   │   │   ├── StreamingText.jsx
│   │   │   └── RoastBadge.jsx
│   │   ├── hooks/
│   │   │   ├── useSpinWheel.js
│   │   │   └── usePitchStream.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── CLAUDE.md
```

---

## 🌍 Environment Variables

### Backend — `backend/.env`
```
OLLAMA_HOST=http://localhost:11434
MODEL_NAME=mistral:7b-instruct
FRONTEND_ORIGIN=http://localhost:5173
```

### Frontend — `frontend/.env`
```
VITE_API_BASE_URL=http://localhost:8000
```

All references to ports, origins, and the model name in source code must read from these variables — never hardcoded.

---

## 🎡 Constraint Data (`backend/data/constraints.py`)

All three lists live here. Each list has **exactly 20 items**. The tone must be a mix of painfully specific, absurd, and genuinely funny — not generic.

### Audiences (20 items — write all of these)
The target is hyper-specific human archetypes. Examples of the correct tone:
- Burnt-out millennials who can't afford therapy but have a Notion dashboard for their feelings
- Retired grandparents who just discovered TikTok and are deeply confused but won't admit it
- Startup founders who've failed 3 times and are currently "consulting"
- Gen Z students with $0, 14 side hustles, and a strong opinion on LLMs
- Remote workers who've forgotten how to make eye contact
- *(Write 20 total. Keep this energy.)*

### Problems (20 items — write all of these)
Painfully relatable micro-problems. Examples:
- Nobody responds to their texts within a reasonable timeframe
- Can't stop doomscrolling at 2am even though they know exactly what they're doing
- Keeps forgetting if they took their meds, supplements, or vitamins
- Their startup idea sounds exactly like 5 other startups but with a different name
- Feels guilty about not going to the gym for the 47th consecutive day
- *(Write 20 total.)*

### Techs (20 items — write all of these)
A mix of genuinely useful and gloriously stupid tech choices. Examples:
- Blockchain (obviously)
- AR glasses nobody will actually wear in public
- A Chrome extension (the lowest form of software)
- WhatsApp bots
- Voice AI that sounds slightly but noticeably off
- Quantum computing (somehow)
- *(Write 20 total.)*

---

## 🔌 API Specification

### `GET /api/spin`
Returns a randomly selected set of three constraints from the backend data.

**Response:**
```
{
  "audience": string,
  "problem": string,
  "tech": string
}
```

**Note on random selection:** The frontend picks constraints client-side using `useSpinWheel.js`. This endpoint exists as the canonical source of truth and can be used for server-side randomness if needed. Both are valid. The frontend hook is the primary path; this endpoint is secondary.

---

### `POST /api/generate-pitch`
Accepts the three locked constraints. Streams the LLM's pitch back to the client as a plain text stream.

**Request body:**
```
{
  "audience": string,
  "problem": string,
  "tech": string
}
```

**Response:** `StreamingResponse` with `media_type="text/plain"`. The response must include these headers explicitly to prevent browser buffering:
```
X-Content-Type-Options: nosniff
Cache-Control: no-cache
```

**Streaming behavior:**
- Each chunk is a raw text fragment as it arrives token-by-token from Ollama
- The stream ends naturally when Ollama finishes generating
- On Ollama connection failure: return HTTP `503` with JSON body `{"detail": "Ollama is not reachable. Make sure Ollama is running and mistral:7b-instruct is loaded."}`
- Do NOT buffer the full response. True token-by-token streaming is required.

---

## 🧠 LLM Prompt Design (`backend/services/llm_service.py`)

This is the most critical file in the project. Get this right.

### System Prompt
The system prompt must establish this persona and these rules:

**Persona:** A charismatic, slightly unhinged Silicon Valley pitch consultant who has personally witnessed 300 startup failures and somehow remains employed. He has seen every bad idea dressed up as disruption and finds the whole thing hilarious but can't stop participating.

**Rules the LLM must follow:**
- Always respond in the exact structured format defined below — no deviations
- Be punchy, creative, and specific to the given constraints — no generic filler
- The roast must be genuinely funny and brutally honest about *this specific idea* — not a generic "this is risky" disclaimer
- Never break character
- Never add preamble such as "Sure!", "Here's your pitch:", "Great idea!" — begin the output immediately with `## STARTUP NAME`
- Never add a closing line after the roast section

### User Prompt (constructed dynamically)
```
Audience: {audience}
Problem: {problem}
Tech: {tech}

Generate a complete startup pitch.
```

### Required Output Format

The LLM must produce output in this **exact** format. Section headers must match character-for-character — the frontend parser splits on these exact strings.

```
## STARTUP NAME
[One punchy, memorable name. Can be a portmanteau, a fake word, or a too-serious corporate name played for irony.]

## TAGLINE
[One line. Under 12 words. Should make someone either cringe or immediately want to invest.]

## MVP SPEC
[Exactly 3 bullet points. Each bullet is one specific, buildable feature. No vague nonsense like "AI-powered insights".]

## BUSINESS MODEL
[2–3 sentences. How does it actually make money? Be specific — subscription, marketplace cut, enterprise licensing, selling user data to a hedge fund, etc.]

## WHY IT'LL FAIL (THE ROAST)
[3–5 sentences. Brutally honest. Funny. Specific to THIS idea and THESE constraints. Not a generic risk disclaimer. Think: a friend who loves you but has watched you make terrible decisions for 10 years.]
```

### Roast Quality Bar

This is what a **good roast** looks like (use this as the internal quality target):

> "Congratulations, you've built a Chrome extension for burnt-out millennials that reminds them to drink water using blockchain verification. The target market will ignore the notification, close the extension after three days, and forget they installed it. The blockchain component adds $0 in value and $40/month in gas fees. Your Series A pitch will get a polite 'we'll follow your progress' from every VC in the room, which is investor for 'never contact us again.' The only person who will use this daily is your co-founder, and only because they're too scared to tell you it's not working."

The roast must be that specific. If the model produces generic output like "This market is crowded and user acquisition will be challenging," the system prompt is failing — iterate on it until the quality bar is met.

---

## 🎨 Frontend UI Specification

### Design Language
- **Theme:** Dark only. Background is near-black (`#0a0a0f`). No light mode.
- **Accent palette:**
  - Electric purple: `#9333ea`
  - Hot pink: `#ec4899`
  - Cyan: `#06b6d4`
  - Deep crimson (roast section only): `#7f1d1d` background, `#fca5a5` text
- **Typography:**
  - Display/headings: `Syne` (load via Google Fonts in `index.html`)
  - Pitch output text: `JetBrains Mono` or `IBM Plex Mono` (load via Google Fonts in `index.html`)
  - Load both fonts with `display=swap` in the `<link>` tag
- **Vibe:** Casino crossed with a VC pitch deck. Premium but chaotic.

### Layout
- Single page, no routing
- Center column, `max-width: 800px`, horizontally centered
- Structure top to bottom:
  1. App title + one-liner description
  2. Three spin wheel columns (side by side)
  3. SPIN button (large, animated, primary CTA)
  4. After spin completes: locked constraints display + GENERATE PITCH button (fade in)
  5. Pitch card (renders below, sections appear progressively)

### `SpinWheel.jsx` — Behavior Spec

Three side-by-side columns. Labels: **AUDIENCE** / **PROBLEM** / **TECH**.

**Spin animation:**
- Each column shows a vertically scrolling list that accelerates, runs fast, then decelerates and snaps to the selected item
- Implement as a CSS `transform: translateY()` animation with `cubic-bezier(0.17, 0.67, 0.35, 1.0)` easing (fast start, hard decelerate)
- Total duration: 1.2s to 1.8s — each wheel gets a slightly different random duration so they don't lock simultaneously (feels more real)
- The "window" showing the selected item uses `overflow: hidden` with a fixed height showing ~3 items; the middle item is the selection
- Selected item: glowing border in the wheel's accent color, slightly larger font
- Wheels must be independently animated — do not sync them

**Post-spin state:**
- All three wheels locked = show `ConstraintDisplay` below the wheels and fade in the GENERATE PITCH button
- A smaller "Re-spin" button (secondary style) is always visible after first spin

### `ConstraintDisplay.jsx`

Shows the three locked values clearly labeled. Each value in its accent color. This is a simple display component — no logic.

**Dependency note:** `PitchCard.jsx` does NOT depend on `ConstraintDisplay.jsx`. Build `ConstraintDisplay.jsx` before `PitchCard.jsx` anyway since it's simpler.

### `usePitchStream.js` — Streaming Hook Spec

This hook owns the entire streaming lifecycle.

**Streaming approach:** Use `fetch` with `ReadableStream`. Do NOT use `EventSource`. The request is a POST with a JSON body — EventSource cannot do this.

**Implementation approach:**
- Call `fetch` on `POST /api/generate-pitch` with the constraints as JSON body
- Read `response.body` as a `ReadableStream`
- Use a `TextDecoder` to decode chunks as they arrive
- Maintain a buffer string that accumulates all received text
- After each chunk, re-parse the full buffer to extract sections (see section parsing below)

**Section parsing logic:**
The LLM output contains these exact delimiter strings:
```
## STARTUP NAME
## TAGLINE
## MVP SPEC
## BUSINESS MODEL
## WHY IT'LL FAIL (THE ROAST)
```
Parse the buffer by splitting on these delimiters. Map the parsed segments to this state shape:
```
sections: {
  name: string,       // content after ## STARTUP NAME
  tagline: string,    // content after ## TAGLINE
  mvpSpec: string,    // content after ## MVP SPEC
  businessModel: string, // content after ## BUSINESS MODEL
  roast: string       // content after ## WHY IT'LL FAIL (THE ROAST)
}
```
Each value grows in real time as more of the stream arrives. Re-parse on every chunk — do not try to do incremental section detection. Re-parsing the full buffer on each chunk is simple, correct, and fast enough.

**Exposed API:**
```
{ sections, isStreaming, error, startStream, reset }
```
- `startStream(audience, problem, tech)` — initiates the fetch stream
- `reset()` — clears sections, error, and streaming state (called on re-spin)

### `PitchCard.jsx` — Render Spec

Renders each section as its own panel, appearing as the corresponding `sections` key becomes non-empty.

**Section reveal:** Each panel animates in with Framer Motion: `opacity: 0 → 1`, `y: 16 → 0`, `duration: 0.4s`, `ease: "easeOut"`. Only render a section panel once its content string has at least one non-whitespace character.

**Section styles:**
- `## STARTUP NAME` — huge bold text, neon glow (`text-shadow` with purple), `Syne` font
- `## TAGLINE` — italic, accent pink color, slightly smaller
- `## MVP SPEC` — rendered as a `<ul>` bulleted list, split content on newline + bullet character
- `## BUSINESS MODEL` — plain paragraph text, monospace font
- `## WHY IT'LL FAIL (THE ROAST)` — rendered by `RoastBadge.jsx` (see below)

### `RoastBadge.jsx`

Visually distinct from all other sections. Deep crimson background (`#7f1d1d`), light red text (`#fca5a5`), a 🔥 icon in the header, slightly rougher border style (dashed or a glowing red border). The tonal shift must be immediately obvious.

### Loading State

While `isStreaming === true` and `sections` is still empty (before the first section delimiter arrives):
- Show a pulsing animated text: `"Generating your doomed startup..."` 
- Use a CSS keyframe `opacity` pulse (1 → 0.4 → 1) — do NOT use a generic spinner
- Once the first section starts arriving, replace this with the progressively rendering `PitchCard`

### Error State

When `error` is non-null, render a styled error panel (not `alert()`):
- Text: `"Ollama isn't running or mistral:7b-instruct isn't loaded. Fire up Ollama and try again."`
- Style: dark red background, clear visible placement above the pitch area

---

## ⚙️ Config Files Spec

### `backend/requirements.txt`
Must include: `fastapi`, `uvicorn[standard]`, `ollama`, `python-dotenv`

### `frontend/package.json` — key dependencies
Must include:
- `react` + `react-dom` (v18)
- `framer-motion` pinned to `^10.18.0`
- `tailwindcss` v3
- `@vitejs/plugin-react`
- `autoprefixer`, `postcss`

No UI component libraries. No shadcn, no MUI, no Chakra. Everything is custom Tailwind.

### `frontend/postcss.config.js`
This file **must exist** at the frontend root. Tailwind will silently fail without it. It must register `tailwindcss` and `autoprefixer` as PostCSS plugins.

### `frontend/tailwind.config.js`
Must extend the default theme with:
- Custom colors: `neon-purple: '#9333ea'`, `neon-pink: '#ec4899'`, `neon-cyan: '#06b6d4'`, `crimson: '#7f1d1d'`
- Content paths covering `./src/**/*.{js,jsx}`

### `frontend/vite.config.js`
Must configure a dev proxy: requests to `/api` proxied to `http://localhost:8000`. This means the frontend uses `/api/...` paths, not the full `http://localhost:8000/api/...` URL. The `VITE_API_BASE_URL` env var acts as a fallback for production builds.

### `frontend/index.html`
Must load both Google Fonts via `<link>` tags with `display=swap`:
- `Syne` (weights 400, 700, 800)
- `JetBrains Mono` (weights 400, 500)

---

## 🔁 Build Order

Follow this sequence exactly. Do not combine steps. Do not jump ahead.

| Step | What to build | Verify before moving on |
|---|---|---|
| 1 | Backend folder structure + `requirements.txt` | Folder exists, file is correct |
| 2 | `constraints.py` — all 20 items per category | Print-check the lists, count them |
| 3 | `llm_service.py` — prompt construction + Ollama streaming | Review prompt quality manually |
| 4 | `pitch.py` router — both endpoints | File is syntactically correct |
| 5 | `main.py` — FastAPI app, CORS, router registration | `uvicorn main:app --reload` starts without errors |
| 6 | **Manual backend verify** | `GET /api/spin` returns valid JSON. `POST /api/generate-pitch` streams real tokens. Confirm in terminal. |
| 7 | Scaffold frontend with Vite + React | `npm run dev` starts without errors |
| 8 | Configure Tailwind + custom colors + Google Fonts | Tailwind classes resolve; fonts load in browser |
| 9 | `useSpinWheel.js` | Logic unit-testable by reading the code |
| 10 | `SpinWheel.jsx` with animation | Spin visually works in browser; wheels lock independently |
| 11 | `usePitchStream.js` | Review streaming logic carefully before moving on |
| 12 | `StreamingText.jsx`, `PitchSection.jsx`, `RoastBadge.jsx` | Components render correctly with static test data |
| 13 | `ConstraintDisplay.jsx` | Renders locked constraints correctly |
| 14 | `PitchCard.jsx` | Renders all sections; Framer Motion animations fire correctly |
| 15 | Wire everything in `App.jsx` | Full page renders without console errors |
| 16 | **Full end-to-end test** | Spin → lock → generate → stream renders section by section → roast appears → re-spin clears state |

---

## ✅ Definition of Done

The project is complete when **all** of the following are true:

- [ ] Spinning the wheel feels smooth — each wheel decelerates and locks independently
- [ ] All three constraints display clearly after spin
- [ ] "Generate Pitch" button only appears after spin completes
- [ ] Clicking it fires the real LLM and streams tokens in real time
- [ ] Each pitch section renders progressively as its content arrives in the stream
- [ ] Startup Name renders with a neon glow
- [ ] MVP Spec renders as a proper bullet list
- [ ] The Roast section is visually distinct (crimson, 🔥) and the content is genuinely funny
- [ ] Re-spinning clears the old pitch and returns to pre-generate state
- [ ] If Ollama is offline, the error renders in the UI — no `alert()`, no crash
- [ ] Zero console errors on the happy path
- [ ] The UI is dark, premium, and slightly chaotic — not generic, not cookie-cutter

---

## 🧭 Decision Guide for Edge Cases

If you encounter an ambiguous situation not covered above, resolve it as follows:

| Situation | Resolution |
|---|---|
| LLM output doesn't follow the format | Render whatever arrived; don't crash. Log a warning in the backend. |
| A section delimiter arrives mid-chunk | Re-parsing the full buffer on every chunk handles this automatically |
| Ollama returns an empty stream | Show the error state: "Something went wrong. The model returned an empty response." |
| Framer Motion API question | Use the v10 API. If in doubt, check the v10 docs specifically. |
| Should I add a feature not in this doc? | No. Build exactly what's specced. Flag additions as suggestions after step 16. |

---

*Part of the 100 Days of Vibe Coding challenge.*
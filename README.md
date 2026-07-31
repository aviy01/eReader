# Verso

**A second-language reading companion for PDF and Word documents.**

Verso is a browser-based eReader built for people reading in a language
they're still learning. Select any word or passage and get an instant
definition, synonyms, and translation — without ever leaving the page.

---

## Features

### Reading
- **PDF and Word (`.docx`) support**, rendered client-side (pdf.js and
  mammoth) — no files ever leave the browser to be processed.
- **Multiple documents open at once.** The Library panel lists everything
  you've opened; switch between them with a click, close with the hover
  trash icon.
- **Page navigation** via the top toolbar, mid-page arrow buttons, or
  keyboard, with a realistic page-turning animation for PDFs (the outgoing
  page curls away from the spine to reveal the next one).
- **Light and dark themes** — a warm "paper" light mode and a soft
  graphite dark mode, toggled from the top bar.
- **Collapsible sidebar** with Library and Vocabulary Vault tabs.

### Language tools
- **Select a word** to see, in order: its definition (in your chosen
  "1st" language), at least 4 synonyms, and its meaning in a second
  language of your choice — plus a speaker button that reads the word
  and then its definition aloud.
- **Select a passage** and click **Translate page** to translate the
  highlighted text as a whole.
- **Three independent language settings**, all changeable from the
  sidebar:
  - **Reading in** — the document's own language.
  - **1st — definition** — defaults to and follows "Reading in"
    automatically, until you manually override it.
  - **2nd — meaning** — a second language shown alongside the first.
- **Vocabulary Vault** — save any looked-up word (with its definition,
  synonyms, second-language meaning, and surrounding context) for later
  review.

### Translation engine
Verso tries, in order, whichever of these is available:

1. **The browser's built-in, on-device Translator API** (Chrome 138+,
   Edge 148+) — translation runs locally on the user's machine. It's
   free, has no rate limit or daily quota, and needs no network request
   once the (one-time, per-language-pair) local model is downloaded.
2. **[MyMemory](https://mymemory.translated.net)** — a free, keyless,
   CORS-enabled translation API, used automatically on browsers that
   don't support the on-device API. Long passages are chunked to respect
   its per-request length limit; if a page is too long to fully
   translate within the shared free daily quota, the UI says so plainly
   instead of silently cutting it off.
3. **A small built-in demo dictionary** as a last-resort fallback if both
   of the above are unreachable (e.g. offline) — clearly labeled as such
   in the UI, never presented as a live result.

Definitions, parts of speech, and synonyms come from the
[Free Dictionary API](https://dictionaryapi.dev), topped up with
[Datamuse](https://www.datamuse.com/api/) synonyms when fewer than four
are available.

No API keys, sign-ups, or environment variables are required for any of
this — every service used is free and keyless.

---

## Tech stack

- **[Next.js 14](https://nextjs.org/)** (App Router) + React 18 + TypeScript
- **Tailwind CSS** with a custom design system (`tailwind.config.ts`) —
  Lora (serif) for reading/branding, Inter for UI chrome, JetBrains Mono
  for numeric UI (page counters, zoom)
- **[Radix UI](https://www.radix-ui.com/)** primitives + **class-variance-authority**
  for accessible, composable components (`components/ui`)
- **[Framer Motion](https://www.framer.com/motion/)** for the sidebar,
  popups, and page-turn animation
- **[pdf.js](https://mozilla.github.io/pdf.js/)** for PDF rendering and
  text-layer selection
- **[mammoth](https://github.com/mwilliamson/mammoth.js)** for `.docx` → HTML conversion
- **next-themes** for light/dark mode

---

## Getting started

### Prerequisites
- Node.js 18.18 or later
- npm (or your package manager of choice)

### Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No environment
variables or API keys are needed — the app works immediately.

> **Note on the on-device translator:** it requires Chrome 138+ or Edge
> 148+ and a secure context. `http://localhost` is automatically treated
> as secure, so it works locally with no extra configuration. On other
> browsers, Verso transparently falls back to the MyMemory-based path
> described above — nothing to configure either way.

### Build for production

```bash
npm run build
npm run start
```

### Deploying

Verso is a standard Next.js app with no backend services, databases, or
environment variables to provision — it deploys to
**[Vercel](https://vercel.com)** with zero configuration. Push the repo,
import it in Vercel, and deploy.

---

## Project structure

```
app/                     Next.js App Router entry (layout, page, globals.css)
components/
  layout/                App shell, sidebar, top navbar
  reader/                Document stage, PDF/DOCX page renderers,
                         word popup, translate-page dialog
  ui/                    Shared design-system primitives (Radix + CVA)
lib/
  document-context.tsx   Open-documents state (multi-doc library)
  language-context.tsx   Reading / 1st / 2nd language state
  vault-context.tsx      Saved-word vocabulary vault
  reader-ui-context.tsx  Cross-component UI state (dialogs, sidebar width, etc.)
  translate-api.ts       MyMemory-based translation (chunking, caching)
  browser-translate.ts   On-device Translator API wrapper
  dictionary-api.ts      Free Dictionary API + Datamuse synonym lookups
  mock-translate.ts      Offline demo-dictionary fallback
  speech.ts              Text-to-speech helpers
```

---

## Known limitations

- **On-device translation is Chrome/Edge only.** Firefox and Safari users
  automatically use the MyMemory-based path instead — this is expected,
  not a bug, and there's no equivalent standard API elsewhere yet.
- **MyMemory's free, keyless tier has a modest shared daily quota.**
  Word/definition lookups and full-page translations on non-Chromium
  browsers all draw from the same pool; very long pages are capped and
  the UI explains when that happens.
- **The vault and open documents are in-memory only** — they reset on a
  full page reload. Persisting them (e.g. to `localStorage` or a backend)
  is a natural next step.
- **`.doc` (legacy binary Word format) isn't supported** — mammoth, the
  library used for Word rendering, only handles `.docx`.
- **Sentence/context extraction** around a selected word is currently
  "the nearest block of text," not true sentence-boundary detection.

---

## License

Add a license of your choosing (e.g. MIT) before publishing.

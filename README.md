# Verso — an eReader for second-language learners

Steps 1–5: app shell, theming, PDF/DOCX upload + render, and the core
highlight-to-translate feature — now backed by **real, free, no-API-key**
translation and dictionary services instead of mock data.

## Real APIs in use

- **Translation** — [MyMemory](https://mymemory.translated.net) via
  `lib/translate-api.ts`. Free, no signup, CORS-enabled, called directly
  from the browser. Used for both the word popup and "Translate page."
  - Word/phrase lookups (`translateWordApi`) are cached in-memory so
    re-selecting the same word doesn't refire the request.
  - Full-page translation (`translatePassageApi`) chunks the page's text
    into ~450-character pieces (MyMemory's free tier caps request length)
    and translates them sequentially, then rejoins them.
- **Part of speech + synonyms** —
  [Free Dictionary API](https://dictionaryapi.dev) via
  `lib/dictionary-api.ts`. Free, no signup, CORS-enabled. Only covers
  single English words by design (it's an English dictionary), so
  multi-word selections or non-English source text just won't show a POS
  tag — the translation itself still works via MyMemory regardless of
  source language.
- **Fallback, not silent failure.** If either API is unreachable (offline,
  rate-limited, blocked network), both the popup and the page dialog fall
  back to the small built-in demo dictionary in `lib/mock-translate.ts` and
  say so explicitly in the UI ("Translation service unreachable — showing
  demo dictionary results"). Nothing is ever silently wrong.
- **Which language is "from"?** `lib/language-context.tsx` now tracks three
  languages, all changeable from the sidebar: **Reading in** (the
  document's language, default English — this is the API's source
  language), and two **Translate into** targets (your native + second
  language, defaults Spanish/French). The word popup shows both targets at
  once; "Translate page" asks you to pick one.

## Everything else from Steps 1–4 (recap)

- **Multiple open documents** stay open until explicitly closed —
  `lib/document-context.tsx` holds an array of documents, not just one.
  The sidebar's Library tab lists them all; click to switch, hover for a
  trash icon to close.
- **Fixed:** dragging a selection used to grab words scattered across the
  page. Root cause was pdf.js's `TextLayer` needing a `--scale-factor` CSS
  variable on its container that was never set — fixed in
  `components/reader/pdf-page.tsx`.
- **Vocabulary Vault** (`lib/vault-context.tsx`) — "Add to Vault" saves a
  real entry; the sidebar's Vault tab reads from it, and its speaker icon
  calls the same TTS helper (`lib/speech.ts`, wraps the browser's
  `SpeechSynthesis` API) as the popup.
- **Theming** — `components/theme-provider.tsx` + CSS variables in
  `app/globals.css`. Warm "paper" light mode; soft graphite
  (`#121212`/`#1E1E1E`) dark mode.
- **Layout shell** — `components/layout/app-shell.tsx` composes the
  collapsible sidebar and top navbar.
- **Design tokens** — `tailwind.config.ts`: paper/ink/highlighter-gold
  palette. Lora (serif) for brand/reading, Inter for UI chrome, JetBrains
  Mono for page counters and zoom %.
- **UI primitives** — `components/ui/*` — shadcn-style Button, Switch,
  Tabs, ScrollArea, Separator, Tooltip, DropdownMenu, Dialog on Radix + CVA.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000. Requires internet access: once for the
Google Fonts / pdf.js worker (cdnjs), and ongoing for the two free
translation/dictionary APIs above (both called live, no key needed).

Try highlighting any word in an uploaded PDF or Word doc — it'll hit
MyMemory + the Free Dictionary API in real time. If you're offline, you'll
still see results, just clearly marked as coming from the demo dictionary.

## What's next

1. Rate limits: MyMemory's free anonymous tier is modest (roughly 5,000
   words/day). For heavier use, either add an `mymemory` "de" email param
   (bumps the daily cap) or swap in a paid API — both are one-file changes
   in `lib/translate-api.ts`.
2. Persisting the vault and open documents across page reloads — currently
   in-memory React state only.
3. Sentence-level context extraction is currently "the nearest block of
   text" — could use real sentence-boundary detection.
4. Broader `.doc` (legacy binary) support — mammoth only handles `.docx`
   today.




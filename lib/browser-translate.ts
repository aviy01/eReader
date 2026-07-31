"use client";

// Chrome (138+, June 2025) and Edge (148+, May 2026) ship a built-in,
// on-device Translator API — translation runs entirely locally using a
// downloaded model, with no server, no API key, no rate limit, and no daily
// quota. It's not a web standard yet and only exists in these two Chromium
// browsers, so every call here is designed to fail soft (return null) and
// let the caller fall back to the MyMemory-based API in translate-api.ts.
//
// Docs: https://developer.chrome.com/docs/ai/translator-api

type TranslatorAvailability =
  | "available"
  | "downloadable"
  | "downloading"
  | "unavailable";

interface BrowserTranslatorInstance {
  translate(text: string): Promise<string>;
  destroy?: () => void;
}

interface TranslatorStatic {
  availability(options: {
    sourceLanguage: string;
    targetLanguage: string;
  }): Promise<TranslatorAvailability>;
  create(options: {
    sourceLanguage: string;
    targetLanguage: string;
  }): Promise<BrowserTranslatorInstance>;
}

declare global {
  interface Window {
    Translator?: TranslatorStatic;
  }
}

export function isBrowserTranslatorSupported(): boolean {
  return typeof window !== "undefined" && "Translator" in window;
}

// One translator instance per language pair, reused across calls instead of
// re-creating (and potentially re-downloading) on every translation.
const translatorCache = new Map<string, Promise<BrowserTranslatorInstance | null>>();

async function createTranslator(
  sourceLang: string,
  targetLang: string
): Promise<BrowserTranslatorInstance | null> {
  if (!isBrowserTranslatorSupported()) return null;
  try {
    const availability = await window.Translator!.availability({
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
    });
    if (availability === "unavailable") return null;

    // "downloadable"/"downloading" just means the on-device model isn't
    // cached yet — create() itself waits for the (one-time) download, so we
    // don't need to special-case it here beyond letting it take longer.
    return await window.Translator!.create({
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
    });
  } catch {
    return null;
  }
}

function getTranslator(
  sourceLang: string,
  targetLang: string
): Promise<BrowserTranslatorInstance | null> {
  const key = `${sourceLang}|${targetLang}`;
  let cached = translatorCache.get(key);
  if (!cached) {
    cached = createTranslator(sourceLang, targetLang);
    translatorCache.set(key, cached);
  }
  return cached;
}

/**
 * Translates text using the browser's free, on-device Translator API.
 * Returns `null` (never throws) if the API is unsupported, the language
 * pair isn't available, or anything goes wrong — callers should fall back
 * to the MyMemory-based API in that case.
 */
export async function translateWithBrowserApi(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string | null> {
  if (!text.trim() || sourceLang === targetLang) return text;

  const translator = await getTranslator(sourceLang, targetLang);
  if (!translator) return null;

  try {
    return await translator.translate(text);
  } catch {
    // A previously-working translator can still fail per-call (e.g. the
    // model was evicted) — drop it from the cache so the next attempt
    // re-creates it instead of repeatedly hitting the same failure.
    translatorCache.delete(`${sourceLang}|${targetLang}`);
    return null;
  }
}

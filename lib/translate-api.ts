// Free, keyless translation via MyMemory (https://mymemory.translated.net).
// CORS-enabled, no signup required. Rate/length limited on the free tier,
// so long passages get split into chunks and short lookups are cached.
// Used as the fallback when the browser's built-in on-device Translator API
// (see browser-translate.ts) isn't supported or doesn't cover a language
// pair — that API is tried first everywhere since it's free and unlimited.

import { translateWithBrowserApi } from "@/lib/browser-translate";

const MYMEMORY_ENDPOINT = "https://api.mymemory.translated.net/get";
const MAX_CHUNK_LENGTH = 450; // stay under MyMemory's ~500 char/request cap

const cache = new Map<string, string>();

// MyMemory expects a couple of language codes in a non-ISO-639-1 form.
function toMyMemoryCode(code: string): string {
  if (code === "zh") return "zh-CN";
  return code;
}

interface MyMemoryResponse {
  responseData?: { translatedText?: string };
  responseStatus?: number | string;
  responseDetails?: string;
}

async function translateChunk(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return text;

  const cacheKey = `${sourceLang}|${targetLang}|${trimmed}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({
    q: trimmed,
    langpair: `${toMyMemoryCode(sourceLang)}|${toMyMemoryCode(targetLang)}`,
  });

  const res = await fetch(`${MYMEMORY_ENDPOINT}?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Translation request failed (${res.status})`);
  }

  const data = (await res.json()) as MyMemoryResponse;
  const status = Number(data.responseStatus);
  if (Number.isFinite(status) && status !== 200) {
    throw new Error(data.responseDetails || "Translation service error");
  }

  const translated = data.responseData?.translatedText;
  if (!translated) throw new Error("Empty translation response");

  cache.set(cacheKey, translated);
  return translated;
}

function splitIntoChunks(text: string, maxLen: number): string[] {
  const chunks: string[] = [];
  let remaining = text.trim();
  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }
    let cut = remaining.lastIndexOf(" ", maxLen);
    if (cut <= 0) cut = maxLen;
    chunks.push(remaining.slice(0, cut));
    remaining = remaining.slice(cut).trim();
  }
  return chunks;
}

/** Translates a short word or phrase. Throws on failure — caller decides fallback. */
export async function translateWordApi(
  word: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  if (!word.trim() || sourceLang === targetLang) return word;

  const viaBrowser = await translateWithBrowserApi(word, sourceLang, targetLang);
  if (viaBrowser !== null) return viaBrowser;

  return translateChunk(word, sourceLang, targetLang);
}

export interface PassageTranslation {
  text: string;
  /** True if the source text was longer than `maxChunks` chunks and the
   *  remainder was left untranslated. Only ever happens on the MyMemory
   *  fallback path — the on-device browser translator has no such cap. */
  truncated: boolean;
  /** Which engine actually produced this translation. */
  engine: "browser" | "mymemory";
}

/**
 * Translates a longer passage. Tries the free, unlimited on-device browser
 * Translator API first (no length cap, so the whole passage goes in one
 * call). Falls back to MyMemory, chunked to respect its per-request length
 * limit and rate limit — `maxChunks` caps how much of a very long page gets
 * sent on that path, since MyMemory's anonymous (keyless) tier shares one
 * daily quota across every translation call the app makes.
 */
export async function translatePassageApi(
  text: string,
  sourceLang: string,
  targetLang: string,
  maxChunks = 8
): Promise<PassageTranslation> {
  if (!text.trim() || sourceLang === targetLang) {
    return { text, truncated: false, engine: "browser" };
  }

  const viaBrowser = await translateWithBrowserApi(text, sourceLang, targetLang);
  if (viaBrowser !== null) {
    return { text: viaBrowser, truncated: false, engine: "browser" };
  }

  const allChunks = splitIntoChunks(text, MAX_CHUNK_LENGTH);
  const chunks = allChunks.slice(0, maxChunks);
  const truncated = allChunks.length > chunks.length;

  const translated: string[] = [];
  for (const chunk of chunks) {
    // Sequential on purpose — the free tier is rate-limited per second.
    // eslint-disable-next-line no-await-in-loop
    translated.push(await translateChunk(chunk, sourceLang, targetLang));
  }
  return { text: translated.join(" "), truncated, engine: "mymemory" };
}

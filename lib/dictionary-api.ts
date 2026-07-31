// Free, keyless English dictionary lookups via
// https://dictionaryapi.dev (CORS-enabled, no signup), topped up with
// https://api.datamuse.com (also free/keyless) for synonyms when the
// dictionary entry doesn't have at least MIN_SYNONYMS on its own. Only
// covers single English words — phrases and non-English source text simply
// get no POS/synonym data, which the UI handles gracefully.

const ENDPOINT = "https://api.dictionaryapi.dev/api/v2/entries/en";
const DATAMUSE_ENDPOINT = "https://api.datamuse.com/words";
const MIN_SYNONYMS = 4;

async function fetchDatamuseSynonyms(word: string): Promise<string[]> {
  try {
    const res = await fetch(
      `${DATAMUSE_ENDPOINT}?rel_syn=${encodeURIComponent(word)}&max=8`
    );
    if (!res.ok) return [];
    const data = (await res.json()) as Array<{ word: string }>;
    return data.map((entry) => entry.word);
  } catch {
    return [];
  }
}

export interface WordInfo {
  pos: string | null;
  synonyms: string[];
  definition: string | null;
}

interface DictionaryApiEntry {
  meanings?: Array<{
    partOfSpeech?: string;
    synonyms?: string[];
    definitions?: Array<{
      definition?: string;
      synonyms?: string[];
    }>;
  }>;
}

const cache = new Map<string, WordInfo | null>();

export async function fetchWordInfo(word: string): Promise<WordInfo | null> {
  const key = word.toLowerCase().trim();
  if (!key || /\s/.test(key)) return null; // dictionaryapi.dev is single-word only

  if (cache.has(key)) return cache.get(key) ?? null;

  try {
    const res = await fetch(`${ENDPOINT}/${encodeURIComponent(key)}`);
    if (!res.ok) {
      cache.set(key, null);
      return null;
    }

    const data = (await res.json()) as DictionaryApiEntry[];
    const meaning = data?.[0]?.meanings?.[0];
    const firstDefinition = meaning?.definitions?.[0];

    let synonyms = Array.from(
      new Set([
        ...(meaning?.synonyms ?? []),
        ...(firstDefinition?.synonyms ?? []),
      ])
    );

    if (synonyms.length < MIN_SYNONYMS) {
      const extra = await fetchDatamuseSynonyms(key);
      synonyms = Array.from(new Set([...synonyms, ...extra]));
    }
    synonyms = synonyms.slice(0, 8);

    const info: WordInfo = {
      pos: meaning?.partOfSpeech ?? null,
      synonyms,
      definition: firstDefinition?.definition ?? null,
    };

    cache.set(key, info);
    return info;
  } catch {
    cache.set(key, null);
    return null;
  }
}

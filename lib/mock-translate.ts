// Demo translation data only — there is no live translation API wired up.
// Swap the lookups below for a real API (DeepL, Google Translate, etc.)
// and keep the same function signatures to upgrade this in place.

interface DictEntry {
  pos: string;
  definition: string;
  synonyms: string[];
  es: string;
  fr: string;
}

const DICTIONARY: Record<string, DictEntry> = {
  hello: { pos: "interjection", definition: "A greeting used when meeting someone or answering the phone.", synonyms: ["hi", "greetings", "hey", "howdy"], es: "hola", fr: "bonjour" },
  world: { pos: "noun", definition: "The earth, together with all of its countries and peoples.", synonyms: ["earth", "globe", "planet", "sphere"], es: "mundo", fr: "monde" },
  book: { pos: "noun", definition: "A written or printed work made of pages bound together.", synonyms: ["volume", "text", "publication", "tome"], es: "libro", fr: "livre" },
  read: { pos: "verb", definition: "To look at and understand the meaning of written or printed words.", synonyms: ["peruse", "scan", "study", "skim"], es: "leer", fr: "lire" },
  reading: { pos: "noun", definition: "The action or practice of reading written or printed matter.", synonyms: ["perusal", "study", "browsing", "skimming"], es: "lectura", fr: "lecture" },
  word: { pos: "noun", definition: "A single meaningful unit of language, spoken or written.", synonyms: ["term", "expression", "phrase", "vocable"], es: "palabra", fr: "mot" },
  language: { pos: "noun", definition: "A system of communication used by a particular community or country.", synonyms: ["tongue", "speech", "dialect", "vernacular"], es: "idioma", fr: "langue" },
  learn: { pos: "verb", definition: "To gain knowledge or skill through study, experience, or teaching.", synonyms: ["study", "acquire", "master", "absorb"], es: "aprender", fr: "apprendre" },
  learning: { pos: "noun", definition: "The acquisition of knowledge or skills through study or experience.", synonyms: ["study", "education", "schooling", "instruction"], es: "aprendizaje", fr: "apprentissage" },
  translate: { pos: "verb", definition: "To express the sense of words or text in another language.", synonyms: ["render", "interpret", "convert", "transcribe"], es: "traducir", fr: "traduire" },
  translation: { pos: "noun", definition: "The process or result of translating text from one language to another.", synonyms: ["rendering", "version", "interpretation", "conversion"], es: "traducción", fr: "traduction" },
  page: { pos: "noun", definition: "One side of a sheet of paper in a book, magazine, or document.", synonyms: ["leaf", "sheet", "folio", "side"], es: "página", fr: "page" },
  dictionary: { pos: "noun", definition: "A reference book that lists words and explains their meanings.", synonyms: ["lexicon", "glossary", "wordbook", "thesaurus"], es: "diccionario", fr: "dictionnaire" },
  vocabulary: { pos: "noun", definition: "The body of words known and used by a particular person or language.", synonyms: ["lexicon", "wordstock", "terminology", "word bank"], es: "vocabulario", fr: "vocabulaire" },
  student: { pos: "noun", definition: "A person who is studying at a school or other place of learning.", synonyms: ["learner", "pupil", "scholar", "trainee"], es: "estudiante", fr: "étudiant" },
  teacher: { pos: "noun", definition: "A person who helps others acquire knowledge or skills.", synonyms: ["instructor", "educator", "tutor", "mentor"], es: "profesor", fr: "professeur" },
  sentence: { pos: "noun", definition: "A set of words expressing a complete thought, ending with punctuation.", synonyms: ["clause", "statement", "utterance", "line"], es: "oración", fr: "phrase" },
  meaning: { pos: "noun", definition: "What is meant or intended by a word, action, or concept.", synonyms: ["sense", "definition", "significance", "gist"], es: "significado", fr: "signification" },
  difficult: { pos: "adjective", definition: "Needing much effort or skill to accomplish, deal with, or understand.", synonyms: ["hard", "challenging", "tough", "demanding"], es: "difícil", fr: "difficile" },
  easy: { pos: "adjective", definition: "Achieved or done without great effort; not difficult.", synonyms: ["simple", "effortless", "straightforward", "manageable"], es: "fácil", fr: "facile" },
  understand: { pos: "verb", definition: "To perceive the intended meaning of words, ideas, or a person.", synonyms: ["comprehend", "grasp", "follow", "fathom"], es: "entender", fr: "comprendre" },
  remember: { pos: "verb", definition: "To have or keep an image or idea in one's mind from the past.", synonyms: ["recall", "recollect", "reminisce", "retain"], es: "recordar", fr: "se souvenir" },
  forget: { pos: "verb", definition: "To fail to remember something; let slip from the mind.", synonyms: ["overlook", "misplace", "neglect", "disregard"], es: "olvidar", fr: "oublier" },
  practice: { pos: "noun/verb", definition: "Repeated exercise in an activity in order to improve or maintain a skill.", synonyms: ["rehearse", "drill", "train", "exercise"], es: "práctica", fr: "pratique" },
  listen: { pos: "verb", definition: "To give attention to sound in order to hear it.", synonyms: ["hear", "heed", "attend", "eavesdrop"], es: "escuchar", fr: "écouter" },
  speak: { pos: "verb", definition: "To say words aloud in order to convey information or ideas.", synonyms: ["talk", "converse", "utter", "communicate"], es: "hablar", fr: "parler" },
  write: { pos: "verb", definition: "To mark letters, words, or symbols on a surface to communicate.", synonyms: ["compose", "draft", "pen", "inscribe"], es: "escribir", fr: "écrire" },
  grammar: { pos: "noun", definition: "The set of rules that govern how words combine into sentences.", synonyms: ["syntax", "structure", "usage", "morphology"], es: "gramática", fr: "grammaire" },
  verb: { pos: "noun", definition: "A word that describes an action, state, or occurrence.", synonyms: ["action word", "predicate", "verbal form", "conjugated word"], es: "verbo", fr: "verbe" },
  noun: { pos: "noun", definition: "A word that names a person, place, thing, or idea.", synonyms: ["naming word", "substantive", "label", "term"], es: "sustantivo", fr: "nom" },
  adjective: { pos: "noun", definition: "A word that describes or modifies a noun.", synonyms: ["descriptor", "modifier", "qualifier", "epithet"], es: "adjetivo", fr: "adjectif" },
  synonym: { pos: "noun", definition: "A word that means the same, or nearly the same, as another word.", synonyms: ["equivalent", "counterpart", "alternative", "parallel term"], es: "sinónimo", fr: "synonyme" },
  example: { pos: "noun", definition: "A thing characteristic of its kind, used to illustrate a rule or point.", synonyms: ["instance", "sample", "illustration", "case"], es: "ejemplo", fr: "exemple" },
  story: { pos: "noun", definition: "An account of imaginary or real people and events, told for entertainment.", synonyms: ["tale", "narrative", "account", "anecdote"], es: "historia", fr: "histoire" },
  chapter: { pos: "noun", definition: "A main division of a book, usually with a number or title.", synonyms: ["section", "part", "division", "segment"], es: "capítulo", fr: "chapitre" },
  paragraph: { pos: "noun", definition: "A distinct section of writing dealing with a single idea.", synonyms: ["passage", "section", "segment", "extract"], es: "párrafo", fr: "paragraphe" },
  knowledge: { pos: "noun", definition: "Facts, information, and skills acquired through experience or education.", synonyms: ["understanding", "awareness", "insight", "expertise"], es: "conocimiento", fr: "connaissance" },
  mistake: { pos: "noun", definition: "An action or judgment that is incorrect or unwise.", synonyms: ["error", "slip", "blunder", "oversight"], es: "error", fr: "erreur" },
  correct: { pos: "adjective", definition: "Free from error; true or accurate.", synonyms: ["right", "accurate", "precise", "exact"], es: "correcto", fr: "correct" },
  question: { pos: "noun", definition: "A sentence used to request information or an answer.", synonyms: ["query", "inquiry", "enquiry", "problem"], es: "pregunta", fr: "question" },
  answer: { pos: "noun", definition: "A response given to a question, problem, or request.", synonyms: ["response", "reply", "solution", "rejoinder"], es: "respuesta", fr: "réponse" },
  whine: { pos: "verb", definition: "To complain in a feeble or petulant way, often with a high-pitched tone.", synonyms: ["complain", "moan", "grumble", "whimper"], es: "quejarse", fr: "geindre" },
  whining: { pos: "noun/adjective", definition: "The act of complaining in a feeble, high-pitched, or petulant way.", synonyms: ["complaining", "moaning", "grumbling", "whimpering"], es: "quejándose", fr: "geignard" },
};

export interface WordTranslation {
  found: boolean;
  translation: string;
  pos: string | null;
  definition: string | null;
  synonyms: string[];
}

function lookup(word: string): DictEntry | null {
  const key = word.toLowerCase().replace(/[^a-z']/g, "");
  return DICTIONARY[key] ?? null;
}

export function translateWord(word: string, langCode: string): WordTranslation {
  const entry = lookup(word);
  if (!entry) {
    return { found: false, translation: "", pos: null, definition: null, synonyms: [] };
  }
  const translation =
    langCode === "es" ? entry.es : langCode === "fr" ? entry.fr : "";
  return {
    found: Boolean(translation),
    translation: translation || "(no demo translation for this language)",
    pos: entry.pos,
    definition: entry.definition,
    synonyms: entry.synonyms,
  };
}

/**
 * Word-substitution "translation" of a longer passage. Only words present
 * in the demo dictionary are swapped; everything else is left as-is so it's
 * obvious this isn't a real machine translation.
 */
export function translateText(text: string, langCode: string): string {
  return text.replace(/[A-Za-z']+/g, (match) => {
    const entry = lookup(match);
    if (!entry) return match;
    const translated =
      langCode === "es" ? entry.es : langCode === "fr" ? entry.fr : "";
    if (!translated) return match;
    // Preserve simple capitalization of the original word.
    if (match[0] === match[0].toUpperCase()) {
      return translated[0].toUpperCase() + translated.slice(1);
    }
    return translated;
  });
}

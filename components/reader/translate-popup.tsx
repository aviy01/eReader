"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { BookmarkPlus, Loader2, Volume2, X } from "lucide-react";

import { useLanguage } from "@/lib/language-context";
import { useVault } from "@/lib/vault-context";
import { translateWordApi } from "@/lib/translate-api";
import { fetchWordInfo } from "@/lib/dictionary-api";
import { translateWord as mockTranslateWord } from "@/lib/mock-translate";
import { speakSequence } from "@/lib/speech";
import type { SelectionPopupState } from "@/lib/use-selection-popup";

interface TranslationSlot {
  text: string;
  usedFallback: boolean;
}

interface TranslatePopupProps {
  selection: SelectionPopupState;
  popupRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
}

const MIN_SYNONYMS_SHOWN = 4;

export function TranslatePopup({
  selection,
  popupRef,
  onClose,
}: TranslatePopupProps) {
  const { text, context } = selection;
  const { documentLanguage, nativeLanguage, secondLanguage } = useLanguage();
  const { addEntry } = useVault();

  const [saved, setSaved] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  // Definition of the word, translated into the first ("native") language.
  const [definition, setDefinition] = React.useState<TranslationSlot | null>(
    null
  );
  // The word's meaning translated into the second language.
  const [second, setSecond] = React.useState<TranslationSlot | null>(null);
  const [pos, setPos] = React.useState<string | null>(null);
  const [synonyms, setSynonyms] = React.useState<string[]>([]);

  const [style, setStyle] = React.useState<React.CSSProperties>({
    top: selection.rect.top,
    left: selection.rect.left,
    opacity: 0,
  });

  // Fetch the definition + grammar info, then translate the definition into
  // the first language and the word itself into the second language.
  // Falls back to the small demo dictionary if any network call fails
  // (offline, rate-limited, etc).
  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setDefinition(null);
    setSecond(null);
    setPos(null);
    setSynonyms([]);

    async function translateWordTo(targetCode: string): Promise<TranslationSlot> {
      try {
        const result = await translateWordApi(
          text,
          documentLanguage.code,
          targetCode
        );
        return { text: result, usedFallback: false };
      } catch {
        const mock = mockTranslateWord(text, targetCode);
        return {
          text: mock.found ? mock.translation : "(translation unavailable)",
          usedFallback: true,
        };
      }
    }

    async function run() {
      const info = await fetchWordInfo(text).catch(() => null);
      const mock = mockTranslateWord(text, nativeLanguage.code);

      const englishDefinition = info?.definition ?? mock.definition;
      const wordPos = info?.pos ?? mock.pos;
      let wordSynonyms = info?.synonyms.length ? info.synonyms : mock.synonyms;
      if (wordSynonyms.length < MIN_SYNONYMS_SHOWN && mock.synonyms.length) {
        wordSynonyms = Array.from(
          new Set([...wordSynonyms, ...mock.synonyms])
        );
      }

      // Definition in the first (native) language: if we have an English
      // definition and the native language isn't English, translate it;
      // otherwise use it (or the mock's) as-is.
      let definitionResult: TranslationSlot;
      if (englishDefinition && nativeLanguage.code !== "en") {
        try {
          const translated = await translateWordApi(
            englishDefinition,
            "en",
            nativeLanguage.code
          );
          definitionResult = { text: translated, usedFallback: false };
        } catch {
          definitionResult = {
            text: englishDefinition,
            usedFallback: true,
          };
        }
      } else {
        definitionResult = {
          text: englishDefinition ?? "(no definition available)",
          usedFallback: !englishDefinition,
        };
      }

      const secondResult = await translateWordTo(secondLanguage.code);

      if (cancelled) return;

      setDefinition(definitionResult);
      setSecond(secondResult);
      setPos(wordPos);
      setSynonyms(wordSynonyms);
      setLoading(false);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [text, documentLanguage.code, nativeLanguage.code, secondLanguage.code]);

  // Position near the selection — above if there's room, below otherwise —
  // then always clamp fully inside the viewport. The clamp matters most for
  // long, multi-line selections: their bounding rect can span nearly the
  // whole visible page, so naively placing the popup "just above" or "just
  // below" that rect can push it mostly off-screen.
  // Re-runs once loading finishes since the popup's height changes.
  React.useLayoutEffect(() => {
    const el = popupRef.current;
    if (!el) return;
    const popupRect = el.getBoundingClientRect();
    const { rect } = selection;
    const margin = 10;
    const viewportPadding = 8;

    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - (rect.top + rect.height);

    let top =
      spaceAbove >= popupRect.height + margin || spaceAbove >= spaceBelow
        ? rect.top - popupRect.height - margin
        : rect.top + rect.height + margin;
    top = Math.max(
      viewportPadding,
      Math.min(top, window.innerHeight - popupRect.height - viewportPadding)
    );

    let left = rect.left + rect.width / 2 - popupRect.width / 2;
    left = Math.max(
      viewportPadding,
      Math.min(left, window.innerWidth - popupRect.width - viewportPadding)
    );

    setStyle({ top, left, opacity: 1 });
  }, [selection, popupRef, loading]);

  function handleAdd() {
    addEntry({
      word: text,
      pos: pos ?? "—",
      translation: definition?.text ?? "—",
      translationLangCode: nativeLanguage.code,
      translationLangName: nativeLanguage.name,
      secondTranslation: second?.text,
      secondLangName: secondLanguage.name,
      synonyms,
      context,
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  function handleSpeak() {
    speakSequence([
      { text, langCode: documentLanguage.code },
      { text: definition?.text ?? "", langCode: nativeLanguage.code },
    ]);
  }

  const usedFallback = definition?.usedFallback || second?.usedFallback;

  return (
    <motion.div
      ref={popupRef as React.RefObject<HTMLDivElement>}
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.97 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      style={{ position: "fixed", zIndex: 60, ...style }}
      className="glass w-72 rounded-xl border border-border p-3 shadow-popover"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-serif text-base font-semibold leading-tight text-foreground">
          {text}
        </p>
        <button
          onClick={onClose}
          aria-label="Close"
          className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {pos && (
        <p className="text-[11px] italic text-muted-foreground">{pos}</p>
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Translating…
        </div>
      ) : (
        <>
          {/* 1. Definition, in the first (native) language */}
          <div className="mt-2 border-t border-border pt-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Definition &middot; {nativeLanguage.name}
            </p>
            <p className="mt-0.5 text-sm leading-snug text-foreground">
              {definition?.text ?? "—"}
            </p>
          </div>

          {/* 2. At least 4 synonyms */}
          {synonyms.length > 0 && (
            <div className="mt-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Synonyms
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {synonyms.slice(0, 6).map((syn) => (
                  <span
                    key={syn}
                    className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-foreground"
                  >
                    {syn}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 3. Meaning in the second language */}
          <div className="mt-2.5 border-t border-border pt-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Meaning &middot; {secondLanguage.name}
            </p>
            <p className="mt-0.5 text-sm font-medium text-foreground">
              {second?.text ?? "—"}
            </p>
          </div>

          {usedFallback && (
            <p className="mt-2 text-[11px] italic text-muted-foreground/70">
              Translation service unreachable — showing demo dictionary
              results instead.
            </p>
          )}
        </>
      )}

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={handleSpeak}
          disabled={loading}
          aria-label="Listen to the word, then its definition"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
        >
          <Volume2 className="h-4 w-4" />
        </button>
        <button
          onClick={handleAdd}
          disabled={loading}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-vault px-3 py-1.5 text-xs font-medium text-vault-foreground transition-colors hover:bg-vault/90 disabled:opacity-50"
        >
          <BookmarkPlus className="h-3.5 w-3.5" />
          {saved ? "Saved!" : "Add to Vault"}
        </button>
      </div>
    </motion.div>
  );
}

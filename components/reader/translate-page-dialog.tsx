"use client";

import * as React from "react";
import { Languages, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AVAILABLE_LANGUAGES, useLanguage } from "@/lib/language-context";
import { translatePassageApi } from "@/lib/translate-api";
import { translateText as mockTranslateText } from "@/lib/mock-translate";
import type { DocEntry } from "@/lib/document-context";

interface TranslatePageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeDoc: DocEntry | null;
  pageText: string | null;
}

type Status = "picking" | "loading" | "done";

export function TranslatePageDialog({
  open,
  onOpenChange,
  activeDoc,
  pageText,
}: TranslatePageDialogProps) {
  const { documentLanguage } = useLanguage();
  const [langCode, setLangCode] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<Status>("picking");
  const [translated, setTranslated] = React.useState("");
  const [usedFallback, setUsedFallback] = React.useState(false);
  const [truncated, setTruncated] = React.useState(false);
  const [engine, setEngine] = React.useState<"browser" | "mymemory">("mymemory");

  // Reset back to the language picker each time the dialog is reopened.
  React.useEffect(() => {
    if (open) {
      setLangCode(null);
      setStatus("picking");
      setTranslated("");
      setUsedFallback(false);
      setTruncated(false);
    }
  }, [open]);

  const sourceText = React.useMemo(() => {
    if (activeDoc?.kind === "docx" && activeDoc.docHtml) {
      if (typeof window === "undefined") return "";
      const div = document.createElement("div");
      div.innerHTML = activeDoc.docHtml;
      return div.textContent?.trim() ?? "";
    }
    return pageText?.trim() ?? "";
  }, [activeDoc, pageText]);

  async function handlePickLanguage(code: string) {
    setLangCode(code);
    if (!sourceText) return;

    setStatus("loading");
    try {
      const result = await translatePassageApi(
        sourceText,
        documentLanguage.code,
        code
      );
      setTranslated(result.text);
      setTruncated(result.truncated);
      setEngine(result.engine);
      setUsedFallback(false);
    } catch {
      setTranslated(mockTranslateText(sourceText, code));
      setTruncated(false);
      setUsedFallback(true);
    }
    setStatus("done");
  }

  const selectedLanguage = AVAILABLE_LANGUAGES.find((l) => l.code === langCode);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-accent" />
            Translate this page
          </DialogTitle>
          <DialogDescription>
            {activeDoc?.kind === "pdf"
              ? `Page ${activeDoc.currentPage} of ${activeDoc.numPages}`
              : "Whole document"}
          </DialogDescription>
        </DialogHeader>

        {!langCode ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Choose a language to translate into:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_LANGUAGES.map((lang) => (
                <Button
                  key={lang.code}
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => handlePickLanguage(lang.code)}
                >
                  {lang.name}
                </Button>
              ))}
            </div>
          </div>
        ) : !sourceText ? (
          <p className="text-sm text-muted-foreground">
            This page doesn&apos;t have any extracted text yet — try again
            once it finishes rendering.
          </p>
        ) : status === "loading" ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Translating the page…
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                Translated into {selectedLanguage?.name}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setLangCode(null)}
              >
                Change language
              </Button>
            </div>
            <div className="max-h-72 overflow-y-auto rounded-lg border border-border bg-muted/40 p-4">
              <p className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-foreground">
                {translated}
              </p>
            </div>
            {usedFallback ? (
              <p className="text-[11px] italic text-muted-foreground">
                Translation service unreachable — showing a demo-dictionary
                translation instead (only recognized words are swapped).
              </p>
            ) : engine === "browser" ? (
              <p className="text-[11px] italic text-muted-foreground">
                Translated on-device in your browser — free, unlimited, and
                nothing was sent to a server.
              </p>
            ) : (
              <p className="text-[11px] italic text-muted-foreground">
                Machine translation via MyMemory — may be imperfect,
                especially for long or idiomatic passages.
              </p>
            )}
            {truncated && (
              <p className="rounded-md bg-muted/60 px-2.5 py-1.5 text-[11px] text-muted-foreground">
                This page is longer than the free translation service allows
                in one go, so only the first part is shown above — the rest
                was left untranslated to keep translations working elsewhere
                in the app today.
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

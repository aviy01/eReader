"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookMarked,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  FileType2,
  Library,
  Trash2,
  Upload,
  Volume2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDocument, type DocEntry } from "@/lib/document-context";
import { useFileOpener } from "@/lib/use-file-opener";
import { useVault, type VaultEntry } from "@/lib/vault-context";
import { useLanguage, AVAILABLE_LANGUAGES } from "@/lib/language-context";
import { speak } from "@/lib/speech";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [activeTab, setActiveTab] = React.useState<"library" | "vault">(
    "library"
  );

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 288 }}
      transition={{ type: "spring", stiffness: 320, damping: 34 }}
      className="relative z-20 flex h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar"
    >
      {/* Brand + collapse control */}
      <div className="flex h-14 items-center justify-between px-3">
        <AnimatePresence mode="wait" initial={false}>
          {!collapsed && (
            <motion.div
              key="brand"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2 pl-1"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <BookMarked className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
              <span className="font-serif text-lg font-semibold tracking-tight text-sidebar-foreground">
                Verso
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onToggle}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                collapsed && "mx-auto"
              )}
            >
              {collapsed ? (
                <ChevronsRight className="h-4 w-4" />
              ) : (
                <ChevronsLeft className="h-4 w-4" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {collapsed ? "Expand" : "Collapse"}
          </TooltipContent>
        </Tooltip>
      </div>

      <Separator />

      {collapsed ? (
        <CollapsedRail
          onSelect={(tab) => {
            setActiveTab(tab);
            onToggle();
          }}
        />
      ) : (
        <div className="flex flex-1 flex-col overflow-hidden px-3 pt-3">
          <LanguagePicker />

          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "library" | "vault")}
            className="mt-3 flex flex-1 flex-col overflow-hidden"
          >
            <TabsList className="w-full">
              <TabsTrigger value="library" className="gap-1.5">
                <Library className="h-3.5 w-3.5" />
                Library
              </TabsTrigger>
              <TabsTrigger value="vault" className="gap-1.5">
                <BookMarked className="h-3.5 w-3.5" />
                Vault
              </TabsTrigger>
            </TabsList>

            <TabsContent value="library" className="flex-1 overflow-hidden">
              <LibraryPanel />
            </TabsContent>

            <TabsContent value="vault" className="flex-1 overflow-hidden">
              <VaultList />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </motion.aside>
  );
}

function CollapsedRail({
  onSelect,
}: {
  onSelect: (tab: "library" | "vault") => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2 pt-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => onSelect("library")}
            aria-label="Expand and show Library"
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Library className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">Library</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => onSelect("vault")}
            aria-label="Expand and show Vocabulary Vault"
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <BookMarked className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">Vocabulary Vault</TooltipContent>
      </Tooltip>
    </div>
  );
}

function LanguagePicker() {
  const {
    documentLanguage,
    nativeLanguage,
    secondLanguage,
    nativeFollowsReading,
    setDocumentLanguage,
    setNativeLanguage,
    setSecondLanguage,
  } = useLanguage();

  return (
    <div className="rounded-lg border border-border bg-card/60 p-2.5">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Reading in
      </p>
      <select
        value={documentLanguage.code}
        onChange={(e) => setDocumentLanguage(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-1.5 py-1 text-xs text-foreground"
        aria-label="Document language"
      >
        {AVAILABLE_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>

      <p className="mb-1.5 mt-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Translate into
      </p>
      <div className="flex gap-1">
        <div className="w-[54%]">
          <label
            htmlFor="first-language-select"
            className="mb-0.5 flex items-center gap-1 whitespace-nowrap text-[10px] text-muted-foreground/80"
          >
            Word definition
            {nativeFollowsReading && (
              <span className="shrink-0 rounded-sm bg-muted px-1 py-px text-[9px] font-medium leading-none text-muted-foreground">
                auto
              </span>
            )}
          </label>
          <select
            id="first-language-select"
            value={nativeLanguage.code}
            onChange={(e) => setNativeLanguage(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-1.5 py-1 text-xs text-foreground"
            aria-label="First language — used for the word definition (matches reading language until changed)"
          >
            {AVAILABLE_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
        <div className="w-[46%]">
          <label
            htmlFor="second-language-select"
            className="mb-0.5 block whitespace-nowrap text-[10px] text-muted-foreground/80"
          >
            Word meaning
          </label>
          <select
            id="second-language-select"
            value={secondLanguage.code}
            onChange={(e) => setSecondLanguage(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-1.5 py-1 text-xs text-foreground"
            aria-label="Second language — used for the extra meaning"
          >
            {AVAILABLE_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function LibraryPanel() {
  const { documents, activeId, switchDocument, closeDocument } = useDocument();
  const { pickPdf, pickDocx, hiddenInputs } = useFileOpener();

  return (
    <div className="flex h-full flex-col gap-2">
      {hiddenInputs}

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 gap-1.5"
          onClick={pickPdf}
        >
          <FileText className="h-3.5 w-3.5" />
          PDF
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 gap-1.5"
          onClick={pickDocx}
        >
          <FileType2 className="h-3.5 w-3.5" />
          Word
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border px-4 py-10 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </span>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              No documents yet
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Upload a PDF or Word file to start reading and building your
              vocabulary.
            </p>
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1 pr-1">
          <div className="flex flex-col gap-1.5 pb-4">
            {documents.map((doc) => (
              <LibraryItem
                key={doc.id}
                doc={doc}
                active={doc.id === activeId}
                onSelect={() => switchDocument(doc.id)}
                onClose={() => closeDocument(doc.id)}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

function LibraryItem({
  doc,
  active,
  onSelect,
  onClose,
}: {
  doc: DocEntry;
  active: boolean;
  onSelect: () => void;
  onClose: () => void;
}) {
  const Icon = doc.kind === "pdf" ? FileText : FileType2;
  const subtitle =
    doc.status === "loading"
      ? "Opening…"
      : doc.status === "error"
      ? "Couldn't open"
      : doc.kind === "pdf"
      ? `${doc.numPages} page${doc.numPages === 1 ? "" : "s"}`
      : "Word document";

  return (
    <button
      onClick={onSelect}
      className={cn(
        "group flex w-full items-start gap-2.5 rounded-lg border p-2.5 text-left transition-colors",
        active
          ? "border-accent/50 bg-accent/10"
          : "border-transparent hover:bg-muted"
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
          active ? "bg-accent/25" : "bg-muted"
        )}
      >
        {doc.status === "loading" ? (
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
        ) : (
          <Icon className="h-4 w-4 text-muted-foreground" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {doc.fileName}
        </p>
        <p
          className={cn(
            "text-xs",
            doc.status === "error" ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {subtitle}
        </p>
      </div>
      <span
        role="button"
        tabIndex={0}
        aria-label={`Close ${doc.fileName}`}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.stopPropagation();
            onClose();
          }
        }}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-background hover:text-foreground group-hover:opacity-100"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}

function VaultList() {
  const { entries, removeEntry } = useVault();

  if (entries.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border px-4 py-10 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <BookMarked className="h-5 w-5 text-muted-foreground" />
        </span>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            Your vault is empty
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Highlight a word while reading, then tap &ldquo;Add to Vault&rdquo;
            to save it here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full pr-1">
      <div className="flex flex-col gap-2 pb-4">
        {entries.map((entry) => (
          <VaultCard key={entry.id} entry={entry} onRemove={() => removeEntry(entry.id)} />
        ))}
      </div>
    </ScrollArea>
  );
}

function VaultCard({
  entry,
  onRemove,
}: {
  entry: VaultEntry;
  onRemove: () => void;
}) {
  return (
    <div className="group rounded-lg border border-border bg-card p-3 transition-colors hover:border-accent/60">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="truncate font-serif text-sm font-semibold text-foreground">
              {entry.word}
            </span>
            <span className="shrink-0 text-[11px] italic text-muted-foreground">
              {entry.pos}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-foreground/90">
            <span className="font-medium text-accent">{entry.translationLangName}:</span>{" "}
            {entry.translation}
          </p>
          {entry.secondTranslation && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">{entry.secondLangName}:</span>{" "}
              {entry.secondTranslation}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            aria-label={`Pronounce ${entry.word}`}
            onClick={() => speak(entry.word)}
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Volume2 className="h-3.5 w-3.5" />
          </button>
          <button
            aria-label={`Remove ${entry.word}`}
            onClick={onRemove}
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {entry.synonyms.length > 0 && (
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          <span className="font-medium">Synonyms:</span> {entry.synonyms.join(", ")}
        </p>
      )}
      {entry.context && (
        <p className="mt-2 line-clamp-2 border-l-2 border-border pl-2 text-xs italic leading-relaxed text-muted-foreground">
          &ldquo;{entry.context}&rdquo;
        </p>
      )}
    </div>
  );
}

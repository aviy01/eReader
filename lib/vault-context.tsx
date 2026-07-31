"use client";

import * as React from "react";

export interface VaultEntry {
  id: string;
  word: string;
  pos: string;
  translation: string;
  translationLangCode: string;
  translationLangName: string;
  secondTranslation?: string;
  secondLangName?: string;
  synonyms: string[];
  context: string;
}

interface VaultContextValue {
  entries: VaultEntry[];
  addEntry: (entry: Omit<VaultEntry, "id">) => void;
  removeEntry: (id: string) => void;
}

const VaultContext = React.createContext<VaultContextValue | null>(null);

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `word_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = React.useState<VaultEntry[]>([]);

  const addEntry = React.useCallback((entry: Omit<VaultEntry, "id">) => {
    setEntries((prev) => [{ ...entry, id: makeId() }, ...prev]);
  }, []);

  const removeEntry = React.useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const value = React.useMemo(
    () => ({ entries, addEntry, removeEntry }),
    [entries, addEntry, removeEntry]
  );

  return (
    <VaultContext.Provider value={value}>{children}</VaultContext.Provider>
  );
}

export function useVault() {
  const ctx = React.useContext(VaultContext);
  if (!ctx) throw new Error("useVault must be used within a VaultProvider");
  return ctx;
}

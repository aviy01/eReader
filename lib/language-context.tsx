"use client";

import * as React from "react";

export interface Language {
  code: string;
  name: string;
}

export const AVAILABLE_LANGUAGES: Language[] = [
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "hi", name: "Hindi" },
  { code: "ja", name: "Japanese" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
  { code: "ru", name: "Russian" },
  { code: "en", name: "English" },
];

interface LanguageContextValue {
  documentLanguage: Language;
  nativeLanguage: Language;
  secondLanguage: Language;
  nativeFollowsReading: boolean;
  setDocumentLanguage: (code: string) => void;
  setNativeLanguage: (code: string) => void;
  setSecondLanguage: (code: string) => void;
}

const LanguageContext = React.createContext<LanguageContextValue | null>(
  null
);

function findLang(code: string): Language {
  return (
    AVAILABLE_LANGUAGES.find((l) => l.code === code) ?? AVAILABLE_LANGUAGES[0]
  );
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [documentCode, setDocumentCode] = React.useState("en");
  // The 1st/definition language defaults to whatever the reading language
  // is. It keeps following the reading language automatically until the
  // user explicitly picks one of their own — tracked by `nativeTouched`.
  const [nativeCode, setNativeCode] = React.useState("en");
  const [nativeTouched, setNativeTouched] = React.useState(false);
  const [secondCode, setSecondCode] = React.useState("fr");

  const setDocumentLanguage = React.useCallback((code: string) => {
    setDocumentCode(code);
    setNativeCode((current) => (nativeTouched ? current : code));
  }, [nativeTouched]);

  const setNativeLanguage = React.useCallback((code: string) => {
    setNativeTouched(true);
    setNativeCode(code);
  }, []);

  const value = React.useMemo<LanguageContextValue>(
    () => ({
      documentLanguage: findLang(documentCode),
      nativeLanguage: findLang(nativeCode),
      secondLanguage: findLang(secondCode),
      nativeFollowsReading: !nativeTouched,
      setDocumentLanguage,
      setNativeLanguage,
      setSecondLanguage: setSecondCode,
    }),
    [documentCode, nativeCode, secondCode, nativeTouched, setDocumentLanguage, setNativeLanguage]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = React.useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}

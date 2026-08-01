"use client";

import * as React from "react";

interface ReaderUIContextValue {
  translateDialogOpen: boolean;
  setTranslateDialogOpen: (open: boolean) => void;
  pageText: string | null;
  setPageText: (text: string | null) => void;
  isTurningPage: boolean;
  setIsTurningPage: (turning: boolean) => void;
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
  lassoMode: boolean;
  setLassoMode: (active: boolean) => void;
}

const ReaderUIContext = React.createContext<ReaderUIContextValue | null>(
  null
);

export function ReaderUIProvider({ children }: { children: React.ReactNode }) {
  const [translateDialogOpen, setTranslateDialogOpen] = React.useState(false);
  const [pageText, setPageText] = React.useState<string | null>(null);
  const [isTurningPage, setIsTurningPage] = React.useState(false);
  const [sidebarWidth, setSidebarWidth] = React.useState(288);
  const [lassoMode, setLassoMode] = React.useState(false);

  const value = React.useMemo(
    () => ({
      translateDialogOpen,
      setTranslateDialogOpen,
      pageText,
      setPageText,
      isTurningPage,
      setIsTurningPage,
      sidebarWidth,
      setSidebarWidth,
      lassoMode,
      setLassoMode,
    }),
    [translateDialogOpen, pageText, isTurningPage, sidebarWidth, lassoMode]
  );

  return (
    <ReaderUIContext.Provider value={value}>
      {children}
    </ReaderUIContext.Provider>
  );
}

export function useReaderUI() {
  const ctx = React.useContext(ReaderUIContext);
  if (!ctx) {
    throw new Error("useReaderUI must be used within a ReaderUIProvider");
  }
  return ctx;
}

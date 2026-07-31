"use client";

import * as React from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";

import "@/lib/pdf-worker";

export type DocKind = "pdf" | "docx";
export type DocStatus = "loading" | "ready" | "error";

export const MIN_ZOOM = 60;
export const MAX_ZOOM = 220;
export const ZOOM_STEP = 10;

export interface DocEntry {
  id: string;
  kind: DocKind;
  fileName: string;
  status: DocStatus;
  error: string | null;

  // PDF-specific
  pdfDoc: PDFDocumentProxy | null;
  numPages: number;
  currentPage: number;

  // DOCX-specific — rendered once, no true pagination
  docHtml: string | null;

  zoom: number;
}

interface DocumentContextValue {
  documents: DocEntry[];
  activeId: string | null;
  active: DocEntry | null;

  openPdf: (file: File) => Promise<void>;
  openDocx: (file: File) => Promise<void>;
  closeDocument: (id: string) => void;
  switchDocument: (id: string) => void;

  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;

  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

const DocumentContext = React.createContext<DocumentContextValue | null>(
  null
);

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `doc_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function DocumentProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = React.useState<DocEntry[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const updateEntry = React.useCallback(
    (id: string, patch: Partial<DocEntry>) => {
      setDocuments((docs) =>
        docs.map((d) => (d.id === id ? { ...d, ...patch } : d))
      );
    },
    []
  );

  const openPdf = React.useCallback(async (file: File) => {
    const id = makeId();
    setDocuments((docs) => [
      ...docs,
      {
        id,
        kind: "pdf",
        fileName: file.name,
        status: "loading",
        error: null,
        pdfDoc: null,
        numPages: 0,
        currentPage: 1,
        docHtml: null,
        zoom: 130,
      },
    ]);
    setActiveId(id);

    try {
      const pdfjsLib = await import("pdfjs-dist");
      const buffer = await file.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: buffer }).promise;

      updateEntry(id, {
        status: "ready",
        pdfDoc: doc,
        numPages: doc.numPages,
      });
    } catch (err) {
      console.error("Failed to open PDF:", err);
      updateEntry(id, {
        status: "error",
        error: "We couldn't open that PDF. Try a different file.",
      });
    }
  }, [updateEntry]);

  const openDocx = React.useCallback(async (file: File) => {
    const id = makeId();
    setDocuments((docs) => [
      ...docs,
      {
        id,
        kind: "docx",
        fileName: file.name,
        status: "loading",
        error: null,
        pdfDoc: null,
        numPages: 1,
        currentPage: 1,
        docHtml: null,
        zoom: 110,
      },
    ]);
    setActiveId(id);

    try {
      const mammoth = await import("mammoth");
      const buffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer: buffer });

      updateEntry(id, { status: "ready", docHtml: result.value });
    } catch (err) {
      console.error("Failed to open document:", err);
      updateEntry(id, {
        status: "error",
        error: "We couldn't open that Word document. Try a different file.",
      });
    }
  }, [updateEntry]);

  const closeDocument = React.useCallback((id: string) => {
    setDocuments((docs) => {
      const next = docs.filter((d) => d.id !== id);
      setActiveId((current) => {
        if (current !== id) return current;
        if (next.length === 0) return null;
        const closedIndex = docs.findIndex((d) => d.id === id);
        const fallback = next[Math.max(0, closedIndex - 1)] ?? next[0];
        return fallback.id;
      });
      return next;
    });
  }, []);

  const switchDocument = React.useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const goToPage = React.useCallback(
    (page: number) => {
      if (!activeId) return;
      setDocuments((docs) =>
        docs.map((d) =>
          d.id === activeId
            ? { ...d, currentPage: Math.min(Math.max(1, page), Math.max(1, d.numPages)) }
            : d
        )
      );
    },
    [activeId]
  );

  const nextPage = React.useCallback(() => {
    if (!activeId) return;
    setDocuments((docs) =>
      docs.map((d) =>
        d.id === activeId
          ? { ...d, currentPage: Math.min(d.currentPage + 1, Math.max(1, d.numPages)) }
          : d
      )
    );
  }, [activeId]);

  const prevPage = React.useCallback(() => {
    if (!activeId) return;
    setDocuments((docs) =>
      docs.map((d) =>
        d.id === activeId ? { ...d, currentPage: Math.max(1, d.currentPage - 1) } : d
      )
    );
  }, [activeId]);

  const setZoom = React.useCallback(
    (z: number) => {
      if (!activeId) return;
      const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
      setDocuments((docs) =>
        docs.map((d) => (d.id === activeId ? { ...d, zoom: clamped } : d))
      );
    },
    [activeId]
  );

  const zoomIn = React.useCallback(() => {
    if (!activeId) return;
    setDocuments((docs) =>
      docs.map((d) =>
        d.id === activeId
          ? { ...d, zoom: Math.min(MAX_ZOOM, d.zoom + ZOOM_STEP) }
          : d
      )
    );
  }, [activeId]);

  const zoomOut = React.useCallback(() => {
    if (!activeId) return;
    setDocuments((docs) =>
      docs.map((d) =>
        d.id === activeId
          ? { ...d, zoom: Math.max(MIN_ZOOM, d.zoom - ZOOM_STEP) }
          : d
      )
    );
  }, [activeId]);

  const active = React.useMemo(
    () => documents.find((d) => d.id === activeId) ?? null,
    [documents, activeId]
  );

  const value = React.useMemo<DocumentContextValue>(
    () => ({
      documents,
      activeId,
      active,
      openPdf,
      openDocx,
      closeDocument,
      switchDocument,
      goToPage,
      nextPage,
      prevPage,
      setZoom,
      zoomIn,
      zoomOut,
    }),
    [
      documents,
      activeId,
      active,
      openPdf,
      openDocx,
      closeDocument,
      switchDocument,
      goToPage,
      nextPage,
      prevPage,
      setZoom,
      zoomIn,
      zoomOut,
    ]
  );

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocument() {
  const ctx = React.useContext(DocumentContext);
  if (!ctx) {
    throw new Error("useDocument must be used within a DocumentProvider");
  }
  return ctx;
}

"use client";

import * as React from "react";

import { useDocument } from "@/lib/document-context";

function isPdfFile(file: File) {
  return (
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  );
}

function isWordFile(file: File) {
  const name = file.name.toLowerCase();
  return (
    name.endsWith(".docx") ||
    name.endsWith(".doc") ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.type === "application/msword"
  );
}

export function useFileOpener() {
  const { openPdf, openDocx } = useDocument();
  const pdfInputRef = React.useRef<HTMLInputElement>(null);
  const docxInputRef = React.useRef<HTMLInputElement>(null);
  const [dragError, setDragError] = React.useState<string | null>(null);

  const pickPdf = React.useCallback(() => pdfInputRef.current?.click(), []);
  const pickDocx = React.useCallback(() => docxInputRef.current?.click(), []);

  const handleFile = React.useCallback(
    (file: File) => {
      setDragError(null);
      if (isPdfFile(file)) {
        openPdf(file);
      } else if (isWordFile(file)) {
        openDocx(file);
      } else {
        setDragError("Only .pdf, .doc, and .docx files are supported.");
      }
    },
    [openPdf, openDocx]
  );

  const onDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const hiddenInputs = (
    <>
      <input
        ref={pdfInputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) openPdf(file);
          e.target.value = "";
        }}
      />
      <input
        ref={docxInputRef}
        type="file"
        accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) openDocx(file);
          e.target.value = "";
        }}
      />
    </>
  );

  return { pickPdf, pickDocx, onDrop, onDragOver, dragError, hiddenInputs };
}

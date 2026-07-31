"use client";

import * as React from "react";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";

interface PdfPageProps {
  pdfDoc: PDFDocumentProxy;
  pageNumber: number;
  zoom: number; // percentage, e.g. 130
  onTextExtracted?: (text: string) => void;
}

export function PdfPage({
  pdfDoc,
  pageNumber,
  zoom,
  onTextExtracted,
}: PdfPageProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const textLayerRef = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  const [isRendering, setIsRendering] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    let renderTask: RenderTask | null = null;
    let textLayerInstance: { cancel?: () => void; render: () => Promise<unknown> } | null =
      null;

    async function renderPage() {
      setIsRendering(true);
      const page = await pdfDoc.getPage(pageNumber);
      if (cancelled) return;

      const scale = zoom / 100;
      const viewport = page.getViewport({ scale });
      const outputScale = window.devicePixelRatio || 1;

      const canvas = canvasRef.current;
      const textLayerEl = textLayerRef.current;
      if (!canvas || !textLayerEl) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      setSize({ width: viewport.width, height: viewport.height });

      const transform =
        outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

      renderTask = page.render({
        canvasContext: ctx,
        viewport,
        transform,
      });

      try {
        await renderTask.promise;
        if (cancelled) return;

        // Text layer — invisible, selectable text aligned over the canvas.
        // IMPORTANT: pdf.js's TextLayer positions every span with
        // `calc(var(--scale-factor) * ...)`. Without this custom property
        // set on the container, spans mis-place on top of one another, and
        // dragging a selection over one word visually grabs several
        // unrelated words scattered around the page.
        textLayerEl.innerHTML = "";
        textLayerEl.style.setProperty("--scale-factor", String(scale));
        textLayerEl.style.width = `${Math.floor(viewport.width)}px`;
        textLayerEl.style.height = `${Math.floor(viewport.height)}px`;

        const { TextLayer } = await import("pdfjs-dist");
        const textContent = await page.getTextContent();
        if (cancelled) return;

        textLayerInstance = new TextLayer({
          textContentSource: textContent,
          container: textLayerEl,
          viewport,
        });
        await textLayerInstance.render();

        if (!cancelled && onTextExtracted) {
          const text = textContent.items
            .map((item) =>
              "str" in item ? item.str + (item.hasEOL ? "\n" : "") : ""
            )
            .join("");
          onTextExtracted(text);
        }
      } catch (err) {
        if (!cancelled) console.error("PDF page render error:", err);
      } finally {
        if (!cancelled) setIsRendering(false);
      }
    }

    renderPage();

    return () => {
      cancelled = true;
      renderTask?.cancel();
      textLayerInstance?.cancel?.();
    };
  }, [pdfDoc, pageNumber, zoom, onTextExtracted]);

  return (
    <div
      className="relative bg-white shadow-page"
      style={{ width: size.width || undefined, height: size.height || undefined }}
    >
      {isRendering && (
        <div className="absolute inset-0 flex items-center justify-center bg-card">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary" />
        </div>
      )}
      <canvas ref={canvasRef} className="block" />
      <div ref={textLayerRef} className="textLayer" />
    </div>
  );
}


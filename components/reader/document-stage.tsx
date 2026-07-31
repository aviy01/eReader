"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  FileText,
  FileType2,
} from "lucide-react";

import { useDocument } from "@/lib/document-context";
import { useFileOpener } from "@/lib/use-file-opener";
import { useReaderUI } from "@/lib/reader-ui-context";
import { useSelectionPopup } from "@/lib/use-selection-popup";
import { Button } from "@/components/ui/button";
import { PdfPage } from "@/components/reader/pdf-page";
import { DocxPage } from "@/components/reader/docx-page";
import { TranslatePopup } from "@/components/reader/translate-popup";
import { TranslatePageDialog } from "@/components/reader/translate-page-dialog";

const TURN_DURATION = 0.55;

interface TurningPage {
  page: number;
  direction: 1 | -1; // 1 = advancing (next), -1 = going back (prev)
}

// Fixed to the viewport (so they stay vertically centered regardless of
// scroll position), but the left arrow's offset is derived from the live
// sidebar width (via ReaderUIContext) so it always sits just outside the
// reading pane instead of drifting over the sidebar.
function PageNavArrows({
  onPrev,
  onNext,
  canPrev,
  canNext,
  disabled,
  sidebarWidth,
}: {
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  disabled: boolean;
  sidebarWidth: number;
}) {
  return (
    <>
      <button
        aria-label="Previous page"
        onClick={onPrev}
        disabled={!canPrev || disabled}
        style={{ left: sidebarWidth + 16 }}
        className="group fixed top-1/2 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/80 text-foreground/70 shadow-popover backdrop-blur-md transition-[left,opacity,background-color,color] duration-300 hover:bg-background hover:text-foreground disabled:pointer-events-none disabled:opacity-0"
      >
        <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
      </button>
      <button
        aria-label="Next page"
        onClick={onNext}
        disabled={!canNext || disabled}
        className="group fixed right-3 top-1/2 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/80 text-foreground/70 shadow-popover backdrop-blur-md transition-all hover:bg-background hover:text-foreground disabled:pointer-events-none disabled:opacity-0 sm:right-6"
      >
        <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
      </button>
    </>
  );
}

export function DocumentStage() {
  const { active, nextPage, prevPage } = useDocument();
  const { pickPdf, pickDocx, onDrop, onDragOver, dragError, hiddenInputs } =
    useFileOpener();
  const {
    translateDialogOpen,
    setTranslateDialogOpen,
    pageText,
    setPageText,
    isTurningPage,
    setIsTurningPage,
    sidebarWidth,
  } = useReaderUI();

  const containerRef = React.useRef<HTMLDivElement>(null);
  const { popup, popupRef, handleMouseUp, close } =
    useSelectionPopup(containerRef);

  // The page that is mid-turn (rendered on top, curling away to reveal the
  // freshly-current page underneath). Detected by watching currentPage
  // change for the SAME document, so this fires no matter which control
  // (mid-page arrows, top navbar, etc.) triggered the navigation.
  const [turning, setTurning] = React.useState<TurningPage | null>(null);
  const prevRef = React.useRef<{ id: string; page: number } | null>(null);

  React.useEffect(() => {
    if (!active || active.kind !== "pdf" || !active.pdfDoc) {
      prevRef.current = null;
      return;
    }
    const prev = prevRef.current;
    if (prev && prev.id === active.id && prev.page !== active.currentPage) {
      const direction: 1 | -1 = active.currentPage > prev.page ? 1 : -1;
      setTurning({ page: prev.page, direction });
      setIsTurningPage(true);
    }
    prevRef.current = { id: active.id, page: active.currentPage };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id, active?.currentPage, active?.kind, active?.pdfDoc]);

  const onTextExtracted = React.useCallback(
    (text: string) => setPageText(text),
    [setPageText]
  );

  if (active && active.status === "ready" && active.kind === "pdf" && active.pdfDoc) {
    const canPrev = active.currentPage > 1;
    const canNext = active.currentPage < active.numPages;

    return (
      <>
        <div
          ref={containerRef}
          className="flex min-h-full justify-center p-10"
          onMouseUp={handleMouseUp}
        >
          <div className="relative" style={{ perspective: 2200 }}>
            {/* Current page — always the freshest content, sits underneath */}
            <PdfPage
              pdfDoc={active.pdfDoc}
              pageNumber={active.currentPage}
              zoom={active.zoom}
              onTextExtracted={onTextExtracted}
            />

            {/* Turning page overlay — the outgoing page curling away */}
            <AnimatePresence>
              {turning && (
                <motion.div
                  key={`${turning.page}-${turning.direction}`}
                  className="absolute inset-0 origin-left bg-white shadow-page"
                  style={{
                    transformOrigin:
                      turning.direction === 1 ? "0% 50%" : "100% 50%",
                    transformStyle: "preserve-3d",
                    backfaceVisibility: "hidden",
                  }}
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: turning.direction === 1 ? -168 : 168 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: TURN_DURATION,
                    ease: [0.45, 0.05, 0.35, 1],
                  }}
                  onAnimationComplete={() => {
                    setTurning(null);
                    setIsTurningPage(false);
                  }}
                >
                  <PdfPage
                    pdfDoc={active.pdfDoc}
                    pageNumber={turning.page}
                    zoom={active.zoom}
                  />
                  {/* Shading that sweeps across the page to sell the curl */}
                  <motion.div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        turning.direction === 1
                          ? "linear-gradient(90deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.28) 100%)"
                          : "linear-gradient(270deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.28) 100%)",
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0.4] }}
                    transition={{ duration: TURN_DURATION, times: [0, 0.6, 1] }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <PageNavArrows
          onPrev={prevPage}
          onNext={nextPage}
          canPrev={canPrev}
          canNext={canNext}
          disabled={isTurningPage}
          sidebarWidth={sidebarWidth}
        />

        <AnimatePresence>
          {popup && (
            <TranslatePopup
              key={`${popup.text}-${popup.rect.top}-${popup.rect.left}`}
              selection={popup}
              popupRef={popupRef}
              onClose={close}
            />
          )}
        </AnimatePresence>
        <TranslatePageDialog
          open={translateDialogOpen}
          onOpenChange={setTranslateDialogOpen}
          activeDoc={active}
          pageText={pageText}
        />
      </>
    );
  }

  if (active && active.status === "ready" && active.kind === "docx" && active.docHtml) {
    return (
      <>
        <div
          ref={containerRef}
          className="flex min-h-full justify-center p-10"
          onMouseUp={handleMouseUp}
        >
          <DocxPage html={active.docHtml} zoom={active.zoom} />
        </div>
        <AnimatePresence>
          {popup && (
            <TranslatePopup
              key={`${popup.text}-${popup.rect.top}-${popup.rect.left}`}
              selection={popup}
              popupRef={popupRef}
              onClose={close}
            />
          )}
        </AnimatePresence>
        <TranslatePageDialog
          open={translateDialogOpen}
          onOpenChange={setTranslateDialogOpen}
          activeDoc={active}
          pageText={pageText}
        />
      </>
    );
  }

  const message = active?.status === "error" ? active.error : dragError;
  const isLoading = active?.status === "loading";
  const isDropTarget = !active || active.status === "error";

  return (
    <div
      className="flex min-h-full items-center justify-center p-10"
      onDrop={isDropTarget ? onDrop : undefined}
      onDragOver={isDropTarget ? onDragOver : undefined}
    >
      {hiddenInputs}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex w-full max-w-lg flex-col items-center gap-6 rounded-xl border-2 border-dashed border-border bg-card/60 px-10 py-16 text-center shadow-page transition-colors hover:border-accent/50"
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-muted-foreground/25 border-t-accent" />
              <p className="text-sm font-medium text-muted-foreground">
                Opening your book…
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/15">
                <BookOpenText
                  className="h-7 w-7 text-accent"
                  strokeWidth={1.75}
                />
              </span>

              <div className="space-y-2">
                <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
                  Open a book to begin
                </h1>
                <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                  Drag a file here, or choose a format below. Highlight any
                  word once it&apos;s open to see its translation, part of
                  speech, and synonyms.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button size="lg" className="gap-2" onClick={pickPdf}>
                  <FileText className="h-4 w-4" />
                  Upload PDF
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="gap-2"
                  onClick={pickDocx}
                >
                  <FileType2 className="h-4 w-4" />
                  Upload Word doc
                </Button>
              </div>

              {message ? (
                <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {message}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground/70">
                  .pdf and .docx supported
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

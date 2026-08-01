"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Languages, Move, X } from "lucide-react";

import { getWordsInRect } from "@/lib/lasso-text";
import type { SelectionPopupState } from "@/lib/use-selection-popup";

interface LassoBoxProps {
  containerRef: React.RefObject<HTMLElement | null>;
  sidebarWidth: number;
  onTranslate: (selection: SelectionPopupState) => void;
  onClose: () => void;
}

type Box = { top: number; left: number; width: number; height: number };
type ResizeDir = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

const NAVBAR_HEIGHT = 56;
// Sized to comfortably wrap a single word at the default zoom (16px font)
// rather than a whole line — the box is meant to close in on one word by
// default, and can still be dragged/resized larger if needed.
const MIN_WIDTH = 32;
const DEFAULT_WIDTH = 64;
// Sized to roughly one line of reading text (16px font * 1.75 line-height
// ≈ 28px) plus a little breathing room, so the box grabs a single line by
// default instead of spanning two.
const MIN_HEIGHT = 26;
const DEFAULT_HEIGHT = 36;

function clampBox(box: Box): Box {
  if (typeof window === "undefined") return box;
  const maxLeft = Math.max(0, window.innerWidth - box.width);
  const maxTop = Math.max(NAVBAR_HEIGHT, window.innerHeight - box.height);
  return {
    ...box,
    left: Math.min(Math.max(0, box.left), maxLeft),
    top: Math.min(Math.max(NAVBAR_HEIGHT, box.top), maxTop),
  };
}

const HANDLES: { dir: ResizeDir; className: string; cursor: string }[] = [
  { dir: "nw", className: "-top-1.5 -left-1.5", cursor: "nwse-resize" },
  { dir: "n", className: "-top-1.5 left-1/2 -translate-x-1/2", cursor: "ns-resize" },
  { dir: "ne", className: "-top-1.5 -right-1.5", cursor: "nesw-resize" },
  { dir: "e", className: "top-1/2 -right-1.5 -translate-y-1/2", cursor: "ew-resize" },
  { dir: "se", className: "-bottom-1.5 -right-1.5", cursor: "nwse-resize" },
  { dir: "s", className: "-bottom-1.5 left-1/2 -translate-x-1/2", cursor: "ns-resize" },
  { dir: "sw", className: "-bottom-1.5 -left-1.5", cursor: "nesw-resize" },
  { dir: "w", className: "top-1/2 -left-1.5 -translate-y-1/2", cursor: "ew-resize" },
];

export function LassoBox({
  containerRef,
  sidebarWidth,
  onTranslate,
  onClose,
}: LassoBoxProps) {
  const [box, setBox] = React.useState<Box>(() => {
    if (typeof window === "undefined") {
      return {
        top: NAVBAR_HEIGHT + 90,
        left: 0,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
      };
    }
    const readingAreaWidth = window.innerWidth - sidebarWidth;
    return clampBox({
      top: NAVBAR_HEIGHT + 90,
      left: sidebarWidth + Math.max(60, readingAreaWidth / 2 - DEFAULT_WIDTH / 2),
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
    });
  });
  const [wordCount, setWordCount] = React.useState(0);

  const boxRef = React.useRef(box);
  boxRef.current = box;

  // Live feedback: recompute how many words currently sit inside the box
  // every time it's moved or resized, so the person knows what they'll get
  // before committing to a translation.
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    setWordCount(getWordsInRect(container, box).length);
  }, [box, containerRef]);

  const dragState = React.useRef<{
    kind: "move" | ResizeDir;
    startX: number;
    startY: number;
    startBox: Box;
  } | null>(null);

  const onPointerMove = React.useCallback((e: PointerEvent) => {
    const d = dragState.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    let { top, left, width, height } = d.startBox;

    if (d.kind === "move") {
      top = d.startBox.top + dy;
      left = d.startBox.left + dx;
    } else {
      const dir = d.kind;
      if (dir.includes("e")) {
        width = Math.max(MIN_WIDTH, d.startBox.width + dx);
      }
      if (dir.includes("w")) {
        width = Math.max(MIN_WIDTH, d.startBox.width - dx);
        left = d.startBox.left + (d.startBox.width - width);
      }
      if (dir.includes("s")) {
        height = Math.max(MIN_HEIGHT, d.startBox.height + dy);
      }
      if (dir.includes("n")) {
        height = Math.max(MIN_HEIGHT, d.startBox.height - dy);
        top = d.startBox.top + (d.startBox.height - height);
      }
    }

    setBox(clampBox({ top, left, width, height }));
  }, []);

  const endDrag = React.useCallback(() => {
    dragState.current = null;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", endDrag);
  }, [onPointerMove]);

  const startDrag = React.useCallback(
    (kind: "move" | ResizeDir) => (e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      dragState.current = {
        kind,
        startX: e.clientX,
        startY: e.clientY,
        startBox: boxRef.current,
      };
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", endDrag);
    },
    [onPointerMove, endDrag]
  );

  React.useEffect(() => {
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endDrag);
    };
  }, [onPointerMove, endDrag]);

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function handleTranslate() {
    const container = containerRef.current;
    if (!container) return;
    const words = getWordsInRect(container, box);
    if (words.length === 0) return;
    const text = words.join(" ");
    onTranslate({
      text,
      context: text,
      rect: { top: box.top, left: box.left, width: box.width, height: box.height },
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      style={{
        position: "fixed",
        top: box.top,
        left: box.left,
        width: box.width,
        height: box.height,
        zIndex: 55,
        touchAction: "none",
      }}
      className="cursor-move rounded-md border-2 border-dashed border-accent bg-accent/10 shadow-popover"
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={startDrag("move")}
    >
      {/* Resize handles */}
      {HANDLES.map((h) => (
        <div
          key={h.dir}
          onPointerDown={startDrag(h.dir)}
          style={{ cursor: h.cursor, touchAction: "none" }}
          className={`absolute z-10 h-3 w-3 rounded-full border border-accent bg-background ${h.className}`}
        />
      ))}

      {/* Floating toolbar */}
      <div
        className="absolute -top-9 left-0 flex items-center gap-1 whitespace-nowrap rounded-md border border-border bg-background/95 px-1.5 py-1 shadow-popover backdrop-blur-md"
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <Move className="h-3 w-3 shrink-0 text-muted-foreground" />
        <span className="px-1 font-mono text-[10px] tabular-nums text-muted-foreground">
          {wordCount} word{wordCount === 1 ? "" : "s"}
        </span>
        <button
          type="button"
          aria-label="Translate words inside the shape"
          disabled={wordCount === 0}
          onClick={handleTranslate}
          className="flex h-6 shrink-0 items-center gap-1 rounded-full bg-accent px-2.5 text-[11px] font-semibold text-accent-foreground shadow-sm transition-colors hover:bg-accent/90 disabled:pointer-events-none disabled:opacity-40"
        >
          <Languages className="h-3 w-3" />
          Translate
        </button>
        <button
          type="button"
          aria-label="Close translate shape"
          onClick={onClose}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

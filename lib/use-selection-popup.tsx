"use client";

import * as React from "react";

export interface SelectionPopupState {
  text: string;
  context: string;
  rect: { top: number; left: number; width: number; height: number };
}

export function useSelectionPopup(
  containerRef: React.RefObject<HTMLElement>
) {
  const [popup, setPopup] = React.useState<SelectionPopupState | null>(null);
  const popupRef = React.useRef<HTMLDivElement | null>(null);

  const close = React.useCallback(() => {
    setPopup(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  const handleMouseUp = React.useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const text = selection.toString().trim();
    if (!text) return;

    const anchorNode = selection.anchorNode;
    if (
      !containerRef.current ||
      !anchorNode ||
      !containerRef.current.contains(anchorNode)
    ) {
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;

    // Grab the surrounding block's text as light "sentence" context.
    let context = text;
    const parentEl =
      anchorNode.nodeType === Node.TEXT_NODE
        ? anchorNode.parentElement
        : (anchorNode as HTMLElement);
    const block = parentEl?.closest("span, p, div");
    if (block?.textContent) {
      context = block.textContent.trim().slice(0, 220);
    }

    setPopup({
      text,
      context,
      rect: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      },
    });
  }, [containerRef]);

  // Any click that isn't inside the popup itself closes it. The popup stops
  // propagation on its own mousedown, so this only fires for outside clicks.
  React.useEffect(() => {
    if (!popup) return;
    function handleOutsideMouseDown() {
      setPopup(null);
      window.getSelection()?.removeAllRanges();
    }
    document.addEventListener("mousedown", handleOutsideMouseDown);
    return () =>
      document.removeEventListener("mousedown", handleOutsideMouseDown);
  }, [popup]);

  return { popup, popupRef, handleMouseUp, close };
}

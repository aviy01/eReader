export interface RectLike {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Collects the words inside `container` whose rendered bounding boxes
 * intersect `rect` (both in fixed/viewport coordinates), in document order.
 *
 * Works by walking live text nodes and testing each word's own Range
 * against the rectangle, rather than relying on window.getSelection() —
 * that's what lets an arbitrary draggable/resizable box "capture" whatever
 * text happens to sit under it, on both the PDF text layer and rendered
 * docx HTML.
 */
export function getWordsInRect(
  container: HTMLElement,
  rect: RectLike
): string[] {
  const boxLeft = rect.left;
  const boxRight = rect.left + rect.width;
  const boxTop = rect.top;
  const boxBottom = rect.top + rect.height;

  if (boxRight <= boxLeft || boxBottom <= boxTop) return [];

  function intersectsBox(r: DOMRect) {
    return (
      r.width > 0 &&
      r.height > 0 &&
      r.left < boxRight &&
      r.right > boxLeft &&
      r.top < boxBottom &&
      r.bottom > boxTop
    );
  }

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || !node.nodeValue.trim()) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const words: string[] = [];
  const wordPattern = /\S+/g;
  let node: Node | null;

  while ((node = walker.nextNode())) {
    const text = node.nodeValue ?? "";
    wordPattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = wordPattern.exec(text))) {
      const range = document.createRange();
      try {
        range.setStart(node, match.index);
        range.setEnd(node, match.index + match[0].length);
      } catch {
        continue;
      }
      const rects = range.getClientRects();
      for (let i = 0; i < rects.length; i++) {
        if (intersectsBox(rects[i])) {
          words.push(match[0]);
          break;
        }
      }
    }
  }

  return words;
}

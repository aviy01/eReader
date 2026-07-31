export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Speaks text aloud. Returns false if the browser has no TTS support. */
export function speak(text: string, langCode?: string): boolean {
  if (!canSpeak() || !text.trim()) return false;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  if (langCode) utterance.lang = langCode;
  window.speechSynthesis.speak(utterance);
  return true;
}

interface SpeechItem {
  text: string;
  langCode?: string;
}

/**
 * Speaks multiple pieces of text back to back — e.g. the word itself,
 * followed by its definition. Each item can have its own language code.
 * The browser's speech queue plays utterances in order once `cancel()`
 * has cleared any previous queue, so we only cancel once up front.
 */
export function speakSequence(items: SpeechItem[]): boolean {
  if (!canSpeak()) return false;
  const usable = items.filter((item) => item.text && item.text.trim());
  if (usable.length === 0) return false;

  window.speechSynthesis.cancel();
  for (const item of usable) {
    const utterance = new SpeechSynthesisUtterance(item.text);
    if (item.langCode) utterance.lang = item.langCode;
    window.speechSynthesis.speak(utterance);
  }
  return true;
}

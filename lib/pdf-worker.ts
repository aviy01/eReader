import { GlobalWorkerOptions, version } from "pdfjs-dist";

if (typeof window !== "undefined") {
  // Served from a CDN rather than bundled: pdf.worker.min.mjs embeds the
  // OpenJPEG/JBIG2 WASM codecs, which is large and can trip up bundler
  // asset handling. The CDN copy always matches the installed package
  // version.
  GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;
}

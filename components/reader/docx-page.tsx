"use client";

interface DocxPageProps {
  html: string;
  zoom: number; // percentage
}

export function DocxPage({ html, zoom }: DocxPageProps) {
  return (
    <div
      className="w-full max-w-[720px] bg-white px-14 py-16 shadow-page"
      style={{ fontSize: `${(16 * zoom) / 100}px` }}
    >
      {/* Content originates from the user's own uploaded .docx, converted
          client-side by mammoth — safe to render directly. */}
      <div
        className="docx-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

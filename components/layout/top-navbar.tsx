"use client";

import {
  ChevronLeft,
  ChevronRight,
  FileText,
  FileType2,
  Languages,
  Minus,
  Plus,
  Upload,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDocument, MIN_ZOOM, MAX_ZOOM } from "@/lib/document-context";
import { useFileOpener } from "@/lib/use-file-opener";
import { useReaderUI } from "@/lib/reader-ui-context";

export function TopNavbar() {
  const { active, nextPage, prevPage, zoomIn, zoomOut, closeDocument } =
    useDocument();
  const { pickPdf, pickDocx, hiddenInputs } = useFileOpener();
  const { setTranslateDialogOpen, isTurningPage } = useReaderUI();

  const hasDoc = active?.status === "ready";
  const isPaginated = hasDoc && active?.kind === "pdf";

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md">
      {hiddenInputs}

      {/* Left: page navigation */}
      <div className="flex items-center gap-1">
        <NavIconButton
          label="Previous page"
          disabled={!isPaginated || isTurningPage || (active?.currentPage ?? 1) <= 1}
          onClick={prevPage}
        >
          <ChevronLeft className="h-4 w-4" />
        </NavIconButton>

        <div className="mx-1 flex items-center gap-1 rounded-md bg-muted px-2.5 py-1.5 font-mono text-xs tabular-nums text-muted-foreground">
          <span className="font-semibold text-foreground">
            {hasDoc ? active!.currentPage : "–"}
          </span>
          <span>/</span>
          <span>{hasDoc ? active!.numPages : "–"}</span>
        </div>

        <NavIconButton
          label="Next page"
          disabled={
            !isPaginated ||
            isTurningPage ||
            (active?.currentPage ?? 1) >= (active?.numPages ?? 1)
          }
          onClick={nextPage}
        >
          <ChevronRight className="h-4 w-4" />
        </NavIconButton>

        <Separator orientation="vertical" className="mx-2 h-5" />

        {/* Zoom controls */}
        <NavIconButton
          label="Zoom out"
          disabled={!hasDoc || (active?.zoom ?? MIN_ZOOM) <= MIN_ZOOM}
          onClick={zoomOut}
        >
          <Minus className="h-4 w-4" />
        </NavIconButton>

        <span className="w-11 text-center font-mono text-xs tabular-nums text-muted-foreground">
          {hasDoc ? `${active!.zoom}%` : "–"}
        </span>

        <NavIconButton
          label="Zoom in"
          disabled={!hasDoc || (active?.zoom ?? MAX_ZOOM) >= MAX_ZOOM}
          onClick={zoomIn}
        >
          <Plus className="h-4 w-4" />
        </NavIconButton>

        {hasDoc && (
          <>
            <Separator orientation="vertical" className="mx-2 h-5" />
            <span className="max-w-[14rem] truncate text-xs text-muted-foreground">
              {active!.fileName}
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  aria-label="Close document"
                  onClick={() => closeDocument(active!.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Close document</TooltipContent>
            </Tooltip>
          </>
        )}
      </div>

      {/* Right: translate + upload + theme */}
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="accent"
              size="sm"
              className="gap-1.5"
              disabled={!hasDoc}
              onClick={() => setTranslateDialogOpen(true)}
            >
              <Languages className="h-3.5 w-3.5" />
              Translate page
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Translate the entire current page
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-5" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Upload className="h-3.5 w-3.5" />
              Open file
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Choose a format</DropdownMenuLabel>
            <DropdownMenuItem onSelect={pickPdf}>
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">PDF document</p>
                <p className="text-xs text-muted-foreground">.pdf</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={pickDocx}>
              <FileType2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Word document</p>
                <p className="text-xs text-muted-foreground">.doc, .docx</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ThemeToggle />
      </div>
    </header>
  );
}

function NavIconButton({
  label,
  children,
  disabled,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          aria-label={label}
          disabled={disabled}
          onClick={onClick}
          className="flex h-8 w-8 items-center justify-center rounded-md text-foreground/80 transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-35"
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}

"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label="Toggle theme"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="relative flex h-8 w-14 items-center rounded-full border border-border bg-muted px-1 transition-colors"
        >
          <motion.span
            layout
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-card shadow-sm"
            style={{ marginLeft: isDark ? "auto" : 0 }}
          >
            {mounted && isDark ? (
              <Moon className="h-3.5 w-3.5 text-primary" strokeWidth={2.25} />
            ) : (
              <Sun className="h-3.5 w-3.5 text-accent" strokeWidth={2.25} />
            )}
          </motion.span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {isDark ? "Switch to light mode" : "Switch to dark mode"}
      </TooltipContent>
    </Tooltip>
  );
}

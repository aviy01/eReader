"use client";

import * as React from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { TopNavbar } from "@/components/layout/top-navbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useReaderUI } from "@/lib/reader-ui-context";

const SIDEBAR_WIDTH_EXPANDED = 288;
const SIDEBAR_WIDTH_COLLAPSED = 64;

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const { setSidebarWidth } = useReaderUI();

  // Keep the reading pane's known left boundary in sync with the sidebar's
  // actual width so fixed-position UI (like the mid-page nav arrow) never
  // drifts over the sidebar.
  React.useEffect(() => {
    setSidebarWidth(collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED);
  }, [collapsed, setSidebarWidth]);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopNavbar />
          <main className="relative flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}

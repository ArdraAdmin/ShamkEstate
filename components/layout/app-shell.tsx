"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useDemoStore } from "@/lib/demo-store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { ready, isAuthed, viewAsUser } = useDemoStore();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        document.querySelector<HTMLButtonElement>("[data-search-trigger]")?.click();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!ready || !isAuthed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Loading workspace…
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        {viewAsUser ? (
          <div className="border-b border-violet-200 bg-violet-50 px-4 py-1.5 text-xs text-violet-800">
            Viewing as <span className="font-semibold">{viewAsUser.name}</span> · {viewAsUser.role}
            {viewAsUser.scope.companyIds.length
              ? " · scoped companies only. Switch back via “View as user”."
              : " · all companies."}
          </div>
        ) : null}
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1400px] p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

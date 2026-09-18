"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Package,
  Settings,
  Shield,
  FileKey2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDemoStore } from "@/lib/demo-store";
import { moduleAllowed } from "@/lib/data";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, module: "reports" as const },
  { href: "/properties", label: "Properties", icon: Building2, module: "properties" as const },
  { href: "/assets", label: "Assets", icon: Package, module: "assets" as const },
  { href: "/leases", label: "Leases & Tenants", icon: FileKey2, module: "leases" as const },
  { href: "/users", label: "User Management", icon: Shield, module: "userManagement" as const },
];

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const { viewAsUser } = useDemoStore();

  return (
    <aside
      className={cn(
        "relative z-20 flex h-full flex-col border-r border-slate-200 bg-white transition-[width] duration-200",
        collapsed ? "w-[68px]" : "w-[248px]"
      )}
    >
      <div className={cn("flex h-14 items-center gap-2 px-3", collapsed && "justify-center")}>
        <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white">
          S
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900">Shamk Estate</div>
            <div className="truncate text-[11px] text-slate-500">Estate Admin</div>
          </div>
        )}
      </div>
      <Separator />
      <nav className="flex flex-1 flex-col gap-1 p-2">
        {nav.map((item) => {
          const allowed = moduleAllowed(viewAsUser, item.module) || item.href === "/dashboard";
          if (item.href === "/dashboard" && viewAsUser && !viewAsUser.modules.reports && !viewAsUser.modules.financials) {
            // still show dashboard as landing but ok
          }
          if (!allowed && item.href !== "/dashboard") return null;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          const link = (
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                collapsed && "justify-center px-0",
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
          if (!collapsed) return <div key={item.href}>{link}</div>;
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>{link}</TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
        <Separator className="my-2" />
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/settings"
                className={cn(
                  "flex items-center justify-center rounded-lg py-2 text-slate-600 hover:bg-slate-50",
                  pathname.startsWith("/settings") && "bg-indigo-50 text-indigo-700"
                )}
              >
                <Settings className="size-4" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        ) : (
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              pathname.startsWith("/settings") && "bg-indigo-50 text-indigo-700"
            )}
          >
            <Settings className="size-4" />
            Settings
          </Link>
        )}
      </nav>
      <div className="p-2">
        <Button variant="ghost" size="sm" className="w-full justify-center" onClick={onToggle}>
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </Button>
      </div>
    </aside>
  );
}

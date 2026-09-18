"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Building2, Eye, LogOut, Search, UserRound } from "lucide-react";
import { companies, notifications, users } from "@/lib/data";
import { useDemoStore } from "@/lib/demo-store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationsSheet } from "@/components/layout/notifications-sheet";
import { properties, assets, leases, tenants } from "@/lib/data";

export function Topbar() {
  const router = useRouter();
  const { companyId, setCompanyId, logout, currentAdmin, viewAsUser, viewAsUserId, setViewAsUserId } =
    useDemoStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  const scopedCompanies = useMemo(() => {
    const ids = viewAsUser?.scope.companyIds ?? [];
    return ids.length ? companies.filter((c) => ids.includes(c.id)) : companies;
  }, [viewAsUser]);

  const companyLabel =
    companyId === "all"
      ? viewAsUser?.scope.companyIds.length === 1
        ? scopedCompanies[0]?.name ?? "All Companies"
        : "All Companies"
      : companies.find((c) => c.id === companyId)?.name ?? "All Companies";

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="max-w-[260px] justify-between gap-2">
            <Building2 className="size-3.5 text-indigo-600" />
            <span className="truncate">{companyLabel}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72">
          <DropdownMenuLabel>Company context</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(viewAsUser?.scope.companyIds.length ?? 0) !== 1 && (
            <DropdownMenuItem onClick={() => setCompanyId("all")}>All Companies</DropdownMenuItem>
          )}
          {scopedCompanies.map((c) => (
            <DropdownMenuItem key={c.id} onClick={() => setCompanyId(c.id)}>
              <span className="flex-1">{c.name}</span>
              <span className="text-[11px] text-slate-400">{c.code}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className="hidden h-8 flex-1 max-w-md items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-left text-sm text-slate-500 md:flex"
      >
        <Search className="size-3.5" />
        Search properties, tenants, assets…
        <kbd className="ml-auto rounded border border-slate-200 bg-white px-1.5 text-[10px] text-slate-400">
          ⌘K
        </kbd>
      </button>
      <Button variant="outline" size="icon-sm" className="md:hidden" onClick={() => setSearchOpen(true)}>
        <Search className="size-4" />
      </Button>

      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={viewAsUser ? "default" : "outline"} size="sm" className="gap-1.5">
              <Eye className="size-3.5" />
              <span className="hidden lg:inline">
                {viewAsUser ? `View as: ${viewAsUser.name}` : "View as user"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Company isolation demo</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setViewAsUserId(null)}>
              Super Admin (full access)
            </DropdownMenuItem>
            {users
              .filter((u) => u.id !== "u-admin")
              .map((u) => (
                <DropdownMenuItem
                  key={u.id}
                  onClick={() => setViewAsUserId(u.id)}
                  className={viewAsUserId === u.id ? "bg-indigo-50" : ""}
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium">{u.name}</div>
                    <div className="truncate text-[11px] text-slate-500">
                      {u.role}
                      {u.scope.companyIds.length
                        ? ` · ${u.scope.companyIds.length} compan${u.scope.companyIds.length === 1 ? "y" : "ies"}`
                        : " · all companies"}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="icon-sm" className="relative" onClick={() => setNotesOpen(true)}>
          <Bell className="size-4" />
          <Badge className="absolute -right-1.5 -top-1.5 h-4 min-w-4 px-1 text-[10px]">
            {notifications.length}
          </Badge>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 gap-2 px-1.5">
              <Avatar className="size-7">
                <AvatarFallback className="bg-violet-100 text-xs text-violet-700">
                  {currentAdmin.avatarInitials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-left text-sm sm:block">
                <span className="block leading-4 font-medium">{currentAdmin.name}</span>
                <span className="block text-[11px] text-slate-500">{currentAdmin.role}</span>
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Admin</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <UserRound className="size-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="size-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <Command>
        <CommandInput placeholder="Search the estate…" />
        <CommandList>
          <CommandEmpty>No matches.</CommandEmpty>
          <CommandGroup heading="Properties">
            {properties.slice(0, 8).map((p) => (
              <CommandItem
                key={p.id}
                onSelect={() => {
                  setSearchOpen(false);
                  router.push(`/properties/${p.id}`);
                }}
              >
                {p.code} · {p.name}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Tenants">
            {tenants.slice(0, 6).map((t) => (
              <CommandItem
                key={t.id}
                onSelect={() => {
                  setSearchOpen(false);
                  const lease = leases.find((l) => l.tenantId === t.id);
                  router.push(lease ? `/leases/${lease.id}` : "/leases");
                }}
              >
                {t.name}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Assets">
            {assets.slice(0, 6).map((a) => (
              <CommandItem
                key={a.id}
                onSelect={() => {
                  setSearchOpen(false);
                  router.push(`/assets/${a.id}`);
                }}
              >
                {a.assetNo} · {a.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
        </Command>
      </CommandDialog>

      <NotificationsSheet open={notesOpen} onOpenChange={setNotesOpen} />
    </header>
  );
}

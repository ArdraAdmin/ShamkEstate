"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getUser, users, type AppUser } from "@/lib/data";

const AUTH_KEY = "shamk-demo-auth";
const COMPANY_KEY = "shamk-company";
const VIEWAS_KEY = "shamk-view-as";

type Snapshot = {
  ready: boolean;
  isAuthed: boolean;
  companyId: string;
  viewAsUserId: string | null;
};

const empty: Snapshot = {
  ready: false,
  isAuthed: false,
  companyId: "all",
  viewAsUserId: null,
};

let snapshot: Snapshot = empty;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function writeCookie(authed: boolean) {
  if (typeof document === "undefined") return;
  if (authed) {
    document.cookie = `${AUTH_KEY}=1; path=/; max-age=2592000; SameSite=Lax`;
  } else {
    document.cookie = `${AUTH_KEY}=; path=/; max-age=0; SameSite=Lax`;
  }
}

function readSnapshot(): Snapshot {
  if (typeof window === "undefined") return empty;
  return {
    ready: true,
    isAuthed: window.localStorage.getItem(AUTH_KEY) === "1",
    companyId: window.localStorage.getItem(COMPANY_KEY) ?? "all",
    viewAsUserId: window.localStorage.getItem(VIEWAS_KEY),
  };
}

function hydrate() {
  snapshot = readSnapshot();
  writeCookie(snapshot.isAuthed);
  emit();
}

if (typeof window !== "undefined") {
  hydrate();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

type DemoStore = {
  ready: boolean;
  isAuthed: boolean;
  login: (email?: string) => void;
  logout: () => void;
  companyId: string | "all";
  setCompanyId: (id: string | "all") => void;
  viewAsUserId: string | null;
  setViewAsUserId: (id: string | null) => void;
  viewAsUser: AppUser | null;
  currentAdmin: AppUser;
};

const DemoStoreContext = createContext<DemoStore | null>(null);

export function DemoStoreProvider({ children }: { children: React.ReactNode }) {
  const snap = useSyncExternalStore(subscribe, () => snapshot, () => empty);
  const router = useRouter();
  const pathname = usePathname();

  const login = useCallback(() => {
    window.localStorage.setItem(AUTH_KEY, "1");
    writeCookie(true);
    hydrate();
    router.push("/dashboard");
  }, [router]);

  const logout = useCallback(() => {
    window.localStorage.removeItem(AUTH_KEY);
    writeCookie(false);
    hydrate();
    router.push("/login");
  }, [router]);

  const setCompanyId = useCallback((id: string | "all") => {
    window.localStorage.setItem(COMPANY_KEY, id);
    hydrate();
  }, []);

  const setViewAsUserId = useCallback((id: string | null) => {
    if (id) window.localStorage.setItem(VIEWAS_KEY, id);
    else window.localStorage.removeItem(VIEWAS_KEY);
    window.localStorage.setItem(COMPANY_KEY, "all");
    hydrate();
  }, []);

  useEffect(() => {
    if (!snap.ready) return;
    if (!snap.isAuthed && pathname !== "/login") router.replace("/login");
    if (snap.isAuthed && pathname === "/login") router.replace("/dashboard");
  }, [snap.ready, snap.isAuthed, pathname, router]);

  const value = useMemo<DemoStore>(() => {
    const viewAsUser = snap.viewAsUserId ? getUser(snap.viewAsUserId) ?? null : null;
    return {
      ready: snap.ready,
      isAuthed: snap.isAuthed,
      login,
      logout,
      companyId: snap.companyId,
      setCompanyId,
      viewAsUserId: snap.viewAsUserId,
      setViewAsUserId,
      viewAsUser,
      currentAdmin: users[0],
    };
  }, [snap, login, logout, setCompanyId, setViewAsUserId]);

  return <DemoStoreContext.Provider value={value}>{children}</DemoStoreContext.Provider>;
}

export function useDemoStore() {
  const ctx = useContext(DemoStoreContext);
  if (!ctx) throw new Error("useDemoStore must be used within DemoStoreProvider");
  return ctx;
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { demoNow, leases as seedLeases, tenants as seedTenants } from "@/lib/data";
import { properties as seedProperties } from "@/lib/data/properties";
import type { Lease, Property, Tenant } from "@/lib/data/types";

type EstateState = {
  tenants: Tenant[];
  leases: Lease[];
  properties: Property[];
};

function cloneSeed(): EstateState {
  return {
    tenants: seedTenants.map((t) => ({ ...t })),
    leases: seedLeases.map((l) => ({
      ...l,
      propertyIds: [...l.propertyIds],
      escalation: l.escalation.map((e) => ({ ...e })),
      payments: l.payments.map((p) => ({ ...p })),
    })),
    properties: seedProperties.map((p) => ({
      ...p,
      ownership: p.ownership.map((o) => ({ ...o })),
      parking: p.parking.map((pk) => ({ ...pk })),
      fixtures: [...p.fixtures],
      amenities: [...p.amenities],
      expenses: { ...p.expenses },
    })),
  };
}

let state: EstateState = cloneSeed();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return state;
}

export type CreateTenantInput = Omit<Tenant, "id">;

export type CreateLeaseInput = {
  tenantId: string;
  propertyIds: string[];
  companyId: string;
  leaseAmount: number;
  startDate: string;
  endDate: string;
  securityDeposit: number;
  lockInMonths: number;
  noticePeriodDays: number;
  freePeriodMonths: number;
};

function nextDueFromStart(startDate: string) {
  const [y, m] = startDate.split("-").map(Number);
  if (!y || !m) return `${demoNow.slice(0, 8)}05`;
  const next = m === 12 ? { y: y + 1, m: 1 } : { y, m: m + 1 };
  return `${next.y}-${String(next.m).padStart(2, "0")}-05`;
}

type EstateStore = {
  tenants: Tenant[];
  leases: Lease[];
  properties: Property[];
  getTenant: (id: string) => Tenant | undefined;
  getLease: (id: string) => Lease | undefined;
  getProperty: (id: string) => Property | undefined;
  createTenant: (input: CreateTenantInput) => Tenant;
  createLease: (input: CreateLeaseInput) => Lease;
};

const EstateStoreContext = createContext<EstateStore | null>(null);

export function EstateStoreProvider({ children }: { children: React.ReactNode }) {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const createTenant = useCallback((input: CreateTenantInput) => {
    const tenant: Tenant = {
      ...input,
      id: `t-${Date.now()}`,
    };
    state = { ...state, tenants: [...state.tenants, tenant] };
    emit();
    return tenant;
  }, []);

  const createLease = useCallback((input: CreateLeaseInput) => {
    const tenant = state.tenants.find((t) => t.id === input.tenantId);
    const year = Number(demoNow.slice(0, 4));
    const seq = String(1000 + (state.leases.length % 9000)).padStart(4, "0");
    const lease: Lease = {
      id: `l-${Date.now()}`,
      srNumber: `SR-${year}-${seq}`,
      tenantId: input.tenantId,
      propertyIds: [...input.propertyIds],
      companyId: input.companyId,
      status: "Active",
      leaseAmount: input.leaseAmount,
      startDate: input.startDate,
      endDate: input.endDate,
      lockInMonths: input.lockInMonths,
      freePeriodMonths: input.freePeriodMonths,
      securityDeposit: input.securityDeposit,
      tokenAmount: input.leaseAmount,
      noticePeriodDays: input.noticePeriodDays,
      agreementDate: input.startDate,
      possessionDate: input.startDate,
      rentCommencementDate: input.startDate,
      chequeDetails: "To be recorded",
      registrationDetails: "Pending",
      escalation: [{ years: 3, percent: 5 }],
      suppressReminders: false,
      payments: [],
      nextDueDate: nextDueFromStart(input.startDate),
      outstanding: 0,
    };

    const perPropertyRent =
      input.propertyIds.length > 0
        ? Math.round(input.leaseAmount / input.propertyIds.length)
        : input.leaseAmount;

    const properties = state.properties.map((p) => {
      if (!input.propertyIds.includes(p.id)) return p;
      return {
        ...p,
        status: "Occupied" as const,
        tenantId: input.tenantId,
        tenantName: tenant?.name,
        currentRent: perPropertyRent,
        daysVacant: undefined,
        assignedBroker: tenant?.broker ?? p.assignedBroker,
      };
    });

    state = {
      ...state,
      leases: [...state.leases, lease],
      properties,
    };
    emit();
    return lease;
  }, []);

  const value = useMemo<EstateStore>(
    () => ({
      tenants: snap.tenants,
      leases: snap.leases,
      properties: snap.properties,
      getTenant: (id) => snap.tenants.find((t) => t.id === id),
      getLease: (id) => snap.leases.find((l) => l.id === id),
      getProperty: (id) => snap.properties.find((p) => p.id === id),
      createTenant,
      createLease,
    }),
    [snap, createTenant, createLease]
  );

  return (
    <EstateStoreContext.Provider value={value}>{children}</EstateStoreContext.Provider>
  );
}

export function useEstateStore() {
  const ctx = useContext(EstateStoreContext);
  if (!ctx) throw new Error("useEstateStore must be used within EstateStoreProvider");
  return ctx;
}

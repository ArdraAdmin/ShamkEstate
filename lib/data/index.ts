import { companies, getCompany, getOwner } from "./companies";
import { coverageFromDate, getAmc, getAsset } from "./assets";
import { getLease, getProspect, getTenant, leases, prospects } from "./leases";
import { getProperty, properties, propertyExpensesTotal } from "./properties";
import { getUser } from "./users";
import type { AppUser, PipelineStage, Property } from "./types";

export * from "./types";
export * from "./companies";
export * from "./properties";
export * from "./assets";
export * from "./leases";
export * from "./users";
export * from "./notifications";

export function filterByCompany<T extends { companyId: string }>(
  rows: T[],
  companyId: string | "all",
  scopedCompanyIds?: string[]
) {
  let next = rows;
  if (scopedCompanyIds && scopedCompanyIds.length > 0) {
    next = next.filter((r) => scopedCompanyIds.includes(r.companyId));
  }
  if (companyId !== "all") {
    next = next.filter((r) => r.companyId === companyId);
  }
  return next;
}

export function filterPropertiesForScope(
  rows: Property[],
  companyId: string | "all",
  user?: AppUser | null
) {
  const scoped = user?.scope.companyIds ?? [];
  let next = filterByCompany(rows, companyId, scoped.length ? scoped : undefined);
  if (user?.scope.propertyIds?.length) {
    next = next.filter((p) => user.scope.propertyIds!.includes(p.id));
  }
  return next;
}

export function visibleCompanies(companyId: string | "all", user?: AppUser | null) {
  const scoped = user?.scope.companyIds ?? [];
  const base = scoped.length ? companies.filter((c) => scoped.includes(c.id)) : companies;
  if (companyId === "all") return base;
  return base.filter((c) => c.id === companyId);
}

export function moduleAllowed(user: AppUser | null | undefined, module: keyof AppUser["modules"]) {
  if (!user) return true;
  return user.modules[module];
}

export function sumExpenses(p: Property) {
  return propertyExpensesTotal(p);
}

export function dashboardMetrics(companyId: string | "all", user?: AppUser | null) {
  const props = filterPropertiesForScope(properties, companyId, user);
  const occupied = props.filter((p) => p.status === "Occupied");
  const vacant = props.filter((p) => p.status === "Vacant");
  const selfUse = props.filter((p) => p.status === "Self-Use");
  const renovation = props.filter((p) => p.status === "Under Renovation");

  const monthlyRent = occupied.reduce((s, p) => s + p.currentRent, 0);
  const expenses = props.reduce((s, p) => s + sumExpenses(p), 0);
  const vacancyLoss = vacant.reduce((s, p) => s + p.expectedRent, 0);
  const selfUseValue = selfUse.reduce((s, p) => s + p.expectedRent, 0);

  const scopedLeases = leases.filter((l) => {
    const leaseProps = l.propertyIds
      .map(getProperty)
      .filter((p): p is Property => Boolean(p));
    if (!leaseProps.length) return false;
    return leaseProps.every((p) => props.some((x) => x.id === p.id));
  });
  const deposits = scopedLeases.reduce((s, l) => s + l.securityDeposit, 0);

  const byCompany = visibleCompanies(companyId, user).map((c) => ({
    name: c.shortName,
    income: props.filter((p) => p.companyId === c.id).reduce((s, p) => s + p.currentRent, 0),
  }));

  const cityMap = new Map<string, { income: number; expense: number }>();
  for (const p of props) {
    const key = `${p.city}`;
    const cur = cityMap.get(key) ?? { income: 0, expense: 0 };
    cur.income += p.currentRent;
    cur.expense += sumExpenses(p);
    cityMap.set(key, cur);
  }
  const byCity = Array.from(cityMap.entries()).map(([name, v]) => ({
    name,
    income: v.income,
    expense: v.expense,
  }));

  const months = [
    "Oct 25",
    "Nov 25",
    "Dec 25",
    "Jan 26",
    "Feb 26",
    "Mar 26",
    "Apr 26",
    "May 26",
    "Jun 26",
    "Jul 26",
    "Aug 26",
    "Sep 26",
  ];
  const trend = months.map((month, i) => {
    const factor = 0.84 + i * 0.014;
    return {
      month,
      income: Math.round(monthlyRent * factor),
      expense: Math.round(expenses * (0.9 + (i % 3) * 0.03)),
    };
  });

  return {
    monthlyRent,
    netIncome: monthlyRent - expenses,
    vacancyLoss,
    deposits,
    selfUseValue,
    expenses,
    counts: {
      total: props.length,
      occupied: occupied.length,
      vacant: vacant.length,
      selfUse: selfUse.length,
      renovation: renovation.length,
      dispute: props.filter((p) => p.status === "Under Dispute").length,
      sale: props.filter((p) => p.status === "Under Sale").length,
    },
    byCompany,
    byCity,
    trend,
    vacantFollowups: vacant
      .slice()
      .sort((a, b) => (b.daysVacant ?? 0) - (a.daysVacant ?? 0)),
  };
}

export function pipelineSummary(companyId: string | "all", user?: AppUser | null) {
  const props = filterPropertiesForScope(properties, companyId, user);
  const ids = new Set(props.map((p) => p.id));
  const relevant = [...leases, ...prospects].filter((row) =>
    row.propertyIds.some((id) => ids.has(id))
  );
  const count = (stage: PipelineStage) =>
    relevant.filter((r) => ("status" in r ? r.status : r.stage) === stage).length;

  const active = leases.filter(
    (l) => l.status === "Active" && l.propertyIds.some((id) => ids.has(id))
  ).length;
  const awaitingReg = count("Registration Pending");
  const kycPending = count("KYC Pending");
  const expireSoon = leases.filter((l) => {
    if (!l.propertyIds.some((id) => ids.has(id))) return false;
    const days =
      (new Date(`${l.endDate}T00:00:00`).getTime() - new Date("2026-09-12T00:00:00").getTime()) /
      86_400_000;
    return days >= 0 && days <= 90;
  }).length;

  return { active, awaitingReg, kycPending, expireSoon };
}

export const helpers = {
  getCompany,
  getOwner,
  getProperty,
  getAsset,
  getAmc,
  getLease,
  getTenant,
  getProspect,
  getUser,
  coverageFromDate,
};

export const demoNow = "2026-09-12";
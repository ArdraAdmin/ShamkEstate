import type { EscalationStep, RentMonthStatus } from "./data/types";

export interface RentScheduleRow {
  key: string;
  period: string;
  start: string;
  end: string;
  yearIndex: number;
  baseRent: number;
  appliedRent: number;
  status: RentMonthStatus;
  isFree: boolean;
}

function addMonths(iso: string, months: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1 + months, d));
  const yy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function monthLabel(iso: string) {
  const [y, m] = iso.split("-");
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${names[Number(m) - 1]} ${y}`;
}

function appliedForYear(base: number, escalation: EscalationStep[], yearIndex: number) {
  let rent = base;
  let consumed = 0;
  for (const step of escalation) {
    const start = consumed;
    const end = consumed + step.years;
    if (yearIndex >= end) {
      rent = Math.round(rent * (1 + step.percent / 100));
    } else if (yearIndex >= start) {
      return rent;
    }
    consumed = end;
  }
  return rent;
}

export function buildRentSchedule(opts: {
  baseRent: number;
  startDate: string;
  endDate: string;
  rentCommencementDate: string;
  freePeriodMonths: number;
  escalation: EscalationStep[];
  paidThrough?: string;
}): RentScheduleRow[] {
  const rows: RentScheduleRow[] = [];
  let cursor = opts.startDate;
  let i = 0;
  while (cursor <= opts.endDate && i < 84) {
    const end = addMonths(cursor, 1);
    const yearIndex = Math.floor(i / 12);
    const isFree =
      i < opts.freePeriodMonths || cursor < opts.rentCommencementDate;
    const applied = isFree
      ? 0
      : appliedForYear(opts.baseRent, opts.escalation, yearIndex);
    let status: RentMonthStatus = "Upcoming";
    if (isFree) status = "Free Period";
    else if (cursor < "2026-09-01") status = "Paid";
    else if (cursor.startsWith("2026-09")) status = "Due";
    rows.push({
      key: cursor,
      period: monthLabel(cursor),
      start: cursor,
      end,
      yearIndex,
      baseRent: opts.baseRent,
      appliedRent: applied,
      status,
      isFree,
    });
    cursor = end;
    i += 1;
  }
  return rows;
}

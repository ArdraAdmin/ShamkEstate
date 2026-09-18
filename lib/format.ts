export function formatINR(value: number, opts?: { compact?: boolean }): string {
  if (opts?.compact) {
    const abs = Math.abs(value);
    const sign = value < 0 ? "-" : "";
    if (abs >= 10_000_000) {
      return `${sign}₹${(abs / 10_000_000).toFixed(2)} Cr`;
    }
    if (abs >= 100_000) {
      return `${sign}₹${(abs / 100_000).toFixed(2)} L`;
    }
  }
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
  return `₹${formatted}`;
}

export function formatINRExact(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export function formatDate(iso: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export function daysUntil(iso: string, from = "2026-09-12"): number {
  const a = new Date(`${from}T00:00:00`);
  const b = new Date(`${iso}T00:00:00`);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

export function daysLeftBadge(days: number): {
  label: string;
  className: string;
} {
  if (days < 0) {
    return {
      label: `${Math.abs(days)}d overdue`,
      className: "border-rose-200 bg-rose-50 text-rose-700",
    };
  }
  if (days <= 15) {
    return {
      label: `${days}d left`,
      className: "border-rose-200 bg-rose-50 text-rose-700",
    };
  }
  if (days <= 45) {
    return {
      label: `${days}d left`,
      className: "border-yellow-200 bg-yellow-50 text-yellow-700",
    };
  }
  return {
    label: `${days}d left`,
    className: "border-sky-200 bg-sky-50 text-sky-700",
  };
}

export function percentDelta(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

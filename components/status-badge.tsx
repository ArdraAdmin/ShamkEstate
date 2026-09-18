import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CoverageStatus } from "@/lib/data/types";

const map: Record<string, string> = {
  Occupied: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Paid: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Complete: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Registered: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Vacant: "border-slate-200 bg-slate-100 text-slate-600",
  Inactive: "border-slate-200 bg-slate-100 text-slate-600",
  None: "border-slate-200 bg-slate-100 text-slate-600",
  Neutral: "border-slate-200 bg-slate-100 text-slate-600",
  "Self-Use": "border-violet-200 bg-violet-50 text-violet-700",
  "Under Renovation": "border-yellow-200 bg-yellow-50 text-yellow-700",
  Pending: "border-yellow-200 bg-yellow-50 text-yellow-700",
  "KYC Pending": "border-yellow-200 bg-yellow-50 text-yellow-700",
  "Registration Pending": "border-yellow-200 bg-yellow-50 text-yellow-700",
  Expiring: "border-yellow-200 bg-yellow-50 text-yellow-700",
  Due: "border-yellow-200 bg-yellow-50 text-yellow-700",
  "Free Period": "border-sky-200 bg-sky-50 text-sky-700",
  Upcoming: "border-sky-200 bg-sky-50 text-sky-700",
  "Under Sale": "border-sky-200 bg-sky-50 text-sky-700",
  "In Use": "border-sky-200 bg-sky-50 text-sky-700",
  "Under Review": "border-sky-200 bg-sky-50 text-sky-700",
  Negotiation: "border-sky-200 bg-sky-50 text-sky-700",
  Partial: "border-yellow-200 bg-yellow-50 text-yellow-700",
  "Under Dispute": "border-rose-200 bg-rose-50 text-rose-700",
  Overdue: "border-rose-200 bg-rose-50 text-rose-700",
  Rejected: "border-rose-200 bg-rose-50 text-rose-700",
  Expired: "border-rose-200 bg-rose-50 text-rose-700",
  "Dead Stock": "border-slate-200 bg-slate-100 text-slate-600",
  "Under Repair": "border-yellow-200 bg-yellow-50 text-yellow-700",
  Decommissioned: "border-rose-200 bg-rose-50 text-rose-700",
  Closed: "border-slate-200 bg-slate-100 text-slate-600",
  "Notice Given": "border-yellow-200 bg-yellow-50 text-yellow-700",
  Vacating: "border-yellow-200 bg-yellow-50 text-yellow-700",
  Approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  "Prospect Submitted": "border-slate-200 bg-slate-100 text-slate-600",
  "Terms Finalised": "border-violet-200 bg-violet-50 text-violet-700",
  "KYC Complete": "border-emerald-200 bg-emerald-50 text-emerald-700",
  "Agreement Drafted": "border-violet-200 bg-violet-50 text-violet-700",
  "Agreement Signed": "border-indigo-200 bg-indigo-50 text-indigo-700",
};

export function StatusBadge({
  value,
  className,
}: {
  value: string | CoverageStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-md font-medium",
        map[value] ?? "border-slate-200 bg-slate-50 text-slate-600",
        className
      )}
    >
      {value}
    </Badge>
  );
}

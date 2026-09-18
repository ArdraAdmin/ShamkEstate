"use client";

import Link from "next/link";
import { notifications, getCompany } from "@/lib/data";
import { daysLeftBadge } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const typeLabel: Record<string, string> = {
  "rent-due": "Rent due",
  "lease-expiring": "Lease expiring",
  "insurance-expiring": "Insurance",
  "amc-expiring": "AMC",
  "poa-expiring": "POA",
  "vacant-followup": "Vacant unit",
};

export function NotificationsSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Reminders</SheetTitle>
          <SheetDescription>
            Rent, leases, insurance, AMC, POA and vacant follow-ups. Demo only — nothing is sent.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] px-4 pb-6">
          <div className="space-y-3">
            {notifications.map((n) => {
              const badge = daysLeftBadge(n.daysLeft);
              return (
                <Link
                  key={n.id}
                  href={n.entityHref}
                  onClick={() => onOpenChange(false)}
                  className="block rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-indigo-200 hover:shadow"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700">
                      {typeLabel[n.type]}
                    </Badge>
                    <Badge variant="outline" className={badge.className}>
                      {badge.label}
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm font-medium text-slate-900">{n.title}</div>
                  <div className="mt-0.5 text-xs text-slate-500">{n.entity}</div>
                  <div className="mt-2 text-[11px] text-slate-400">
                    {getCompany(n.companyId)?.name}
                  </div>
                </Link>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

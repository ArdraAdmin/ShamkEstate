"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { filterPropertiesForScope, prospects } from "@/lib/data";
import type { PipelineStage } from "@/lib/data/types";
import { useDemoStore } from "@/lib/demo-store";
import { useEstateStore } from "@/lib/estate-store";
import { formatDate, formatINR } from "@/lib/format";

const STAGES: PipelineStage[] = [
  "Prospect Submitted",
  "Under Review",
  "Approved",
  "Negotiation",
  "Terms Finalised",
  "KYC Pending",
  "KYC Complete",
  "Agreement Drafted",
  "Agreement Signed",
  "Registration Pending",
  "Registered",
  "Active",
  "Notice Given",
  "Vacating",
  "Closed",
  "Rejected",
];

export default function LeasesPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-500">Loading leases…</div>}>
      <LeasesPageInner />
    </Suspense>
  );
}

function LeasesPageInner() {
  const search = useSearchParams();
  const { companyId, viewAsUser } = useDemoStore();
  const { leases, properties, getTenant, getProperty } = useEstateStore();
  const scopedProps = filterPropertiesForScope(properties, companyId, viewAsUser);
  const ids = new Set(scopedProps.map((p) => p.id));
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const scopedLeases = leases.filter((l) => l.propertyIds.some((id) => ids.has(id)));
  const scopedProspects = prospects.filter((p) => p.propertyIds.some((id) => ids.has(id)));

  const leaseRows = useMemo(
    () =>
      scopedLeases.filter((l) => {
        const t = getTenant(l.tenantId);
        if (!q) return true;
        return `${t?.name} ${l.srNumber}`.toLowerCase().includes(q.toLowerCase());
      }),
    [scopedLeases, q, getTenant]
  );

  const cards = [
    ...scopedProspects,
    ...scopedLeases.map((l) => ({
      id: l.id,
      srNumber: l.srNumber,
      tenantName: getTenant(l.tenantId)?.name ?? "—",
      propertyIds: l.propertyIds,
      broker: getTenant(l.tenantId)?.broker,
      submittedBy: "System",
      stage: l.status,
      expectedRent: l.leaseAmount,
      stageHistory: [],
    })),
  ];

  const uniqueCards = cards.filter(
    (c, i, arr) => arr.findIndex((x) => x.srNumber === c.srNumber) === i
  );

  const prospect = uniqueCards.find((c) => c.id === open || c.srNumber === open);

  return (
    <div>
      <PageHeader
        title="Leases"
        description="Active lease files and prospect pipeline"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Leases" }]}
      />

      <Tabs defaultValue={search.get("tab") === "pipeline" ? "pipeline" : "leases"}>
        <TabsList>
          <TabsTrigger value="leases">Lease list</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
        </TabsList>

        <TabsContent value="leases" className="space-y-3">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tenant or SR…"
            className="max-w-sm"
          />
          <Card>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lease</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Monthly rent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next due</TableHead>
                    <TableHead>Outstanding</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaseRows.map((l) => {
                    const t = getTenant(l.tenantId);
                    return (
                      <TableRow key={l.id}>
                        <TableCell>
                          <Link
                            href={`/leases/${l.id}`}
                            className="font-medium text-indigo-700 hover:underline"
                          >
                            {l.srNumber}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {t ? (
                            <Link
                              href={`/tenants/${t.id}`}
                              className="text-indigo-700 hover:underline"
                            >
                              {t.name}
                            </Link>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          {l.propertyIds
                            .map((id) => getProperty(id)?.code)
                            .filter(Boolean)
                            .join(", ")}
                        </TableCell>
                        <TableCell className="text-xs">
                          {formatDate(l.startDate)} – {formatDate(l.endDate)}
                        </TableCell>
                        <TableCell>{formatINR(l.leaseAmount)}</TableCell>
                        <TableCell>
                          <StatusBadge value={l.status} />
                        </TableCell>
                        <TableCell>{formatDate(l.nextDueDate)}</TableCell>
                        <TableCell>
                          {l.outstanding > 0 ? (
                            <span className="rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">
                              {formatINR(l.outstanding)}
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline">
          <div className="flex gap-3 overflow-x-auto pb-4">
            {STAGES.map((stage) => {
              const col = uniqueCards.filter((c) => c.stage === stage);
              return (
                <div
                  key={stage}
                  className="w-64 shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-2"
                >
                  <div className="mb-2 flex items-center justify-between px-1">
                    <div className="text-xs font-semibold text-slate-700">{stage}</div>
                    <div className="text-[11px] text-slate-400">{col.length}</div>
                  </div>
                  <div className="space-y-2">
                    {col.map((c) => (
                      <button
                        key={c.srNumber}
                        type="button"
                        onClick={() => setOpen(c.id)}
                        className="w-full rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm hover:border-indigo-200"
                      >
                        <div className="text-[11px] font-medium text-indigo-600">{c.srNumber}</div>
                        <div className="mt-0.5 text-sm font-semibold">{c.tenantName}</div>
                        <div className="mt-1 text-[11px] text-slate-500">
                          {c.propertyIds
                            .map((id) => getProperty(id)?.code)
                            .filter(Boolean)
                            .join(", ")}
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <StatusBadge value={c.stage} />
                          <span className="text-[11px] text-slate-400">{c.broker ?? "—"}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={Boolean(open)} onOpenChange={() => setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {prospect?.srNumber} · {prospect?.tenantName}
            </DialogTitle>
          </DialogHeader>
          {prospect ? (
            <div className="space-y-3 text-sm">
              <div>Submitted by {prospect.submittedBy}</div>
              <div>
                Property:{" "}
                {prospect.propertyIds
                  .map((id) => getProperty(id)?.name)
                  .filter(Boolean)
                  .join(", ")}
              </div>
              <div>Expected rent: {formatINR(prospect.expectedRent)}</div>
              <div className="space-y-2">
                {(prospects.find((p) => p.id === prospect.id)?.stageHistory ?? []).map((h) => (
                  <div key={h.id}>
                    <div className="text-xs text-slate-400">{formatDate(h.date)}</div>
                    <div className="font-medium">{h.title}</div>
                    <div className="text-slate-500">{h.description}</div>
                  </div>
                ))}
              </div>
              {leases.some((l) => l.id === prospect.id) && (
                <Button asChild>
                  <Link href={`/leases/${prospect.id}`}>Open lease file</Link>
                </Button>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

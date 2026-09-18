"use client";

import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Building2,
  CircleDollarSign,
  Home,
  Landmark,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  amcContracts,
  dashboardMetrics,
  filterPropertiesForScope,
  leases,
  pipelineSummary,
  properties,
  propertyDocuments,
} from "@/lib/data";
import { daysLeftBadge, daysUntil, formatINR } from "@/lib/format";
import { useDemoStore } from "@/lib/demo-store";

const CHART = {
  indigo: "#4F46E5",
  teal: "#0D9488",
  violet: "#7C3AED",
  sky: "#0EA5E9",
  slate: "#64748B",
};

function Kpi({
  label,
  value,
  hint,
  delta,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  delta: number;
  icon: typeof Banknote;
}) {
  const up = delta >= 0;
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Icon className="size-4" />
          </div>
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-medium ${
              up ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        </div>
        <div className="mt-3 text-xs font-medium text-slate-500">{label}</div>
        <div className="mt-1 text-xl font-semibold tracking-tight text-slate-900">{value}</div>
        {hint ? <div className="mt-1 text-[11px] text-slate-400">{hint}</div> : null}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { companyId, viewAsUser } = useDemoStore();
  const m = dashboardMetrics(companyId, viewAsUser);
  const pipeline = pipelineSummary(companyId, viewAsUser);
  const scopedProps = filterPropertiesForScope(properties, companyId, viewAsUser);

  const statusData = [
    { name: "Occupied", value: m.counts.occupied, color: CHART.indigo },
    { name: "Vacant", value: m.counts.vacant, color: CHART.slate },
    { name: "Self-Use", value: m.counts.selfUse, color: CHART.violet },
    { name: "Renovation", value: m.counts.renovation, color: CHART.sky },
  ];

  const expiries = [
    ...leases
      .filter((l) => scopedProps.some((p) => l.propertyIds.includes(p.id)))
      .map((l) => ({
        id: l.id,
        type: "Lease",
        entity: l.srNumber,
        href: `/leases/${l.id}`,
        date: l.endDate,
        companyId: l.companyId,
      })),
    ...propertyDocuments
      .filter((d) => d.expiresOn)
      .map((d) => ({
        id: d.id,
        type: d.category,
        entity: d.name,
        href: `/properties/${d.entityIds[0]}`,
        date: d.expiresOn!,
        companyId: scopedProps.find((p) => d.entityIds.includes(p.id))?.companyId ?? "",
      })),
    ...amcContracts.map((a) => ({
      id: a.id,
      type: "AMC",
      entity: a.supplier,
      href: "/assets/amc",
      date: a.expiryDate,
      companyId: "c-sm",
    })),
  ]
    .map((e) => ({ ...e, days: daysUntil(e.date) }))
    .filter((e) => e.days <= 90)
    .sort((a, b) => a.days - b.days)
    .slice(0, 8);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Group financial and operational overview · September 2026"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Dashboard" }]}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Kpi
          label="Total monthly rent income"
          value={formatINR(m.monthlyRent, { compact: true })}
          hint={formatINR(m.monthlyRent)}
          delta={3.4}
          icon={Banknote}
        />
        <Kpi
          label="Net income (after property expenses)"
          value={formatINR(m.netIncome, { compact: true })}
          hint={`${formatINR(m.expenses)} expenses this month`}
          delta={2.1}
          icon={CircleDollarSign}
        />
        <Kpi
          label="Vacancy loss / month"
          value={formatINR(m.vacancyLoss, { compact: true })}
          hint={`${m.counts.vacant} vacant units`}
          delta={-1.8}
          icon={Home}
        />
        <Kpi
          label="Total properties"
          value={String(m.counts.total)}
          hint={`${m.counts.occupied} occupied · ${m.counts.vacant} vacant · ${m.counts.selfUse} self-use`}
          delta={0.0}
          icon={Building2}
        />
        <Kpi
          label="Security deposits held"
          value={formatINR(m.deposits, { compact: true })}
          hint={formatINR(m.deposits)}
          delta={1.2}
          icon={Landmark}
        />
        <Kpi
          label="Value marked as self-use"
          value={formatINR(m.selfUseValue, { compact: true })}
          hint="Market rent of owner-occupied units"
          delta={0.4}
          icon={Wallet}
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly income trend</CardTitle>
            <CardDescription>Last 12 months · property-attributable rent</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={m.trend}>
                <defs>
                  <linearGradient id="inc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART.indigo} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={CHART.indigo} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `₹${Math.round(v / 100000)}L`} />
                <Tooltip formatter={(v) => formatINR(Number(v))} />
                <Area type="monotone" dataKey="income" stroke={CHART.indigo} fill="url(#inc)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Income by company</CardTitle>
            <CardDescription>Current monthly rent</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={m.byCompany}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `₹${Math.round(v / 100000)}L`} />
                <Tooltip formatter={(v) => formatINR(Number(v))} />
                <Bar dataKey="income" fill={CHART.teal} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Property status</CardTitle>
            <CardDescription>Occupied / vacant / self-use / renovation</CardDescription>
          </CardHeader>
          <CardContent className="flex h-64 items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={3}>
                  {statusData.map((s) => (
                    <Cell key={s.name} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 pr-4 text-xs">
              {statusData.map((s) => (
                <div key={s.name} className="flex items-center gap-2">
                  <span className="size-2 rounded-full" style={{ background: s.color }} />
                  <span className="text-slate-600">{s.name}</span>
                  <span className="ml-auto font-medium">{s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Income vs expense by city</CardTitle>
            <CardDescription>Property-attributable only</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={m.byCity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `₹${Math.round(v / 100000)}L`} />
                <Tooltip formatter={(v) => formatINR(Number(v))} />
                <Bar dataKey="income" fill={CHART.indigo} radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill={CHART.violet} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/leases">
          <Badge className="cursor-pointer bg-emerald-50 px-3 py-1.5 text-emerald-700 hover:bg-emerald-100">
            {pipeline.active} Active
          </Badge>
        </Link>
        <Link href="/leases?tab=pipeline">
          <Badge className="cursor-pointer bg-yellow-50 px-3 py-1.5 text-yellow-700 hover:bg-yellow-100">
            {pipeline.awaitingReg} Awaiting registration
          </Badge>
        </Link>
        <Link href="/leases?tab=pipeline">
          <Badge className="cursor-pointer bg-sky-50 px-3 py-1.5 text-sky-700 hover:bg-sky-100">
            {pipeline.kycPending} KYC pending
          </Badge>
        </Link>
        <Link href="/leases">
          <Badge className="cursor-pointer bg-violet-50 px-3 py-1.5 text-violet-700 hover:bg-violet-100">
            {pipeline.expireSoon} leases expire within 90 days
          </Badge>
        </Link>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vacant properties needing follow-up</CardTitle>
            <CardDescription>Expected rent and assigned broker</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Expected rent</TableHead>
                  <TableHead>Days vacant</TableHead>
                  <TableHead>Broker</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {m.vacantFollowups.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link href={`/properties/${p.id}`} className="font-medium text-indigo-700 hover:underline">
                        {p.code}
                      </Link>
                      <div className="text-xs text-slate-500">{p.building}</div>
                    </TableCell>
                    <TableCell>{formatINR(p.expectedRent)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-yellow-200 bg-yellow-50 text-yellow-700">
                        {p.daysVacant ?? 0}d
                      </Badge>
                    </TableCell>
                    <TableCell>{p.assignedBroker ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming expiries / reminders</CardTitle>
            <CardDescription>Next 90 days · leases, insurance, AMC, POA</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Days left</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiries.map((e) => {
                  const b = daysLeftBadge(e.days);
                  return (
                    <TableRow key={e.id}>
                      <TableCell>
                        <StatusBadge value={e.type} />
                      </TableCell>
                      <TableCell>
                        <Link href={e.href} className="text-indigo-700 hover:underline">
                          {e.entity}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={b.className}>
                          {b.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

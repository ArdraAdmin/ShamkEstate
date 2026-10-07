"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { filterPropertiesForScope } from "@/lib/data";
import { useDemoStore } from "@/lib/demo-store";
import { useEstateStore } from "@/lib/estate-store";
import { formatINR } from "@/lib/format";

export default function TenantsPage() {
  const { companyId, viewAsUser } = useDemoStore();
  const { tenants, leases, properties } = useEstateStore();
  const [q, setQ] = useState("");

  const scopedProps = filterPropertiesForScope(properties, companyId, viewAsUser);
  const propIds = useMemo(() => new Set(scopedProps.map((p) => p.id)), [scopedProps]);

  const rows = useMemo(() => {
    return tenants
      .map((t) => {
        const tenantLeases = leases.filter((l) => l.tenantId === t.id);
        const scopedLeases = tenantLeases.filter((l) =>
          l.propertyIds.some((id) => propIds.has(id))
        );
        const activeLeases = scopedLeases.filter(
          (l) =>
            l.status === "Active" ||
            l.status === "Registration Pending" ||
            l.status === "KYC Pending" ||
            l.status === "Notice Given"
        );
        const propertyCodes = activeLeases
          .flatMap((l) => l.propertyIds)
          .map((id) => properties.find((p) => p.id === id)?.code)
          .filter(Boolean);
        const rent = activeLeases.reduce((s, l) => s + l.leaseAmount, 0);
        const unassigned = tenantLeases.length === 0;
        const inScope = companyId === "all" || scopedLeases.length > 0 || unassigned;
        return { tenant: t, activeLeases, propertyCodes, rent, inScope };
      })
      .filter((r) => {
        if (!r.inScope) return false;
        if (!q) return true;
        const hay =
          `${r.tenant.name} ${r.tenant.email} ${r.tenant.company} ${r.propertyCodes.join(" ")}`.toLowerCase();
        return hay.includes(q.toLowerCase());
      });
  }, [tenants, leases, properties, propIds, companyId, q]);

  return (
    <div>
      <PageHeader
        title="Tenants"
        description="Tenant profiles — create first, then assign to a property"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Tenants" }]}
        actions={
          <Button asChild>
            <Link href="/tenants/new">
              <Plus className="size-4" /> Create tenant
            </Link>
          </Button>
        }
      />

      <div className="mb-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, email, or property…"
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>KYC</TableHead>
                <TableHead>Active properties</TableHead>
                <TableHead>Monthly rent</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ tenant: t, propertyCodes, rent, activeLeases }) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <Link
                      href={`/tenants/${t.id}`}
                      className="font-medium text-indigo-700 hover:underline"
                    >
                      {t.name}
                    </Link>
                    <div className="text-xs text-slate-400">{t.email}</div>
                  </TableCell>
                  <TableCell>{t.type}</TableCell>
                  <TableCell>
                    <StatusBadge value={t.kycStatus} />
                  </TableCell>
                  <TableCell className="text-xs">
                    {propertyCodes.length ? propertyCodes.join(", ") : "—"}
                  </TableCell>
                  <TableCell>{rent > 0 ? formatINR(rent) : "—"}</TableCell>
                  <TableCell className="text-right">
                    {activeLeases.length === 0 ? (
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/tenants/${t.id}/assign`}>Assign</Link>
                      </Button>
                    ) : (
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/tenants/${t.id}`}>View</Link>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!rows.length && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-slate-500">
                    No tenants match this filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

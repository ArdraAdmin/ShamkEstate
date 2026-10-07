"use client";

import { use } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEstateStore } from "@/lib/estate-store";
import { formatDate, formatINR } from "@/lib/format";

export default function TenantProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { getTenant, leases, getProperty } = useEstateStore();
  const tenant = getTenant(id);

  if (!tenant) {
    return <div className="text-sm text-slate-500">Tenant not found.</div>;
  }

  const tenantLeases = leases
    .filter((l) => l.tenantId === tenant.id)
    .slice()
    .sort((a, b) => b.startDate.localeCompare(a.startDate));

  const hasActive = tenantLeases.some(
    (l) => l.status === "Active" || l.status === "Registration Pending" || l.status === "KYC Pending"
  );

  return (
    <div>
      <PageHeader
        title={tenant.name}
        description={`${tenant.type} · ${tenant.email || "No email"}`}
        crumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Tenants", href: "/tenants" },
          { label: tenant.name },
        ]}
        actions={
          <>
            <StatusBadge value={tenant.kycStatus} />
            <Button asChild>
              <Link href={`/tenants/${tenant.id}/assign`}>Assign to property</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Contact and KYC</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Field label="Type" value={tenant.type} />
            <Field label="Legal / entity" value={tenant.company} />
            <Field label="Email" value={tenant.email || "—"} />
            <Field label="Phone" value={tenant.phone || "—"} />
            <Field label="PAN" value={tenant.pan || "—"} />
            <Field label="Address" value={tenant.address || "—"} />
            <Field label="Broker" value={tenant.broker || "—"} />
            <Field label="KYC" value={tenant.kycStatus} />
            {tenant.notes ? <Field label="Notes" value={tenant.notes} /> : null}
            {!hasActive ? (
              <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                No active lease yet. Assign this tenant to a property to set start/end dates and rent.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Lease history</CardTitle>
            <CardDescription>Assignments and agreements linked to this tenant</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            {tenantLeases.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SR</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Rent</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenantLeases.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell>
                        <Link
                          href={`/leases/${l.id}`}
                          className="font-medium text-indigo-700 hover:underline"
                        >
                          {l.srNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="text-xs">
                        {l.propertyIds
                          .map((pid) => getProperty(pid)?.code)
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="px-6 pb-4 text-sm text-slate-500">No leases yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

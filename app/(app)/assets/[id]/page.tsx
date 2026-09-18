"use client";

import { use } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { Printer } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  assetDocuments,
  assignmentHistory,
  coverageFromDate,
  getAmc,
  getAsset,
  getCompany,
  getProperty,
  maintenanceHistory,
} from "@/lib/data";
import { daysLeftBadge, daysUntil, formatDate, formatINR } from "@/lib/format";

export default function AssetProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const asset = getAsset(id);
  if (!asset) return <div className="text-sm text-slate-500">Asset not found.</div>;

  const amc = asset.amcContractId ? getAmc(asset.amcContractId) : undefined;
  const company = getCompany(asset.companyId);
  const property = asset.propertyId ? getProperty(asset.propertyId) : undefined;
  const moves = assignmentHistory.filter((m) => m.assetId === asset.id);
  const maint = maintenanceHistory.filter((m) => m.assetId === asset.id);
  const docs = assetDocuments.filter((d) => d.entityIds.includes(asset.id));
  const amcBadge = amc ? daysLeftBadge(daysUntil(amc.expiryDate)) : null;

  return (
    <div>
      <PageHeader
        title={asset.name}
        description={`${asset.assetNo} · ${company?.name}`}
        crumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Assets", href: "/assets" },
          { label: asset.assetNo },
        ]}
        actions={
          <>
            <StatusBadge value={asset.status} />
            <Button variant="outline">
              <Printer className="size-4" /> Print label
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>QR label</CardTitle>
            <CardDescription>Scan target is a placeholder.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <QRCodeSVG value={`shamk://asset/${asset.assetNo}`} size={168} level="M" />
            </div>
            <div className="font-mono text-xs text-slate-500">{asset.assetNo}</div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3 text-sm">
              <Field label="Category" value={asset.category} />
              <Field label="Subtype" value={asset.subtype} />
              <Field label="Model" value={asset.model} />
              <Field label="Serial" value={asset.serialNumber} />
              <Field label="Purchase date" value={formatDate(asset.purchaseDate)} />
              <Field label="Purchase price" value={formatINR(asset.purchasePrice)} />
              <Field label="Invoice" value={asset.invoiceNumber} />
              <Field label="Owning company" value={company?.name ?? "—"} />
              <Field
                label="Assigned property"
                value={property ? property.code : "Unassigned"}
              />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>AMC</CardTitle>
                <CardDescription>Independent of warranty. One contract can cover many assets.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {amc ? (
                  <>
                    <Field label="Supplier" value={amc.supplier} />
                    <Field label="Period" value={`${formatDate(amc.startDate)} – ${formatDate(amc.expiryDate)}`} />
                    <Field label="Coverage" value={amc.coverage} />
                    <div className="flex gap-2">
                      <StatusBadge value={coverageFromDate(amc.expiryDate)} />
                      {amcBadge ? <StatusBadge value={amcBadge.label} /> : null}
                    </div>
                    <Link href="/assets/amc" className="text-sm text-indigo-700 hover:underline">
                      View contract · {amc.assetIds.length} assets
                    </Link>
                  </>
                ) : (
                  <p className="text-slate-500">No AMC on this asset.</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Warranty</CardTitle>
                <CardDescription>Shown separately from AMC.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Field label="Cover" value={asset.warrantyLabel} />
                <Field label="Expiry" value={asset.warrantyExpiry ? formatDate(asset.warrantyExpiry) : "—"} />
                <StatusBadge value={coverageFromDate(asset.warrantyExpiry)} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Assignment history</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {moves.length ? moves.map((m) => (
              <div key={m.id} className="flex gap-3 text-sm">
                <div className="mt-1 size-2 rounded-full bg-teal-500" />
                <div>
                  <div className="text-xs text-slate-400">{formatDate(m.date)}</div>
                  <div>
                    {m.fromPropertyId ? getProperty(m.fromPropertyId)?.code ?? "—" : "Unassigned"}
                    {" → "}
                    {m.toPropertyId ? (
                      <Link href={`/properties/${m.toPropertyId}`} className="text-indigo-700 hover:underline">
                        {getProperty(m.toPropertyId)?.code}
                      </Link>
                    ) : "—"}
                  </div>
                  <div className="text-slate-500">{m.note}</div>
                </div>
              </div>
            )) : <p className="text-sm text-slate-500">No moves recorded.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Maintenance history</CardTitle></CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maint.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{formatDate(m.date)}</TableCell>
                    <TableCell>{m.type}</TableCell>
                    <TableCell>{m.vendor}</TableCell>
                    <TableCell className="text-right">{formatINR(m.cost)}</TableCell>
                  </TableRow>
                ))}
                {!maint.length && (
                  <TableRow><TableCell colSpan={4} className="text-slate-500">No service events.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>One invoice can attach to multiple assets.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {docs.map((d) => (
            <div key={d.id} className="rounded-lg border border-slate-200 p-3 text-sm">
              <div className="font-medium">{d.name}</div>
              <div className="text-xs text-slate-500">{d.category} · {formatDate(d.uploadedOn)} · attached to {d.entityIds.length} assets</div>
            </div>
          ))}
          {!docs.length && <p className="text-sm text-slate-500">No documents.</p>}
        </CardContent>
      </Card>
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

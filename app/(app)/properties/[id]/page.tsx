"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FileUp, MapPin } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  assets,
  getCompany,
  getOwner,
  getProperty,
  propertyDocuments,
  propertyExpensesTotal,
  propertyHistory,
} from "@/lib/data";
import { daysLeftBadge, formatDate, formatINR } from "@/lib/format";

export default function PropertyProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const property = getProperty(id);
  const [docOpen, setDocOpen] = useState<string | null>(null);
  const expenseTotal = property ? propertyExpensesTotal(property) : 0;
  const trend = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"].map((m, i) => ({
    m,
    income: Math.round((property?.currentRent ?? 0) * (0.96 + i * 0.008)),
    expense: Math.round(expenseTotal * (0.92 + (i % 2) * 0.04)),
  }));

  if (!property) {
    return <div className="text-sm text-slate-500">Property not found.</div>;
  }

  const company = getCompany(property.companyId);
  const docs = propertyDocuments.filter((d) => d.entityIds.includes(property.id));
  const history = propertyHistory[property.id] ?? [
    {
      id: "fallback",
      date: "2021-01-01",
      title: "Onboarded",
      description: "Property added to the estate register.",
      type: "event" as const,
    },
  ];
  const assignedAssets = assets.filter((a) => a.propertyId === property.id);
  const net = property.currentRent - expenseTotal;

  const shareData = property.ownership.map((s) => ({
    name: getOwner(s.ownerId)?.name ?? s.ownerId,
    value: s.sharePercent,
  }));
  const COLORS = ["#4F46E5", "#7C3AED", "#0D9488", "#0EA5E9"];

  const groups = Array.from(new Set(docs.map((d) => d.category)));

  return (
    <div>
      <PageHeader
        title={property.name}
        description={`${property.code} · ${company?.name}`}
        crumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Properties", href: "/properties" },
          { label: company?.shortName ?? "Company", href: "/properties" },
          { label: property.city, href: "/properties" },
          { label: property.area, href: "/properties" },
          { label: property.building, href: "/properties" },
          { label: `Unit ${property.unitNumber}` },
        ]}
        actions={
          <>
            <StatusBadge value={property.status} />
            <Button variant="outline">Assign tenant</Button>
            <Button>Edit property</Button>
          </>
        }
      />

      <Tabs defaultValue="overview">
        <TabsList className="mb-4 flex h-auto flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="physical">Physical details</TabsTrigger>
          <TabsTrigger value="ownership">Ownership</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Identification</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <Field label="Property ID" value={property.code} />
              <Field label="Name" value={property.name} />
              <Field label="Unit" value={property.unitNumber} />
              <Field label="Company / owner" value={company?.name ?? "—"} />
              <Field label="Building / society" value={property.building} />
              <Field label="Area" value={property.area} />
              <Field label="City" value={property.city} />
              <Field label="State" value={property.state} />
              <Field label="Country" value={property.country} />
              <Field label="PIN" value={property.pin} />
              <div className="col-span-2">
                <Field label="Address" value={property.address} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="size-4 text-indigo-600" /> Location
              </CardTitle>
              <CardDescription>Map placeholder with pin — no live API</CardDescription>
            </CardHeader>
            <CardContent>
              <iframe
                title="map"
                className="h-64 w-full rounded-lg border border-slate-200"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(property.mapQuery)}&z=15&output=embed`}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="physical">
          <Card>
            <CardContent className="grid gap-3 pt-6 sm:grid-cols-3 text-sm">
              <Field label="Type" value={property.type} />
              <Field label="Subtype" value={property.subtype} />
              <Field label="Floor" value={property.floor} />
              {property.bhk !== undefined && <Field label="BHK" value={String(property.bhk || "Studio")} />}
              <Field label="Built-up" value={`${property.builtUp} sq ft`} />
              <Field label="Carpet" value={`${property.carpet} sq ft`} />
              <Field label="Super built-up" value={`${property.superBuiltUp} sq ft`} />
              <Field label="Furnishing" value={property.furnishing} />
              <Field label="Parking count" value={String(property.parkingCount)} />
            </CardContent>
          </Card>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader><CardTitle>Parking units</CardTitle></CardHeader>
              <CardContent>
                {property.parking.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Slot</TableHead>
                        <TableHead>Type</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {property.parking.map((pk) => (
                        <TableRow key={pk.id}>
                          <TableCell>{pk.label}</TableCell>
                          <TableCell>{pk.type}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-slate-500">No linked parking.</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Fixtures</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {property.fixtures.map((f) => (
                  <StatusBadge key={f} value={f} />
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Amenities</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {property.amenities.map((f) => (
                  <StatusBadge key={f} value={f} />
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ownership" className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Owners</CardTitle>
              <CardDescription>Rent is split per these shares every month.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Owner</TableHead>
                    <TableHead>Share</TableHead>
                    <TableHead className="text-right">Rent share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {property.ownership.map((s) => (
                    <TableRow key={s.ownerId}>
                      <TableCell>{getOwner(s.ownerId)?.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={s.sharePercent} className="h-2 w-24" />
                          {s.sharePercent}%
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatINR((property.currentRent * s.sharePercent) / 100)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Share split</CardTitle></CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={shareData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                    {shareData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financials" className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Property P&L</CardTitle>
              <CardDescription>Property-attributable finance only — not group P&L.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row k="Current rent" v={formatINR(property.currentRent)} />
              <Row k="Expected rent" v={formatINR(property.expectedRent)} />
              <Row k="Society charges" v={formatINR(property.expenses.societyCharges)} />
              <Row k="Property tax" v={formatINR(property.expenses.propertyTax)} />
              <Row k="Maintenance" v={formatINR(property.expenses.maintenance)} />
              <Row k="Insurance" v={formatINR(property.expenses.insurance)} />
              <Row k="Repairs" v={formatINR(property.expenses.repairs)} />
              <div className="border-t border-slate-200 pt-2 font-semibold">
                <Row k="Net income" v={formatINR(net)} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Mini trend</CardTitle></CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trend}>
                  <XAxis dataKey="m" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => formatINR(Number(v))} />
                  <Bar dataKey="income" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <div className="mb-3 flex justify-end">
            <Button variant="outline" onClick={() => setDocOpen("upload")}>
              <FileUp className="size-4" /> Upload document
            </Button>
          </div>
          <div className="space-y-5">
            {[...groups, "Other"].filter((g, i, a) => a.indexOf(g) === i).map((cat) => {
              const list = docs.filter((d) => d.category === cat);
              if (!list.length && cat !== "Other") return null;
              if (!list.length) return null;
              return (
                <div key={cat}>
                  <h3 className="mb-2 text-sm font-semibold text-slate-700">{cat}</h3>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {list.map((d) => {
                      const badge = d.expiresOn ? daysLeftBadge(
                        Math.round((new Date(`${d.expiresOn}T00:00:00`).getTime() - new Date("2026-09-12T00:00:00").getTime()) / 86400000)
                      ) : null;
                      return (
                        <Card key={d.id}>
                          <CardContent className="space-y-2 pt-4">
                            <div className="font-medium">{d.name}</div>
                            <div className="text-xs text-slate-500">
                              {formatDate(d.uploadedOn)} · {d.version}
                            </div>
                            {badge ? <StatusBadge value={badge.label} /> : null}
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => setDocOpen(d.id)}>View</Button>
                              <Button size="sm" variant="ghost">Download</Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="space-y-4 pt-6">
              {history.map((h) => (
                <div key={h.id} className="flex gap-3">
                  <div className="mt-1 size-2 shrink-0 rounded-full bg-indigo-500" />
                  <div>
                    <div className="text-xs text-slate-400">{formatDate(h.date)}</div>
                    <div className="text-sm font-medium">{h.title}</div>
                    <div className="text-sm text-slate-500">{h.description}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets">
          <Card>
            <CardContent className="px-0 pt-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset No.</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedAssets.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>
                        <Link href={`/assets/${a.id}`} className="text-indigo-700 hover:underline">
                          {a.assetNo}
                        </Link>
                      </TableCell>
                      <TableCell>{a.category}</TableCell>
                      <TableCell>{a.model}</TableCell>
                      <TableCell><StatusBadge value={a.status} /></TableCell>
                    </TableRow>
                  ))}
                  {!assignedAssets.length && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-slate-500">No assets assigned.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={Boolean(docOpen)} onOpenChange={() => setDocOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{docOpen === "upload" ? "Upload document" : "Document viewer"}</DialogTitle>
          </DialogHeader>
          {docOpen === "upload" ? (
            <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
              Drop a file or click to browse. Demo only — nothing is stored.
              <div className="mt-3"><input type="file" className="text-xs" /></div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-500">
              Placeholder viewer for {docs.find((d) => d.id === docOpen)?.name}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-medium text-slate-900">{value}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{k}</span>
      <span>{v}</span>
    </div>
  );
}

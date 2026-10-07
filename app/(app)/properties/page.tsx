"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LayoutGrid, ListFilter, Plus, Table2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PropertyTree } from "@/components/property-tree";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { companies, filterPropertiesForScope } from "@/lib/data";
import type { PropertyStatus, PropertyType } from "@/lib/data/types";
import { formatINR } from "@/lib/format";
import { useDemoStore } from "@/lib/demo-store";
import { useEstateStore } from "@/lib/estate-store";

export default function PropertiesPage() {
  const { companyId, viewAsUser } = useDemoStore();
  const { properties } = useEstateStore();
  const [view, setView] = useState<"table" | "cards">("table");
  const [tab, setTab] = useState<"all" | "vacant">("all");
  const [city, setCity] = useState("all");
  const [type, setType] = useState<PropertyType | "all">("all");
  const [status, setStatus] = useState<PropertyStatus | "all">("all");
  const [q, setQ] = useState("");
  const [treeFilter, setTreeFilter] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [step, setStep] = useState(1);

  const scoped = filterPropertiesForScope(properties, companyId, viewAsUser);
  const cities = Array.from(new Set(scoped.map((p) => p.city)));

  const rows = useMemo(() => {
    return scoped.filter((p) => {
      if (tab === "vacant" && p.status !== "Vacant") return false;
      if (city !== "all" && p.city !== city) return false;
      if (type !== "all" && p.type !== type) return false;
      if (status !== "all" && p.status !== status) return false;
      if (treeFilter && !`${p.companyId} ${p.state} ${p.city} ${p.area} ${p.building} ${p.id}`.includes(treeFilter))
        return false;
      if (q) {
        const hay = `${p.code} ${p.name} ${p.building} ${p.tenantName ?? ""}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [scoped, tab, city, type, status, q, treeFilter]);

  return (
    <div>
      <PageHeader
        title="Properties"
        description="Company → state → city → area → building → unit"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Properties" }]}
        actions={
          <Button onClick={() => { setAddOpen(true); setStep(1); }}>
            <Plus className="size-4" /> Add Property
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <div className="hidden lg:block">
          <PropertyTree
            properties={scoped}
            onSelect={(p, key) => {
              if (p) setTreeFilter(p.id);
              else setTreeFilter(key ?? null);
            }}
          />
        </div>

        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Tabs value={tab} onValueChange={(v) => setTab(v as "all" | "vacant")}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="vacant">Vacant properties</TabsTrigger>
              </TabsList>
            </Tabs>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search code, name, tenant…"
              className="w-56"
            />
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="w-36"><SelectValue placeholder="City" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All cities</SelectItem>
                {cities.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={type} onValueChange={(v) => setType(v as PropertyType | "all")}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="Commercial">Commercial</SelectItem>
                <SelectItem value="Residential">Residential</SelectItem>
                <SelectItem value="Mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(v) => setStatus(v as PropertyStatus | "all")}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {["Occupied", "Vacant", "Self-Use", "Under Renovation", "Under Dispute", "Under Sale"].map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="ml-auto flex gap-1">
              <Button variant={view === "table" ? "default" : "outline"} size="icon-sm" onClick={() => setView("table")}>
                <Table2 className="size-4" />
              </Button>
              <Button variant={view === "cards" ? "default" : "outline"} size="icon-sm" onClick={() => setView("cards")}>
                <LayoutGrid className="size-4" />
              </Button>
            </div>
          </div>

          {treeFilter ? (
            <Button variant="ghost" size="sm" onClick={() => setTreeFilter(null)}>
              <ListFilter className="size-3.5" /> Clear hierarchy filter
            </Button>
          ) : null}

          {view === "table" ? (
            <Card>
              <CardContent className="px-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Building</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Rent</TableHead>
                      <TableHead>Tenant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <Link href={`/properties/${p.id}`} className="font-medium text-indigo-700 hover:underline">
                            {p.code}
                          </Link>
                        </TableCell>
                        <TableCell>{p.name}</TableCell>
                        <TableCell>{p.type}</TableCell>
                        <TableCell>{p.building}</TableCell>
                        <TableCell>{p.city}</TableCell>
                        <TableCell><StatusBadge value={p.status} /></TableCell>
                        <TableCell className="text-right">
                          {p.status === "Vacant" ? formatINR(p.expectedRent) : formatINR(p.currentRent)}
                        </TableCell>
                        <TableCell>
                          {p.status === "Vacant" ? (
                            <span className="text-xs text-slate-500">Broker: {p.assignedBroker ?? "—"}</span>
                          ) : (
                            p.tenantName ?? "—"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {rows.map((p) => (
                <Link key={p.id} href={`/properties/${p.id}`}>
                  <Card className="h-full transition hover:border-indigo-200 hover:shadow-sm">
                    <CardContent className="space-y-2 pt-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-xs font-medium text-indigo-600">{p.code}</div>
                        <StatusBadge value={p.status} />
                      </div>
                      <div className="font-semibold text-slate-900">{p.name}</div>
                      <div className="text-xs text-slate-500">
                        {p.building} · {p.area}, {p.city}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">{p.type}</span>
                        <span className="font-medium">
                          {formatINR(p.currentRent || p.expectedRent)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <AddPropertyDialog open={addOpen} onOpenChange={setAddOpen} step={step} setStep={setStep} />
    </div>
  );
}

function AddPropertyDialog({
  open,
  onOpenChange,
  step,
  setStep,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  step: number;
  setStep: (n: number) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add property</DialogTitle>
          <DialogDescription>Visual only — nothing is saved. Step {step} of 3.</DialogDescription>
        </DialogHeader>
        {step === 1 && (
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label>Company</Label>
              <Select defaultValue="c-sm">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>State</Label><Input defaultValue="Maharashtra" /></div>
              <div className="space-y-1.5"><Label>City</Label><Input defaultValue="Mumbai" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Area</Label><Input placeholder="Andheri" /></div>
              <div className="space-y-1.5"><Label>Building</Label><Input placeholder="Hera Premium Society" /></div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Unit number</Label><Input placeholder="103" /></div>
              <div className="space-y-1.5"><Label>Type</Label>
                <Select defaultValue="Residential">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Residential">Residential</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5"><Label>Carpet</Label><Input placeholder="1180" /></div>
              <div className="space-y-1.5"><Label>Built-up</Label><Input placeholder="1450" /></div>
              <div className="space-y-1.5"><Label>Parking</Label><Input placeholder="1" /></div>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="grid gap-3">
            <div className="space-y-1.5"><Label>Expected rent (₹)</Label><Input placeholder="85000" /></div>
            <div className="space-y-1.5"><Label>Owner share note</Label><Input defaultValue="100% — assign later" /></div>
          </div>
        )}
        <DialogFooter>
          {step > 1 && <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>}
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)}>Continue</Button>
          ) : (
            <Button onClick={() => onOpenChange(false)}>Create (demo)</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

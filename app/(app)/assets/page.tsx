"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
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
import { Textarea } from "@/components/ui/textarea";
import {
  amcContracts,
  assetCategories,
  assets,
  companies,
  coverageFromDate,
  filterByCompany,
  getCompany,
  getProperty,
} from "@/lib/data";
import type { AssetCategory, AssetStatus } from "@/lib/data/types";
import { useDemoStore } from "@/lib/demo-store";

export default function AssetsPage() {
  const { companyId, viewAsUser } = useDemoStore();
  const scopedIds = viewAsUser?.scope.companyIds;
  const scoped = filterByCompany(assets, companyId, scopedIds?.length ? scopedIds : undefined);
  const [category, setCategory] = useState<AssetCategory | "all">("all");
  const [status, setStatus] = useState<AssetStatus | "all">("all");
  const [supplier, setSupplier] = useState("all");
  const [q, setQ] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);

  const rows = useMemo(
    () =>
      scoped.filter((a) => {
        if (category !== "all" && a.category !== category) return false;
        if (status !== "all" && a.status !== status) return false;
        if (supplier !== "all" && a.amcContractId !== supplier) return false;
        if (q && !`${a.assetNo} ${a.model} ${a.serialNumber}`.toLowerCase().includes(q.toLowerCase()))
          return false;
        return true;
      }),
    [scoped, category, status, supplier, q]
  );

  return (
    <div>
      <PageHeader
        title="Assets"
        description="ACs, appliances, AMC blocks and warranties"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Assets" }]}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/assets/amc">AMC contracts</Link>
            </Button>
            <Button variant="outline" onClick={() => setCatOpen(true)}>Add category</Button>
            <Button variant="outline" onClick={() => setBulkOpen(true)}>Bulk add</Button>
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="size-4" /> Add asset
            </Button>
          </>
        }
      />

      <div className="mb-3 flex flex-wrap gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search asset no / serial" className="w-56" />
        <Select value={category} onValueChange={(v) => setCategory(v as AssetCategory | "all")}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {assetCategories.map((c) => (
              <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setStatus(v as AssetStatus | "all")}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {["In Use", "Dead Stock", "Under Repair", "Decommissioned"].map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={supplier} onValueChange={setSupplier}>
          <SelectTrigger className="w-48"><SelectValue placeholder="AMC supplier" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All suppliers</SelectItem>
            {amcContracts.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.supplier}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset No.</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Serial</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>AMC</TableHead>
                <TableHead>Warranty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((a) => {
                const amc = amcContracts.find((c) => c.id === a.amcContractId);
                return (
                  <TableRow key={a.id}>
                    <TableCell>
                      <Link href={`/assets/${a.id}`} className="font-medium text-indigo-700 hover:underline">
                        {a.assetNo}
                      </Link>
                    </TableCell>
                    <TableCell>{a.category}</TableCell>
                    <TableCell>{a.model}</TableCell>
                    <TableCell className="font-mono text-xs">{a.serialNumber}</TableCell>
                    <TableCell>
                      {a.propertyId ? (
                        <Link href={`/properties/${a.propertyId}`} className="text-indigo-700 hover:underline">
                          {getProperty(a.propertyId)?.code}
                        </Link>
                      ) : "—"}
                    </TableCell>
                    <TableCell>{getCompany(a.companyId)?.shortName}</TableCell>
                    <TableCell><StatusBadge value={a.status} /></TableCell>
                    <TableCell>
                      <StatusBadge value={amc ? coverageFromDate(amc.expiryDate) : "None"} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={coverageFromDate(a.warrantyExpiry)} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add asset</DialogTitle>
            <DialogDescription>Visual only.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Category</Label>
                <Select defaultValue="AC"><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{assetCategories.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Subtype</Label><Input defaultValue="Split" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Model</Label><Input /></div>
              <div className="space-y-1.5"><Label>Serial</Label><Input /></div>
            </div>
            <div className="space-y-1.5"><Label>Company</Label>
              <Select defaultValue="c-sm"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{companies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button onClick={() => setAddOpen(false)}>Save (demo)</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk add assets</DialogTitle>
            <DialogDescription>Paste model + serial pairs — used when 100+ ACs arrive together.</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="grid">
            <TabsList><TabsTrigger value="grid">Spreadsheet</TabsTrigger></TabsList>
          </Tabs>
          <Textarea
            className="min-h-48 font-mono text-xs"
            defaultValue={"Daikin FTKP35\tDKN-FTP-20001\nDaikin FTKP35\tDKN-FTP-20002\nMitsubishi PLA-M\tMTS-PLA-90001"}
          />
          <DialogFooter><Button onClick={() => setBulkOpen(false)}>Import (demo)</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={catOpen} onOpenChange={setCatOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add category</DialogTitle>
            <DialogDescription>Categories are configurable.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5"><Label>Name</Label><Input placeholder="Microwave" /></div>
          <DialogFooter><Button onClick={() => setCatOpen(false)}>Add (demo)</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

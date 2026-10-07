"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { filterPropertiesForScope } from "@/lib/data";
import { useDemoStore } from "@/lib/demo-store";
import { useEstateStore } from "@/lib/estate-store";
import { formatINR } from "@/lib/format";

export function AssignTenantForm({
  tenantId: fixedTenantId,
  propertyId: fixedPropertyId,
}: {
  tenantId?: string;
  propertyId?: string;
}) {
  const router = useRouter();
  const { companyId, viewAsUser } = useDemoStore();
  const { tenants, properties, getTenant, createLease } = useEstateStore();

  const scopedProps = filterPropertiesForScope(properties, companyId, viewAsUser);
  const vacantFirst = useMemo(() => {
    const vacant = scopedProps.filter((p) => p.status === "Vacant");
    const rest = scopedProps.filter((p) => p.status !== "Vacant");
    return [...vacant, ...rest];
  }, [scopedProps]);

  const [tenantId, setTenantId] = useState(fixedTenantId ?? "");
  const [propertyId, setPropertyId] = useState(fixedPropertyId ?? "");
  const [startDate, setStartDate] = useState("2026-10-01");
  const [endDate, setEndDate] = useState("2029-09-30");
  const [leaseAmount, setLeaseAmount] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [lockInMonths, setLockInMonths] = useState("12");
  const [noticePeriodDays, setNoticePeriodDays] = useState("60");
  const [freePeriodMonths, setFreePeriodMonths] = useState("0");
  const [submitting, setSubmitting] = useState(false);

  const selectedProperty = vacantFirst.find((p) => p.id === propertyId);
  const tenant = tenantId ? getTenant(tenantId) : undefined;

  useEffect(() => {
    if (!fixedPropertyId || leaseAmount) return;
    const p = vacantFirst.find((x) => x.id === fixedPropertyId);
    if (!p) return;
    const rent = p.expectedRent || p.currentRent;
    if (rent) {
      setLeaseAmount(String(rent));
      setSecurityDeposit(String(rent * 3));
    }
  }, [fixedPropertyId, vacantFirst, leaseAmount]);

  function onPropertyChange(id: string) {
    setPropertyId(id);
    const p = vacantFirst.find((x) => x.id === id);
    if (p && !leaseAmount) {
      const rent = p.expectedRent || p.currentRent;
      if (rent) {
        setLeaseAmount(String(rent));
        setSecurityDeposit(String(rent * 3));
      }
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId || !propertyId || !selectedProperty) {
      toast.error("Select a tenant and property");
      return;
    }
    const amount = Number(leaseAmount);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid monthly rent");
      return;
    }
    if (endDate <= startDate) {
      toast.error("End date must be after start date");
      return;
    }

    setSubmitting(true);
    const lease = createLease({
      tenantId,
      propertyIds: [propertyId],
      companyId: selectedProperty.companyId,
      leaseAmount: amount,
      startDate,
      endDate,
      securityDeposit: Number(securityDeposit) || amount * 3,
      lockInMonths: Number(lockInMonths) || 12,
      noticePeriodDays: Number(noticePeriodDays) || 60,
      freePeriodMonths: Number(freePeriodMonths) || 0,
    });
    toast.success(`Lease ${lease.srNumber} created for ${tenant?.name ?? "tenant"}`);
    router.push(`/leases/${lease.id}`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lease assignment</CardTitle>
        <CardDescription>
          Link the tenant to a property and set the agreed rent and term.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          {!fixedTenantId ? (
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Tenant</Label>
              <Select value={tenantId} onValueChange={setTenantId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tenant" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} · {t.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="sm:col-span-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
              <div className="text-xs text-slate-500">Tenant</div>
              <div className="font-medium">{tenant?.name ?? "—"}</div>
            </div>
          )}

          <div className="space-y-1.5 sm:col-span-2">
            <Label>Property</Label>
            <Select
              value={propertyId}
              onValueChange={onPropertyChange}
              disabled={Boolean(fixedPropertyId)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                {vacantFirst.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.code} · {p.status}
                    {p.expectedRent ? ` · ${formatINR(p.expectedRent)}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProperty?.status === "Vacant" ? (
              <p className="text-xs text-slate-500">Vacant unit — preferred for new assignments.</p>
            ) : selectedProperty ? (
              <p className="text-xs text-amber-700">
                This unit is currently {selectedProperty.status}. Assigning will mark it Occupied.
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="startDate">Lease start</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="endDate">Lease end</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="leaseAmount">Monthly rent (₹)</Label>
            <Input
              id="leaseAmount"
              type="number"
              min={1}
              value={leaseAmount}
              onChange={(e) => setLeaseAmount(e.target.value)}
              placeholder="85000"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="securityDeposit">Security deposit (₹)</Label>
            <Input
              id="securityDeposit"
              type="number"
              min={0}
              value={securityDeposit}
              onChange={(e) => setSecurityDeposit(e.target.value)}
              placeholder="255000"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lockIn">Lock-in (months)</Label>
            <Input
              id="lockIn"
              type="number"
              min={0}
              value={lockInMonths}
              onChange={(e) => setLockInMonths(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notice">Notice period (days)</Label>
            <Input
              id="notice"
              type="number"
              min={0}
              value={noticePeriodDays}
              onChange={(e) => setNoticePeriodDays(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="freePeriod">Free period (months)</Label>
            <Input
              id="freePeriod"
              type="number"
              min={0}
              value={freePeriodMonths}
              onChange={(e) => setFreePeriodMonths(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              Create lease
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
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
import { Textarea } from "@/components/ui/textarea";
import type { TenantType } from "@/lib/data/types";
import { useEstateStore } from "@/lib/estate-store";

export default function NewTenantPage() {
  const router = useRouter();
  const { createTenant } = useEstateStore();

  const [name, setName] = useState("");
  const [type, setType] = useState<TenantType>("Individual");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [pan, setPan] = useState("");
  const [address, setAddress] = useState("");
  const [broker, setBroker] = useState("");
  const [kycStatus, setKycStatus] = useState<"Complete" | "Pending" | "Partial">("Pending");
  const [notes, setNotes] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    const tenant = createTenant({
      name: name.trim(),
      type,
      email: email.trim(),
      phone: phone.trim(),
      company: company.trim() || (type === "Individual" ? "Individual" : name.trim()),
      kycStatus,
      broker: broker.trim() || undefined,
      pan: pan.trim() || undefined,
      address: address.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    toast.success(`${tenant.name} created`);
    router.push(`/tenants/${tenant.id}`);
  }

  return (
    <div>
      <PageHeader
        title="Create tenant"
        description="Save a profile first — assign a property and lease terms next"
        crumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Tenants", href: "/tenants" },
          { label: "Create" },
        ]}
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Tenant profile</CardTitle>
          <CardDescription>Contact and KYC details. Lease terms are set when you assign a property.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Priya Nair or Apex Digital Pvt Ltd"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select
                value={type}
                onValueChange={(v) => {
                  const next = v as TenantType;
                  setType(next);
                  if (next === "Individual" && !company) setCompany("Individual");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Individual">Individual</SelectItem>
                  <SelectItem value="Company">Company</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>KYC status</Label>
              <Select
                value={kycStatus}
                onValueChange={(v) => setKycStatus(v as "Complete" | "Pending" | "Partial")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Partial">Partial</SelectItem>
                  <SelectItem value="Complete">Complete</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 …"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="company">
                {type === "Company" ? "Legal entity" : "Company / entity"}
              </Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder={type === "Individual" ? "Individual" : "Registered company name"}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pan">PAN</Label>
              <Input
                id="pan"
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                maxLength={10}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Correspondence address"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="broker">Broker</Label>
              <Input
                id="broker"
                value={broker}
                onChange={(e) => setBroker(e.target.value)}
                placeholder="Optional"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal notes"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => router.push("/tenants")}>
                Cancel
              </Button>
              <Button type="submit">Create profile</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

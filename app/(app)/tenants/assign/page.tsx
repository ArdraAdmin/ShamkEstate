"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AssignTenantForm } from "@/components/assign-tenant-form";
import { PageHeader } from "@/components/page-header";
import { useEstateStore } from "@/lib/estate-store";

export default function AssignFromPropertyPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-500">Loading…</div>}>
      <AssignFromPropertyInner />
    </Suspense>
  );
}

function AssignFromPropertyInner() {
  const search = useSearchParams();
  const propertyId = search.get("propertyId") ?? undefined;
  const tenantId = search.get("tenantId") ?? undefined;
  const { getProperty } = useEstateStore();
  const property = propertyId ? getProperty(propertyId) : undefined;

  return (
    <div>
      <PageHeader
        title="Assign tenant"
        description={
          property
            ? `Link a tenant to ${property.code} and set lease terms`
            : "Pick a tenant and property, then set lease terms"
        }
        crumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Tenants", href: "/tenants" },
          { label: "Assign" },
        ]}
      />
      <div className="max-w-2xl">
        <AssignTenantForm tenantId={tenantId} propertyId={propertyId} />
      </div>
    </div>
  );
}

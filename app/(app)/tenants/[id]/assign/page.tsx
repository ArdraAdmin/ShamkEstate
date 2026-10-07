"use client";

import { use } from "react";
import { AssignTenantForm } from "@/components/assign-tenant-form";
import { PageHeader } from "@/components/page-header";
import { useEstateStore } from "@/lib/estate-store";

export default function AssignTenantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { getTenant } = useEstateStore();
  const tenant = getTenant(id);

  if (!tenant) {
    return <div className="text-sm text-slate-500">Tenant not found.</div>;
  }

  return (
    <div>
      <PageHeader
        title="Assign to property"
        description={`Create a lease for ${tenant.name}`}
        crumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Tenants", href: "/tenants" },
          { label: tenant.name, href: `/tenants/${tenant.id}` },
          { label: "Assign" },
        ]}
      />
      <div className="max-w-2xl">
        <AssignTenantForm tenantId={tenant.id} />
      </div>
    </div>
  );
}

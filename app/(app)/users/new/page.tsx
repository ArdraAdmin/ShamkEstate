"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { PermissionBuilder } from "@/components/permission-builder";

export default function NewUserPage() {
  const router = useRouter();
  return (
    <div>
      <PageHeader
        title="Add user"
        description="Role + module access + field matrix + company scope"
        crumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "User Management", href: "/users" },
          { label: "Add user" },
        ]}
      />
      <PermissionBuilder onSave={() => router.push("/users")} />
    </div>
  );
}

"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { PermissionBuilder } from "@/components/permission-builder";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/data";
import { useDemoStore } from "@/lib/demo-store";

export default function UserEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const user = getUser(id);
  const router = useRouter();
  const { setViewAsUserId } = useDemoStore();

  if (!user) return <div className="text-sm text-slate-500">User not found.</div>;

  return (
    <div>
      <PageHeader
        title={user.name}
        description={`${user.role} · ${user.email}`}
        crumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "User Management", href: "/users" },
          { label: user.name },
        ]}
        actions={
          <Button
            variant="outline"
            onClick={() => {
              setViewAsUserId(user.id === "u-admin" ? null : user.id);
              router.push("/properties");
            }}
          >
            View as this user
          </Button>
        }
      />
      <PermissionBuilder user={user} onSave={() => router.push("/users")} />
    </div>
  );
}

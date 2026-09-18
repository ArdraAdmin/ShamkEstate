"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { companies, users } from "@/lib/data";
import { useDemoStore } from "@/lib/demo-store";

export default function UsersPage() {
  const { setViewAsUserId } = useDemoStore();
  const [q] = useState("");

  return (
    <div>
      <PageHeader
        title="User management"
        description="Roles, field-level access, and company isolation"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "User Management" }]}
        actions={
          <Button asChild>
            <Link href="/users/new">
              <Plus className="size-4" /> Add user
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last active</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {users
                .filter((u) => !q || u.name.toLowerCase().includes(q))
                .map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <Link href={`/users/${u.id}`} className="font-medium text-indigo-700 hover:underline">
                        {u.name}
                      </Link>
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.role}</TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {u.scope.companyIds.length
                        ? u.scope.companyIds.map((id) => companies.find((c) => c.id === id)?.shortName).join(", ")
                        : "All companies"}
                    </TableCell>
                    <TableCell><StatusBadge value={u.status} /></TableCell>
                    <TableCell className="text-xs">{u.lastActive}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => setViewAsUserId(u.id === "u-admin" ? null : u.id)}>
                        View as
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

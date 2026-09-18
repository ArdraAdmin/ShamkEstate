"use client";

import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { amcContracts, coverageFromDate } from "@/lib/data";
import { daysLeftBadge, daysUntil, formatDate } from "@/lib/format";

export default function AmcPage() {
  return (
    <div>
      <PageHeader
        title="AMC contracts"
        description="One contract can cover a block of assets — e.g. CoolAir on ~100 ACs."
        crumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Assets", href: "/assets" },
          { label: "AMC contracts" },
        ]}
      />
      <div className="grid gap-4 md:grid-cols-2">
        {amcContracts.map((c) => {
          const days = daysUntil(c.expiryDate);
          const badge = daysLeftBadge(days);
          return (
            <Card key={c.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle>{c.supplier}</CardTitle>
                    <CardDescription>{c.coverage}</CardDescription>
                  </div>
                  <StatusBadge value={coverageFromDate(c.expiryDate)} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Assets covered</span>
                  <span className="font-semibold">{c.assetIds.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Period</span>
                  <span>
                    {formatDate(c.startDate)} – {formatDate(c.expiryDate)}
                  </span>
                </div>
                <Badge variant="outline" className={badge.className}>{badge.label}</Badge>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Linked assets</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {c.assetIds.slice(0, 4).map((id) => (
                      <TableRow key={id}>
                        <TableCell>
                          <Link href={`/assets/${id}`} className="text-indigo-700 hover:underline">
                            {id.replace("a-", "AST · ")}
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                    {c.assetIds.length > 4 && (
                      <TableRow>
                        <TableCell className="text-slate-500">+{c.assetIds.length - 4} more</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

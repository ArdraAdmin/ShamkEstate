"use client";

import { use, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getLease, getOwner, getProperty, getTenant, leaseDocuments } from "@/lib/data";
import { formatDate, formatINR } from "@/lib/format";
import { buildRentSchedule } from "@/lib/rent-schedule";

export default function LeaseProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const lease = getLease(id);
  const [agreement, setAgreement] = useState(false);
  const [vacate, setVacate] = useState(false);
  const [renew, setRenew] = useState(false);
  const [suppress, setSuppress] = useState(lease?.suppressReminders ?? false);

  const schedule = lease
    ? buildRentSchedule({
        baseRent: lease.leaseAmount,
        startDate: lease.startDate,
        endDate: lease.endDate,
        rentCommencementDate: lease.rentCommencementDate,
        freePeriodMonths: lease.freePeriodMonths,
        escalation: lease.escalation,
      })
    : [];

  if (!lease) return <div className="text-sm text-slate-500">Lease not found.</div>;

  const tenant = getTenant(lease.tenantId);
  const props = lease.propertyIds.map(getProperty).filter(Boolean);
  const docs = leaseDocuments.filter((d) => d.entityIds.includes(lease.id));
  const owners = props[0]?.ownership ?? [];

  const chart = schedule
    .filter((_, i) => i % 3 === 0)
    .map((r) => ({ period: r.period, rent: r.appliedRent }));

  return (
    <div>
      <PageHeader
        title={tenant?.name ?? "Lease"}
        description={`${lease.srNumber} · ${props.map((p) => p!.code).join(", ")}`}
        crumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Leases & Tenants", href: "/leases" },
          { label: lease.srNumber },
        ]}
        actions={
          <>
            <StatusBadge value={lease.status} />
            <Button variant="outline" onClick={() => setAgreement(true)}>Generate agreement</Button>
            <Button variant="outline" onClick={() => setRenew(true)}>Renew lease</Button>
            <Button variant="destructive" onClick={() => setVacate(true)}>End lease / vacate</Button>
          </>
        }
      />

      <Tabs defaultValue="terms">
        <TabsList className="mb-4 flex h-auto flex-wrap">
          <TabsTrigger value="terms">Lease terms</TabsTrigger>
          <TabsTrigger value="schedule">Rent schedule</TabsTrigger>
          <TabsTrigger value="splits">Rent splits</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="terms">
          <Card>
            <CardContent className="grid gap-4 pt-6 sm:grid-cols-3 text-sm">
              <Field label="Lease amount" value={formatINR(lease.leaseAmount)} />
              <Field label="Term" value={`${formatDate(lease.startDate)} – ${formatDate(lease.endDate)}`} />
              <Field label="Lock-in" value={`${lease.lockInMonths} months`} />
              <Field label="Free period" value={`${lease.freePeriodMonths} month(s)`} />
              <Field label="Security deposit" value={formatINR(lease.securityDeposit)} />
              <Field label="Token amount" value={formatINR(lease.tokenAmount)} />
              <Field label="Notice period" value={`${lease.noticePeriodDays} days`} />
              <Field
                label="Escalation"
                value={
                  lease.escalation.length
                    ? lease.escalation.map((e) => `${e.percent}% × ${e.years}y`).join(" then ")
                    : "None"
                }
              />
              <Field label="Cheques / ECS" value={lease.chequeDetails} />
              <Field label="Registration" value={lease.registrationDetails} />
            </CardContent>
          </Card>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <DateCard title="Agreement date" date={lease.agreementDate} />
            <DateCard title="Possession date" date={lease.possessionDate} />
            <DateCard title="Registration date" date={lease.registrationDate} />
            <DateCard title="Rent commencement" date={lease.rentCommencementDate} note="Can differ from possession after a free period" />
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rent over time</CardTitle>
              <CardDescription>Stepped escalation applied after free period.</CardDescription>
            </CardHeader>
            <CardContent className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart}>
                  <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => formatINR(Number(v))} />
                  <Bar dataKey="rent" fill="#4F46E5" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Base rent</TableHead>
                    <TableHead>Applied rent</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedule.map((r) => (
                    <TableRow key={r.key}>
                      <TableCell>{r.period}</TableCell>
                      <TableCell>{formatINR(r.baseRent)}</TableCell>
                      <TableCell>{formatINR(r.appliedRent)}</TableCell>
                      <TableCell><StatusBadge value={r.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="splits">
          <Card>
            <CardHeader>
              <CardTitle>Ownership split</CardTitle>
              <CardDescription>
                Each month&apos;s rent is split across owners by share %
                {props[0] ? ` on ${props[0].code}` : ""}.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Owner</TableHead>
                    <TableHead>Share %</TableHead>
                    <TableHead className="text-right">Amount / month</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {owners.map((o) => (
                    <TableRow key={o.ownerId}>
                      <TableCell>{getOwner(o.ownerId)?.name}</TableCell>
                      <TableCell>{o.sharePercent}%</TableCell>
                      <TableCell className="text-right">
                        {formatINR((lease.leaseAmount * o.sharePercent) / 100)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Invoiced</TableHead>
                    <TableHead>Received</TableHead>
                    <TableHead>TDS</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Recorded by</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lease.payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.month}</TableCell>
                      <TableCell>{formatINR(p.invoiced)}</TableCell>
                      <TableCell>{formatINR(p.received)}</TableCell>
                      <TableCell>{formatINR(p.tds)}</TableCell>
                      <TableCell>
                        {p.outstanding > 0 ? (
                          <span className="rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs text-rose-700">
                            {formatINR(p.outstanding)}
                          </span>
                        ) : (
                          formatINR(0)
                        )}
                      </TableCell>
                      <TableCell>{p.date ? formatDate(p.date) : "—"}</TableCell>
                      <TableCell className="text-xs">
                        {p.recordedBy}
                        <div className="text-slate-400">{p.recordedAt}</div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="grid gap-3 sm:grid-cols-2">
          {docs.map((d) => (
            <Card key={d.id}>
              <CardContent className="space-y-1 pt-4 text-sm">
                <div className="font-medium">{d.name}</div>
                <div className="text-xs text-slate-500">{d.category} · {formatDate(d.uploadedOn)} · {d.version}</div>
                <Button size="sm" variant="outline">View</Button>
              </CardContent>
            </Card>
          ))}
          {!docs.length && <p className="text-sm text-slate-500">No documents attached yet.</p>}
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Reminder settings</CardTitle>
              <CardDescription>Reliable payers can have reminders suppressed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <div>
                  <div className="text-sm font-medium">Suppress reminders for this tenant</div>
                  <div className="text-xs text-slate-500">Still visible to accounts; nothing is sent in this demo.</div>
                </div>
                <Switch checked={suppress} onCheckedChange={setSuppress} />
              </div>
              <div>
                <div className="mb-2 text-sm font-medium">Reminder ladder</div>
                <div className="flex flex-wrap gap-2">
                  {["15 days before", "3 days before", "2 days before", "1 day before"].map((l) => (
                    <StatusBadge key={l} value={l} />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={agreement} onOpenChange={setAgreement}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Leave & Licence Agreement — preview</DialogTitle></DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto rounded-lg border border-slate-200 bg-white p-6 text-sm leading-6">
            <div className="text-center font-semibold">LEAVE AND LICENCE AGREEMENT</div>
            <p className="mt-4">
              This agreement is made on {formatDate(lease.agreementDate)} between the Licensor
              ({props[0] ? getProperty(props[0].id)?.building : "the Owner"}) and the Licensee{" "}
              <strong>{tenant?.name}</strong> for premises {props.map((p) => p!.code).join(", ")}.
            </p>
            <p>
              Licence fee of {formatINR(lease.leaseAmount)} per month shall commence on{" "}
              {formatDate(lease.rentCommencementDate)}. Security deposit {formatINR(lease.securityDeposit)}.
              Lock-in {lease.lockInMonths} months. Notice {lease.noticePeriodDays} days.
            </p>
            <p className="text-xs text-slate-500">Demo preview only — no PDF is generated.</p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={renew} onOpenChange={setRenew}>
        <DialogContent>
          <DialogHeader><DialogTitle>Renew lease</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600">
            Proposed new term: {formatDate(lease.endDate)} + 36 months at current applied rent. Visual only.
          </p>
          <DialogFooter><Button onClick={() => setRenew(false)}>Create renewal (demo)</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={vacate} onOpenChange={setVacate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Vacate / settlement</DialogTitle></DialogHeader>
          <div className="space-y-2 text-sm">
            <Row k="Deposit held" v={formatINR(lease.securityDeposit)} />
            <Row k="Deductions (repairs + dues)" v={formatINR(Math.min(25000, lease.outstanding + 8000))} />
            <Row k="Final refund" v={formatINR(lease.securityDeposit - Math.min(25000, lease.outstanding + 8000))} />
          </div>
          <DialogFooter>
            <Button variant="outline">Generate possession letter</Button>
            <Button onClick={() => setVacate(false)}>Complete vacate (demo)</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function DateCard({ title, date, note }: { title: string; date?: string; note?: string }) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="text-xs text-slate-500">{title}</div>
        <div className="text-lg font-semibold">{date ? formatDate(date) : "—"}</div>
        {note ? <div className="mt-1 text-[11px] text-slate-400">{note}</div> : null}
      </CardContent>
    </Card>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}

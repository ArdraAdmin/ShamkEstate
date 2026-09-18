"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { companies, permissionCatalog, properties } from "@/lib/data";
import type { AccessLevel, AppUser, ModuleAccess, UserRole } from "@/lib/data/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const roles: UserRole[] = [
  "Owner/Family",
  "Super Admin",
  "Property Manager",
  "Accounts",
  "Legal",
  "Maintenance",
  "Broker",
  "Tenant",
  "Vendor",
];

const moduleKeys: Array<keyof ModuleAccess> = [
  "properties",
  "assets",
  "leases",
  "financials",
  "userManagement",
  "reports",
];

export function PermissionBuilder({
  user,
  onSave,
}: {
  user?: AppUser;
  onSave?: () => void;
}) {
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [role, setRole] = useState<UserRole>(user?.role ?? "Property Manager");
  const [modules, setModules] = useState<ModuleAccess>(
    user?.modules ?? {
      properties: true,
      assets: true,
      leases: true,
      financials: false,
      userManagement: false,
      reports: true,
    }
  );
  const [access, setAccess] = useState<Record<string, AccessLevel>>(() => {
    const init: Record<string, AccessLevel> = {};
    for (const group of permissionCatalog) {
      for (const resource of group.resources) {
        const key = `${group.module}:${resource}`;
        const existing = user?.permissions.find((p) => p.module === group.module && p.resource === resource);
        init[key] = existing ? (existing.edit ? "edit" : existing.view ? "view" : "none") : "none";
      }
    }
    return init;
  });
  const [companyIds, setCompanyIds] = useState<string[]>(user?.scope.companyIds ?? []);

  const scopedBuildings = useMemo(() => {
    const list = companyIds.length ? properties.filter((p) => companyIds.includes(p.companyId)) : properties;
    return Array.from(new Set(list.map((p) => `${p.city} · ${p.building}`)));
  }, [companyIds]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Identity</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger className="max-w-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              Example: Legal sees lease terms and documents, not rent. Accounts sees rent and P&L, not title papers.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Module access</CardTitle>
          <CardDescription>Toggle entire modules on or off for this user.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {moduleKeys.map((key) => (
            <label key={key} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <span className="capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
              <Switch
                checked={modules[key]}
                onCheckedChange={(v) => setModules({ ...modules, [key]: v })}
              />
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Field / resource access</CardTitle>
          <CardDescription>
            View / Edit / None per resource. This is the matrix the family asked for.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {permissionCatalog.map((group) => (
            <Collapsible key={group.module} defaultOpen={group.module === "leases" || group.module === "financials"}>
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold">
                <span className="flex items-center gap-2">
                  {group.label}
                  {!modules[group.module] && (
                    <Badge variant="outline" className="border-slate-200 text-slate-500">module off</Badge>
                  )}
                </span>
                <ChevronDown className="size-4 text-slate-400" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className={cn("mt-2 overflow-hidden rounded-lg border border-slate-200", !modules[group.module] && "opacity-50")}>
                  <div className="grid grid-cols-[1fr_80px_80px_80px] bg-slate-50 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                    <span>Resource</span>
                    <span className="text-center">View</span>
                    <span className="text-center">Edit</span>
                    <span className="text-center">None</span>
                  </div>
                  {group.resources.map((resource) => {
                    const key = `${group.module}:${resource}`;
                    const value = access[key] ?? "none";
                    return (
                      <RadioGroup
                        key={key}
                        value={value}
                        onValueChange={(v) => setAccess({ ...access, [key]: v as AccessLevel })}
                        className="grid grid-cols-[1fr_80px_80px_80px] items-center border-t border-slate-100 px-3 py-2 text-sm"
                      >
                        <span>{resource}</span>
                        {(["view", "edit", "none"] as AccessLevel[]).map((level) => (
                          <div key={level} className="flex justify-center">
                            <RadioGroupItem value={level} aria-label={`${resource} ${level}`} />
                          </div>
                        ))}
                      </RadioGroup>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scope assignment</CardTitle>
          <CardDescription>
            Limit this user to specific companies — then optionally cities and buildings. Company isolation is the default boundary.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Companies</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {companies.map((c) => {
                const checked = companyIds.includes(c.id);
                return (
                  <label key={c.id} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) =>
                        setCompanyIds(v ? [...companyIds, c.id] : companyIds.filter((id) => id !== c.id))
                      }
                    />
                    <span className="flex-1">{c.name}</span>
                    <span className="text-[11px] text-slate-400">{c.code}</span>
                  </label>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Leave all unchecked for group-wide access (Owner / Super Admin). Checking any company hides the rest.
            </p>
          </div>
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Optional buildings
            </div>
            <div className="grid max-h-48 gap-1 overflow-y-auto rounded-lg border border-slate-200 p-2">
              {scopedBuildings.map((b) => (
                <label key={b} className="flex items-center gap-2 text-sm">
                  <Checkbox /> {b}
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button onClick={onSave}>Save user (demo)</Button>
      </div>
    </div>
  );
}

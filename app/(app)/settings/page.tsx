"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Workspace preferences — visual only in this demo"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Settings" }]}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Organisation</CardTitle>
            <CardDescription>Shown on documents and the sidebar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5"><Label>Display name</Label><Input defaultValue="Shamk Estate" /></div>
            <div className="space-y-1.5"><Label>Registered office</Label><Input defaultValue="Bandra West, Mumbai 400050" /></div>
            <Button>Save (demo)</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reminders</CardTitle>
            <CardDescription>Default ladder for rent and document expiry.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center justify-between text-sm">
              Email reminders <Switch defaultChecked />
            </label>
            <label className="flex items-center justify-between text-sm">
              WhatsApp reminders <Switch />
            </label>
            <p className="text-xs text-slate-500">No messages are sent from this prototype.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

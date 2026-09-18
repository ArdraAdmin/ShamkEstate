"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDemoStore } from "@/lib/demo-store";

export default function LoginPage() {
  const { login, ready, isAuthed } = useDemoStore();
  const [email, setEmail] = useState("admin@estate.com");
  const [password, setPassword] = useState("demo");

  if (!ready || isAuthed) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Redirecting…
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 size-80 rounded-full bg-indigo-200/50 blur-3xl" />
        <div className="absolute -right-16 top-1/4 size-72 rounded-full bg-violet-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 size-72 rounded-full bg-teal-200/30 blur-3xl" />
      </div>
      <Card className="relative w-full max-w-md shadow-lg ring-slate-200">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Building2 className="size-5" />
          </div>
          <div>
            <CardTitle className="text-xl">Shamk Estate</CardTitle>
            <CardDescription className="mt-1">
              Internal admin for the Mahtani real estate group
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              login(email);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@estate.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full">
              Sign in
            </Button>
            <p className="text-center text-xs text-slate-500">Demo — use any credentials.</p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

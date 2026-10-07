import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { DemoStoreProvider } from "@/lib/demo-store";
import { EstateStoreProvider } from "@/lib/estate-store";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shamk Estate — Admin",
  description: "Internal admin prototype for a multi-company real estate group.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-50 font-sans text-slate-900">
        <DemoStoreProvider>
          <EstateStoreProvider>
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </EstateStoreProvider>
        </DemoStoreProvider>
      </body>
    </html>
  );
}

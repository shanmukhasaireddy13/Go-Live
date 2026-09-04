"use client";

import React from "react";
import { SubdomainRecord } from "@/lib/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import {
  Lock,
  Clock,
  Radio,
  Server,
  Trash2,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { DashboardTab } from "./ManageSidebar";

interface CommonLockdownViewProps {
  domain: SubdomainRecord;
  activeTab?: DashboardTab;
  cooldownMinutes?: number;
  cooldownUntil?: string;
}

export function CommonLockdownView({
  domain,
  activeTab = "overview",
  cooldownMinutes = 120,
  cooldownUntil,
}: CommonLockdownViewProps) {
  const resetTimeStr = cooldownUntil
    ? new Date(cooldownUntil).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : `${cooldownMinutes} minutes`;

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in-50 duration-200">
      {/* ─── MAIN UNIFIED LOCKDOWN CARD ─── */}
      <Card className="border-amber-500/40 bg-(--color-card) rounded-xl shadow-xs overflow-hidden">
        <CardHeader className="p-6 border-b border-(--color-rule) bg-amber-500/5 dark:bg-amber-950/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                  <Lock className="w-3 h-3" />
                  <span>COMMON LOCKOUT ACTIVE</span>
                </span>
                <span className="text-[10px] font-mono text-(--color-muted) uppercase">
                  Applies to all tabs
                </span>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-(--color-ink) pt-2">
                {domain.fullDomain}
              </CardTitle>
              <CardDescription className="text-xs text-(--color-muted) mt-1 font-sans">
                This subdomain was deleted. Cloudflare Anycast DNS and Vercel routing have been completely purged from the edge.
              </CardDescription>
            </div>

            <div className="shrink-0 p-3 rounded-lg bg-(--color-card) border border-(--color-rule) text-right font-mono">
              <span className="text-[10px] text-(--color-muted) uppercase block font-bold">Edge Reset In</span>
              <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                {cooldownMinutes}m remaining
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6 text-xs">
          {/* Fair-use explanation requested by user */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
              <span>2-Hour Edge Slot Cooldown Notice</span>
            </div>
            <p className="text-xs leading-relaxed text-(--color-muted) font-sans">
              You already deleted this domain. Wait for <strong>{cooldownMinutes} minutes</strong> (until ~{resetTimeStr}) to reset everything, then you can claim your new subdomain.
            </p>
            <p className="text-[11px] text-(--color-muted) italic pt-1 border-t border-amber-500/20 font-sans">
              Please understand us: this fair-use cooldown protects our free Anycast edge mesh from provider rate limits and keeps Go-Live free for all developers.
            </p>
          </div>

          {/* Unified status across all platform services */}
          <div>
            <h4 className="text-[11px] font-mono uppercase font-bold text-(--color-muted) tracking-wider mb-3">
              Locked Services &amp; Edge State
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
              {/* DNS & Edge Health */}
              <div className="p-4 rounded-xl border border-(--color-rule) bg-(--color-card-subtle) space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-(--color-ink) flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-amber-500" />
                    <span>DNS &amp; Edge Health</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-500/10 text-zinc-500">
                    OFFLINE
                  </span>
                </div>
                <p className="text-[11px] text-(--color-muted) font-sans font-normal">
                  All Anycast records (CNAME/A) purged from Cloudflare. Global nodes are offline for this domain.
                </p>
              </div>

              {/* Vercel Deploy */}
              <div className="p-4 rounded-xl border border-(--color-rule) bg-(--color-card-subtle) space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-(--color-ink) flex items-center gap-1.5">
                    <span className="font-bold text-xs">▲</span>
                    <span>Vercel Integration</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    LOCKED
                  </span>
                </div>
                <p className="text-[11px] text-(--color-muted) font-sans font-normal">
                  Subdomain alias unlinked from Vercel. Project re-linking is locked during cooldown.
                </p>
              </div>

              {/* Custom DNS */}
              <div className="p-4 rounded-xl border border-(--color-rule) bg-(--color-card-subtle) space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-(--color-ink) flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-amber-500" />
                    <span>Custom DNS Targets</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    LOCKED
                  </span>
                </div>
                <p className="text-[11px] text-(--color-muted) font-sans font-normal">
                  Target configuration is locked. No traffic routing or custom VPS IPs can be attached.
                </p>
              </div>

              {/* Subdomain Lifecycle */}
              <div className="p-4 rounded-xl border border-(--color-rule) bg-(--color-card-subtle) space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-(--color-ink) flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    <span>Subdomain Status</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400">
                    RELEASED
                  </span>
                </div>
                <p className="text-[11px] text-(--color-muted) font-sans font-normal">
                  Subdomain released and Anycast routing cleared. Slot resets when cooldown reaches 0.
                </p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 sm:p-5 bg-(--color-card-subtle) border-t border-(--color-rule) flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-(--color-muted)">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
            <span>All modification controls are disabled until the 2-hour cooldown completes.</span>
          </div>
          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
            Resets at ~{resetTimeStr}
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}

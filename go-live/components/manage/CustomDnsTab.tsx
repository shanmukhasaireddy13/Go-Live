"use client";

import React from "react";
import { SubdomainRecord } from "@/lib/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Server, Loader2, ShieldCheck, Lock, Clock } from "lucide-react";

interface CustomDnsTabProps {
  domain: SubdomainRecord;
  customTarget: string;
  customRecordType: "CNAME" | "A";
  isSaving: boolean;
  isLockedDown?: boolean;
  cooldownMinutes?: number;
  onChangeTarget: (target: string) => void;
  onChangeRecordType: (type: "CNAME" | "A") => void;
  onSave: (e: React.FormEvent) => void;
}

export function CustomDnsTab({
  domain,
  customTarget,
  customRecordType,
  isSaving,
  isLockedDown,
  cooldownMinutes,
  onChangeTarget,
  onChangeRecordType,
  onSave,
}: CustomDnsTabProps) {
  const isReleased = isLockedDown || domain.isDeleted || domain.status === "RELEASED";

  if (isReleased) {
    return (
      <div className="space-y-4 max-w-5xl">
        <Card className="border-amber-500/30 bg-(--color-card) rounded-xl shadow-xs overflow-hidden">
          <CardHeader className="p-6 border-b border-(--color-rule)">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
              <Lock className="w-4 h-4" />
              <span>Custom DNS Configuration Locked</span>
            </div>
            <CardTitle className="text-xl font-mono font-black text-(--color-ink) pt-1">
              Subdomain Released &amp; Inactive
            </CardTitle>
            <CardDescription className="text-xs text-(--color-muted)">
              {domain.fullDomain} was released. All Anycast DNS records on Cloudflare have been purged.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-600 dark:text-amber-400">
                <Clock className="w-4 h-4" />
                <span>Edge Cooldown Active: {cooldownMinutes || 120} minutes remaining</span>
              </div>
              <p className="text-[12px] leading-relaxed text-(--color-muted)">
                Custom DNS routing is disabled while this slot is in cooldown. After the 2-hour fair-use window resets, you can claim your new subdomain.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-5xl">
      <Card className="border-(--color-rule) bg-(--color-card) rounded-xl shadow-xs overflow-hidden">
        <CardHeader className="p-6 border-b border-(--color-rule)">
          <CardTitle className="text-base sm:text-lg font-bold text-(--color-ink) flex items-center gap-2">
            <Server className="w-4 h-4 text-(--color-signal)" />
            <span>Custom Server Target</span>
          </CardTitle>
          <CardDescription className="text-xs text-(--color-muted) mt-0.5">
            Point {domain.fullDomain} to your own VPS, Render, Railway, Fly.io, or AWS host.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={onSave} className="space-y-4 max-w-xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-(--color-muted) uppercase font-mono block mb-1.5">
                  Record Type
                </label>
                <select
                  value={customRecordType}
                  onChange={(e) => onChangeRecordType(e.target.value as "CNAME" | "A")}
                  className="w-full bg-(--color-card) border border-(--color-rule) rounded-lg text-xs font-mono h-9 px-2.5 text-(--color-ink) focus:ring-1 focus:ring-(--color-signal) focus:outline-none"
                >
                  <option value="CNAME">CNAME (Hostname)</option>
                  <option value="A">A (IPv4 Address)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-(--color-muted) uppercase font-mono block mb-1.5">
                  {customRecordType === "CNAME" ? "Target CNAME Hostname" : "Server IPv4 Address"}
                </label>
                <Input
                  type="text"
                  placeholder={customRecordType === "CNAME" ? "myapp.fly.dev" : "192.0.2.1"}
                  value={customTarget}
                  onChange={(e) => onChangeTarget(e.target.value)}
                  className="font-mono text-xs h-9 bg-(--color-card) border-(--color-rule)"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Button
                type="submit"
                disabled={isSaving || !customTarget.trim()}
                className="bg-(--color-signal) text-white hover:opacity-90 font-bold text-xs h-9 px-5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    <span>Updating Cloudflare...</span>
                  </>
                ) : (
                  <span>Save Target &amp; Update Anycast</span>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-(--color-rule) space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-(--color-ink)">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Global Anycast Acceleration</span>
            </div>
            <p className="text-xs text-(--color-muted) max-w-xl leading-relaxed font-sans">
              When using custom DNS targets, traffic routes through Cloudflare&apos;s global 300+ city edge network before reaching your origin server.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

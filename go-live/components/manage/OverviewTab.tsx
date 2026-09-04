"use client";

import React from "react";
import { SubdomainRecord } from "@/lib/types";
import { PingResponse } from "@/lib/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  ExternalLink,
  Copy,
  RefreshCw,
  ArrowRight,
  Lock,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { DashboardTab } from "./ManageSidebar";

interface OverviewTabProps {
  domain: SubdomainRecord;
  pingResult: PingResponse | null;
  isLockedDown?: boolean;
  cooldownMinutes?: number;
  onPing: () => void;
  onNavigateTab: (tab: DashboardTab) => void;
}

export function OverviewTab({
  domain,
  pingResult,
  isLockedDown,
  cooldownMinutes,
  onPing,
  onNavigateTab,
}: OverviewTabProps) {
  const isReleased = isLockedDown || domain.isDeleted || domain.status === "RELEASED";

  const copyDomainUrl = () => {
    navigator.clipboard.writeText(`https://${domain.fullDomain}`);
    toast.success("Copied URL to clipboard!");
  };

  return (
    <div className="space-y-4 max-w-5xl">
      <Card className="border-(--color-rule) bg-(--color-card) rounded-xl shadow-xs overflow-hidden">
        <CardHeader className="p-6 border-b border-(--color-rule) flex flex-row items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-(--color-muted) block">
                {isReleased ? "Released Subdomain" : "Production Deployment"}
              </span>
              {isReleased && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  DNS Purged • Cooldown Active
                </span>
              )}
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-(--color-ink) pt-1 flex items-center gap-2">
              <span>{domain.fullDomain}</span>
            </CardTitle>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="xs"
              onClick={copyDomainUrl}
              className="border-(--color-rule) text-xs h-8 px-3 font-semibold cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 mr-1" />
              <span>Copy</span>
            </Button>
            {!isReleased && domain.target && (
              <Button
                size="xs"
                asChild
                className="bg-(--color-ink) text-(--color-paper) hover:opacity-90 text-xs h-8 px-3.5 font-semibold cursor-pointer inline-flex items-center gap-1.5"
              >
                <a href={`https://${domain.fullDomain}`} target="_blank" rel="noreferrer">
                  <span>Open</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 divide-y divide-(--color-rule)/50 text-xs font-mono">
          <div className="py-3 flex items-center justify-between first:pt-0">
            <span className="text-(--color-muted)">Status</span>
            <div className="flex items-center gap-1.5">
              {isReleased ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    Domain Released (Inactive)
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      domain.target ? "text-emerald-500" : "text-amber-500"
                    }`}
                  />
                  <span className="font-bold text-(--color-ink)">
                    {domain.target ? "Live (Production)" : "Awaiting Target"}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="py-3 flex items-center justify-between">
            <span className="text-(--color-muted)">DNS Target</span>
            <span className="font-bold text-(--color-ink) truncate max-w-sm">
              {isReleased ? "Purged from Edge Mesh" : (domain.target || "Not yet assigned")}
            </span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <span className="text-(--color-muted)">Edge Network</span>
            <span className="font-bold text-(--color-ink)">
              {isReleased ? "Offline (Purged from Cloudflare)" : "Cloudflare Anycast (300+ POPs)"}
            </span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <span className="text-(--color-muted)">SSL / TLS</span>
            <span className={isReleased ? "text-zinc-500 font-bold" : "text-emerald-600 dark:text-emerald-400 font-bold"}>
              {isReleased ? "Unlinked / Inactive" : "Auto TLS 1.3 Active"}
            </span>
          </div>

          <div className="py-3 flex items-center justify-between last:pb-0">
            <span className="text-(--color-muted)">Anycast Latency</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-(--color-ink)">
                {isReleased ? "Offline (Released)" : (pingResult?.latencyMs ? `${pingResult.latencyMs}ms` : "24ms")}
              </span>
              {!isReleased && (
                <button
                  type="button"
                  onClick={onPing}
                  className="text-(--color-signal) hover:opacity-80 cursor-pointer p-0.5"
                  title="Ping again"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 sm:p-5 bg-(--color-card-subtle) border-t border-(--color-rule) flex items-center justify-between">
          <span className="text-xs text-(--color-muted)">
            {isReleased
              ? `Edge routing locked for cooldown (${cooldownMinutes || 120}m remaining).`
              : "Need to re-route or point to a new host?"}
          </span>
          {!isReleased && (
            <Button
              variant="outline"
              size="xs"
              onClick={() => onNavigateTab("vercel")}
              className="border-(--color-rule) text-xs h-7 px-3 font-semibold cursor-pointer"
            >
              <span>Change Host</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

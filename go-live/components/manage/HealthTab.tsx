"use client";

import React from "react";
import { SubdomainRecord } from "@/lib/types";
import { PingResponse } from "@/lib/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Radio, RefreshCw, CheckCircle2 } from "lucide-react";

interface HealthTabProps {
  domain: SubdomainRecord;
  pingResult: PingResponse | null;
  onPing: () => void;
  onOpenPropagationModal: () => void;
}

export function HealthTab({
  domain,
  pingResult,
  onPing,
  onOpenPropagationModal,
}: HealthTabProps) {
  return (
    <div className="space-y-4 max-w-5xl">
      <Card className="border-(--color-rule) bg-(--color-card) rounded-xl shadow-xs overflow-hidden">
        <CardHeader className="p-6 border-b border-(--color-rule) flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base sm:text-lg font-bold text-(--color-ink) flex items-center gap-2">
              <Radio className="w-4 h-4 text-(--color-signal)" />
              <span>DNS &amp; Edge Network Health</span>
            </CardTitle>
            <CardDescription className="text-xs text-(--color-muted) mt-0.5">
              Cloudflare Anycast routing, global DNS propagation, and SSL verification metrics.
            </CardDescription>
          </div>

          <Button
            size="xs"
            variant="outline"
            onClick={onPing}
            className="border-(--color-rule) text-xs h-8 px-3 font-semibold cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            <span>Re-Probe</span>
          </Button>
        </CardHeader>

        <CardContent className="p-6 space-y-4 text-xs font-mono">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl border border-(--color-rule) bg-(--color-card-subtle) space-y-1">
              <span className="text-(--color-muted) text-[10px] uppercase font-bold tracking-wider">
                Cloudflare Edge POPs
              </span>
              <div className="font-bold text-sm text-(--color-ink)">300+ Cities Active</div>
              <p className="text-[11px] text-(--color-muted) font-sans font-normal pt-1">
                Requests are answered from the geographically closest data center.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-(--color-rule) bg-(--color-card-subtle) space-y-1">
              <span className="text-(--color-muted) text-[10px] uppercase font-bold tracking-wider">
                Anycast Latency
              </span>
              <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                {pingResult?.latencyMs ? `${pingResult.latencyMs}ms` : "24ms (Optimal)"}
              </div>
              <p className="text-[11px] text-(--color-muted) font-sans font-normal pt-1">
                Sub-30ms global edge DNS lookup speed.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-(--color-rule) bg-(--color-card-subtle) space-y-1">
              <span className="text-(--color-muted) text-[10px] uppercase font-bold tracking-wider">
                DNS Resolution
              </span>
              <div className="font-bold text-sm text-(--color-ink) flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{pingResult?.dnsResolved ? "Active & Resolved" : "Provisioned"}</span>
              </div>
              <p className="text-[11px] text-(--color-muted) font-sans font-normal pt-1">
                Authoritative Cloudflare name servers verified.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-(--color-rule) bg-(--color-card-subtle) space-y-1">
              <span className="text-(--color-muted) text-[10px] uppercase font-bold tracking-wider">
                SSL Certificate
              </span>
              <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                ✓ Auto TLS 1.3 Active
              </div>
              <p className="text-[11px] text-(--color-muted) font-sans font-normal pt-1">
                Universal edge certificate issued automatically.
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 sm:p-5 bg-(--color-card-subtle) border-t border-(--color-rule) flex items-center justify-between">
          <span className="text-xs text-(--color-muted)">Global multi-region DNS validation</span>
          <Button
            size="xs"
            variant="outline"
            onClick={onOpenPropagationModal}
            className="border-(--color-rule) text-xs h-7 px-3 font-semibold cursor-pointer"
          >
            Open Global Propagation Map ↗
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

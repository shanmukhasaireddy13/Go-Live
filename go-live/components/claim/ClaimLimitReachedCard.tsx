"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowRight } from "lucide-react";
import { ROOT_DOMAIN } from "@/lib/constants";

interface ClaimLimitReachedCardProps {
  existingSubdomain: {
    name: string;
    fullDomain: string;
    target?: string;
  };
  name?: string;
}

export function ClaimLimitReachedCard({ existingSubdomain, name }: ClaimLimitReachedCardProps) {
  const router = useRouter();

  return (
    <main className="max-w-xl w-full mx-auto px-4 sm:px-6 py-12 my-auto">
      <Card className="border-(--color-rule) bg-(--color-card) rounded-2xl shadow-xl overflow-hidden p-6 sm:p-8 space-y-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-7 h-7 text-(--color-signal)" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-(--color-card-subtle) border border-(--color-rule) text-[11px] font-mono text-(--color-muted)">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>1 Free Subdomain In Use</span>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-black text-(--color-ink) tracking-tight">
            Subdomain Limit Reached
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-(--color-muted) max-w-md mx-auto leading-relaxed">
            Each developer is allocated <strong>1 free Anycast edge subdomain</strong> forever. You already own an active subdomain:
          </CardDescription>
        </div>

        {/* Existing Subdomain Highlight Card */}
        <div className="p-4 rounded-xl bg-(--color-card-subtle) border border-(--color-rule) text-left space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-bold text-(--color-muted)">Active Subdomain</span>
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">● Live Anycast</span>
          </div>
          <div className="font-mono font-black text-xl text-(--color-ink) truncate">
            {existingSubdomain.fullDomain}
          </div>
          <div className="text-[11px] font-mono text-(--color-muted) flex items-center justify-between border-t border-(--color-rule)/50 pt-2">
            <span>Routing Target:</span>
            <span className="font-bold text-(--color-ink) truncate max-w-xs">
              {existingSubdomain.target || "Vercel Anycast"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <Button
            onClick={() => router.push(`/manage?name=${encodeURIComponent(existingSubdomain.name)}`)}
            className="w-full bg-(--color-ink) text-(--color-paper) hover:opacity-90 font-bold py-3 text-xs h-10 cursor-pointer shadow-xs flex items-center justify-center gap-2"
          >
            <span>Go to Dashboard ({existingSubdomain.fullDomain})</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <p className="text-[11px] text-(--color-muted) leading-relaxed">
            Want to claim <strong>{name ? `${name}.${ROOT_DOMAIN}` : "another subdomain"}</strong>? You can release your current subdomain in your dashboard (subject to a 2-hour cooldown).
          </p>
        </div>
      </Card>
    </main>
  );
}

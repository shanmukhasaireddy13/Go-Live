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
import { Trash2, Clock, ShieldAlert, Lock } from "lucide-react";

interface DangerTabProps {
  domain: SubdomainRecord;
  isLockedDown?: boolean;
  cooldownMinutes?: number;
  onOpenDeleteModal: () => void;
}

export function DangerTab({ domain, isLockedDown, cooldownMinutes, onOpenDeleteModal }: DangerTabProps) {
  const isReleased = isLockedDown || domain.isDeleted || domain.status === "RELEASED";

  return (
    <div className="space-y-4 max-w-5xl">
      <Card className="border-red-200 dark:border-red-900/40 bg-(--color-card) rounded-xl shadow-xs overflow-hidden">
        <CardHeader className="p-6 border-b border-red-100 dark:border-red-900/30">
          <CardTitle className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
            {isReleased ? <Lock className="w-4 h-4 text-amber-500" /> : <Trash2 className="w-4 h-4" />}
            <span>{isReleased ? "Subdomain Already Released" : "Release Subdomain"}</span>
          </CardTitle>
          <CardDescription className="text-xs text-(--color-muted) mt-0.5">
            {isReleased
              ? `${domain.fullDomain} is already released and purged from Cloudflare Anycast and Vercel.`
              : `Permanently release ${domain.fullDomain} and purge all Anycast DNS records from Cloudflare.`}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-4 text-xs">
          {isReleased ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-600 dark:text-amber-400">
                <Clock className="w-4 h-4" />
                <span>Account Cooldown Active</span>
              </div>
              <p className="text-[12px] leading-relaxed text-(--color-muted) font-sans">
                You already deleted this domain. Please wait <strong>{cooldownMinutes || 120} minutes</strong> for the system to reset everything. Once the cooldown timer expires, you can claim your new subdomain.
              </p>
              <p className="text-[11px] text-(--color-muted) italic pt-1">
                Please understand us: this fair-use cooldown protects our free Anycast edge mesh from provider rate limits and keeps Go-Live free for all developers.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>2-Hour Registration Cooldown Notice</span>
              </div>
              <p className="text-[12px] leading-relaxed text-(--color-muted) font-sans">
                To prevent Cloudflare rate-limits, releasing your subdomain initiates a <strong>2-hour cooldown</strong> on your GitHub account before you can claim another subdomain.
              </p>
            </div>
          )}

          <div className="pt-2">
            {isReleased ? (
              <Button
                disabled
                size="sm"
                className="bg-zinc-400 dark:bg-zinc-700 text-white text-xs font-semibold h-9 px-5 opacity-60 cursor-not-allowed"
              >
                <Lock className="w-3.5 h-3.5 mr-2" />
                <span>Already Released • Wait {cooldownMinutes || 120}m</span>
              </Button>
            ) : (
              <Button
                variant="destructive"
                size="sm"
                onClick={onOpenDeleteModal}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold h-9 px-5 cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" />
                <span>Release {domain.fullDomain}</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

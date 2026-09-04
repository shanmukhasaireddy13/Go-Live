"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Clock, ArrowRight, Loader2 } from "lucide-react";

interface ClaimStep3DeployProps {
  fullDomain: string;
  username?: string;
  cooldownError: string | null;
  isRegistering: boolean;
  onProceed: () => void;
}

export function ClaimStep3Deploy({
  fullDomain,
  username,
  cooldownError,
  isRegistering,
  onProceed,
}: ClaimStep3DeployProps) {
  return (
    <Card className="border-emerald-300 dark:border-emerald-800 bg-(--color-card) rounded-xl shadow-lg overflow-hidden">
      <CardHeader className="p-6 sm:p-7 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-extrabold text-(--color-ink) font-mono">
              Subdomain Locked &amp; Ready
            </CardTitle>
            <CardDescription className="text-xs text-(--color-muted)">
              Reserved to @{username || "developer"} &bull; Anycast DNS slot allocated
            </CardDescription>
          </div>
        </div>

        {cooldownError ? (
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-2 text-left">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4 shrink-0" />
              <span>2-Hour Cooldown Active</span>
            </div>
            <p className="text-xs text-(--color-muted) leading-relaxed">
              {cooldownError}
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-md bg-(--color-card-subtle) border border-(--color-rule) space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-(--color-muted)">Subdomain:</span>
              <span className="font-bold text-(--color-ink)">{fullDomain}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-(--color-muted)">Owner:</span>
              <span className="font-bold text-(--color-ink)">@{username || "developer"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-(--color-muted)">Status:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Ready for Hosting</span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardFooter className="bg-(--color-card-subtle) border-t border-(--color-rule) px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-xs text-(--color-muted)">
          {cooldownError ? "Registration paused during cooldown" : "Choose Vercel or Custom DNS"}
        </span>
        <Button
          disabled={Boolean(cooldownError) || isRegistering}
          onClick={onProceed}
          className="w-full sm:w-auto bg-(--color-signal) text-white hover:opacity-90 font-bold px-5 py-2.5 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
        >
          {isRegistering ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Locking Slot...</span>
            </>
          ) : (
            <>
              <span>Choose Hosting &amp; Go Live</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

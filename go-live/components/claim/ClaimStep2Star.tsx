"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Check, Loader2 } from "lucide-react";
import { GITHUB_REPO_NAME } from "@/lib/constants";

interface ClaimStep2StarProps {
  username?: string;
  isVerifyingStar: boolean;
  onOpenRepo: () => void;
  onVerifyStar: () => void;
}

export function ClaimStep2Star({
  username,
  isVerifyingStar,
  onOpenRepo,
  onVerifyStar,
}: ClaimStep2StarProps) {
  return (
    <Card className="border-(--color-rule) bg-(--color-card) rounded-xl shadow-lg overflow-hidden">
      <CardHeader className="p-6 sm:p-7 space-y-3">
        <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
          <Star className="w-5 h-5 fill-current" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-lg font-extrabold text-(--color-ink)">
            Star {GITHUB_REPO_NAME}
          </CardTitle>
          <CardDescription className="text-xs text-(--color-muted) leading-relaxed">
            Signed in as <strong>@{username || "developer"}</strong>. Star our open-source repo to unlock your free Anycast slot.
          </CardDescription>
        </div>
      </CardHeader>

      <CardFooter className="bg-(--color-card-subtle) border-t border-(--color-rule) p-6 sm:p-7 flex flex-col gap-3">
        <Button
          onClick={onOpenRepo}
          className="w-full bg-(--color-ink) text-(--color-paper) hover:opacity-90 font-bold py-3 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span>Star on GitHub ↗</span>
        </Button>

        <Button
          variant="outline"
          disabled={isVerifyingStar}
          onClick={onVerifyStar}
          className="w-full border-(--color-rule) bg-(--color-card) text-(--color-ink) hover:bg-(--color-card-subtle) font-bold py-3 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          {isVerifyingStar ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying Star...</span>
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Verify &amp; Unlock Slot</span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Clock } from "lucide-react";

interface NoSubdomainCardProps {
  username?: string;
  cooldownData?: { active: boolean; cooldownMinutes: number; cooldownUntil: string } | null;
}

export function NoSubdomainCard({ username, cooldownData }: NoSubdomainCardProps) {
  const router = useRouter();

  return (
    <div className="flex-1 flex items-center justify-center p-6 my-12">
      <Card className="border-(--color-rule) bg-(--color-card) max-w-md w-full p-8 text-center space-y-4 rounded-xl shadow-xs">
        <div className="w-10 h-10 rounded-full bg-(--color-card-subtle) border border-(--color-rule) flex items-center justify-center mx-auto text-(--color-signal)">
          <Globe className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-base font-bold text-(--color-ink)">No Subdomain Claimed</CardTitle>
          <CardDescription className="text-xs text-(--color-muted)">
            Signed in as <strong>@{username || "developer"}</strong>.
          </CardDescription>
        </div>

        {cooldownData?.active ? (
          <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-left text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
              <Clock className="w-3.5 h-3.5" />
              <span>2-Hour Cooldown Active</span>
            </div>
            <p className="text-(--color-muted) text-[11px]">
              You recently released a domain. You can claim a new domain in <strong>{cooldownData.cooldownMinutes} minutes</strong>.
            </p>
          </div>
        ) : (
          <Button
            onClick={() => router.push("/")}
            className="bg-(--color-ink) text-(--color-paper) hover:opacity-90 font-bold text-xs px-4 py-2 cursor-pointer shadow-xs"
          >
            Claim a Subdomain &rarr;
          </Button>
        )}
      </Card>
    </div>
  );
}

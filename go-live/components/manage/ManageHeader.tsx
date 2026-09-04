"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { UserSession } from "@/lib/domain-service";
import { SubdomainRecord } from "@/lib/types";
import { GITHUB_REPO_URL } from "@/lib/constants";
import { GithubIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ExternalLink, LogOut, Lock } from "lucide-react";

interface ManageHeaderProps {
  domain: SubdomainRecord | null;
  user: UserSession | null;
  isLockedDown?: boolean;
  onSignOut: () => void;
}

export function ManageHeader({ domain, user, isLockedDown, onSignOut }: ManageHeaderProps) {
  const router = useRouter();
  const isReleased = isLockedDown || domain?.isDeleted || domain?.status === "RELEASED";

  return (
    <header className="h-14 border-b border-(--color-rule) bg-(--color-card) px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-2 text-xs font-mono">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 font-bold text-(--color-ink) hover:opacity-80 transition-opacity cursor-pointer"
        >
          <span className="text-sm font-black text-(--color-signal)">▲</span>
          <span>Go-Live</span>
        </button>
        <span className="text-(--color-rule)">/</span>
        <div className="flex items-center gap-1.5 truncate max-w-[200px] sm:max-w-none">
          {isReleased && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" />
              <span>RELEASED</span>
            </span>
          )}
          <span className="text-(--color-ink) font-semibold truncate">
            {domain?.fullDomain || "Dashboard"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 text-xs font-medium">
        {!isReleased && domain?.target && (
          <Button
            size="xs"
            asChild
            className="bg-(--color-signal) text-white hover:opacity-90 font-bold px-3 shadow-xs h-7 flex items-center gap-1"
          >
            <a href={`https://${domain.fullDomain}`} target="_blank" rel="noreferrer">
              <span>Visit Site</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </Button>
        )}

        {user && (
          <div className="flex items-center gap-2 pr-1 border-r border-(--color-rule)">
            <span className="font-mono text-xs text-(--color-muted) hidden sm:inline">@{user.githubUsername}</span>
            <button
              onClick={onSignOut}
              title="Sign out"
              className="text-(--color-muted) hover:text-red-500 transition-colors cursor-pointer p-1"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <Button
          variant="outline"
          size="xs"
          asChild
          className="border-(--color-rule) bg-(--color-card) text-(--color-ink) text-xs font-semibold h-7"
        >
          <a href={GITHUB_REPO_URL} target="_blank" rel="noreferrer" className="flex items-center gap-1.5">
            <GithubIcon className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Star</span>
          </a>
        </Button>
      </div>
    </header>
  );
}

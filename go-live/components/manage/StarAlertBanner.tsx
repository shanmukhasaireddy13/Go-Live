"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { GITHUB_REPO_NAME } from "@/lib/constants";

interface StarAlertBannerProps {
  isReVerifying: boolean;
  onReVerify: () => void;
}

export function StarAlertBanner({ isReVerifying, onReVerify }: StarAlertBannerProps) {
  return (
    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 flex items-center justify-between gap-3 text-xs max-w-5xl">
      <span className="text-red-600 dark:text-red-400 font-medium">
        Star required: Please star <strong>{GITHUB_REPO_NAME}</strong> on GitHub to keep your domain active.
      </span>
      <Button
        size="xs"
        disabled={isReVerifying}
        onClick={onReVerify}
        className="bg-red-600 text-white hover:bg-red-700 text-xs h-7 px-3 font-semibold"
      >
        {isReVerifying ? "Checking..." : "Re-Verify"}
      </Button>
    </div>
  );
}

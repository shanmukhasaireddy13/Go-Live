"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ClaimNavbar() {
  const router = useRouter();

  return (
    <header className="h-14 border-b border-(--color-rule) bg-(--color-card) px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-2 text-xs font-mono">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 font-bold text-(--color-ink) hover:opacity-80 transition-opacity cursor-pointer"
        >
          <span className="text-sm font-black text-(--color-signal)">▲</span>
          <span>Go-Live</span>
        </button>
        <span className="text-(--color-rule)">/</span>
        <span className="text-(--color-muted)">Claim Domain</span>
      </div>

      <Button
        variant="outline"
        size="xs"
        onClick={() => router.push("/")}
        className="border-(--color-rule) text-xs font-mono cursor-pointer"
      >
        Cancel
      </Button>
    </header>
  );
}

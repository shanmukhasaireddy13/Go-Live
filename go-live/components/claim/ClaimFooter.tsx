"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ROOT_DOMAIN, GITHUB_REPO_URL } from "@/lib/constants";

export function ClaimFooter() {
  const router = useRouter();

  return (
    <footer className="max-w-5xl w-full mx-auto py-6 border-t border-(--color-rule) flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-(--color-muted) font-mono px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <span>{ROOT_DOMAIN}</span>
        <span>&bull;</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Anycast Active</span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/terms")}
          className="hover:text-(--color-ink) transition-colors cursor-pointer"
        >
          Terms
        </button>
        <button
          onClick={() => router.push("/privacy")}
          className="hover:text-(--color-ink) transition-colors cursor-pointer"
        >
          Privacy
        </button>
        <button
          onClick={() => router.push("/feedback")}
          className="hover:text-(--color-ink) transition-colors cursor-pointer text-emerald-600 dark:text-emerald-400 font-semibold"
        >
          Feedback
        </button>
        <button
          onClick={() => router.push("/issues")}
          className="hover:text-(--color-ink) transition-colors cursor-pointer font-semibold"
        >
          Issues
        </button>
        <a
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noreferrer"
          className="hover:text-(--color-ink) transition-colors font-semibold"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}

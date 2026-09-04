"use client";

import { useEffect } from "react";
import { GITHUB_ISSUES_URL, GITHUB_NEW_ISSUE_URL } from "@/lib/constants";
import { AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function IssuesPage() {
  useEffect(() => {
    window.location.href = GITHUB_ISSUES_URL;
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center font-mono bg-(--color-paper)">
      <div className="max-w-md w-full p-8 rounded-xl border border-(--color-rule) bg-(--color-card) shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-(--color-ink)">Redirecting to GitHub Issues...</h1>
        <p className="text-xs text-(--color-muted)">
          Found a bug or having DNS routing trouble? Track active issues or submit a detailed bug report on GitHub.
        </p>
        <div className="pt-2 flex flex-col gap-2">
          <Button asChild className="w-full bg-(--color-signal) text-white font-bold h-9">
            <a href={GITHUB_ISSUES_URL} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5">
              <span>View Open Issues</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </Button>
          <Button variant="outline" asChild className="w-full border-(--color-rule) text-xs h-8">
            <a href={GITHUB_NEW_ISSUE_URL} target="_blank" rel="noreferrer">
              <span>Open New Issue</span>
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

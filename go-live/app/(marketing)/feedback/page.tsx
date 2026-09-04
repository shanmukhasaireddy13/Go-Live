"use client";

import { useEffect } from "react";
import { GITHUB_FEEDBACK_URL, GITHUB_ISSUES_URL } from "@/lib/constants";
import { MessageSquare, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FeedbackPage() {
  useEffect(() => {
    window.location.href = GITHUB_FEEDBACK_URL;
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center font-mono bg-(--color-paper)">
      <div className="max-w-md w-full p-8 rounded-xl border border-(--color-rule) bg-(--color-card) shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
          <MessageSquare className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-(--color-ink)">Redirecting to GitHub Feedback...</h1>
        <p className="text-xs text-(--color-muted)">
          We use GitHub Issues &amp; Discussions for community feedback, roadmap suggestions, and feature requests.
        </p>
        <div className="pt-2 flex flex-col gap-2">
          <Button asChild className="w-full bg-(--color-signal) text-white font-bold h-9">
            <a href={GITHUB_FEEDBACK_URL} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5">
              <span>Open Feedback on GitHub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </Button>
          <Button variant="outline" asChild className="w-full border-(--color-rule) text-xs h-8">
            <a href={GITHUB_ISSUES_URL} target="_blank" rel="noreferrer">
              <span>View All Open Issues</span>
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

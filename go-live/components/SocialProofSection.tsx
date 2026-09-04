"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { SocialProofResponse } from "@/lib/types";
import { Sparkles, Globe } from "lucide-react";

export function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(date.getTime()) || diffSecs < 0) return "recently";
  if (diffSecs < 60) return "just now";
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "1d ago";
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo ago`;
}

export function SocialProofSection() {
  const [data, setData] = useState<SocialProofResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    api.socialProof
      .getStats()
      .then((res) => {
        if (isMounted && res && res.success) {
          setData(res);
        }
      })
      .catch(() => {
        if (isMounted) setError(true);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (error) return null;

  const topDomains = data?.domains ? data.domains.slice(0, 5) : [];

  return (
    <section className="w-full max-w-6xl mx-auto my-6 p-4 sm:p-5 rounded-xl bg-(--color-card)/30 border border-(--color-rule) backdrop-blur-xs font-mono space-y-3 animate-in fade-in duration-300">
      {/* Compact Header & Metric Badge */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-(--color-signal)" />
          <h2 className="text-xs sm:text-sm font-bold text-(--color-ink) flex items-center gap-1.5">
            <span>Developers going live</span>
            <span className="text-xs">🚀</span>
          </h2>
        </div>

        {!loading && data && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-(--color-signal)/10 border border-(--color-signal)/20 text-xs font-bold text-(--color-signal)">
            <Sparkles className="w-3 h-3 text-(--color-signal)" />
            <span>{data.stats.totalClaimed.toLocaleString()} claimed</span>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="flex items-center gap-2 overflow-hidden py-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-8 w-44 rounded-lg bg-(--color-rule)/30 border border-(--color-rule)/40 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Compact Top 5 Domain Pills */}
      {!loading && data && (
        <>
          {topDomains.length === 0 ? (
            <div className="py-2 text-center text-xs text-(--color-muted) italic border border-dashed border-(--color-rule) rounded-lg">
              Be the first developer to claim a domain and go live!
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {topDomains.map((item, index) => (
                <div
                  key={`${item.fullDomain}-${index}`}
                  className="px-3 py-1.5 rounded-lg border border-(--color-rule) bg-(--color-card) hover:border-(--color-signal)/50 transition-all duration-150 flex items-center gap-2 text-xs shadow-2xs group"
                >
                  <span className="font-semibold text-(--color-ink) group-hover:text-(--color-signal) transition-colors truncate">
                    {item.fullDomain}
                  </span>
                  <span className="text-[10px] text-(--color-muted) select-none">
                    {formatRelativeTime(item.claimedAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

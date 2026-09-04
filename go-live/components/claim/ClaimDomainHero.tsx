"use client";

import React from "react";
import { Sparkles, Globe, ShieldCheck } from "lucide-react";
import { ROOT_DOMAIN } from "@/lib/constants";

interface ClaimDomainHeroProps {
  name: string;
  phrase: {
    title: string;
    subtitle: string;
  };
}

export function ClaimDomainHero({ name, phrase }: ClaimDomainHeroProps) {
  return (
    <div className="lg:col-span-7 space-y-6">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-(--color-card-subtle) border border-(--color-rule) text-xs font-mono font-medium text-(--color-muted)">
          <Sparkles className="w-3.5 h-3.5 text-(--color-signal)" />
          <span>Instant DNS Reservation</span>
        </div>

        {/* Clean Domain Title */}
        <div className="space-y-1">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-(--color-muted) block">
            {phrase.title}
          </span>
          <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight leading-tight flex items-baseline flex-wrap">
            <span className="text-(--color-ink)">{name || "yourname"}</span>
            <span className="text-(--color-muted)">.{ROOT_DOMAIN}</span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-(--color-muted) leading-relaxed max-w-lg">
          {phrase.subtitle}
        </p>
      </div>

      {/* Anycast Feature Highlight Card */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="p-3.5 rounded-lg border border-(--color-rule) bg-(--color-card) space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-(--color-ink)">
            <Globe className="w-3.5 h-3.5 text-(--color-signal)" />
            <span>300+ Edge Nodes</span>
          </div>
          <p className="text-[11px] text-(--color-muted)">Anycast routed on Cloudflare enterprise tier.</p>
        </div>

        <div className="p-3.5 rounded-lg border border-(--color-rule) bg-(--color-card) space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-(--color-ink)">
            <ShieldCheck className="w-3.5 h-3.5 text-(--color-signal)" />
            <span>Auto SSL &amp; TLS 1.3</span>
          </div>
          <p className="text-[11px] text-(--color-muted)">Universal SSL certificates provisioned automatically.</p>
        </div>
      </div>
    </div>
  );
}

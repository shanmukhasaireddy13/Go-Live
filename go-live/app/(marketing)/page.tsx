"use client";

import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import { DomainService } from "@/lib/domain-service";
import { AvailabilityResult } from "@/lib/types";
import { ROOT_DOMAIN, GITHUB_REPO_URL } from "@/lib/constants";
import { GithubIcon } from "@/components/icons";
import { OrbitDotGlobe } from "@/components/OrbitDotGlobe";
import { SocialProofSection } from "@/components/SocialProofSection";
import { ArrowRight, Layers, Sparkles } from "lucide-react";

const COMEDY_PLACEHOLDERS = [
  "works-on-my-machine",
  "still-compiling",
  "git-push-and-pray",
  "centering-a-div",
  "coffee-to-code",
  "it-is-a-feature",
  "sudo-deploy",
  "rubber-duck-ai",
  "rm-rf-node-modules",
];

export default function HomePage() {
  const router = useRouter();

  // --- Search & Input State ---
  const [subdomain, setSubdomain] = useState<string>("");
  const [debouncedName, setDebouncedName] = useState<string>("");
  const [availability, setAvailability] = useState<AvailabilityResult | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [inputWidth, setInputWidth] = useState<number | null>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const mirrorRef = useRef<HTMLSpanElement>(null);

  // Rotate fun developer placeholders
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % COMEDY_PLACEHOLDERS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const currentPlaceholder = COMEDY_PLACEHOLDERS[placeholderIndex];

  // --- Auto-Sizing Input Width Strictly for Typed Text ---
  const displayName = subdomain || currentPlaceholder;
  useLayoutEffect(() => {
    if (mirrorRef.current) {
      setInputWidth(Math.max(mirrorRef.current.offsetWidth + 4, 120));
    }
  }, [displayName]);

  // --- Ultra-Fast Debounced Search (100ms) & Globe Spin Trigger ---
  useEffect(() => {
    if (subdomain.trim()) {
      setIsSearching(true);
    }
    const timer = setTimeout(() => {
      setDebouncedName(subdomain);
      setIsSearching(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [subdomain]);

  // --- Live Backend & Database Availability Check with AbortController ---
  useEffect(() => {
    if (!debouncedName.trim()) {
      setAvailability(null);
      return;
    }

    const abortController = new AbortController();
    let isCurrent = true;

    DomainService.checkAvailabilityRemote(debouncedName, abortController.signal).then((check) => {
      if (isCurrent && check) {
        setAvailability(check);
      }
    }).catch((err) => {
      if (err.name !== "AbortError") {
        console.warn("Domain check notice:", err);
      }
    });

    return () => {
      isCurrent = false;
      abortController.abort();
    };
  }, [debouncedName]);

  // --- Handle Claim Route Transition ---
  const handleClaim = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!availability || !availability.isAvailable) return;
    router.push(`/claim?name=${encodeURIComponent(availability.subdomain)}`);
  };

  const sampleQuickIdeas = [
    "portfolio",
    "works-on-my-machine",
    "my-app",
    "still-compiling",
    "ai-agent",
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-14 font-sans selection:bg-(--color-signal) selection:text-white">
      {/* ─── SPLIT LAYOUT: SEARCH ON LEFT, ORBITDOT GLOBE ON RIGHT ─── */}
      <main className="max-w-6xl w-full mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* ─── LEFT COLUMN: SEARCH CONSOLE & INLINE CLAIM BUTTON ─── */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-(--color-ink) leading-none font-mono">
              Go-Live
            </h1>
            <p className="text-sm sm:text-base text-(--color-muted) leading-relaxed">
              Your site. Your subdomain. Live. Get a free developer subdomain and connect your project in seconds.
            </p>
          </div>

          {/* ─── SEARCH INPUT LINE (UNDERLINE STRICTLY ON TYPED TEXT ONLY, CLAIM BUTTON IN MIDDLE) ─── */}
          <form onSubmit={handleClaim} className="space-y-4 pt-2">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search line */}
              <div className="flex items-baseline font-mono tracking-tight text-(--color-ink) text-2xl sm:text-4xl font-extrabold">
                {/* Input with underline ONLY on typed text */}
                <div className="relative inline-flex items-baseline">
                  <input
                    ref={inputRef}
                    type="text"
                    value={subdomain}
                    onChange={(e) =>
                      setSubdomain(e.target.value.toLowerCase().trim().replace(/[^a-z0-9-]/g, ""))
                    }
                    placeholder={currentPlaceholder}
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    style={{ width: inputWidth ? `${inputWidth}px` : "130px" }}
                    className="bg-transparent border-b-2 sm:border-b-4 border-(--color-signal) text-(--color-ink) outline-none placeholder:text-(--color-muted)/30 py-1"
                    maxLength={32}
                    autoFocus
                  />

                  {/* Dynamic sizing mirror */}
                  <span
                    ref={mirrorRef}
                    aria-hidden="true"
                    className="pointer-events-none absolute top-0 left-0 -z-10 text-2xl sm:text-4xl font-extrabold opacity-0 whitespace-pre"
                  >
                    {displayName}
                  </span>
                </div>

                {/* Suffix WITHOUT underline */}
                <span className="text-(--color-muted) select-none pl-0.5">.{ROOT_DOMAIN}</span>
              </div>

              {/* ─── CLAIM BUTTON IN THE MIDDLE (Between Search & Globe) ─── */}
              {availability?.isAvailable && (
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-(--color-signal) hover:opacity-90 text-white font-mono font-bold text-sm sm:text-base transition-all flex items-center gap-1.5 shadow-md animate-in fade-in zoom-in-95 duration-200 cursor-pointer"
                >
                  <span>Claim</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Availability Status */}
            {subdomain.trim() && availability && (
              <div className="space-y-2 font-mono text-xs animate-in fade-in duration-150">
                <div className="flex items-center gap-2">
                  {availability.isAvailable ? (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-(--color-emerald) animate-pulse" />
                      <span className="text-(--color-emerald) font-bold">
                        {availability.fullDomain} is available!
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-(--color-flag)" />
                      <span className="text-(--color-flag) font-bold">
                        {availability.reason}
                      </span>
                    </>
                  )}
                </div>

                {/* Suggestions if reserved / claimed */}
                {!availability.isAvailable && availability.suggestions && availability.suggestions.length > 0 && (
                  <div className="text-(--color-muted) flex items-center gap-2 flex-wrap pt-1">
                    <span>How about:</span>
                    {availability.suggestions.map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setSubdomain(sug)}
                        className="text-(--color-signal) hover:underline cursor-pointer font-semibold"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick ideas if empty search */}
            {!subdomain.trim() && (
              <div className="flex items-center gap-2 font-mono text-xs text-(--color-muted) flex-wrap">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Dev favorites:</span>
                {sampleQuickIdeas.map((idea) => (
                  <button
                    key={idea}
                    type="button"
                    onClick={() => setSubdomain(idea)}
                    className="hover:text-(--color-signal) hover:underline cursor-pointer"
                  >
                    {idea}
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>

        {/* ─── RIGHT COLUMN: 3D ORBITDOT GLOBE ─── */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
          <OrbitDotGlobe
            isSearching={isSearching}
            isAvailable={availability ? availability.isAvailable : null}
          />
        </div>
      </main>

      {/* ─── SOCIAL PROOF & COMMUNITY ACTIVITY ─── */}
      <SocialProofSection />

      {/* ─── FOOTER ─── */}
      <footer className="max-w-6xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-(--color-muted) pt-6 border-t border-(--color-rule)">
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={() => router.push("/manage")}
            className="hover:text-(--color-ink) underline underline-offset-4 flex items-center gap-1 cursor-pointer font-semibold"
          >
            <Layers className="w-3.5 h-3.5 text-(--color-signal)" />
            <span>My Subdomains</span>
          </button>

          <span>•</span>

          <span className="flex items-center gap-1 text-(--color-emerald) font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-(--color-emerald) animate-ping" />
            <span>Anycast DNS Online</span>
          </span>
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
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="hover:text-(--color-signal) flex items-center gap-1 font-semibold transition-colors"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>
        </div>
      </footer>
    </div>
  );
}

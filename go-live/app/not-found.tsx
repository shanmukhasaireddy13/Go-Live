import React from "react";
import Link from "next/link";
import { ROOT_DOMAIN, GITHUB_REPO_URL } from "@/lib/constants";
import { ArrowLeft, Compass, RefreshCw, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: `404 — Lost in Anycast Space | ${ROOT_DOMAIN}`,
  description: `404 - Page not found on ${ROOT_DOMAIN}`,
};

const COMEDY_QUOTES = [
  "Even our 300+ Anycast edge nodes couldn't find this route. Did you push to prod on Friday?",
  "404: Works on my machine, but definitely not on this URL.",
  "This endpoint was deprecated before it was even conceived.",
  "Have you tried turning the internet off and on again?",
  "DNS resolved successfully to 127.0.0.1... oh wait, that's your localhost.",
  "Looks like someone forgot a semicolon in the router config."
];

export default function NotFound() {
  const randomQuote = COMEDY_QUOTES[Math.floor(Math.random() * COMEDY_QUOTES.length)];

  return (
    <div className="min-h-screen flex flex-col justify-between font-sans selection:bg-(--color-signal) selection:text-white">
      {/* ─── HEADER ─── */}
      <header className="h-14 border-b border-(--color-rule) bg-(--color-card) px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono">
          <Link
            href="/"
            className="flex items-center gap-1.5 font-bold text-(--color-ink) hover:opacity-80 transition-opacity"
          >
            <span className="text-sm font-black text-(--color-signal)">▲</span>
            <span>Go-Live</span>
          </Link>
          <span className="text-(--color-rule)">/</span>
          <span className="text-(--color-flag) font-semibold">404</span>
        </div>

        <Link
          href="/"
          className="text-xs text-(--color-muted) hover:text-(--color-ink) flex items-center gap-1 font-mono transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to safety</span>
        </Link>
      </header>

      {/* ─── MAIN 404 BODY ─── */}
      <main className="max-w-lg w-full mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center space-y-8">
        <div className="space-y-3">
          <div className="font-mono text-5xl sm:text-6xl font-black text-(--color-flag) tracking-tight">
            404
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-(--color-ink) tracking-tight">
            Route Not Found on Anycast Edge
          </h1>

          <p className="text-xs sm:text-sm text-(--color-muted) leading-relaxed">
            {randomQuote}
          </p>
        </div>

        {/* Terminal Debug Box */}
        <div className="p-4 rounded-lg bg-(--color-card) border border-(--color-rule) text-left font-mono text-xs space-y-1.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-(--color-muted) text-[11px] pb-1 border-b border-(--color-rule)">
            <Terminal className="w-3.5 h-3.5 text-(--color-signal)" />
            <span>edge-traceroute.log</span>
          </div>
          <div className="text-(--color-muted) text-[11px] pt-1">
            <span className="text-(--color-emerald)">✓</span> Querying Cloudflare FRA node... <span className="text-(--color-emerald)">200</span>
          </div>
          <div className="text-(--color-muted) text-[11px]">
            <span className="text-(--color-emerald)">✓</span> Checking Redis route table... <span className="text-(--color-emerald)">200</span>
          </div>
          <div className="text-(--color-flag) text-[11px]">
            <span className="text-(--color-flag)">✗</span> HTTP GET /unknown-path &rarr; <span className="font-bold">404 NOT_FOUND</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            asChild
            className="w-full sm:w-auto bg-(--color-ink) text-(--color-paper) hover:opacity-90 font-bold text-xs h-9 px-5 shadow-xs cursor-pointer"
          >
            <Link href="/">
              <span>Search Subdomains</span>
            </Link>
          </Button>

          <Button
            variant="outline"
            asChild
            className="w-full sm:w-auto border-(--color-rule) bg-(--color-card) text-(--color-ink) hover:bg-(--color-card-subtle) text-xs h-9 px-4 font-semibold"
          >
            <Link href="/manage">
              <span>My Subdomain</span>
            </Link>
          </Button>
        </div>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-(--color-rule) bg-(--color-card) py-6 px-4 sm:px-6 max-w-2xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-(--color-muted) font-mono">
        <span>{ROOT_DOMAIN} &bull; 404 Route</span>
        <div className="flex items-center gap-4">
          <Link href="/terms" className="hover:text-(--color-ink) transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-(--color-ink) transition-colors">
            Privacy
          </Link>
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="hover:text-(--color-ink) transition-colors"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}

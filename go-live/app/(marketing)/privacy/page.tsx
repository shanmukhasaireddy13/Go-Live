import React from "react";
import Link from "next/link";
import { GITHUB_REPO_URL, ROOT_DOMAIN } from "@/lib/constants";
import { ArrowLeft, ExternalLink } from "lucide-react";

export const metadata = {
  title: `Privacy Policy — ${ROOT_DOMAIN}`,
  description: `Privacy Policy and Developer Data Protection standards for ${ROOT_DOMAIN} developer subdomains.`,
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between font-sans selection:bg-(--color-signal) selection:text-white">
      {/* ─── TOPBAR ─── */}
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
          <span className="text-(--color-muted)">Legal</span>
          <span className="text-(--color-rule)">/</span>
          <span className="text-(--color-ink) font-semibold">Privacy</span>
        </div>

        <Link
          href="/"
          className="text-xs text-(--color-muted) hover:text-(--color-ink) flex items-center gap-1 font-mono transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
      </header>

      {/* ─── EDITORIAL MAIN CONTENT ─── */}
      <main className="max-w-2xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-12">
        {/* Page Header */}
        <header className="space-y-3 border-b border-(--color-rule) pb-8">
          <div className="text-[11px] font-mono text-(--color-muted) uppercase tracking-wider">
            Privacy &bull; Updated September 2026
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-(--color-ink) tracking-tight">
            Privacy Policy &amp; Data Security
          </h1>
          <p className="text-xs sm:text-sm text-(--color-muted) leading-relaxed">
            Go-Live is built on developer-first principles: zero tracking, minimal data retention, and complete domain data isolation.
          </p>
        </header>

        {/* Sections */}
        <div className="space-y-10 text-xs sm:text-sm text-(--color-ink) leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-mono text-(--color-muted) font-semibold">01.</span>
              <h2 className="text-base font-bold text-(--color-ink)">Data Collection</h2>
            </div>
            <p className="text-(--color-muted)">
              We only collect essential metadata required to operate your DNS routing:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-(--color-muted)">
              <li><strong>GitHub Profile:</strong> Username, ID, and avatar to authenticate ownership and enforce the 1-subdomain limit.</li>
              <li><strong>DNS Target Records:</strong> CNAME or IP destination hostnames provided by your hosting setup.</li>
              <li><strong>OAuth Handshakes:</strong> Ephemeral tokens used during authorization to verify stars or query project lists.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-mono text-(--color-muted) font-semibold">02.</span>
              <h2 className="text-base font-bold text-(--color-ink)">Zero Tracking &amp; Privacy</h2>
            </div>
            <p className="text-(--color-muted)">
              We do not embed third-party advertising trackers, marketing pixels, or analytics trackers on any Go-Live surface.
            </p>
            <p className="text-(--color-muted)">
              Your subdomain configurations are strictly scoped to your authenticated GitHub session. Other developers cannot inspect or discover your private target routing from our database.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-mono text-(--color-muted) font-semibold">03.</span>
              <h2 className="text-base font-bold text-(--color-ink)">Edge Routing</h2>
            </div>
            <p className="text-(--color-muted)">
              DNS resolution is handled by Cloudflare Anycast edge servers. HTTP request traffic to your web applications travels directly between end users and your hosting provider (Vercel, Render, Railway, VPS). Go-Live does not inspect or proxy application payload data.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-mono text-(--color-muted) font-semibold">04.</span>
              <h2 className="text-base font-bold text-(--color-ink)">Data Deletion</h2>
            </div>
            <p className="text-(--color-muted)">
              You have the right to remove your subdomain or disconnect accounts at any time. When a domain is deleted from your dashboard, the corresponding DNS record is immediately purged from Cloudflare and deleted from the database.
            </p>
          </section>
        </div>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-(--color-rule) bg-(--color-card) py-6 px-4 sm:px-6 max-w-2xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-(--color-muted) font-mono">
        <span>{ROOT_DOMAIN}</span>
        <div className="flex items-center gap-4">
          <Link href="/terms" className="hover:text-(--color-ink) transition-colors">
            Terms
          </Link>
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="hover:text-(--color-ink) transition-colors flex items-center gap-1"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </footer>
    </div>
  );
}

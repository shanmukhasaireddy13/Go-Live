import React from "react";
import Link from "next/link";
import { GITHUB_REPO_URL, ROOT_DOMAIN } from "@/lib/constants";
import { ArrowLeft, ExternalLink } from "lucide-react";

export const metadata = {
  title: `Terms of Service — ${ROOT_DOMAIN}`,
  description: `Terms of Service, Platform Rights, and Acceptable Use Policy for ${ROOT_DOMAIN} developer subdomains.`,
};

export default function TermsPage() {
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
          <span className="text-(--color-ink) font-semibold">Terms</span>
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
            Legal &bull; Updated September 2026
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-(--color-ink) tracking-tight">
            Terms of Service &amp; Acceptable Use
          </h1>
          <p className="text-xs sm:text-sm text-(--color-muted) leading-relaxed">
            By reserving, linking, or routing subdomains on {ROOT_DOMAIN}, you agree to comply with the following terms, conditions, and platform policies.
          </p>
        </header>

        {/* Legal Sections */}
        <div className="space-y-10 text-xs sm:text-sm text-(--color-ink) leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-mono text-(--color-muted) font-semibold">01.</span>
              <h2 className="text-base font-bold text-(--color-ink)">Service Scope &amp; Eligibility</h2>
            </div>
            <p className="text-(--color-muted)">
              Go-Live ({ROOT_DOMAIN}) provides free, Anycast-routed DNS subdomain provisioning for individual developers. Eligibility requires authentication via a valid GitHub account.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-(--color-muted)">
              <li>Each GitHub account is strictly limited to <strong>one (1) active subdomain slot</strong>.</li>
              <li>Active domain routing requires maintaining a star on the official open-source repository (<a href={GITHUB_REPO_URL} target="_blank" rel="noreferrer" className="text-(--color-signal) underline font-medium">shanmukhasaireddy13/Go-Live</a>).</li>
            </ul>
          </section>

          {/* Section 2: Owner Absolute Rights (PROMINENT HIGHLIGHT) */}
          <section className="space-y-3 p-5 rounded-lg border border-(--color-rule) bg-(--color-card)">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-mono text-(--color-signal) font-semibold">02.</span>
              <h2 className="text-base font-bold text-(--color-ink)">
                Owner Absolute Rights to Block, Stop &amp; Delete
              </h2>
            </div>
            <p className="text-(--color-ink) font-medium text-xs sm:text-sm leading-relaxed">
              The owner and operators of Go-Live ({ROOT_DOMAIN}) retain absolute, unconditional, and irrevocable authority to block, stop, reclaim, reassign, or permanently delete any subdomain, DNS record, target routing, or account access at any time, for any reason or no reason, without prior notice, and with zero financial liability or compensation under any circumstances.
            </p>
            <p className="text-xs text-(--color-muted) leading-relaxed">
              Registration of a subdomain conveys a revocable, temporary service privilege and does not grant permanent ownership, copyright, or trademark rights to any subdomain prefix.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-mono text-(--color-muted) font-semibold">03.</span>
              <h2 className="text-base font-bold text-(--color-ink)">Acceptable Use Policy</h2>
            </div>
            <p className="text-(--color-muted)">
              The following activities are strictly prohibited and will trigger immediate DNS revocation and edge-level IP blocks:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-(--color-muted)">
              <li>Phishing, credential theft, malware distribution, or deceptive hosting.</li>
              <li>Impersonation of corporations, open-source projects, or existing trademarks.</li>
              <li>Hosting automated link farms, SEO spam networks, or high-volume scrapers.</li>
              <li>Botnet Command and Control (C2) servers, port scanners, or DDoS infrastructure.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-mono text-(--color-muted) font-semibold">04.</span>
              <h2 className="text-base font-bold text-(--color-ink)">SLA &amp; Availability Disclaimer</h2>
            </div>
            <p className="text-(--color-muted)">
              Go-Live is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind. While Anycast DNS propagation operates globally via Cloudflare edge nodes, we do not guarantee uninterrupted availability.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-mono text-(--color-muted) font-semibold">05.</span>
              <h2 className="text-base font-bold text-(--color-ink)">Third-Party Hosting Brokerage</h2>
            </div>
            <p className="text-(--color-muted)">
              Go-Live configures DNS pointers to your chosen hosting provider (Vercel, Render, Railway, custom VPS). Application runtime availability, SSL termination, and content hosting remain governed by your provider&apos;s terms of service.
            </p>
          </section>
        </div>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-(--color-rule) bg-(--color-card) py-6 px-4 sm:px-6 max-w-2xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-(--color-muted) font-mono">
        <span>{ROOT_DOMAIN}</span>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-(--color-ink) transition-colors">
            Privacy
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

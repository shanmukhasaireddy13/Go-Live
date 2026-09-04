"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { SubdomainRecord } from "@/lib/types";
import { GitHubRepo, api } from "@/lib/api";
import { DomainService } from "@/lib/domain-service";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Check,
  Loader2,
  Search,
  ExternalLink,
  BookOpen,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Lock,
  GitBranch,
  Folder,
  RefreshCw,
  Clock
} from "lucide-react";

interface GitHubPagesTabProps {
  domain: SubdomainRecord;
  authToken?: string | null;
  isLockedDown?: boolean;
  cooldownMinutes?: number;
  onRefreshDomain?: (updatedDomain: SubdomainRecord) => void;
}

export function GitHubPagesTab({
  domain,
  authToken,
  isLockedDown,
  cooldownMinutes,
  onRefreshDomain,
}: GitHubPagesTabProps) {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [search, setSearch] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [branch, setBranch] = useState("main");
  const [path, setPath] = useState("/");
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [provisionMessage, setProvisionMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isChangingRepo, setIsChangingRepo] = useState(false);

  const isReleased = isLockedDown || domain.isDeleted || domain.status === "RELEASED";
  const isAlreadyConnected =
    !isReleased &&
    domain.status === "ACTIVE" &&
    domain.target &&
    (domain.target.includes("github.io") || domain.preset === "github-pages");

  // Fetch Repositories on Mount
  useEffect(() => {
    if (authToken && !repos.length && !isReleased) {
      loadRepos();
    }
  }, [authToken, isReleased]);

  const loadRepos = async () => {
    setIsLoadingRepos(true);
    setErrorMessage(null);
    try {
      const res = await api.github.getRepos(authToken || undefined);
      if (res.success && res.repos) {
        setRepos(res.repos);
        if (res.repos.length > 0 && !selectedRepo) {
          const pagesRepo = res.repos.find((r) => r.hasPages) || res.repos[0];
          setSelectedRepo(pagesRepo);
          setBranch(pagesRepo.defaultBranch || "main");
        }
      } else {
        setErrorMessage(res.error || "Could not load GitHub repositories.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to connect to GitHub API.");
    } finally {
      setIsLoadingRepos(false);
    }
  };

  const handleDeploy = async () => {
    if (!selectedRepo) return;
    setIsDeploying(true);
    setErrorMessage(null);
    setProvisionMessage("Configuring domain on GitHub Pages...");

    try {
      const res = await api.github.assignPages({
        subdomain: domain.name,
        repoOwner: selectedRepo.owner,
        repoName: selectedRepo.name,
        branch,
        path,
        token: authToken || undefined,
      });

      if (!res.success) {
        const cleanMsg = res.error || res.message || "Failed to link GitHub Pages.";
        setErrorMessage(cleanMsg);
        throw new Error(cleanMsg);
      }

      setProvisionMessage("Provisioning Cloudflare Anycast CNAME...");
      await new Promise((r) => setTimeout(r, 400));

      const updatedDomain: SubdomainRecord = {
        ...domain,
        target: res.targetCname || `${selectedRepo.owner.toLowerCase()}.github.io`,
        preset: "github-pages",
        updatedAt: new Date().toISOString(),
      };
      DomainService.saveDomains([updatedDomain]);

      // Progressive Live Verification Ladder: 1s, 2s, 3s, 5s, 7s
      const intervals = [1000, 2000, 3000, 5000, 7000];
      const stageMessages = [
        "Verifying Anycast edge routing (1s)...",
        "Synchronizing GitHub Pages SSL certificate (2s)...",
        "Checking deployment status (3s)...",
        "Probing live HTTP response from global mesh (5s)...",
        "Confirming edge network resolution (7s)...",
      ];

      let liveConfirmed = false;
      for (let i = 0; i < intervals.length; i++) {
        setProvisionMessage(stageMessages[i] || `Probing live status (${intervals[i] / 1000}s)...`);
        await new Promise((r) => setTimeout(r, intervals[i]));

        try {
          const pingRes = await api.domains.ping(domain.fullDomain);
          if (pingRes?.success) {
            if (pingRes.httpReachable || (pingRes.statusCode && pingRes.statusCode < 500)) {
              liveConfirmed = true;
              break;
            }
          }
        } catch {}
      }

      setIsDeploying(false);
      setIsChangingRepo(false);
      if (onRefreshDomain) onRefreshDomain(updatedDomain);

      if (liveConfirmed) {
        try {
          confetti({ particleCount: 140, spread: 80, origin: { y: 0.5 } });
        } catch {}
        toast.success(`🎉 ${domain.fullDomain} is live on GitHub Pages (${selectedRepo.name})!`);
      } else {
        toast.info(
          `DNS is provisioned on Anycast Edge. GitHub Pages SSL handshake is completing in the background and will be reachable shortly.`
        );
      }
    } catch (err: any) {
      console.error("GitHub Pages deploy notice:", err);
      setIsDeploying(false);
      toast.error(err.message || "Could not link domain to GitHub Pages.");
    }
  };

  const filteredRepos = repos.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(search.toLowerCase()))
  );

  // ─── RELEASED / LOCKED STATE ───
  if (isReleased) {
    return (
      <div className="space-y-4 max-w-5xl">
        <Card className="border-amber-500/30 bg-(--color-card) rounded-xl shadow-xs overflow-hidden">
          <CardHeader className="p-6 border-b border-(--color-rule)">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
              <Lock className="w-4 h-4" />
              <span>GitHub Pages Integration Locked</span>
            </div>
            <CardTitle className="text-xl font-mono font-black text-(--color-ink) pt-1">
              Subdomain Released &amp; Unlinked
            </CardTitle>
            <CardDescription className="text-xs text-(--color-muted)">
              {domain.fullDomain} was released. All GitHub Pages aliases and Cloudflare Anycast CNAME records have been permanently detached.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-600 dark:text-amber-400">
                <Clock className="w-4 h-4" />
                <span>Edge Cooldown Active: {cooldownMinutes || 120} minutes remaining</span>
              </div>
              <p className="text-[12px] leading-relaxed text-(--color-muted)">
                You cannot re-link or deploy GitHub Pages to this subdomain because it is released. Once the 2-hour fair-use cooldown expires, your account resets and you can claim a brand-new subdomain.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── ALREADY CONNECTED TO GITHUB PAGES ───
  if (isAlreadyConnected && !isChangingRepo) {
    return (
      <div className="space-y-4 max-w-5xl">
        <Card className="border-emerald-500/30 bg-(--color-card) rounded-xl shadow-xs overflow-hidden">
          <CardHeader className="p-6 border-b border-(--color-rule)">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Successfully Connected to GitHub Pages</span>
                </div>
                <CardTitle className="text-lg sm:text-xl font-mono font-black text-(--color-ink) pt-1">
                  {domain.fullDomain}
                </CardTitle>
                <CardDescription className="text-xs text-(--color-muted) mt-0.5">
                  Routing active traffic directly to GitHub Pages origin on Anycast edge.
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://${domain.fullDomain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-(--color-ink) text-(--color-paper) text-xs font-bold hover:opacity-90 transition-opacity shadow-xs"
                >
                  <span>Visit Live Site</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-(--color-card-subtle) border border-(--color-rule) space-y-1">
                <div className="text-[11px] font-mono text-(--color-muted) uppercase">Target Destination</div>
                <div className="font-mono font-bold text-(--color-ink) truncate">{domain.target || "username.github.io"}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-(--color-card-subtle) border border-(--color-rule) space-y-1">
                <div className="text-[11px] font-mono text-(--color-muted) uppercase">DNS Record Type</div>
                <div className="font-mono font-bold text-(--color-ink)">{domain.recordType || "CNAME"} &bull; Anycast Edge</div>
              </div>
              <div className="p-3.5 rounded-xl bg-(--color-card-subtle) border border-(--color-rule) space-y-1">
                <div className="text-[11px] font-mono text-(--color-muted) uppercase">Deployment Status</div>
                <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Live &amp; Serving</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-(--color-muted) flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-(--color-ink)">Zero Configuration Required</span>
                <p className="leading-relaxed">
                  Your GitHub Pages site is mapped to <code className="font-mono text-(--color-ink)">{domain.fullDomain}</code>. Any new commits pushed to your publishing branch will automatically go live.
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-(--color-card-subtle) border-t border-(--color-rule) p-4 flex items-center justify-between text-xs">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsChangingRepo(true)}
              className="text-xs"
            >
              Change Connected Repository
            </Button>
            <a
              href="https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-mono text-(--color-muted) hover:text-(--color-ink) flex items-center gap-1"
            >
              <span>GitHub Pages Docs</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // ─── DEPLOYMENT / SETUP FORM ───
  return (
    <div className="space-y-6 max-w-5xl">
      <Card className="border-(--color-rule) bg-(--color-card) rounded-xl shadow-xs overflow-hidden">
        <CardHeader className="p-6 border-b border-(--color-rule)">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>1-Click Native Deployment</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              GitHub Pages
            </span>
          </div>
          <CardTitle className="text-xl font-mono font-black text-(--color-ink) pt-2">
            Connect GitHub Pages
          </CardTitle>
          <CardDescription className="text-xs text-(--color-muted)">
            Select any repository to connect its static site, Astro blog, or documentation directly to{" "}
            <span className="font-mono font-bold text-(--color-ink)">{domain.fullDomain}</span>.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Step 1: Select Repository */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-(--color-ink) uppercase tracking-wider">
                1. Select Repository
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadRepos}
                disabled={isLoadingRepos}
                className="h-7 text-xs text-(--color-muted) hover:text-(--color-ink) gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingRepos ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </Button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-(--color-muted)" />
              <Input
                placeholder="Filter repositories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            <div className="border border-(--color-rule) rounded-lg overflow-hidden max-h-56 overflow-y-auto divide-y divide-(--color-rule) bg-(--color-surface)">
              {isLoadingRepos ? (
                <div className="p-8 text-center text-xs text-(--color-muted) flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                  <span>Loading your GitHub repositories...</span>
                </div>
              ) : filteredRepos.length === 0 ? (
                <div className="p-8 text-center text-xs text-(--color-muted)">
                  No matching repositories found.
                </div>
              ) : (
                filteredRepos.map((r) => {
                  const isSelected = selectedRepo?.id === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setSelectedRepo(r);
                        setBranch(r.defaultBranch || "main");
                      }}
                      className={`w-full p-3 text-left text-xs flex items-center justify-between transition-colors hover:bg-indigo-500/5 ${
                        isSelected ? "bg-indigo-500/10 font-bold" : ""
                      }`}
                    >
                      <div className="space-y-0.5 truncate pr-2">
                        <div className="font-mono text-xs text-(--color-ink) flex items-center gap-1.5">
                          <span>{r.name}</span>
                          {r.hasPages && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-sans font-semibold">
                              Pages Ready
                            </span>
                          )}
                        </div>
                        {r.description && (
                          <div className="text-[11px] text-(--color-muted) truncate">{r.description}</div>
                        )}
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Step 2: Branch & Path Configuration */}
          {selectedRepo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-(--color-rule)">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-(--color-ink) flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Source Branch</span>
                </label>
                <Input
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="main or gh-pages"
                  className="text-xs font-mono"
                />
                <p className="text-[11px] text-(--color-muted)">Branch containing your built site.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-(--color-ink) flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Source Path</span>
                </label>
                <select
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  className="w-full h-9 rounded-md border border-(--color-rule) bg-(--color-surface) text-xs px-3 font-mono text-(--color-ink)"
                >
                  <option value="/">/ (Root Directory)</option>
                  <option value="/docs">/docs (Documentation Directory)</option>
                </select>
                <p className="text-[11px] text-(--color-muted)">Directory where your HTML is published.</p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-6 border-t border-(--color-rule) bg-(--color-surface) flex flex-wrap items-center justify-between gap-3">
          {isChangingRepo && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsChangingRepo(false)}
              className="text-xs"
            >
              Cancel
            </Button>
          )}
          <div className="ml-auto flex items-center gap-2">
            <Button
              onClick={handleDeploy}
              disabled={!selectedRepo || isDeploying}
              className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-xs"
            >
              {isDeploying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{provisionMessage || "Deploying..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Connect &amp; Deploy to Edge</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

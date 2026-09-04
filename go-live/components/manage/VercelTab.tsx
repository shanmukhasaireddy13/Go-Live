"use client";

import React, { useState } from "react";
import { SubdomainRecord } from "@/lib/types";
import { VercelProject } from "@/lib/api";
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
  Layers,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Key,
  Lock,
  Clock
} from "lucide-react";

interface VercelTabProps {
  domain: SubdomainRecord;
  vercelToken: string | null;
  vercelProjects: VercelProject[];
  selectedProject: VercelProject | null;
  isLoadingProjects: boolean;
  isConnectingVercel: boolean;
  isDeploying: boolean;
  provisionMessage: string;
  errorMessage?: string | null;
  isLockedDown?: boolean;
  cooldownMinutes?: number;
  onConnectVercel: () => void;
  onConnectWithToken?: (token: string) => void;
  onDisconnectVercel: () => void;
  onRefreshProjects: () => void;
  onSelectProject: (project: VercelProject) => void;
  onDeploy: () => void;
}

export function VercelTab({
  domain,
  vercelToken,
  vercelProjects,
  selectedProject,
  isLoadingProjects,
  isConnectingVercel,
  isDeploying,
  provisionMessage,
  errorMessage,
  isLockedDown,
  cooldownMinutes,
  onConnectVercel,
  onConnectWithToken,
  onDisconnectVercel,
  onRefreshProjects,
  onSelectProject,
  onDeploy,
}: VercelTabProps) {
  const [search, setSearch] = useState("");
  const [manualToken, setManualToken] = useState("");
  const [isChangingProject, setIsChangingProject] = useState(false);

  const isReleased = isLockedDown || domain.isDeleted || domain.status === "RELEASED";
  const isAlreadyConnected =
    !isReleased &&
    domain.status === "ACTIVE" &&
    domain.target &&
    (domain.target.includes("vercel") || domain.preset === "vercel");

  const filtered = vercelProjects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (isReleased) {
    return (
      <div className="space-y-4 max-w-5xl">
        <Card className="border-amber-500/30 bg-(--color-card) rounded-xl shadow-xs overflow-hidden">
          <CardHeader className="p-6 border-b border-(--color-rule)">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
              <Lock className="w-4 h-4" />
              <span>Vercel Integration Locked</span>
            </div>
            <CardTitle className="text-xl font-mono font-black text-(--color-ink) pt-1">
              Subdomain Released &amp; Unlinked
            </CardTitle>
            <CardDescription className="text-xs text-(--color-muted)">
              {domain.fullDomain} was released. All Vercel aliases and Cloudflare Anycast CNAME records have been permanently detached.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-600 dark:text-amber-400">
                <Clock className="w-4 h-4" />
                <span>Edge Cooldown Active: {cooldownMinutes || 120} minutes remaining</span>
              </div>
              <p className="text-[12px] leading-relaxed text-(--color-muted)">
                You cannot re-link or deploy Vercel projects to this subdomain because it is released. Once the 2-hour fair-use cooldown expires, your account resets and you can claim a brand-new subdomain.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── ALREADY CONNECTED TO VERCEL PROJECT ───
  if (isAlreadyConnected && !isChangingProject) {
    return (
      <div className="space-y-4 max-w-5xl">
        <Card className="border-emerald-500/30 bg-(--color-card) rounded-xl shadow-xs overflow-hidden">
          <CardHeader className="p-6 border-b border-(--color-rule)">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Successfully Connected to Vercel Project</span>
                </div>
                <CardTitle className="text-lg sm:text-xl font-mono font-black text-(--color-ink) pt-1">
                  {domain.fullDomain}
                </CardTitle>
                <CardDescription className="text-xs text-(--color-muted) mt-0.5">
                  Routing active traffic directly to Vercel Anycast edge network.
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
                <div className="font-mono font-bold text-(--color-ink) truncate">{domain.target || "cname.vercel-dns.com"}</div>
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
                  Your Vercel project is mapped to <code className="font-mono text-(--color-ink)">{domain.fullDomain}</code>. Any new commits pushed to your project repository will automatically go live.
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-(--color-card-subtle) border-t border-(--color-rule) p-4 flex items-center justify-between text-xs">
            <span className="text-(--color-muted) text-[11px]">Need to change destination or switch target?</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsChangingProject(true)}
              className="text-xs h-8 px-3 cursor-pointer"
            >
              Re-route to Different Project
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-5xl">
      <Card className="border-(--color-rule) bg-(--color-card) rounded-xl shadow-xs overflow-hidden">
        <CardHeader className="p-6 border-b border-(--color-rule)">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-(--color-ink) flex items-center gap-2">
                <span className="text-base font-black">▲</span>
                <span>Vercel Automated Deployment</span>
              </CardTitle>
              <CardDescription className="text-xs text-(--color-muted) mt-0.5">
                Connect your Vercel projects and automatically route {domain.fullDomain} in 1 click.
              </CardDescription>
            </div>

            {vercelToken && (
              <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
                <button
                  type="button"
                  onClick={onRefreshProjects}
                  disabled={isLoadingProjects}
                  className="font-bold text-(--color-signal) hover:underline cursor-pointer disabled:opacity-50"
                >
                  Refresh
                </button>
                <span className="text-(--color-rule)">•</span>
                <button
                  type="button"
                  onClick={onDisconnectVercel}
                  className="font-semibold text-red-500 hover:underline cursor-pointer"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-5">
          {!vercelToken ? (
            <div className="p-6 sm:p-8 rounded-xl bg-(--color-card-subtle) border border-(--color-rule) text-center space-y-5 max-w-lg mx-auto my-4">
              <div className="w-12 h-12 rounded-xl bg-(--color-card) border border-(--color-rule) flex items-center justify-center mx-auto text-lg font-black text-(--color-ink) shadow-xs">
                ▲
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-(--color-ink)">Link your Vercel Account</h4>
                <p className="text-xs text-(--color-muted) max-w-sm mx-auto leading-relaxed">
                  Authorizes Go-Live to list your deployment projects and configure custom Anycast DNS aliases automatically.
                </p>
              </div>

              {/* Method 1: 1-Click Integration / OAuth */}
              <div className="space-y-2">
                <Button
                  disabled={isConnectingVercel}
                  onClick={onConnectVercel}
                  className="w-full bg-(--color-ink) text-(--color-paper) hover:opacity-90 font-bold text-xs h-10 px-5 cursor-pointer shadow-xs flex items-center justify-center gap-2"
                >
                  {isConnectingVercel ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>▲</span>
                  )}
                  <span>Connect Vercel Integration (1-Click)</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-(--color-rule)" />
                <span className="shrink-0 mx-3 text-[10px] font-mono uppercase font-bold text-(--color-muted)">
                  or connect with personal access token
                </span>
                <div className="flex-grow border-t border-(--color-rule)" />
              </div>

              {/* Method 2: Token Input */}
              <div className="space-y-2 text-left">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Key className="w-3.5 h-3.5 text-(--color-muted) absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      type="password"
                      value={manualToken}
                      onChange={(e) => setManualToken(e.target.value)}
                      placeholder="Paste Vercel Token (e.g. vercel_...)"
                      className="pl-8 bg-(--color-card) border-(--color-rule) text-xs h-9 font-mono"
                    />
                  </div>
                  <Button
                    type="button"
                    disabled={isConnectingVercel || !manualToken.trim()}
                    onClick={() => onConnectWithToken && onConnectWithToken(manualToken)}
                    className="bg-(--color-signal) text-white hover:opacity-90 font-bold text-xs h-9 px-4 shrink-0 cursor-pointer shadow-xs"
                  >
                    Connect
                  </Button>
                </div>
                <div className="text-center pt-1">
                  <a
                    href="https://vercel.com/account/tokens"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-(--color-muted) hover:text-(--color-ink) underline inline-flex items-center gap-1"
                  >
                    <span>Create a token in Vercel Account Settings</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Friendly Error Banner if any */}
              {errorMessage && (
                <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-400">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold">Notice:</span>
                    <p className="leading-relaxed">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Search and count header */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-3.5 h-3.5 text-(--color-muted) absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search projects by name..."
                    className="pl-8 bg-(--color-card) border-(--color-rule) text-xs h-9"
                  />
                </div>
                <div className="text-xs font-mono text-(--color-muted) self-end sm:self-auto">
                  {filtered.length} {filtered.length === 1 ? "project" : "projects"} found
                </div>
              </div>

              {/* Projects Grid */}
              {isLoadingProjects ? (
                <div className="p-12 border border-(--color-rule) rounded-xl text-center text-xs text-(--color-muted) space-y-2">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-(--color-signal)" />
                  <div>Loading your Vercel projects...</div>
                </div>
              ) : filtered.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto p-0.5">
                  {filtered.map((project) => {
                    const isSelected = selectedProject?.id === project.id;
                    return (
                      <div
                        key={project.id}
                        onClick={() => onSelectProject(project)}
                        className={`p-4 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                          isSelected
                            ? "border-(--color-signal) bg-(--color-card) ring-2 ring-(--color-signal)/20 shadow-xs"
                            : "border-(--color-rule) bg-(--color-card) hover:border-(--color-ink) hover:shadow-xs"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 min-w-0">
                            <div className="font-bold text-sm text-(--color-ink) truncate flex items-center gap-1.5">
                              <span>{project.name}</span>
                              {isSelected && (
                                <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
                                  <Check className="w-2.5 h-2.5" />
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-(--color-muted) truncate">
                              {project.defaultUrl}
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-(--color-card-subtle) border border-(--color-rule) text-(--color-muted) shrink-0">
                            {project.framework || "other"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-(--color-muted) border-t border-(--color-rule)/50 pt-2">
                          <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                          <span className={isSelected ? "text-(--color-signal) font-bold" : ""}>
                            {isSelected ? "Selected Target" : "Select Project"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 border border-dashed border-(--color-rule) rounded-xl text-center text-xs text-(--color-muted) space-y-2">
                  <div>No Vercel projects matching &ldquo;{search}&rdquo;</div>
                </div>
              )}
            </div>
          )}
        </CardContent>

        {/* Footer Deploy Action Bar */}
        {vercelToken && selectedProject && (
          <CardFooter className="bg-(--color-card-subtle) border-t border-(--color-rule) p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-(--color-ink)">
                Route {domain.fullDomain} &rarr; {selectedProject.name}
              </div>
              <p className="text-[11px] text-(--color-muted)">
                {provisionMessage || "Creates Cloudflare Anycast CNAME and registers domain on Vercel."}
              </p>
            </div>

            <Button
              disabled={isDeploying}
              onClick={onDeploy}
              className="bg-(--color-signal) text-white hover:opacity-90 font-bold px-5 py-2 text-xs h-9 cursor-pointer shadow-xs shrink-0 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isDeploying ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Configuring DNS...</span>
                </>
              ) : (
                <>
                  <span>Assign &amp; Route Domain</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

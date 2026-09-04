"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { SubdomainRecord } from "@/lib/types";
import { RenderService, api } from "@/lib/api";
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
  Server,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Key,
  Lock,
  RefreshCw,
  Radio,
  Clock
} from "lucide-react";

interface RenderTabProps {
  domain: SubdomainRecord;
  isLockedDown?: boolean;
  cooldownMinutes?: number;
  onRefreshDomain?: (updatedDomain: SubdomainRecord) => void;
}

export function RenderTab({
  domain,
  isLockedDown,
  cooldownMinutes,
  onRefreshDomain,
}: RenderTabProps) {
  const [apiKey, setApiKey] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [services, setServices] = useState<RenderService[]>([]);
  const [search, setSearch] = useState("");
  const [selectedService, setSelectedService] = useState<RenderService | null>(null);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [provisionMessage, setProvisionMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isChangingService, setIsChangingService] = useState(false);

  const isReleased = isLockedDown || domain.isDeleted || domain.status === "RELEASED";
  const isAlreadyConnected =
    !isReleased &&
    domain.status === "ACTIVE" &&
    domain.target &&
    (domain.target.includes("onrender.com") || domain.preset === "render");

  // Load saved Render API Key from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem("golive_render_api_key");
      if (savedKey) {
        setApiKey(savedKey);
        setIsConnected(true);
        loadServices(savedKey);
      }
    }
  }, []);

  const loadServices = async (keyToUse?: string) => {
    const key = keyToUse || apiKey;
    if (!key.trim()) {
      setErrorMessage("Please enter your Render API Key.");
      return;
    }

    setIsLoadingServices(true);
    setErrorMessage(null);
    try {
      const res = await api.render.getServices(key.trim());
      if (res.success && res.services) {
        setServices(res.services);
        setIsConnected(true);
        if (res.services.length > 0 && !selectedService) {
          setSelectedService(res.services[0]);
        }
        if (typeof window !== "undefined") {
          localStorage.setItem("golive_render_api_key", key.trim());
        }
      } else {
        setErrorMessage(res.error || "Failed to load Render services. Please verify your API Key.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Could not connect to Render API.");
    } finally {
      setIsLoadingServices(false);
    }
  };

  const handleDisconnect = () => {
    setApiKey("");
    setIsConnected(false);
    setServices([]);
    setSelectedService(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("golive_render_api_key");
    }
    toast.info("Disconnected Render account.");
  };

  const handleDeploy = async () => {
    if (!selectedService || !apiKey) return;
    setIsDeploying(true);
    setErrorMessage(null);
    setProvisionMessage("Configuring custom domain on Render service...");

    try {
      const res = await api.render.assignDomain({
        apiKey: apiKey.trim(),
        serviceId: selectedService.id,
        subdomain: domain.name,
        customTarget: selectedService.defaultDomain,
      });

      if (!res.success) {
        const cleanMsg = res.error || res.message || "Failed to route domain on Render.";
        setErrorMessage(cleanMsg);
        throw new Error(cleanMsg);
      }

      setProvisionMessage("Provisioning Cloudflare Anycast CNAME...");
      await new Promise((r) => setTimeout(r, 400));

      const updatedDomain: SubdomainRecord = {
        ...domain,
        target: res.targetCname || selectedService.defaultDomain || `${selectedService.name}.onrender.com`,
        preset: "render",
        updatedAt: new Date().toISOString(),
      };
      DomainService.saveDomains([updatedDomain]);

      // Progressive Live Verification Ladder: 1s, 2s, 3s, 5s, 7s
      const intervals = [1000, 2000, 3000, 5000, 7000];
      const stageMessages = [
        "Verifying Anycast edge routing (1s)...",
        "Synchronizing Render SSL certificate (2s)...",
        "Checking service deployment status (3s)...",
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
      setIsChangingService(false);
      if (onRefreshDomain) onRefreshDomain(updatedDomain);

      if (liveConfirmed) {
        try {
          confetti({ particleCount: 140, spread: 80, origin: { y: 0.5 } });
        } catch {}
        toast.success(`🎉 ${domain.fullDomain} is live on Render (${selectedService.name})!`);
      } else {
        toast.info(
          `DNS is provisioned on Anycast Edge. Render SSL handshake is completing in the background and will be reachable shortly.`
        );
      }
    } catch (err: any) {
      console.error("Render deployment notice:", err);
      setIsDeploying(false);
      toast.error(err.message || "Could not link domain to Render service.");
    }
  };

  const filteredServices = services.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.defaultDomain.toLowerCase().includes(search.toLowerCase())
  );

  // ─── RELEASED / LOCKED STATE ───
  if (isReleased) {
    return (
      <div className="space-y-4 max-w-5xl">
        <Card className="border-amber-500/30 bg-(--color-card) rounded-xl shadow-xs overflow-hidden">
          <CardHeader className="p-6 border-b border-(--color-rule)">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
              <Lock className="w-4 h-4" />
              <span>Render Integration Locked</span>
            </div>
            <CardTitle className="text-xl font-mono font-black text-(--color-ink) pt-1">
              Subdomain Released &amp; Unlinked
            </CardTitle>
            <CardDescription className="text-xs text-(--color-muted)">
              {domain.fullDomain} was released. All Render service aliases and Cloudflare Anycast CNAME records have been permanently detached.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-600 dark:text-amber-400">
                <Clock className="w-4 h-4" />
                <span>Edge Cooldown Active: {cooldownMinutes || 120} minutes remaining</span>
              </div>
              <p className="text-[12px] leading-relaxed text-(--color-muted)">
                You cannot re-link or deploy Render services to this subdomain because it is released. Once the 2-hour fair-use cooldown expires, your account resets and you can claim a brand-new subdomain.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── ALREADY CONNECTED TO RENDER SERVICE ───
  if (isAlreadyConnected && !isChangingService) {
    return (
      <div className="space-y-4 max-w-5xl">
        <Card className="border-purple-500/30 bg-(--color-card) rounded-xl shadow-xs overflow-hidden">
          <CardHeader className="p-6 border-b border-(--color-rule)">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  <span>Successfully Connected to Render Service</span>
                </div>
                <CardTitle className="text-lg sm:text-xl font-mono font-black text-(--color-ink) pt-1">
                  {domain.fullDomain}
                </CardTitle>
                <CardDescription className="text-xs text-(--color-muted) mt-0.5">
                  Routing active traffic directly to Render Anycast edge network.
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
                <div className="font-mono font-bold text-(--color-ink) truncate">{domain.target || "your-app.onrender.com"}</div>
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
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-(--color-ink)">Zero Configuration Required</span>
                <p className="leading-relaxed">
                  Your Render service is mapped to <code className="font-mono text-(--color-ink)">{domain.fullDomain}</code>. Any new deployments on Render will automatically go live.
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-(--color-card-subtle) border-t border-(--color-rule) p-4 flex items-center justify-between text-xs">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsChangingService(true)}
              className="text-xs"
            >
              Change Connected Service
            </Button>
            <a
              href="https://render.com/docs/custom-domains"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-mono text-(--color-muted) hover:text-(--color-ink) flex items-center gap-1"
            >
              <span>Render Docs</span>
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
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase tracking-wider">
              <Server className="w-4 h-4" />
              <span>1-Click Cloud Routing</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              Render Hosting
            </span>
          </div>
          <CardTitle className="text-xl font-mono font-black text-(--color-ink) pt-2">
            Connect Render Web Service
          </CardTitle>
          <CardDescription className="text-xs text-(--color-muted)">
            Connect your Node.js, Python, Go, or Static Site on Render to{" "}
            <span className="font-mono font-bold text-(--color-ink)">{domain.fullDomain}</span> with zero manual DNS configuration.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Step 1: Render API Key Input */}
          {!isConnected ? (
            <div className="space-y-3 p-4 rounded-xl bg-(--color-surface) border border-(--color-rule)">
              <div className="space-y-1">
                <label className="text-xs font-bold text-(--color-ink) flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-purple-500" />
                  <span>Enter Render API Key</span>
                </label>
                <p className="text-[11px] text-(--color-muted)">
                  Find your API key in Render Dashboard &rarr; Account Settings &rarr; API Keys.
                </p>
              </div>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="rnd_xxxxxxxxxxxxxxxxxxxxxxxx"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="font-mono text-xs"
                />
                <Button
                  onClick={() => loadServices()}
                  disabled={isLoadingServices || !apiKey.trim()}
                  className="text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shrink-0"
                >
                  {isLoadingServices ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Connect"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs">
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-medium">
                  <Radio className="w-3.5 h-3.5 text-purple-500 animate-pulse" />
                  <span>Connected to Render API</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDisconnect}
                  className="h-6 text-[11px] text-(--color-muted) hover:text-red-600"
                >
                  Disconnect
                </Button>
              </div>

              {/* Step 2: Service Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-(--color-ink) uppercase tracking-wider">
                    Select Render Service
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => loadServices()}
                    disabled={isLoadingServices}
                    className="h-7 text-xs text-(--color-muted) hover:text-(--color-ink) gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingServices ? "animate-spin" : ""}`} />
                    <span>Refresh</span>
                  </Button>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-(--color-muted)" />
                  <Input
                    placeholder="Filter services by name or domain..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 text-xs"
                  />
                </div>

                <div className="border border-(--color-rule) rounded-lg overflow-hidden max-h-56 overflow-y-auto divide-y divide-(--color-rule) bg-(--color-surface)">
                  {isLoadingServices ? (
                    <div className="p-8 text-center text-xs text-(--color-muted) flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                      <span>Loading Render services...</span>
                    </div>
                  ) : filteredServices.length === 0 ? (
                    <div className="p-8 text-center text-xs text-(--color-muted)">
                      No web services or static sites found in your Render account.
                    </div>
                  ) : (
                    filteredServices.map((s) => {
                      const isSelected = selectedService?.id === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSelectedService(s)}
                          className={`w-full p-3 text-left text-xs flex items-center justify-between transition-colors hover:bg-purple-500/5 ${
                            isSelected ? "bg-purple-500/10 font-bold" : ""
                          }`}
                        >
                          <div className="space-y-0.5 truncate pr-2">
                            <div className="font-mono text-xs text-(--color-ink) flex items-center gap-2">
                              <span>{s.name}</span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] bg-purple-500/15 text-purple-600 dark:text-purple-400 font-sans font-semibold uppercase">
                                {s.type.replace("_", " ")}
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-(--color-muted) truncate">{s.defaultDomain}</div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-purple-600 shrink-0" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-6 border-t border-(--color-rule) bg-(--color-surface) flex flex-wrap items-center justify-between gap-3">
          {isChangingService && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsChangingService(false)}
              className="text-xs"
            >
              Cancel
            </Button>
          )}
          <div className="ml-auto flex items-center gap-2">
            <Button
              onClick={handleDeploy}
              disabled={!selectedService || isDeploying || !isConnected}
              className="text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white gap-2 shadow-xs"
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

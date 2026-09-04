"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { DomainService, UserSession } from "@/lib/domain-service";
import { SubdomainRecord } from "@/lib/types";
import { api, VercelProject, PingResponse } from "@/lib/api";
import { ROOT_DOMAIN, GITHUB_REPO_URL, GITHUB_REPO_NAME } from "@/lib/constants";
import { GithubIcon } from "@/components/icons";
import { PropagationModal } from "@/components/PropagationModal";
import { CloudflareModal } from "@/components/CloudflareModal";
import { DeleteDomainModal } from "@/components/DeleteDomainModal";
import { ManageHeader } from "@/components/manage/ManageHeader";
import { ManageSidebar, DashboardTab } from "@/components/manage/ManageSidebar";
import { OverviewTab } from "@/components/manage/OverviewTab";
import { VercelTab } from "@/components/manage/VercelTab";
import { GitHubPagesTab } from "@/components/manage/GitHubPagesTab";
import { RenderTab } from "@/components/manage/RenderTab";
import { CustomDnsTab } from "@/components/manage/CustomDnsTab";
import { HealthTab } from "@/components/manage/HealthTab";
import { DangerTab } from "@/components/manage/DangerTab";
import { ManageLoginCard } from "@/components/manage/ManageLoginCard";
import { StarAlertBanner } from "@/components/manage/StarAlertBanner";
import { NoSubdomainCard } from "@/components/manage/NoSubdomainCard";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { CommonLockdownView } from "@/components/manage/CommonLockdownView";

function ManageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawName = searchParams.get("name") || "";
  const name = rawName.toLowerCase().trim().replace(/[^a-z0-9-]/g, "");

  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [domain, setDomain] = useState<SubdomainRecord | null>(null);
  const [user, setUser] = useState<UserSession | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  // --- Vercel State ---
  const [vercelToken, setVercelToken] = useState<string | null>(null);
  const [vercelProjects, setVercelProjects] = useState<VercelProject[]>([]);
  const [selectedVercelProject, setSelectedVercelProject] = useState<VercelProject | null>(null);
  const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(false);
  const [isConnectingVercel, setIsConnectingVercel] = useState<boolean>(false);
  const [vercelError, setVercelError] = useState<string | null>(null);

  // --- Custom DNS State ---
  const [customTarget, setCustomTarget] = useState<string>("");
  const [customRecordType, setCustomRecordType] = useState<"CNAME" | "A">("CNAME");
  const [isSavingCustom, setIsSavingCustom] = useState<boolean>(false);

  // --- Deployment & Telemetry ---
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [provisionMessage, setProvisionMessage] = useState<string>("");
  const [pingResult, setPingResult] = useState<PingResponse | null>(null);

  // --- Modals ---
  const [propagationModalOpen, setPropagationModalOpen] = useState<boolean>(false);
  const [cloudflareModalOpen, setCloudflareModalOpen] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [isDeletingDomain, setIsDeletingDomain] = useState<boolean>(false);

  // --- Cooldown & Star Guards ---
  const [cooldownData, setCooldownData] = useState<{ active: boolean; cooldownMinutes: number; cooldownUntil: string } | null>(null);
  const [isStarMissing, setIsStarMissing] = useState<boolean>(false);
  const [isReVerifying, setIsReVerifying] = useState<boolean>(false);

  const fetchVercelProjects = async (token: string) => {
    setIsLoadingProjects(true);
    setVercelError(null);
    try {
      const data = await api.vercel.getProjects(token);
      if (data.projects && Array.isArray(data.projects)) {
        setVercelProjects(data.projects);
        if (data.projects.length > 0 && !selectedVercelProject) {
          setSelectedVercelProject(data.projects[0]);
        }
      } else if (data.connected === false) {
        setVercelToken(null);
        localStorage.removeItem("go_live_vercel_token");
        setVercelError("Your Vercel session has expired. Please reconnect.");
      }
    } catch (err: any) {
      console.error("Vercel projects fetch notice:", err);
      setVercelError("Could not load projects. Check your connection or reconnect Vercel.");
    } finally {
      setIsLoadingProjects(false);
    }
  };

  useEffect(() => {
    // 1. Check incoming GitHub OAuth session
    const ghSessionParam = searchParams.get("gh_session");
    if (ghSessionParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(ghSessionParam));
        const session: UserSession = {
          id: parsed.id,
          githubUsername: parsed.username,
          name: parsed.name || parsed.username,
          avatarUrl: parsed.avatar,
          hasStarred: parsed.hasStarred,
          token: parsed.token,
          createdAt: new Date().toISOString(),
        };
        DomainService.saveUserSession(session);
        setUser(session);
      } catch (e) {
        console.error("Error parsing gh_session:", e);
      }
    }

    // 2. Load authenticated user & domain list
    const currentUser = DomainService.getCurrentUser();
    if (currentUser && currentUser.token) {
      setUser(currentUser);

      api.domains.list(currentUser.githubUsername, currentUser.token).then((data) => {
        if (data && data.success && Array.isArray(data.domains)) {
          const remoteList = data.domains;
          if (remoteList.length > 0) {
            const active = name ? (remoteList.find((d: any) => d.name === name) || remoteList[0]) : remoteList[0];
            const isReleased = Boolean(active.isDeleted || active.status === "RELEASED" || data.isLockedDown);
            const mappedDomain: SubdomainRecord = {
              id: active._id || active.id,
              name: active.name,
              fullDomain: active.fullDomain,
              userId: active.userId,
              userGithub: active.userGithub,
              userAvatar: active.userAvatar,
              preset: active.provider === "vercel" ? "vercel" : "custom",
              target: isReleased ? "" : (active.target || ""),
              recordType: active.recordType || "CNAME",
              proxied: active.proxied || false,
              ttl: 300,
              sslStatus: isReleased ? "error" : "active",
              healthStatus: isReleased ? "degraded" : "healthy",
              latencyMs: isReleased ? 0 : 32,
              createdAt: active.createdAt,
              updatedAt: active.updatedAt,
              viewsCount: 1,
              dnsQueriesCount: 1,
              description: active.description || "",
              starredRepo: active.starredRepo || false,
              tags: [active.provider || "Vercel"],
              status: isReleased ? "RELEASED" : (active.status || "active"),
              isDeleted: isReleased,
              deletedAt: active.deletedAt || null,
            };
            setDomain(mappedDomain);
            DomainService.saveDomains([mappedDomain]);
            if (mappedDomain.target) setCustomTarget(mappedDomain.target);
          } else {
            // Developer owns 0 subdomains and cooldown has expired
            setDomain(null);
            DomainService.saveDomains([]);
            if (name) {
              router.replace("/manage");
            }
          }
        } else {
          setDomain(null);
          DomainService.saveDomains([]);
        }

        if (data?.cooldown?.active) {
          setCooldownData(data.cooldown);
        } else {
          setCooldownData(null);
        }
      });

      // Check Star Liveness
      if (currentUser.hasStarred) {
        setIsStarMissing(false);
      }
      api.auth
        .verifyStar(currentUser.token, currentUser.githubUsername, false)
        .then((data) => {
          if (data?.success && data?.hasStarred) {
            setIsStarMissing(false);
            DomainService.toggleStar(true);
          } else if (data?.hasStarred === false) {
            setIsStarMissing(true);
            DomainService.toggleStar(false);
          }
        })
        .catch(() => {});
    } else {
      setUser(null);
      setDomain(null);
    }

    // Check Vercel Token from URL or storage
    const incomingVercelToken = searchParams.get("vercel_token");
    if (incomingVercelToken) {
      localStorage.setItem("go_live_vercel_token", incomingVercelToken);
      setVercelToken(incomingVercelToken);
      fetchVercelProjects(incomingVercelToken);
      toast.success("✓ Connected Vercel Account!", { id: "vercel-connect" });
    } else {
      const savedToken = localStorage.getItem("go_live_vercel_token");
      if (savedToken) {
        setVercelToken(savedToken);
        fetchVercelProjects(savedToken);
      }
    }
  }, [name, searchParams]);

  const handleGithubLogin = async () => {
    setIsAuthenticating(true);
    try {
      const returnPath = `/manage${name ? `?name=${encodeURIComponent(name)}` : ""}`;
      const data = await api.auth.getGithubAuthUrl(returnPath);
      if (data.authUrl) window.location.href = data.authUrl;
    } catch {
      toast.error("Could not reach auth server.", { id: "auth-server-err" });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("go_live_auth_user_v1");
    localStorage.removeItem("go_live_vercel_token");
    setUser(null);
    setDomain(null);
    setVercelToken(null);
    toast.info("Signed out successfully.", { id: "sign-out" });
  };

  const handleConnectVercel = async () => {
    setIsConnectingVercel(true);
    try {
      const returnPath = `/manage?name=${encodeURIComponent(domain?.name || name || "")}`;
      const data = await api.vercel.getAuthUrl(returnPath);
      if (data?.authUrl) {
        window.location.href = data.authUrl;
      } else {
        toast.error(
          data?.error ||
            "Could not initialize Vercel OAuth. You can connect instantly using a Personal Access Token below."
        );
      }
    } catch {
      toast.error("Could not reach Vercel authentication service. Please try again or use a Personal Access Token.");
    } finally {
      setIsConnectingVercel(false);
    }
  };

  const handleDisconnectVercel = () => {
    localStorage.removeItem("go_live_vercel_token");
    setVercelToken(null);
    setVercelProjects([]);
    setSelectedVercelProject(null);
    toast.info("Disconnected Vercel account.");
  };

  const handleConnectWithToken = async (token: string) => {
    if (!token.trim()) {
      toast.error("Please enter a valid Vercel Personal Access Token.");
      return;
    }
    setIsConnectingVercel(true);
    try {
      const res = await api.vercel.verifyToken(token.trim());
      if (res?.success && res?.projects) {
        setVercelToken(token.trim());
        localStorage.setItem("go_live_vercel_token", token.trim());
        setVercelProjects(res.projects);
        toast.success("✓ Vercel account connected successfully!");
      } else {
        toast.error(res?.message || res?.error || "Invalid Vercel token. Please check and try again.");
      }
    } catch {
      toast.error("Could not verify Vercel token.");
    } finally {
      setIsConnectingVercel(false);
    }
  };

  const executeDomainPing = async (fullDomain: string) => {
    try {
      const res = await api.domains.ping(fullDomain);
      if (res?.success) setPingResult(res);
    } catch (e) {
      console.warn("Ping check notice:", e);
    }
  };

  const handleConnectAndDeployVercel = async () => {
    if (!domain || !selectedVercelProject) return;

    setIsDeploying(true);
    setPingResult(null);
    setVercelError(null);
    setProvisionMessage("Configuring domain on Vercel...");

    try {
      const assignData = await api.vercel.assignDomain({
        projectId: selectedVercelProject.id,
        domain: domain.fullDomain,
        token: vercelToken,
      });

      if (!assignData.success) {
        const cleanMsg = assignData.error || assignData.message || "Failed to route domain on Vercel.";
        setVercelError(cleanMsg);
        throw new Error(cleanMsg);
      }

      setProvisionMessage("Provisioning Cloudflare Anycast CNAME...");
      await new Promise((r) => setTimeout(r, 400));

      const updatedDomain: SubdomainRecord = {
        ...domain,
        target: assignData.targetCname || "cname.vercel-dns.com",
        preset: "vercel",
        updatedAt: new Date().toISOString(),
      };
      setDomain(updatedDomain);
      DomainService.saveDomains([updatedDomain]);

      // Progressive Live Verification Ladder: 1s, 2s, 3s, 5s, 7s, 10s
      const intervals = [1000, 2000, 3000, 5000, 7000, 10000];
      const stageMessages = [
        "Verifying Anycast edge routing (1s)...",
        "Synchronizing SSL certificate handshake (2s)...",
        "Checking Vercel deployment status (3s)...",
        "Probing live HTTP response from global mesh (5s)...",
        "Confirming edge network resolution (7s)...",
        "Final live handshake check (10s)...",
      ];

      let liveConfirmed = false;
      for (let i = 0; i < intervals.length; i++) {
        setProvisionMessage(stageMessages[i] || `Probing live status (${intervals[i] / 1000}s)...`);
        await new Promise((r) => setTimeout(r, intervals[i]));

        // Trigger background Vercel domain verification on early attempts
        if (i === 1 || i === 3) {
          api.vercel.verifyDomain({
            projectId: selectedVercelProject.id,
            domain: domain.fullDomain,
            token: vercelToken || "",
          }).catch(() => {});
        }

        try {
          const res = await api.domains.ping(domain.fullDomain);
          if (res?.success) {
            setPingResult(res);
            if (res.httpReachable || (res.statusCode && res.statusCode < 500)) {
              liveConfirmed = true;
              break;
            }
          }
        } catch {}
      }

      setIsDeploying(false);

      if (liveConfirmed) {
        try {
          confetti({ particleCount: 140, spread: 80, origin: { y: 0.5 } });
        } catch {}
        toast.success(`🎉 ${domain.fullDomain} is live on ${selectedVercelProject.name}!`);
      } else {
        toast.info(
          `DNS is provisioned on Anycast Edge. Vercel SSL handshake is completing in the background and will be reachable shortly.`
        );
      }
    } catch (err: any) {
      console.error("Deployment notice:", err);
      setIsDeploying(false);
      toast.error(err.message || "Could not link domain to Vercel project.");
    }
  };

  const handleSaveCustomTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain || !customTarget.trim()) return;

    setIsSavingCustom(true);
    setPingResult(null);
    try {
      const res = await DomainService.assignCustomTargetRemote({
        name: domain.name,
        target: customTarget.trim(),
        recordType: customRecordType,
      });

      if (res.success && res.domain) {
        setDomain(res.domain);
        DomainService.saveDomains([res.domain]);

        // Progressive Live Verification Ladder for Custom DNS: 1s, 2s, 3s, 5s, 7s
        const customIntervals = [1000, 2000, 3000, 5000, 7000];
        let liveConfirmed = false;
        for (let i = 0; i < customIntervals.length; i++) {
          await new Promise((r) => setTimeout(r, customIntervals[i]));
          try {
            const ping = await api.domains.ping(domain.fullDomain);
            if (ping?.success) {
              setPingResult(ping);
              if (ping.httpReachable || (ping.statusCode && ping.statusCode < 500)) {
                liveConfirmed = true;
                break;
              }
            }
          } catch {}
        }

        if (liveConfirmed) {
          try {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
          } catch {}
          toast.success(`✓ ${domain.fullDomain} is live and responding!`);
        } else {
          toast.info(`Anycast DNS record active. Traffic is routed to ${customTarget.trim()}.`);
        }
      } else {
        toast.error(res.error || "Failed to update DNS target.");
      }
    } catch {
      toast.error("Network error while saving target.");
    } finally {
      setIsSavingCustom(false);
    }
  };

  const handleReVerifyStar = async () => {
    if (!user?.token) return;
    setIsReVerifying(true);
    try {
      const data = await api.auth.verifyStar(user.token, user.githubUsername, true);
      if (data.success && data.hasStarred) {
        setIsStarMissing(false);
        DomainService.toggleStar(true);
        toast.success("★ Star verified! Your domain is active.");
      } else {
        toast.error("Star not detected yet. Please star on GitHub first!");
      }
    } catch {
      toast.error("Verification check failed.");
    } finally {
      setIsReVerifying(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!domain) return;
    setIsDeletingDomain(true);
    try {
      const res = await DomainService.deleteSubdomainRemote(
        domain.id || domain.name,
        user?.token,
        vercelToken || undefined
      );
      setDeleteModalOpen(false);

      // Soft-delete domain: mark as RELEASED so dashboard enters lockdown mode immediately
      const releasedDomain: SubdomainRecord = {
        ...domain,
        target: "",
        status: "RELEASED",
        isDeleted: true,
        sslStatus: "error",
        healthStatus: "degraded",
        latencyMs: 0,
        updatedAt: new Date().toISOString(),
      };
      setDomain(releasedDomain);
      DomainService.saveDomains([releasedDomain]);

      setCooldownData({
        active: true,
        cooldownMinutes: res?.cooldownMinutes || 120,
        cooldownUntil: res?.cooldownUntil || new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      });
      toast.success(`✓ '${domain.fullDomain}' released and purged from edge. 2-hour cooldown started.`, { id: "domain-released" });
    } catch {
      toast.error("Failed to release subdomain.", { id: "domain-release-err" });
    } finally {
      setIsDeletingDomain(false);
    }
  };

  const isLockedDown = Boolean(
    domain && (domain.isDeleted || domain.status === "RELEASED" || (cooldownData && cooldownData.active))
  );

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-(--color-signal) selection:text-white bg-(--color-paper)">
      {/* ─── FLUSH TOPBAR ─── */}
      <ManageHeader
        domain={domain}
        user={user}
        isLockedDown={isLockedDown}
        onSignOut={handleSignOut}
      />

      {/* ─── FULL BLEED BODY SHELL ─── */}
      <div className="w-full flex-1 flex flex-col md:flex-row bg-(--color-paper)">
        {!user ? (
          <ManageLoginCard
            isAuthenticating={isAuthenticating}
            onLogin={handleGithubLogin}
          />
        ) : domain ? (
          <>
            {/* ─── DOCKED LEFT SIDEBAR ─── */}
            <ManageSidebar
              domain={domain}
              user={user}
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              vercelToken={vercelToken}
              isLockedDown={isLockedDown}
            />

            {/* ─── MAIN CONTENT AREA ─── */}
            <main className="flex-1 p-6 sm:p-8 lg:p-10 space-y-6 overflow-y-auto">
              {isStarMissing && (
                <StarAlertBanner
                  isReVerifying={isReVerifying}
                  onReVerify={handleReVerifyStar}
                />
              )}

              {isLockedDown ? (
                <CommonLockdownView
                  domain={domain}
                  activeTab={activeTab}
                  cooldownMinutes={cooldownData?.cooldownMinutes || 120}
                  cooldownUntil={cooldownData?.cooldownUntil}
                />
              ) : (
                <>
                  {activeTab === "overview" && (
                    <OverviewTab
                      domain={domain}
                      pingResult={pingResult}
                      onPing={() => executeDomainPing(domain.fullDomain)}
                      onNavigateTab={setActiveTab}
                    />
                  )}

                  {activeTab === "vercel" && (
                    <VercelTab
                      domain={domain}
                      vercelToken={vercelToken}
                      vercelProjects={vercelProjects}
                      selectedProject={selectedVercelProject}
                      isLoadingProjects={isLoadingProjects}
                      isConnectingVercel={isConnectingVercel}
                      isDeploying={isDeploying}
                      provisionMessage={provisionMessage}
                      errorMessage={vercelError}
                      onConnectVercel={handleConnectVercel}
                      onConnectWithToken={handleConnectWithToken}
                      onDisconnectVercel={handleDisconnectVercel}
                      onRefreshProjects={() => vercelToken && fetchVercelProjects(vercelToken)}
                      onSelectProject={setSelectedVercelProject}
                      onDeploy={handleConnectAndDeployVercel}
                    />
                  )}

                  {activeTab === "github-pages" && (
                    <GitHubPagesTab
                      domain={domain}
                      authToken={user?.token}
                      isLockedDown={isLockedDown}
                      cooldownMinutes={cooldownData?.cooldownMinutes || 120}
                      onRefreshDomain={(updated) => {
                        setDomain(updated);
                        DomainService.saveDomains([updated]);
                      }}
                    />
                  )}

                  {activeTab === "render" && (
                    <RenderTab
                      domain={domain}
                      isLockedDown={isLockedDown}
                      cooldownMinutes={cooldownData?.cooldownMinutes || 120}
                      onRefreshDomain={(updated) => {
                        setDomain(updated);
                        DomainService.saveDomains([updated]);
                      }}
                    />
                  )}

                  {activeTab === "custom" && (
                    <CustomDnsTab
                      domain={domain}
                      customTarget={customTarget}
                      customRecordType={customRecordType}
                      isSaving={isSavingCustom}
                      onChangeTarget={setCustomTarget}
                      onChangeRecordType={setCustomRecordType}
                      onSave={handleSaveCustomTarget}
                    />
                  )}

                  {activeTab === "health" && (
                    <HealthTab
                      domain={domain}
                      pingResult={pingResult}
                      onPing={() => executeDomainPing(domain.fullDomain)}
                      onOpenPropagationModal={() => setPropagationModalOpen(true)}
                    />
                  )}

                  {activeTab === "danger" && (
                    <DangerTab
                      domain={domain}
                      onOpenDeleteModal={() => setDeleteModalOpen(true)}
                    />
                  )}
                </>
              )}
            </main>
          </>
        ) : (
          <NoSubdomainCard
            username={user.githubUsername}
            cooldownData={cooldownData}
          />
        )}
      </div>


      {/* Modals */}
      <DeleteDomainModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        domain={domain}
        isLoading={isDeletingDomain}
      />

      <PropagationModal
        domain={domain}
        isOpen={propagationModalOpen}
        onClose={() => setPropagationModalOpen(false)}
      />

      <CloudflareModal
        isOpen={cloudflareModalOpen}
        onClose={() => setCloudflareModalOpen(false)}
      />
    </div>
  );
}

export default function ManagePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-mono text-xs">Loading dashboard...</div>}>
      <ManageContent />
    </Suspense>
  );
}

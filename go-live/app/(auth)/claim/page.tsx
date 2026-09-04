"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ROOT_DOMAIN, GITHUB_REPO_URL } from "@/lib/constants";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { api } from "@/lib/api";
import { DomainService } from "@/lib/domain-service";

import { ClaimNavbar } from "@/components/claim/ClaimNavbar";
import { ClaimLimitReachedCard } from "@/components/claim/ClaimLimitReachedCard";
import { ClaimDomainHero } from "@/components/claim/ClaimDomainHero";
import { ClaimStep1Auth } from "@/components/claim/ClaimStep1Auth";
import { ClaimStep2Star } from "@/components/claim/ClaimStep2Star";
import { ClaimStep3Deploy } from "@/components/claim/ClaimStep3Deploy";
import { ClaimFooter } from "@/components/claim/ClaimFooter";

interface UserProfile {
  id: string;
  githubUsername: string;
  avatarUrl?: string;
  hasStarred: boolean;
}

const STEP_PHRASES: Record<number, { title: string; subtitle: string }> = {
  1: {
    title: "Claiming anycast slot for",
    subtitle: "Sign in with GitHub to verify you are a real developer (and not an automated crawler trying to hog 10,000 domains)."
  },
  2: {
    title: "One last micro-step for",
    subtitle: "Star our open-source repo to unlock your free edge slot forever. It fuels the servers and keeps DNS free!"
  },
  3: {
    title: "DNS slot locked & allocated for",
    subtitle: "Your edge record is reserved. Choose your deployment target to route live traffic in seconds."
  }
};

function ClaimWizardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [name, setName] = useState<string>("");
  const [step, setStep] = useState<number>(1);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [isVerifyingStar, setIsVerifyingStar] = useState<boolean>(false);
  const [isFlippingCube, setIsFlippingCube] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [cooldownError, setCooldownError] = useState<string | null>(null);

  // When developer already owns a claimed subdomain - Subdomain Limit Reached
  const [isAlreadyClaimedState, setIsAlreadyClaimedState] = useState<boolean>(false);
  const [existingSubdomain, setExistingSubdomain] = useState<any | null>(null);

  const fullDomain = name ? `${name}.${ROOT_DOMAIN}` : `... .${ROOT_DOMAIN}`;

  // Helper to trigger 3D cube rotation transition
  const triggerCubeFlip = (nextStep: number) => {
    setIsFlippingCube(true);
    setTimeout(() => {
      setStep(nextStep);
      setTimeout(() => {
        setIsFlippingCube(false);
      }, 300);
    }, 200);
  };

  // Check if developer already owns a domain on Go-Live
  const checkDeveloperDomainOwnership = async (username: string, authToken: string, targetRequestedName: string) => {
    try {
      const data = await api.domains.list(username, authToken);

      if (data?.cooldown?.active) {
        setCooldownError(
          `2-Hour Cooldown Active: You released a domain recently. You can claim a new domain in ${data.cooldown.cooldownMinutes} minutes.`
        );
      }

      if (data?.success && Array.isArray(data.domains) && data.domains.length > 0) {
        const owned = data.domains[0];
        setExistingSubdomain(owned);

        if (targetRequestedName && targetRequestedName.toLowerCase() === owned.name.toLowerCase()) {
          router.replace(`/manage?name=${encodeURIComponent(owned.name)}`);
          return true;
        }

        setIsAlreadyClaimedState(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const rawName = searchParams.get("name") || "";
    const cleanName = rawName.toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (cleanName) setName(cleanName);

    const tokenParam = searchParams.get("token");
    const userParam = searchParams.get("user");
    const stepParam = searchParams.get("step");
    const cooldownParam = searchParams.get("cooldown");
    const minutesParam = searchParams.get("minutes");

    if (cooldownParam === "active") {
      setCooldownError(
        `2-Hour Cooldown Active: You recently deleted a domain. Please wait ${minutesParam || 120} minutes before registering a new domain.`
      );
    }

    const authErrorParam = searchParams.get("auth_error");
    if (authErrorParam) {
      toast.error(`GitHub authentication failed: ${authErrorParam.replace(/_/g, " ")}`, { id: "auth-error" });
    }

    const ghSessionParam = searchParams.get("gh_session");
    if (ghSessionParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(ghSessionParam));
        const sessionUser = {
          id: parsed.id,
          githubUsername: parsed.username,
          name: parsed.name || parsed.username,
          avatarUrl: parsed.avatar,
          hasStarred: Boolean(parsed.hasStarred),
          token: parsed.token,
          createdAt: new Date().toISOString(),
        };
        setUser(sessionUser);
        setToken(parsed.token);
        localStorage.setItem("go_live_user", JSON.stringify(sessionUser));
        localStorage.setItem("go_live_token", parsed.token);
        DomainService.saveUserSession(sessionUser);

        checkDeveloperDomainOwnership(sessionUser.githubUsername, parsed.token, cleanName).then((hasDomain) => {
          if (!hasDomain) {
            if (sessionUser.hasStarred) {
              if (cleanName) {
                registerSubdomain(sessionUser, cleanName);
              }
              setStep(3);
              toast.success(`Welcome back @${sessionUser.githubUsername}! Star verified & slot reserved.`, { id: "auth-star-verified" });
            } else {
              setStep(2);
              toast.success(`Connected as @${sessionUser.githubUsername}! Star our repo to unlock.`, { id: "auth-connected" });
            }
          }
        });
      } catch (e) {
        console.error("Error parsing gh_session:", e);
      }
    } else if (tokenParam && userParam) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userParam));
        setUser(parsedUser);
        setToken(tokenParam);
        localStorage.setItem("go_live_user", JSON.stringify(parsedUser));
        localStorage.setItem("go_live_token", tokenParam);

        checkDeveloperDomainOwnership(parsedUser.githubUsername, tokenParam, cleanName).then((hasDomain) => {
          if (!hasDomain) {
            if (stepParam) {
              setStep(parseInt(stepParam, 10));
            } else if (parsedUser.hasStarred) {
              setStep(3);
            } else {
              setStep(2);
            }
          }
        });
      } catch {
        toast.error("Could not parse GitHub user session.");
      }
    } else {
      const savedUser = localStorage.getItem("go_live_user");
      const savedToken = localStorage.getItem("go_live_token");
      if (savedUser && savedToken) {
        try {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
          setToken(savedToken);

          checkDeveloperDomainOwnership(parsed.githubUsername, savedToken, cleanName).then((hasDomain) => {
            if (!hasDomain) {
              if (parsed.hasStarred) {
                setStep(3);
              } else {
                setStep(2);
              }
            }
          });
        } catch {
          // ignore corrupted local state
        }
      }
    }
  }, [searchParams, router]);

  const handleGithubLogin = async () => {
    setIsAuthenticating(true);
    try {
      const returnPath = `/claim?name=${encodeURIComponent(name)}`;
      const data = await api.auth.getGithubAuthUrl(returnPath);
      if (data?.authUrl) {
        window.location.href = data.authUrl;
      } else {
        toast.error("GitHub OAuth service is currently unavailable.");
      }
    } catch {
      toast.error("Failed to connect to authentication service.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleOpenGithubRepo = () => {
    window.open(GITHUB_REPO_URL, "_blank");
  };

  const handleVerifyStar = async () => {
    if (!user || !token) {
      toast.error("Please connect GitHub first.");
      return;
    }

    setIsVerifyingStar(true);
    try {
      const res = await api.auth.verifyStar(token, user.githubUsername, true);

      if (res?.hasStarred) {
        const updated = { ...user, hasStarred: true };
        setUser(updated);
        localStorage.setItem("go_live_user", JSON.stringify(updated));

        // Immediately save & reserve subdomain in database
        if (name) {
          registerSubdomain(updated, name);
        }

        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
            colors: ["#6366f1", "#10b981", "#f59e0b"]
          });
        } catch {}

        toast.success("★ Star verified! Subdomain reserved & unlocked.");
        triggerCubeFlip(3);
      } else {
        toast.error(
          `Star not found yet for @${user.githubUsername}. Please star the repo and try again.`
        );
      }
    } catch {
      toast.error("Failed to verify star with GitHub API.");
    } finally {
      setIsVerifyingStar(false);
    }
  };

  const registerSubdomain = async (currentUser: UserProfile, domainName: string) => {
    try {
      const data = await api.domains.claim({
        name: domainName,
        token: token || undefined,
        user: {
          id: currentUser.id,
          githubUsername: currentUser.githubUsername,
          avatarUrl: currentUser.avatarUrl,
          hasStarred: currentUser.hasStarred,
        },
      });

      if (data?.cooldown?.active) {
        setCooldownError(
          `2-Hour Cooldown Active: You cannot claim a new domain yet. Please wait ${data.cooldown.cooldownMinutes} minutes.`
        );
        toast.error(`Cooldown Active: Wait ${data.cooldown.cooldownMinutes}m before claiming.`);
        return { cooldownActive: true };
      }

      if (data?.success) {
        toast.success(`Domain ${data.domain?.fullDomain || domainName} registered!`);
        return data;
      } else {
        if (data?.code === "SUBDOMAIN_LIMIT_REACHED") {
          setIsAlreadyClaimedState(true);
          return { alreadyClaimed: true };
        }
        toast.error(data?.message || data?.error || "Registration failed.");
        return null;
      }
    } catch {
      toast.error("Could not complete registration.");
      return null;
    }
  };

  const handleProceedToManage = async () => {
    if (cooldownError) {
      toast.error(cooldownError);
      return;
    }

    setIsRegistering(true);
    try {
      if (user && name) {
        const res = await registerSubdomain(user, name);
        if (res && (res.cooldownActive || res.alreadyClaimed)) {
          setIsRegistering(false);
          return;
        }
      }
      router.push(`/manage?name=${encodeURIComponent(name)}`);
    } catch {
      router.push(`/manage?name=${encodeURIComponent(name)}`);
    } finally {
      setIsRegistering(false);
    }
  };

  const currentPhrase = STEP_PHRASES[step] || STEP_PHRASES[1];

  return (
    <div className="min-h-screen flex flex-col justify-between font-sans selection:bg-(--color-signal) selection:text-white bg-(--color-paper)">
      <ClaimNavbar />

      {/* Case A: User already owns a claimed subdomain - Subdomain Limit Reached */}
      {isAlreadyClaimedState && existingSubdomain ? (
        <ClaimLimitReachedCard existingSubdomain={existingSubdomain} name={name} />
      ) : (
        /* Case B: Standard 3-Step Claim Wizard */
        <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 my-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Domain Title & Anycast Telemetry */}
            <ClaimDomainHero name={name} phrase={currentPhrase} />

            {/* Right Column: 3D Cube Action Box */}
            <div
              className="lg:col-span-5 transition-all duration-400 ease-out"
              style={{
                perspective: "1000px",
                transform: isFlippingCube ? "rotateY(-70deg) scale(0.94)" : "rotateY(0deg) scale(1)",
                opacity: isFlippingCube ? 0.3 : 1,
              }}
            >
              {step === 1 && (
                <ClaimStep1Auth
                  isAuthenticating={isAuthenticating}
                  onLogin={handleGithubLogin}
                />
              )}

              {step === 2 && (
                <ClaimStep2Star
                  username={user?.githubUsername}
                  isVerifyingStar={isVerifyingStar}
                  onOpenRepo={handleOpenGithubRepo}
                  onVerifyStar={handleVerifyStar}
                />
              )}

              {step === 3 && (
                <ClaimStep3Deploy
                  fullDomain={fullDomain}
                  username={user?.githubUsername}
                  cooldownError={cooldownError}
                  isRegistering={isRegistering}
                  onProceed={handleProceedToManage}
                />
              )}
            </div>
          </div>
        </main>
      )}

      <ClaimFooter />
    </div>
  );
}

export default function ClaimPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-mono text-xs">Loading reservation wizard...</div>}>
      <ClaimWizardContent />
    </Suspense>
  );
}

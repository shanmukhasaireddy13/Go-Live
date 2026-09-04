import { BACKEND_URL } from "./constants";
import { AvailabilityResult, SubdomainRecord, SocialProofResponse } from "./types";

export interface VercelProject {
  id: string;
  name: string;
  framework: string;
  defaultUrl: string;
  updatedAt: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  htmlUrl: string;
  defaultBranch: string;
  hasPages: boolean;
  isPrivate: boolean;
  updatedAt: string;
  description?: string;
}

export interface RenderService {
  id: string;
  name: string;
  type: string;
  repo?: string;
  autoDeploy?: string;
  url: string;
  defaultDomain: string;
  updatedAt: string;
}

export interface PingResponse {
  success: boolean;
  domain: string;
  dnsResolved: boolean;
  dnsRecord: string | null;
  httpReachable: boolean;
  statusCode: number | null;
  latencyMs: number;
}

/**
 * Centralized API Endpoints Map for Go-Live Frontend
 * All API routes and URL builders are strictly defined here.
 */
export const ENDPOINTS = {
  AUTH: {
    GITHUB_URL: (returnTo: string = "/") =>
      `${BACKEND_URL}/api/auth/github/url?returnTo=${encodeURIComponent(returnTo)}`,
    VERIFY_STAR: `${BACKEND_URL}/api/auth/github/verify-star`,
    ME: `${BACKEND_URL}/api/auth/me`,
  },
  DOMAINS: {
    CHECK: (query: string) =>
      `${BACKEND_URL}/api/domains/check?q=${encodeURIComponent(query)}`,
    CLAIM: `${BACKEND_URL}/api/domains/claim`,
    CUSTOM_TARGET: `${BACKEND_URL}/api/domains/custom-target`,
    PING: `${BACKEND_URL}/api/domains/ping`,
    LIST: (username?: string) =>
      username
        ? `${BACKEND_URL}/api/domains/list?user=${encodeURIComponent(username)}`
        : `${BACKEND_URL}/api/domains/list`,
    DELETE: (idOrName: string) =>
      `${BACKEND_URL}/api/domains/${encodeURIComponent(idOrName)}`,
  },
  VERCEL: {
    AUTH_URL: (returnTo: string = "/manage") =>
      `${BACKEND_URL}/api/integrations/vercel/url?returnTo=${encodeURIComponent(returnTo)}`,
    VERIFY_TOKEN: `${BACKEND_URL}/api/integrations/vercel/verify-token`,
    PROJECTS: (teamId?: string) =>
      teamId
        ? `${BACKEND_URL}/api/integrations/vercel/projects?teamId=${teamId}`
        : `${BACKEND_URL}/api/integrations/vercel/projects`,
    ASSIGN_DOMAIN: `${BACKEND_URL}/api/integrations/vercel/assign-domain`,
    VERIFY_DOMAIN: `${BACKEND_URL}/api/integrations/vercel/verify-domain`,
  },
  GITHUB: {
    REPOS: `${BACKEND_URL}/api/integrations/github/repos`,
    ASSIGN_PAGES: `${BACKEND_URL}/api/integrations/github/assign-pages`,
    VERIFY_PAGES: `${BACKEND_URL}/api/integrations/github/verify-pages`,
  },
  RENDER: {
    SERVICES: `${BACKEND_URL}/api/integrations/render/services`,
    ASSIGN_DOMAIN: `${BACKEND_URL}/api/integrations/render/assign-domain`,
    VERIFY_DOMAIN: `${BACKEND_URL}/api/integrations/render/verify-domain`,
  },
  DNS: {
    VERIFY: (name: string) =>
      `${BACKEND_URL}/api/dns/verify?name=${encodeURIComponent(name)}`,
  },
  SOCIAL_PROOF: `${BACKEND_URL}/api/social-proof`,
};

// In-memory instant cache with 3-second TTL for rapid keystroke debouncing
interface CacheEntry {
  result: AvailabilityResult;
  timestamp: number;
}
const availabilityMemoryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 3000;

/**
 * Centralized API Client for Go-Live Frontend
 * All backend communications are defined, cached, and strongly typed here.
 */
export const api = {
  endpoints: ENDPOINTS,

  auth: {
    getGithubAuthUrl: async (
      returnTo: string = "/"
    ): Promise<{ authUrl?: string; configured?: boolean; error?: string }> => {
      const res = await fetch(ENDPOINTS.AUTH.GITHUB_URL(returnTo));
      return res.json();
    },

    verifyStar: async (token: string, username: string, force: boolean = true) => {
      const res = await fetch(ENDPOINTS.AUTH.VERIFY_STAR, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, username, force }),
      });
      return res.json();
    },
  },

  domains: {
    invalidateCache: (query?: string) => {
      if (query) {
        availabilityMemoryCache.delete(query.toLowerCase().trim());
      } else {
        availabilityMemoryCache.clear();
      }
    },

    checkAvailability: async (
      query: string,
      signal?: AbortSignal
    ): Promise<AvailabilityResult> => {
      const clean = query.toLowerCase().trim().replace(/[^a-z0-9-]/g, "");
      if (!clean) {
        return {
          subdomain: "",
          fullDomain: `... .go-live.me`,
          isAvailable: false,
          isReserved: false,
          reason: "Please type a subdomain name.",
        };
      }

      // Fast cache hit if within 3 seconds
      const cached = availabilityMemoryCache.get(clean);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.result;
      }

      try {
        const res = await fetch(ENDPOINTS.DOMAINS.CHECK(clean), { signal });
        const data = await res.json();
        if (data && typeof data.isAvailable === "boolean") {
          availabilityMemoryCache.set(clean, { result: data, timestamp: Date.now() });
          return data;
        }
        return data;
      } catch (err: any) {
        if (err.name === "AbortError") {
          throw err;
        }
        return {
          subdomain: clean,
          fullDomain: `${clean}.go-live.me`,
          isAvailable: false,
          isReserved: false,
          reason: "Unable to verify domain availability right now. Please try again.",
        };
      }
    },

    claim: async (payload: {
      name: string;
      provider?: string;
      target?: string;
      token?: string;
      user?: {
        id?: string;
        githubUsername?: string;
        avatarUrl?: string;
        hasStarred?: boolean;
      };
    }) => {
      availabilityMemoryCache.clear();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (payload.token) {
        headers["Authorization"] = `Bearer ${payload.token}`;
      }

      const res = await fetch(ENDPOINTS.DOMAINS.CLAIM, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      return res.json();
    },

    assignCustomTarget: async (payload: {
      name: string;
      target: string;
      recordType?: string;
      proxied?: boolean;
      token?: string;
    }) => {
      availabilityMemoryCache.clear();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (payload.token) {
        headers["Authorization"] = `Bearer ${payload.token}`;
      }

      const res = await fetch(ENDPOINTS.DOMAINS.CUSTOM_TARGET, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      return res.json();
    },

    ping: async (domain: string): Promise<PingResponse> => {
      const res = await fetch(ENDPOINTS.DOMAINS.PING, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      return res.json();
    },

    list: async (username?: string, token?: string) => {
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(ENDPOINTS.DOMAINS.LIST(username), { headers });
      return res.json();
    },

    delete: async (idOrName: string, token?: string, vercelToken?: string) => {
      availabilityMemoryCache.clear();
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      if (vercelToken) {
        headers["x-vercel-token"] = vercelToken;
      }

      const res = await fetch(ENDPOINTS.DOMAINS.DELETE(idOrName), {
        method: "DELETE",
        headers,
      });
      return res.json();
    },

    clearCache: () => {
      availabilityMemoryCache.clear();
    },
  },

  vercel: {
    getAuthUrl: async (
      returnTo: string = "/manage"
    ): Promise<{ success?: boolean; authUrl?: string; state?: string; error?: string }> => {
      try {
        const res = await fetch(ENDPOINTS.VERCEL.AUTH_URL(returnTo));
        return await res.json();
      } catch (err) {
        return { error: "Network error connecting to Vercel authorization service" };
      }
    },

    verifyToken: async (token: string) => {
      const res = await fetch(ENDPOINTS.VERCEL.VERIFY_TOKEN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      return res.json();
    },

    getProjects: async (token: string, teamId?: string) => {
      const res = await fetch(ENDPOINTS.VERCEL.PROJECTS(teamId), {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },

    assignDomain: async (payload: {
      projectId: string;
      domain: string;
      token?: string | null;
      teamId?: string;
    }) => {
      availabilityMemoryCache.clear();
      const res = await fetch(ENDPOINTS.VERCEL.ASSIGN_DOMAIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.json();
    },

    verifyDomain: async (payload: {
      projectId: string;
      domain: string;
      token: string;
      teamId?: string;
    }) => {
      const res = await fetch(ENDPOINTS.VERCEL.VERIFY_DOMAIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.json();
    },
  },

  github: {
    getRepos: async (
      token?: string
    ): Promise<{ success: boolean; repos?: GitHubRepo[]; error?: string }> => {
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(ENDPOINTS.GITHUB.REPOS, { headers });
      return res.json();
    },

    assignPages: async (payload: {
      subdomain: string;
      repoOwner: string;
      repoName: string;
      branch?: string;
      path?: string;
      token?: string;
    }) => {
      availabilityMemoryCache.clear();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (payload.token) headers["Authorization"] = `Bearer ${payload.token}`;
      const res = await fetch(ENDPOINTS.GITHUB.ASSIGN_PAGES, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      return res.json();
    },

    verifyPages: async (payload: {
      repoOwner: string;
      repoName: string;
      token?: string;
    }) => {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (payload.token) headers["Authorization"] = `Bearer ${payload.token}`;
      const res = await fetch(ENDPOINTS.GITHUB.VERIFY_PAGES, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      return res.json();
    },
  },

  render: {
    getServices: async (
      apiKey: string
    ): Promise<{ success: boolean; services?: RenderService[]; error?: string }> => {
      const res = await fetch(ENDPOINTS.RENDER.SERVICES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });
      return res.json();
    },

    assignDomain: async (payload: {
      apiKey: string;
      serviceId: string;
      subdomain: string;
      customTarget?: string;
    }) => {
      availabilityMemoryCache.clear();
      const res = await fetch(ENDPOINTS.RENDER.ASSIGN_DOMAIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.json();
    },

    verifyDomain: async (payload: {
      apiKey: string;
      serviceId: string;
      domainId: string;
    }) => {
      const res = await fetch(ENDPOINTS.RENDER.VERIFY_DOMAIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.json();
    },
  },

  dns: {
    verify: async (name: string) => {
      const res = await fetch(ENDPOINTS.DNS.VERIFY(name));
      return res.json();
    },
  },

  socialProof: {
    getStats: async (): Promise<SocialProofResponse> => {
      const res = await fetch(ENDPOINTS.SOCIAL_PROOF);
      return res.json();
    },
  },
};

/**
 * Centralized API Endpoints & Routes Configuration for Go-Live Backend
 */

const GITHUB_API_BASE = "https://api.github.com";
const VERCEL_API_BASE = "https://api.vercel.com";
const CLOUDFLARE_API_BASE = "https://api.cloudflare.com/client/v4";
const RENDER_API_BASE = "https://api.render.com/v1";

const API = {
  GITHUB: {
    BASE_URL: GITHUB_API_BASE,
    OAUTH_AUTHORIZE: "https://github.com/login/oauth/authorize",
    OAUTH_ACCESS_TOKEN: "https://github.com/login/oauth/access_token",
    USER: `${GITHUB_API_BASE}/user`,
    USER_REPOS: `${GITHUB_API_BASE}/user/repos?per_page=100&sort=updated&type=all`,
    USER_STARRED_REPO: (repo) => `${GITHUB_API_BASE}/user/starred/${repo}`,
    PUBLIC_USER_STARRED: (username) => `${GITHUB_API_BASE}/users/${username}/starred`,
    STARGAZERS: (repo) => `${GITHUB_API_BASE}/repos/${repo}/stargazers?per_page=100`,
    PAGES: (owner, repo) => `${GITHUB_API_BASE}/repos/${owner}/${repo}/pages`,
    PAGES_HEALTH: (owner, repo) => `${GITHUB_API_BASE}/repos/${owner}/${repo}/pages/health`,
  },
  VERCEL: {
    BASE_URL: VERCEL_API_BASE,
    OAUTH_AUTHORIZE: "https://vercel.com/oauth/authorize",
    OAUTH_ACCESS_TOKEN: `${VERCEL_API_BASE}/v2/oauth/access_token`,
    INTEGRATION_NEW: (slug) => `https://vercel.com/integrations/${slug}/new`,
    PROJECTS: (teamId) =>
      teamId ? `${VERCEL_API_BASE}/v9/projects?teamId=${teamId}` : `${VERCEL_API_BASE}/v9/projects`,
    PROJECT_DOMAINS: (projectId, teamId) =>
      teamId
        ? `${VERCEL_API_BASE}/v9/projects/${projectId}/domains?teamId=${teamId}`
        : `${VERCEL_API_BASE}/v9/projects/${projectId}/domains`,
    PROJECT_DOMAIN: (projectId, domain, teamId) =>
      teamId
        ? `${VERCEL_API_BASE}/v9/projects/${projectId}/domains/${domain}?teamId=${teamId}`
        : `${VERCEL_API_BASE}/v9/projects/${projectId}/domains/${domain}`,
    DELETE_DOMAIN: (domain, teamId) =>
      teamId
        ? `${VERCEL_API_BASE}/v6/domains/${domain}?teamId=${teamId}`
        : `${VERCEL_API_BASE}/v6/domains/${domain}`,
    VERIFY_DOMAIN: (projectId, domain, teamId) =>
      teamId
        ? `${VERCEL_API_BASE}/v9/projects/${projectId}/domains/${domain}/verify?teamId=${teamId}`
        : `${VERCEL_API_BASE}/v9/projects/${projectId}/domains/${domain}/verify`,
  },
  RENDER: {
    BASE_URL: RENDER_API_BASE,
    SERVICES: `${RENDER_API_BASE}/services?limit=100`,
    SERVICE: (serviceId) => `${RENDER_API_BASE}/services/${serviceId}`,
    CUSTOM_DOMAINS: (serviceId) => `${RENDER_API_BASE}/services/${serviceId}/custom-domains`,
    CUSTOM_DOMAIN: (serviceId, domainId) =>
      `${RENDER_API_BASE}/services/${serviceId}/custom-domains/${domainId}`,
    VERIFY_DOMAIN: (serviceId, domainId) =>
      `${RENDER_API_BASE}/services/${serviceId}/custom-domains/${domainId}/verify`,
  },
  CLOUDFLARE: {
    BASE_URL: CLOUDFLARE_API_BASE,
    ZONE_DNS_RECORDS: (zoneId) => `${CLOUDFLARE_API_BASE}/zones/${zoneId}/dns_records`,
    RECORD: (zoneId, recordId) => `${CLOUDFLARE_API_BASE}/zones/${zoneId}/dns_records/${recordId}`,
  },
  ROUTES: {
    HEALTH: "/health",
    AUTH: {
      GITHUB_URL: "/api/auth/github/url",
      GITHUB_CALLBACK: "/api/auth/github/callback",
      VERIFY_STAR: "/api/auth/github/verify-star",
      ME: "/api/auth/me",
    },
    DOMAINS: {
      CHECK: "/api/domains/check",
      CLAIM: "/api/domains/claim",
      CUSTOM_TARGET: "/api/domains/custom-target",
      PING: "/api/domains/ping",
      LIST: "/api/domains/list",
      DELETE: (id) => `/api/domains/${id}`,
    },
    INTEGRATIONS: {
      // Vercel
      VERCEL_URL: "/api/integrations/vercel/url",
      VERCEL_AUTH_URL: "/api/integrations/vercel/auth-url",
      VERCEL_CALLBACK: "/api/integrations/vercel/callback",
      VERCEL_PROJECTS: "/api/integrations/vercel/projects",
      VERCEL_VERIFY_TOKEN: "/api/integrations/vercel/verify-token",
      VERCEL_ASSIGN_DOMAIN: "/api/integrations/vercel/assign-domain",
      VERCEL_VERIFY_DOMAIN: "/api/integrations/vercel/verify-domain",

      // GitHub Pages
      GITHUB_REPOS: "/api/integrations/github/repos",
      GITHUB_ASSIGN_PAGES: "/api/integrations/github/assign-pages",
      GITHUB_VERIFY_PAGES: "/api/integrations/github/verify-pages",

      // Render
      RENDER_SERVICES: "/api/integrations/render/services",
      RENDER_ASSIGN_DOMAIN: "/api/integrations/render/assign-domain",
      RENDER_VERIFY_DOMAIN: "/api/integrations/render/verify-domain",
    },
    DNS: {
      VERIFY: "/api/dns/verify",
    },
  },
};

module.exports = API;

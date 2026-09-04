import { PresetInfo, ProviderPreset } from "./types";

// In the browser, ALWAYS use relative path "" so all API traffic is seamlessly routed through https://go-live.me/api/*
export const BACKEND_URL =
  typeof window !== "undefined"
    ? ""
    : process.env.BACKEND_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "https://go-live-app.onrender.com";
export const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "go-live.me";
export const GITHUB_REPO_URL = process.env.NEXT_PUBLIC_GITHUB_REPO_URL || "https://github.com/shanmukhasaireddy13/Go-Live";
export const GITHUB_REPO_NAME = process.env.NEXT_PUBLIC_GITHUB_REPO_NAME || "shanmukhasaireddy13/Go-Live";
export const GITHUB_ISSUES_URL = `${GITHUB_REPO_URL}/issues`;
export const GITHUB_FEEDBACK_URL = `${GITHUB_REPO_URL}/issues/new?template=feedback.yml`;
export const GITHUB_NEW_ISSUE_URL = `${GITHUB_REPO_URL}/issues/new`;

export const RESERVED_SUBDOMAINS = [
  "admin",
  "api",
  "app",
  "auth",
  "billing",
  "blog",
  "cdn",
  "connect",
  "dashboard",
  "demo",
  "dev",
  "docs",
  "ftp",
  "gateway",
  "git",
  "help",
  "internal",
  "login",
  "mail",
  "ns1",
  "ns2",
  "oauth",
  "portal",
  "root",
  "sai",
  "secure",
  "server",
  "signup",
  "smtp",
  "ssl",
  "staging",
  "status",
  "support",
  "test",
  "vpn",
  "webmail",
  "www",
];

export const DNS_TEST_SERVERS = [
  { name: "Cloudflare Anycast", location: "Global (300+ Cities)", ip: "1.1.1.1" },
  { name: "Google Public DNS", location: "North America & Europe", ip: "8.8.8.8" },
  { name: "Quad9 Secure", location: "Zurich, Switzerland", ip: "9.9.9.9" },
  { name: "OpenDNS", location: "San Francisco, USA", ip: "208.67.222.222" },
];

export const PRESETS: Record<ProviderPreset, PresetInfo> = {
  vercel: {
    id: "vercel",
    name: "Vercel",
    tagline: "1-Click edge deployment with zero DNS configuration",
    icon: "▲",
    badge: "1-Click Connect",
    defaultRecordType: "CNAME",
    defaultTargetPlaceholder: "cname.vercel-dns.com",
    defaultTargetHint: "Vercel routes your custom domain automatically using cname.vercel-dns.com",
    steps: [
      "Select your Vercel project with 1-click.",
      "Go-Live attaches your subdomain and routes DNS instantly."
    ],
    docUrl: "https://vercel.com/docs/projects/domains/add-a-domain",
    color: "#000000"
  },
  "github-pages": {
    id: "github-pages",
    name: "GitHub Pages",
    tagline: "1-Click static site and docs deployment",
    icon: "🐙",
    badge: "1-Click Connect",
    defaultRecordType: "CNAME",
    defaultTargetPlaceholder: "username.github.io",
    defaultTargetHint: "Point your domain to your GitHub Pages origin username.github.io",
    steps: [
      "Select your GitHub repository and source branch.",
      "Go-Live sets your custom domain and enables HTTPS automatically."
    ],
    docUrl: "https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site",
    color: "#4F46E5"
  },
  render: {
    id: "render",
    name: "Render Hosting",
    tagline: "1-Click web service and static site cloud routing",
    icon: "🟣",
    badge: "1-Click Connect",
    defaultRecordType: "CNAME",
    defaultTargetPlaceholder: "your-app.onrender.com",
    defaultTargetHint: "Point your domain to your Render service address your-app.onrender.com",
    steps: [
      "Select your active Render web service or static site.",
      "Go-Live registers the custom domain and triggers instant SSL verification."
    ],
    docUrl: "https://render.com/docs/custom-domains",
    color: "#9333EA"
  },
  custom: {
    id: "custom",
    name: "Custom Hosting",
    tagline: "Point your domain to any CNAME or IPv4 server",
    icon: "🌐",
    badge: "Any Host",
    defaultRecordType: "CNAME",
    defaultTargetPlaceholder: "your-app.onrender.com or 192.0.2.1",
    defaultTargetHint: "Enter your target server address or load balancer host",
    steps: [
      "Enter your server target host or IP.",
      "Go-Live provisions Anycast DNS on Cloudflare."
    ],
    docUrl: "https://developers.cloudflare.com/dns/",
    color: "#2563EB"
  }
};

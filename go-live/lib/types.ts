export type ProviderPreset = "vercel" | "github-pages" | "render" | "custom";

export type RecordType = "CNAME" | "A" | "AAAA" | "TXT" | "REDIRECT_301" | "REDIRECT_302";

export interface SubdomainRecord {
  id: string;
  name: string; // e.g. "coolapp"
  fullDomain: string; // "coolapp.go-live.me"
  userId: string;
  userGithub: string;
  userAvatar?: string;
  preset: ProviderPreset;
  target: string; // e.g. "cname.vercel-dns.com" or "myapp.onrender.com"
  recordType: RecordType;
  proxied: boolean;
  ttl: number; // in seconds, or 1 for auto
  sslStatus: "active" | "provisioning" | "error";
  healthStatus: "healthy" | "degraded" | "checking";
  latencyMs: number;
  createdAt: string;
  updatedAt: string;
  viewsCount: number;
  dnsQueriesCount: number;
  description?: string;
  starredRepo: boolean;
  tags?: string[];
  status?: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface PresetInfo {
  id: ProviderPreset;
  name: string;
  tagline: string;
  icon: string;
  badge: string;
  defaultRecordType: RecordType;
  defaultTargetPlaceholder: string;
  defaultTargetHint: string;
  steps: string[];
  docUrl?: string;
  color: string;
}

export interface AvailabilityResult {
  subdomain: string;
  fullDomain: string;
  isAvailable: boolean;
  isReserved: boolean;
  reason?: string;
  suggestions?: string[];
}

export interface DNSNodeCheck {
  nodeId: string;
  location: string;
  city: string;
  country: string;
  flag: string;
  ip: string;
  status: "resolved" | "pending" | "propagating";
  responseValue: string;
  latencyMs: number;
}

export interface CloudflareConfig {
  apiToken: string;
  zoneId: string;
  zoneName: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}

export interface SocialProofDomain {
  fullDomain: string;
  claimedAt: string;
}

export interface SocialProofResponse {
  success: boolean;
  stats: {
    totalClaimed: number;
  };
  domains: SocialProofDomain[];
}

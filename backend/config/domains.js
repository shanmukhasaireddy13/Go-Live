require("dotenv").config();

const ROOT_DOMAIN = (process.env.ROOT_DOMAIN || "go-live.me").trim();
const COOLDOWN_HOURS = parseFloat(process.env.COOLDOWN_HOURS) || 2;
const COOLDOWN_DURATION_MS = COOLDOWN_HOURS * 60 * 60 * 1000;

const RESERVED_SUBDOMAINS = [
  "www", "api", "admin", "dashboard", "mail", "status", "docs", "support", "blog", "cdn",
  "app", "auth", "dev", "staging", "test", "demo", "ns1", "ns2", "root", "gateway", "connect", "sai",
  "billing", "ftp", "git", "help", "internal", "login", "oauth", "portal", "secure", "server", "signup",
  "smtp", "ssl", "vpn", "webmail"
];

module.exports = {
  ROOT_DOMAIN,
  COOLDOWN_HOURS,
  COOLDOWN_DURATION_MS,
  RESERVED_SUBDOMAINS,
};

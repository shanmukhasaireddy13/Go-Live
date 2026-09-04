# 🏛️ Go-Live Architecture & Network Design

Go-Live is architected for maximum speed, global availability, and zero-configuration developer experience.

```
   Developer               Go-Live Platform                  Global Edge
┌──────────────┐       ┌──────────────────────┐        ┌─────────────────────┐
│  GitHub Auth │ ────► │  Subdomain Registry  │ ─────► │  Cloudflare Anycast │
└──────────────┘       │  Provider Handshake  │        │  300+ Edge PoPs     │
                       └──────────────────────┘        └─────────────────────┘
                                  │                               │
                                  ▼                               ▼
                       ┌──────────────────────┐        ┌─────────────────────┐
                       │ Vercel / GH Pages /  │        │ End Users Worldwide │
                       │ Render / Custom VPS  │ ◄───── │ Sub-30ms Resolution │
                       └──────────────────────┘        └─────────────────────┘
```

---

## 🌐 1. Global Anycast DNS Network
- **300+ Edge Locations**: Distributed across North America, Europe, Asia-Pacific, Latin America, and Africa.
- **BGP Anycast Routing**: User DNS queries are automatically routed to the topologically closest edge data center.
- **Sub-30ms Global Latency**: Instantaneous name resolution with global Anycast caching.
- **Enterprise DDoS Mitigation**: Automatic layer 3/4 flood protection and traffic leveling.

---

## 🔒 2. Universal SSL & TLS 1.3
- **Automatic Provisioning**: Every claimed subdomain receives automated SSL/TLS certificates.
- **Modern Protocols**: Full HTTP/2 and TLS 1.3 support with strong cipher suites.
- **Zero Configuration**: No certbot, ACME cronjobs, or renewal errors required.

---

## 🪜 3. Progressive Live Verification Ladder
When a developer binds or changes a subdomain target, Go-Live runs an automated, progressive verification ladder:
1. **Cloudflare Record Assertion**: Validates dynamic DNS record creation in Cloudflare Zone.
2. **Interval Probing**: Probes HTTP reachability and TLS handshake at 1s, 2s, 3s, 5s, and 7s intervals.
3. **Multi-Region Health Check**: Verifies resolution across global PoPs (Frankfurt, San Francisco, Tokyo, Singapore).
4. **Status Promotion**: Once verified, the subdomain is transitioned to `ACTIVE` status.

---

## 🛡️ 4. Fair-Use & Cooldown Protection
- **1 Slot per Developer**: Authenticated via GitHub OAuth to ensure fair network resource allocation.
- **2-Hour Release Cooldown**: When a subdomain is released, a 2-hour cooldown period prevents rapid name hoarding and edge thrashing.

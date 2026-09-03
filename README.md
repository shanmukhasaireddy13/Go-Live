<div align="center">

# ▲ Go-Live.me

### Instant, Globally-Distributed Anycast Subdomains for Developers.

**Go from `localhost` to a live, production-grade, globally Anycast-routed `.go-live.me` domain in under 10 seconds.**

[![Release](https://img.shields.io/badge/Release-v1.0.0--stable-emerald.svg?style=flat-square)](#current-release-v100)
[![Global Anycast](https://img.shields.io/badge/Network-300%2B%20Edge%20PoPs-black.svg?style=flat-square)](#-features--capabilities)
[![Latency](https://img.shields.io/badge/Latency-%3C30ms%20Global-blue.svg?style=flat-square)](#-features--capabilities)
[![SSL](https://img.shields.io/badge/SSL-Auto%20TLS%201.3-amber.svg?style=flat-square)](#-features--capabilities)
[![Vercel Ready](https://img.shields.io/badge/Vercel-1--Click%20Deploy-black.svg?style=flat-square)](#option-a-1-click-vercel-integration-recommended)

</div>

---

## ⚡ What is Go-Live?

**Go-Live** gives every developer a permanent, high-performance edge slot under `*.go-live.me`. 

No credit cards, no complex DNS dashboards, and no configuration headaches. Pick a subdomain, connect with GitHub, star the project to claim your slot, and route your deployments worldwide in 1 click.

---

## 📦 Current Release (v1.0.0)

Go-Live is officially released as a fast, reliable developer utility.

### 🌟 Release Highlights:
- **1-Click Vercel Automated Deployment**: Connect your Vercel projects and instantly bind your subdomain without manual DNS record entries.
- **Progressive Live Verification Ladder**: Multi-stage verification checks (1s, 2s, 3s, 5s, 7s) confirm Anycast DNS resolution and SSL termination before marking your domain active.
- **Dedicated Deployment Dashboard**: View real-time DNS telemetry across global Anycast PoPs (Frankfurt, San Francisco, Tokyo, Singapore), inspect response latencies, and manage custom targets.
- **Custom DNS Routing**: Point to any CNAME (Railway, Render, Fly.io, GitHub Pages, Cloudflare Tunnels) or direct VPS IPv4 address (DigitalOcean, Hetzner, AWS EC2).
- **Edge Slot Fair-Use Protection**: 1 free permanent subdomain per developer with a 2-hour fair-use cooldown upon subdomain release.

---

## 🚀 How Easy It Is to Connect

Connecting your projects to a custom Anycast subdomain takes less than 10 seconds:

```
  1. Pick Name          2. Star on GitHub         3. Route Anywhere
 [mysite.go-live.me] ──► [Unlock Free Slot] ──► [Vercel / VPS / Tunnel]
```

### 1. Claim Your Subdomain
Search for your project name on [go-live.me](https://go-live.me). Our real-time DNS registry checks availability instantly in under 0.1ms.

### 2. Connect Your Deployment

#### Option A: 1-Click Vercel Integration (Recommended)
Connect your Vercel account via OAuth or Personal Access Token:
- Go-Live automatically lists all your deployment projects.
- Select your project and click **Assign & Route Domain**.
- Go-Live sets up the domain alias, configures Anycast CNAME records, and validates live routing.

#### Option B: Custom DNS (Any Server or Platform)
Route your subdomain to any target:
- **CNAME Records**: Point to Fly.io, Railway, Render, GitHub Pages, or Cloudflare Tunnels.
- **A Records**: Point directly to your VPS IPv4 address.

### 3. You're Live!
Our live Anycast probe confirms SSL and edge propagation immediately. Your domain is live worldwide.

---

## ✨ Features & Capabilities

### 🌐 Global Anycast Edge Network
Every `*.go-live.me` subdomain is backed by enterprise Anycast infrastructure across **300+ edge locations** worldwide:
- **Sub-30ms global response latency**.
- Automatic DDoS mitigation and traffic leveling.
- Built-in geo-routing to the nearest edge node.

### 🔒 Universal SSL & TLS 1.3
- Automatic universal SSL provisioning for all subdomains.
- Full HTTP/2 and modern TLS 1.3 protocol support out of the box.
- Enforced HTTPS redirect options for secure transport.

### 📊 Real-Time DNS Health & Telemetry
- Inspect live HTTP reachability, status codes, and Anycast latency directly from your dashboard.
- Live Anycast node explorer displays active edge locations in real time.

### 🛡️ Developer Fair-Use Protection
- Every GitHub developer receives **1 permanent, free subdomain**.
- Graceful release management with a 2-hour cooldown to protect edge network availability.

---

## 🗺️ Roadmap & Upcoming Releases

- [x] v1.0.0 — Public Release (Anycast Subdomains, 1-Click Vercel Integration, Global DNS Telemetry)
- [ ] v1.1.0 — Webhook-based instant deployment triggers
- [ ] v1.2.0 — Custom TXT / ACME challenge support for wildcard certificates
- [ ] v1.3.0 — Custom subdomain analytics & request counters

---

## 💬 Community, Feedback & How to Open Issues

We actively welcome bug reports, suggestions, platform integrations, and general feedback from the developer community!

### 🐛 1. How to Report a Bug
If you experience a DNS routing error, domain verification challenge, or unexpected behavior:
1. Click **[Report a Bug](https://github.com/shanmukhasaireddy13/Go-Live/issues/new?template=bug_report.yml)** to open the pre-formatted issue form.
2. Provide your **subdomain prefix** (e.g. `myproject.go-live.me`), **hosting platform** (Vercel, GitHub Pages, Render, VPS), and a brief description of the issue.
3. Attach any screenshots, network logs, or error codes (e.g. `502`, `404`, `Verification Required`).

### 💡 2. How to Propose a Feature or Integration
Want Go-Live to add native 1-click support for **GitHub Pages**, **Netlify**, **Cloudflare Workers**, or **Coolify**?
1. Click **[Request a Feature](https://github.com/shanmukhasaireddy13/Go-Live/issues/new?template=feature_request.yml)** to open the proposal template.
2. Select your category (New Hosting Provider, DNS & Edge Routing, Dashboard Tooling).
3. Describe the problem it solves and your proposed workflow.
4. You can also view and upvote open proposals on our **[Enhancement Board](https://github.com/shanmukhasaireddy13/Go-Live/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement)**.

### 💬 3. General Feedback & Discussion
- Share your thoughts on Anycast speeds, regional latency, or UX improvements directly in our **[Issues Hub](https://github.com/shanmukhasaireddy13/Go-Live/issues)**.
- Read our full **[Contributing & Community Guidelines](CONTRIBUTING.md)** for more details.
- ⭐ **[Star the Repository](https://github.com/shanmukhasaireddy13/Go-Live)** to support the project and unlock your permanent edge slot!

---

## 📄 Release & Copyright

&copy; 2026 Go-Live.me. All rights reserved. Built for developers worldwide.

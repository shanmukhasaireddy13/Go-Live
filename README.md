<div align="center">

# ▲ Go-Live.me

### Instant, Globally-Distributed Anycast Subdomains for Developers.

**Go from `localhost` to a live, production-grade, globally Anycast-routed `.go-live.me` domain in under 10 seconds.**

[![Release](https://img.shields.io/badge/Release-v1.1.0--stable-emerald.svg?style=flat-square)](#current-release-v110)
[![Global Anycast](https://img.shields.io/badge/Network-300%2B%20Edge%20PoPs-black.svg?style=flat-square)](#-features--capabilities)
[![Latency](https://img.shields.io/badge/Latency-%3C30ms%20Global-blue.svg?style=flat-square)](#-features--capabilities)
[![SSL](https://img.shields.io/badge/SSL-Auto%20TLS%201.3-amber.svg?style=flat-square)](#-features--capabilities)
[![Vercel Ready](https://img.shields.io/badge/Vercel-1--Click%20Deploy-black.svg?style=flat-square)](#option-a-1-click-vercel-integration)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-1--Click%20Deploy-181717.svg?style=flat-square)](#option-b-1-click-github-pages-integration)
[![Render Ready](https://img.shields.io/badge/Render-1--Click%20Deploy-46E3B7.svg?style=flat-square)](#option-c-1-click-render-integration)

</div>

---

## ⚡ What is Go-Live?

**Go-Live** gives every developer a permanent, high-performance edge slot under `*.go-live.me`. 

No credit cards, no complex DNS dashboards, and no configuration headaches. Pick a subdomain, connect with GitHub, star the project to claim your slot, and route your deployments worldwide in 1 click.

---

## 📦 Current Release (v1.1.0)

Go-Live v1.1.0 introduces multi-cloud 1-click integrations, automated repository configuration, and community showcase capabilities.

### 🌟 Release Highlights:
- **1-Click GitHub Pages Automated Integration**: Connect any GitHub Pages repository and Go-Live automatically provisions custom CNAME records on both GitHub and Cloudflare Anycast DNS.
- **1-Click Render Automated Integration**: Auto-provision custom domains on Render Web Services via Render API tokens with automated TXT/CNAME handshake verification.
- **1-Click Vercel Integration**: Bind your Vercel projects and automatically provision DNS challenge records and alias endpoints without touching DNS zone files.
- **Custom DNS Routing (CNAME & A Records)**: Point to any VPS (DigitalOcean, Hetzner, AWS EC2), Cloudflare Tunnel, Railway, or Fly.io instance.
- **Community Project Showcase**: Submit and showcase your live `.go-live.me` websites and discover live developer apps in real time.
- **Progressive Live Verification Ladder**: Multi-stage verification checks (1s, 2s, 3s, 5s, 7s) confirm Anycast DNS resolution and SSL termination before marking your domain active.
- **Dedicated Deployment Dashboard**: View real-time DNS telemetry across global Anycast PoPs, inspect response latencies, and manage hosting targets seamlessly.
- **Edge Slot Fair-Use Protection**: 1 free permanent subdomain per developer with a 2-hour fair-use cooldown upon subdomain release.

---

## 🚀 How Easy It Is to Connect

Connecting your projects to a custom Anycast subdomain takes less than 10 seconds:

```
  1. Pick Name          2. Star on GitHub         3. 1-Click Route
 [mysite.go-live.me] ──► [Unlock Free Slot] ──► [Vercel / GitHub Pages / Render / VPS]
```

### 1. Claim Your Subdomain
Search for your project name on [go-live.me](https://go-live.me). Our real-time DNS registry checks availability instantly in under 0.1ms.

### 2. Connect Your Deployment

#### Option A: 1-Click Vercel Integration
Connect your Vercel account:
- Go-Live lists your projects and automatically creates the domain alias.
- TXT challenge records and Anycast CNAMEs are automatically provisioned.

#### Option B: 1-Click GitHub Pages Integration
Connect your GitHub repository:
- Select your repository from the interactive picker.
- Go-Live automatically sets the custom CNAME on your GitHub Pages repo and binds the Anycast DNS routing.

#### Option C: 1-Click Render Integration
Connect your Render account:
- Enter your Render API Key and select your Web Service.
- Go-Live registers the custom domain on Render and completes DNS binding automatically.

#### Option D: Custom DNS (Any Server or Platform)
Route your subdomain to any target:
- **CNAME Records**: Point to Fly.io, Railway, Cloudflare Tunnels, or any hosting platform.
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
- [x] v1.1.0 — 1-Click GitHub Pages & Render Integrations, Social Proof Showcase, OOP Architecture
- [ ] v1.2.0 — Custom TXT / ACME challenge support for wildcard certificates
- [ ] v1.3.0 — Custom subdomain analytics & request counters
- [ ] v1.4.0 — Webhook-based instant deployment triggers

---

## 💬 Community, Feedback & How to Open Issues

We actively welcome bug reports, suggestions, project showcases, platform integrations, and community feedback!

### 💬 1. Share Feedback & User Experience
Have feedback on Go-Live's speed, design, or developer experience?
- Click **[Share Feedback](https://github.com/shanmukhasaireddy13/Go-Live/issues/new?template=feedback.yml)** to submit your thoughts and suggestions directly to the team.

### 🌟 2. Showcase Your Live Project
Built something cool with your `.go-live.me` subdomain?
- Click **[Showcase Your Project](https://github.com/shanmukhasaireddy13/Go-Live/issues/new?template=community_showcase.yml)** to get your project featured in the community showcase!

### 🐛 3. How to Report a Bug
If you experience a DNS routing error, domain verification challenge, or unexpected behavior:
1. Click **[Report a Bug](https://github.com/shanmukhasaireddy13/Go-Live/issues/new?template=bug_report.yml)** to open the pre-formatted issue form.
2. Provide your **subdomain prefix** (e.g. `myproject.go-live.me`), **hosting platform** (Vercel, GitHub Pages, Render, VPS), and a brief description.
3. Attach any screenshots, network logs, or error codes.

### 💡 4. How to Propose a Feature or Integration
Want Go-Live to add native 1-click support for **Netlify**, **Cloudflare Workers**, or **Coolify**?
1. Click **[Request a Feature](https://github.com/shanmukhasaireddy13/Go-Live/issues/new?template=feature_request.yml)** to open the proposal template.
2. Describe the feature, provider, or tooling you'd love to see.
3. Upvote open proposals on our **[Enhancement Board](https://github.com/shanmukhasaireddy13/Go-Live/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement)**.

### 🤝 5. How to Contribute Code & Build Features
Want to contribute code or build a new integration?
1. Open a **[Contributor Application & Proposal](https://github.com/shanmukhasaireddy13/Go-Live/issues/new?template=contribute.yml)** detailing what you'd like to work on.
2. Once reviewed by maintainers, **you will receive an automatic invitation** granting access to the development repository with full development setup instructions.
3. Create a branch and open a PR using our **[Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md)**.

---

## 📄 Release & Copyright

&copy; 2026 Go-Live.me. All rights reserved. Built for developers worldwide.

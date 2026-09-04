# 🚀 Go-Live Hosting Provider Integration Guide

Go-Live provides automated, 1-click cloud integrations and custom DNS routing for your `*.go-live.me` subdomains.

---

## 1. ▲ Vercel (1-Click Integration)

Go-Live connects directly with Vercel to automatically configure custom domain aliases and DNS challenge records.

### How It Works:
1. **Connect Vercel**: Authenticate via Vercel OAuth or Personal Access Token.
2. **Select Project**: Choose the Vercel project you want to bind to your `.go-live.me` subdomain.
3. **Automated Binding**:
   - Go-Live calls the Vercel API to create the custom domain alias.
   - If Vercel requests ownership validation, Go-Live automatically provisions the required `_vercel` TXT challenge records on Cloudflare DNS.
   - Go-Live points your subdomain CNAME to `cname.vercel-dns.com`.
4. **Verification**: Live Anycast health checks verify SSL and routing within 10 seconds.

---

## 2. 🐙 GitHub Pages (1-Click Integration)

Host static sites, documentation, and portfolios from your GitHub repository with automatic HTTPS and custom CNAME binding.

### How It Works:
1. **Select Repository**: Go-Live displays your public GitHub repositories with active GitHub Pages.
2. **Automatic CNAME File Update**: Go-Live sets your subdomain (`your-name.go-live.me`) in your repository's GitHub Pages settings via GitHub API.
3. **Cloudflare DNS Binding**: Go-Live creates an Anycast CNAME record pointing to `<your-username>.github.io`.
4. **SSL Provisioning**: GitHub automatically provisions a Let's Encrypt TLS certificate for your custom domain.

---

## 3. ⚡ Render (1-Click Integration)

Deploy full-stack web applications, Docker containers, and APIs hosted on Render.

### How It Works:
1. **Provide Render Token**: Enter your Render API Key from your Render Account Settings.
2. **Select Web Service**: Choose the active Render Web Service you want to route.
3. **Automated Registration**:
   - Go-Live calls the Render Custom Domains API (`/v1/services/{id}/custom-domains`) to register your subdomain.
   - Go-Live configures the appropriate Cloudflare CNAME record pointing to your Render service address.
4. **Instant HTTPS**: Render's automated ACME workflow verifies the DNS record and issues an SSL certificate.

---

## 4. 🌐 Custom DNS Routing (Any Server or Platform)

Route your subdomain to any cloud server, VPS, or PaaS platform worldwide.

### CNAME Routing:
Point your subdomain to any platform hostname:
- **Fly.io**: `your-app.fly.dev`
- **Railway**: `your-app.up.railway.app`
- **Cloudflare Tunnels**: `uuid.cfargotunnel.com`
- **AWS CloudFront / S3**: `d123456.cloudfront.net`

### A Record Routing:
Point your subdomain directly to any IPv4 address:
- **DigitalOcean Droplets**: `198.51.100.1`
- **Hetzner Cloud VPS**: `203.0.113.1`
- **AWS EC2 / Linode / Bare Metal**: `192.0.2.1`

---

## 🛡️ Live Verification & Security
All hosting providers benefit from:
- **Universal TLS 1.3 Encryption**: Automatic SSL certificate management.
- **Enterprise Anycast Edge Network**: 300+ global points of presence.
- **Sub-30ms Global Latency**: Optimized regional edge routing.

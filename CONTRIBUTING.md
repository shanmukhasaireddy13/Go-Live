# Contributing & Community Guidelines for Go-Live

Thank you for helping make **Go-Live** better for developers worldwide!

Whether you are reporting a bug, proposing a new hosting integration (like GitHub Pages, Netlify, or Coolify), or implementing code changes, this guide walks you through the entire lifecycle from proposal to automated invitation, PR submission, and merging.

---

## 📋 Table of Contents

1. [How to Contribute Code & Build Features](#-how-to-contribute-code--build-features)
2. [How to Report a Bug](#-how-to-report-a-bug)
3. [How to Propose a Feature or Integration](#-how-to-propose-a-feature-or-integration)
4. [Local Development & Testing Standards](#-local-development--testing-standards)
5. [Submitting General Feedback](#-submitting-general-feedback)
6. [Community Code of Conduct](#-community-code-of-conduct)

---

## 🚀 How to Contribute Code & Build Features

To maintain code security, high Anycast performance, and production reliability, the Go-Live codebase is organized into:
- **Public Hub ([`Go-Live`](https://github.com/shanmukhasaireddy13/Go-Live))**: Releases, Issue tracker, feature proposals, and community onboarding.
- **Private Development Repository ([`Go-Live-App`](https://github.com/shanmukhasaireddy13/Go-Live-App))**: Full-stack Next.js 16 + Node.js Express Anycast DNS engine.

### 4-Step Contributor Workflow:

```
 1. Submit Proposal        2. Maintainer Approval      3. Auto-Invite Dispatched     4. Pull Request & CI
[Open Contributor Issue] ──► [Owner Labels 'approved'] ──► [Access Private Codebase] ──► [Pass Tests & Merge]
```

1. **Submit a Proposal**:
   - Open a **[Contributor Application & Feature Proposal](https://github.com/shanmukhasaireddy13/Go-Live/issues/new?template=contribute.yml)**.
   - Outline the feature or improvement you would like to build.

2. **Maintainer Review & Approval**:
   - The maintainer reviews the proposal and marks it as `approved` or comments `/accept`.

3. **Automated Private Repository Invitation**:
   - An automated GitHub Action instantly dispatches a collaborator invitation to your GitHub account for **[`Go-Live-App`](https://github.com/shanmukhasaireddy13/Go-Live-App)**.
   - Accept the invitation via your notifications or visit **[Accept Repository Invitation](https://github.com/shanmukhasaireddy13/Go-Live-App/invitations)**.

4. **Branch, Build & Submit a Pull Request**:
   - Clone the private repository and checkout a dedicated feature branch:
     ```bash
     git clone https://github.com/shanmukhasaireddy13/Go-Live-App.git
     cd Go-Live-App
     git checkout -b feat/your-feature-name
     ```
   - Make your changes and run the test suite to ensure all tests pass.
   - Open a **Pull Request** against `main` on `Go-Live-App` referencing your initial proposal issue.
   - Automated CI test runners will validate your PR, and the repository owner will review and merge your changes into `main`!

---

## 🧪 Local Development & Testing Standards

Before opening a Pull Request, verify that all backend tests and frontend production builds pass:

### Backend Testing (51+ Unit & Integration Suites)
```bash
cd backend
npm install
npm test
```

### Frontend Build & Typechecking
```bash
cd go-live
npm install
npm run build
node --test tests/domain-service.test.mjs tests/api-client.test.mjs
```

---

## 🐛 How to Report a Bug

If you encounter unexpected behavior with subdomain routing, verification, or edge DNS:

1. **Check Existing Issues**:
   - Search the [Issues Tracker](https://github.com/shanmukhasaireddy13/Go-Live/issues) to verify if the issue has already been reported.

2. **Open a Bug Report**:
   - Navigate to the [New Bug Report Form](https://github.com/shanmukhasaireddy13/Go-Live/issues/new?template=bug_report.yml).

3. **What to Include in Your Report**:
   - **Subdomain Name**: The `*.go-live.me` prefix you are claiming or routing (e.g., `myproject.go-live.me`).
   - **Hosting Target / Provider**: Which platform you are connecting (e.g. Vercel, GitHub Pages, Render, Custom A record).
   - **Steps to Reproduce**: Clear numbered steps to trigger the behavior.
   - **Expected vs. Actual Outcome**: What should have happened vs. what actually occurred.
   - **Screenshots or Logs**: Console logs, network status codes (e.g. 502, 404, 308), or screenshots from your hosting provider's dashboard (e.g. Vercel verification challenges).

---

## 💡 How to Propose a Feature or Integration

We actively build new integrations based on community demand!

1. **Check Existing Proposals**:
   - Filter open feature discussions on the [Enhancements Board](https://github.com/shanmukhasaireddy13/Go-Live/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement).

2. **Open a Feature Request**:
   - Navigate to the [New Feature Proposal Form](https://github.com/shanmukhasaireddy13/Go-Live/issues/new?template=feature_request.yml).

3. **Structure Your Proposal**:
   - **Title**: Use a descriptive title (e.g., `[Feature]: Native 1-Click GitHub Pages integration`).
   - **Problem / Motivation**: What workflow or hosting setup are you trying to streamline?
   - **Proposed Workflow**: How should the feature work inside the Go-Live dashboard or API?
   - **Target Hosting / Utility**: Specify the platform (e.g. GitHub Pages, Cloudflare Workers, Coolify, Docker swarm).

---

## 💬 Submitting General Feedback

Have feedback on UI responsiveness, Anycast latencies in your region, or ideas for developer tooling?

- Feel free to start a conversation directly in the [GitHub Issues](https://github.com/shanmukhasaireddy13/Go-Live/issues) with the label `feedback`.
- Star the repository on [GitHub](https://github.com/shanmukhasaireddy13/Go-Live) to keep updated with every release.

---

## 🤝 Community Code of Conduct

- **Be Respectful**: Treat fellow developers and maintainers with courtesy.
- **Provide Actionable Details**: Actionable reproduction steps and clear technical details help us resolve issues in hours rather than days.

# Contributing & Community Guidelines for Go-Live

Thank you for helping make **Go-Live** better for developers worldwide!

Whether you are reporting a DNS anomaly, proposing a new hosting integration (like GitHub Pages, Netlify, or Coolify), or suggesting dashboard improvements, this guide walks you through the best way to get your request addressed quickly.

---

## 📋 Table of Contents

1. [How to Report a Bug](#-how-to-report-a-bug)
2. [How to Propose a Feature or Integration](#-how-to-propose-a-feature-or-integration)
3. [Submitting General Feedback](#-submitting-general-feedback)
4. [Community Code of Conduct](#-community-code-of-conduct)

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

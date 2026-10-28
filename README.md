# PR Approval Playground

A **fictional, public-safe, interactive demonstration** of automated pull-request approval, security boundaries, and deployment integrity.

## Live demo

Once GitHub Pages is enabled: https://irvinthev.github.io/pr-approval-playground-public/

## Features

- **Architecture:** Click through source, eligibility, review, authorization, and production monitoring.
- **PR Simulator:** Explore documentation, sensitive payment logic, shared dependencies, post-approval commits, and bot-authored changes.
- **Policy Lab:** Toggle four hypothetical safeguards and see potential consequences.
- **Design Guide:** Explore nine general governance areas.

This is an educational simulator, **not** a working approval system or evidence of any real organization's controls. Examples are fictional.

## Run locally

Open `index.html` in any browser. No build step, installation, API key, or backend required.

## Publish with GitHub Pages

Repository → **Settings → Pages** → **Build and deployment** → **Deploy from a branch** → branch `main`, folder `/(root)` → **Save**.

## Privacy & cost

No proprietary configuration, internal URLs, or audit evidence. No third-party scripts, analytics, external requests, API connections, or LLM inference. Hosting is subject to GitHub Pages terms.


## Public demonstration boundaries

This is a fictional educational simulator. All PRs, identities, repositories, approvals, logs, incidents, deployment records, and policy settings are invented. It does not reproduce an employer's internal architecture, names, configuration, procedures, or evidence.

The playground is a static client-side HTML/CSS/JavaScript application hosted through GitHub Pages. It requires no React, Next.js, backend, proprietary APIs, credentials, or model tokens. Simulated logs and exported evidence do not imply tamper resistance, immutability, real-world retention, or compliance certification.


## Financial Impact Lab

Under **Design Controls → Financial Impact Lab**, inspect invented service dependencies, adjust conditional billing-error assumptions, and test an independent financial review requirement. The shared-library scenario starts with two low AI verdicts but still requires qualified independent authorization.

- Six fictional cases cover documentation, shared dependencies, pricing, reporting schedules, missing mappings, and policy downgrades.
- Approval Race includes financial review, post-approval commits, and mapping-version invalidation.
- Missing/stale mappings are unresolved, not zero exposure. Unsupported dollar models remain unknown. Dollar estimates cannot override protected review rules.
- `financial-engine.js` contains the pure deterministic model; `financial-ui.js` connects it to the existing simulator.
- Calculations are conditional billing-error scenarios, not expected loss, financial-statement misstatement estimates, materiality conclusions, or measured control effectiveness.
- All new services, identities, policies, paths, events and amounts were invented for this demo. No employer materials, customer data, internal configurations, API credentials or actual financial data are included. All assets are local; no external requests or storage are used.
- Permission switches are educational simulations. The browser does not enforce segregation of duties or establish independent administration.

### Tests

Run `node --test tests/*.test.js`. No dependencies are required for engine tests. Open `index.html` locally to use the complete demo.

Optional browser smoke: with Playwright and Chromium installed, run `node tests/browser-smoke.cjs`. It covers the new lab, financial and existing approval races, navigation, export, mobile overflow and external-request detection.

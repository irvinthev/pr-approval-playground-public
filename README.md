# PR Approval Playground

A **fictional, public-safe, interactive demonstration** of automated pull-request approval, security boundaries, and deployment integrity.

## Live demo

Once GitHub Pages is enabled: https://irvinthev.github.io/pr-approval-playground-public/

## Start here

The overview asks **How do you evaluate AI-assisted code approval?** It introduces five reusable questions about delegation, impact, required conditions, authority and evidence. **Start with a change** opens the fictional shared-library case directly; readers can also enter through implementation, risk or assurance questions.

- **Pipeline:** inspect one possible workflow. Each stage invites a judgment before expanding the example’s facts, available approaches, rationale and evidence needs.
- **Blueprint:** examine how decisions could be enforced.
- **Risks & Safeguards:** challenge failure modes and coverage.
- **Monitoring:** explore observation, investigation and response.
- **Assurance:** examine evidence, testing and the limits of conclusions.

The goal is transferable judgment, not adoption of a prescribed architecture. A closing exercise asks readers to apply the questions to another change and identify what their own tools establish or leave unresolved. Optional Engineering, Risk/GRC, Internal Audit and external-audit prompts share the same case; no separate role dashboards are added.

Published framework references remain visible on the homepage. They inform proposed designs, without endorsing this architecture or establishing effectiveness.

**Advanced experiments** opens the sandbox overview directly. Policy Builder, Control Lab, Financial Impact Lab, Approval Race, Evidence Lab and the scenario library remain available. The older story and retired exercises remain in source temporarily, outside the primary journey.

This is an educational simulator, not a working approval system or evidence of a real organization's controls. Examples are fictional.

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

Under **Explore the sandbox → Financial Impact Lab**, inspect invented service dependencies, adjust conditional billing-error assumptions, and test an independent financial review requirement. The shared-library scenario starts with two low AI verdicts but still requires qualified independent authorization.

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

### Guided story implementation

`story-model.js` uses the same financial decision engine as the lab; `story.js` renders the walkthrough and `story.css` supplies responsive styles. No new company-specific facts or data were introduced. The independent gate is described as an authorization boundary based on known mappings, not proof that code is safe.

### Clickable pipeline

The guided view opens with a six-node interactive pipeline. Click a pull request, technical review, dependency map, independent gate, authorization, or release-route node to inspect it. Technical evidence and financial context converge at authorization. Node colors and text follow the decision engine, not which stages have been visited. Clicking a node never grants approval.

The diagram uses local HTML/CSS/SVG and plain JavaScript. It includes keyboard-operable buttons, reduced-motion support, a compact mobile layout, and text labels alongside status colors. Release eligibility is explicitly simulated, not a real deployment.

## MVP retirement pass (navigation only)

To reduce duplicated experiences before consolidating the shared simulation engine, the main Advanced Playground menu now exposes only Policy Builder, Control Lab, Financial Impact Lab, Approval Race, Evidence Lab, and Full Scenario Library. The legacy PR Journey, PR Simulator, Policy Lab, Operational Discovery, Access Governance, Incident Timeline, and Policy Outcomes exercises are retired from the visible menu. Their implementations remain intact temporarily to preserve behavior until a tested consolidation replaces them; this is **not** a code-size reduction yet.

The main stage-gate presentation and Risk-to-Control Explorer remain distinct entry points. Follow-up work should remove legacy code only after regression tests cover replacements.

## Connected case slice

On the main Pipeline page, choose **Shared library · connected case** or **Follow the shared-library case**. This bounded deterministic case carries revision-bound evidence and policy/mapping versions into the existing Monitoring and Assurance pages. Use the case links to preserve the editable action history. No role lenses or new lab were added.

`case-model.js` is the pure evaluator and replay contract; `case-ui.js` renders the same case in all three chapters. See [SHARED-CASE.md](./SHARED-CASE.md) for schema/status definitions, import limits, baseline-test disposition and a reproducible revision-A → approval → revision-B → renewed-review trace. Browser history and exports remain editable simulation data, not authentic audit records.

## Guided reasoning

`case-guide.js` turns the shared evaluator’s output into stage-specific learning explanations. It does not evaluate or authorize changes. Optional reasoning notes stay in page memory, are bounded to 2,000 characters per stage, are not saved or included in case links, and are cleared by the shared-case reset. Navigating away or reloading discards them.

The overview links to `experience.html?example=shared`, which starts a fresh case only when no fragment exists. Existing case fragments take priority and invalid fragments remain rejected. The ordinary Pipeline entry retains its existing default walkthrough. The bounded learning pass adds no case actions or evaluator/schema changes; dependency-removal and artifact-substitution challenges are not added to the connected case.


## Auditor View

Under **5 · Assurance**, choose **Auditor View** for four fixed fictional scenarios pairing pipeline JSON with illustrative control objectives, IPE descriptions and testing strategies. The secondary menu links back to the testing guide and example RCM download. `auditor-view.html` is self-contained and has no external dependencies. These scenarios do not import or mutate the connected shared-library case; the workpapers describe synthetic evidence rather than actual retained records or a control-effectiveness conclusion.

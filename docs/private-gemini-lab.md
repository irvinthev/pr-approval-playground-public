# PR #178 — Private Gemini Challenge Lab

## Objective
Provide a responsive, mobile-first **private test page** for Gemini-backed scenario challenges, using the existing `POST /api/challenge` endpoint.

**Preview URL after deployment:** `https://<preview-host>/private-challenge.html` — must use the **Vercel preview**, not the GitHub Pages URL.

## Private owner walkthrough (iPhone)
1. Open the PR's Vercel Preview deployment and visit `/private-challenge.html`. Vercel Authentication may require signing in.
2. In the first input, paste your **CHALLENGE_API_TOKEN** (the separate test password kept in your password manager). **Do not use the Gemini API key.**
3. Tap **Load example** and then **Challenge my design**.
4. Review each conclusion’s scenario basis, cited provision, application, and open question. Use follow-up questions as desired.
5. Tap **Clear session** to erase the input token and visible results from this tab.

## Boundaries
- Gemini API credential stays only in the Vercel backend environment. No key is embedded in HTML or GitHub.
- The test access token is entered directly by the owner, held in browser memory, and used as an authorization header; it is never written to browser storage or the URL.
- The page can be loaded as static source outside Vercel but **cannot use the model unless the Vercel backend and valid private token are present**. It is deliberately not linked from the public field guide.
- User input and AI results are rendered via text nodes, not untrusted HTML.
- Same-origin API only, bounded scenario and follow-up length.
- No durable chat history or multiuser account model. Past turns remain **caller-provided text**, not authenticated model history.
- Vercel protection alone is not a public user authentication architecture. Shared test token must not be distributed; no production model keys, per-user quotas, hard cost cap, or abuse prevention are in place.
- Google's Gemini **free-tier data-use terms** mean fictional/public-safe material only. Do not submit real Braze materials.
- The backend requires citations to be attached to specific conclusions and resolves titles, publisher links, and source summaries from the canonical catalog. Scenario-only reasoning is labeled separately. The reader still needs to assess whether each provision supports the application.

## Acceptance
- Test and visual QA GitHub workflows green
- Vercel preview build ready
- Actual protected page loads on an iPhone
- Live Gemini test confirms meaningful architectural challenge, qualified claims, and correct references
- Unauthorized requests rejected; token never appears in browser URL or source
- No merge or public enablement without explicit owner approval

## Later
For a public experience: implement authenticated user sessions, distributed rate limiting, usage limits/billing safeguards, prompt safety evaluation, meaningful consent and privacy protections before connecting the public field guide.

# PR #177 — private Challenge Agent test

This slice does not expose a public conversational UI or require a database. It improves the private AI endpoint and provides a repeatable, non-destructive live-model acceptance test.

## Setup (owner action)
1. In Vercel project `ai-sdlc-challenge-agent`, keep deployment protection enabled and create **Preview-only** secrets: `OPENAI_API_KEY` and `CHALLENGE_API_TOKEN` (a freshly generated long random value). Never store either in GitHub or the public website.
2. Optionally set `OPENAI_MODEL` (Preview only); default is `gpt-4o-mini`, subject to provider availability and account configuration.
3. Verify OpenAI API billing and apply a conservative project budget/spend alert. A budget alert is not a guaranteed hard cap; the server lacks per-user quota enforcement.
4. Redeploy the **PR #177 preview branch** after configuring Preview variables.
5. From a trusted local terminal, set `CHALLENGE_API_URL` to the protected preview deployment URL, and `CHALLENGE_API_TOKEN` privately to the same token configured in Vercel.
6. Run `node scripts/smoke-challenge-preview.mjs` locally. Never run it on a shared public runner or with an untrusted PR.

The runner submits three fictional, nonsensitive design questions. It checks that unauthorized POST is rejected and that authorized calls return live-model responses with challenge questions, facts and canonical https citations.

**Important:** Vercel Authentication may reject external shell traffic before it reaches the API. A 401 or 403 from the platform does not establish the app's bearer-auth behavior. If Preview is protected, use an approved owner-only test route (or temporarily test from an authenticated environment) without publishing bypass tokens or disabling protection broadly.

## Code change
Previously the caller could supply `turns` with `role:assistant` and these were forwarded to the model as though they were authentic assistant messages. Now all supplied history is explicitly presented as untrusted quoted caller-provided content inside one user message. This prevents transcript role spoofing from changing model message roles, although prompt-injection risk remains and still needs empirical testing.

## Exit criteria
- Preview deployed at reviewed commit, GitHub test suite green
- Anonymous POST rejected at app layer, no secrets printed in logs
- Three fictional scenario responses produce valid contract output and canonical citations
- Human evaluates citation **relevance**, challenge quality and unsupported claims (the script only checks schema, not semantic accuracy)
- No public interface enabled; no merge until test findings are reviewed

Production credentials remain absent and public field guide stays on the existing heuristic journey.

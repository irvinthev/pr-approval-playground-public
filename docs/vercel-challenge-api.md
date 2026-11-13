# Vercel challenge-agent API (PR #176)

## Scope and status
A real OpenAI-compatible **server-side** model call path, not a mock. The public GitHub Pages UI is unchanged and continues to use its transparent, local heuristic. The endpoint is **disabled until credentials are configured**, and is designed for private server-to-server proof-of-concept testing.

- Endpoint: `POST /api/challenge` on a Vercel Node deployment.
- Request: `{"scenarioText":"Fictional description","turns":[{"role":"user","content":"What if the policy changes?"}]}`
- Response: validated challenge-agent contract, canonical citations (publisher URLs, versions and qualifications), `mode:"live-model"`.
- Canonical catalog: `framework-source-catalog.js`; output validation: `challenge-agent-contract.js`.
- No database, session persistence, client token, public browser connection, code merge, deployment action, or approval authority.
- Model interpretation remains unverified; cited guidance does not establish compliance or implemented controls.

## Security conditions
Before private testing, set the following as **private Vercel environment variables** for Preview only, in Vercel settings (never commit them):
- `OPENAI_API_KEY` — private provider credential.
- `CHALLENGE_API_TOKEN` — high-entropy, unique secret shared only with trusted server-side test clients; **never place in browser JavaScript**.
- `OPENAI_MODEL` — optional provider model name (default `gpt-4o-mini`, subject to availability and account access).

Unauthenticated requests return 401 when configured; missing configuration returns 503. The endpoint does not grant CORS access to browser origins, caps scenario/turn/body lengths, caps model output tokens, enforces a model timeout, validates model output against canonical provision IDs, and sends no-store responses. It does not write to a database or mutate GitHub.

**Not ready for a public frontend:** this prototype has no durable per-user identity, distributed rate limiting, spending budget enforcement, consent/privacy screening, abuse controls, or complete content-safety evaluation. Vercel deployment protection and model-provider spending caps should be enabled for private testing. A browser cannot safely embed the shared bearer token; public access requires a separate authentication/session design and bounded per-user quotas. Do not deploy to an unprotected production endpoint with model credentials.

## Private smoke test (after configuring preview environment)
Use a trusted server-side shell, never a public web page:

```bash
curl -sS -X POST 'https://YOUR-VERCEL-PREVIEW-URL/api/challenge' \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $CHALLENGE_API_TOKEN" \
  --data '{"scenarioText":"A fictional code-review bot can approve a PR after two AI reviewers agree.","turns":[]}'
```

Expect an HTTP 200 with verified-catalog citations and challenge questions; HTTP 502 means model/provider or contract failure. The `mode` value is *only* `live-model` when the live provider request succeeds and the contract validates. No mock success path.

## Test
```bash
node --test tests/*.test.js tests/*.test.mjs
```

Tests cover schema bounds, canonical ID prompt construction, missing credentials, method rejection and unauthorized requests. They do **not** attest to live model behavior. No credentials are required for CI.

## Next slice
Add a protected, short-lived end-user session and server-enforced quotas before connecting the public `open-scenario.html` interface. Continue explicit privacy filtering, monitoring and cost ceilings, then exercise multi-turn challenges and citation accuracy in a staged preview.

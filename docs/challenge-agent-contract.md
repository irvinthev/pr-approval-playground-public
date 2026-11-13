# Challenge Agent — provider-neutral backend contract (proposal)

**Status:** design/contract increment; not a live LLM integration. This is a public educational field guide. Do not send corporate code, credentials, proprietary repositories or privileged system data into this demonstration.

## Objective

Support *arbitrary natural-language AI SDLC scenarios* with a model-backed interpretation service without allowing model-generated framework citations to masquerade as source facts or assertions of implemented control effectiveness.

## Flow

1. **Browser** collects a fictional/sanitized scenario (maximum 4,000 characters). It may continue to use the deterministic `scenario-framework-adapter.js` fallback. It never directly calls an LLM or embeds provider secrets.
2. **Approved private backend** screens inputs against public-content/privacy policy, rate-limits calls, invokes an LLM with a bounded prompt, and requests a structured interpretation. Auth, logging/retention policy, abuse controls and vendor configuration belong here, not inside GitHub Pages.
3. **Contract validator** in `challenge-agent-contract.js` accepts only the declared version, labeled facts/inferences/unknowns, meaningful challenge questions and **real provision IDs** from the canonical `framework-source-catalog.js`. A model cannot introduce new publisher URLs or invent authoritative framework identifiers. Unknown IDs invalidate the interpretation. The original scenario is supplied by the trusted caller, not taken from the model response.
4. **Publisher-backed grounding**: the backend should retrieve the specific provision text/metadata and validate relevance *before* any publisher claim is published. Successful ID validation is necessary but **not sufficient** to assert a framework actually supports a generated recommendation.
5. **Experience** renders draft architecture, follow-up questions, counterexamples and alternatives, clearly labeled **unverified interpretation**, with citations and source limitations. A real implementation would preserve version-bound scenario state and allow follow-up responses to revise it.

## Response contract shape

```json
{
  "contractVersion": "0.1.0",
  "facts": [
    {"statement": "A human signs off on an AI review plan", "support": "explicit-user-statement"},
    {"statement": "Effective approval delegation is unknown", "support": "unknown"}
  ],
  "challenges": [
    {"question": "What grants authority to approve the resulting revision?", "reason": "Plan review is different from code authorization", "tests": ["Attempt an out-of-scope approval"], "alternatives": ["Human authorizes final code", "Bounded independent delegation"]}
  ],
  "citationIds": ["SSDF:PS.1"],
  "unknowns": ["Effective GitHub rules not specified"],
  "alternatives": ["Human code review", "Independent policy gate"]
}
```

*The provider's output is untrusted.* The validator rejects absent challenges, unknown citations, unsupported support labels and unsupported versions. The current pure module has no network, model, permissions or actual compliance evaluation.

## Decisions required before live integration

- Select and secure a backend provider, authentication mode, billing owner, operational owner, logging/data retention requirements and rate limits.
- Confirm an appropriate public acceptable-use and input handling policy and privacy notice. Never infer content safety solely from user instructions to sanitize scenarios.
- Validate prompt injection resilience; user input, retrieved passages and prior scenario state must not override the system's authority/evidence boundaries.
- Create adjudicated scenario cases and expected interpretation elements across authority, enforcement, evidence, correlated failure, untrusted inputs, and release integrity.
- Add an end-to-end browser integration test that validates the live backend path, error/timeout behavior, accessibility and bounded export. Do not connect production or employer systems.

## Acceptance criteria for a subsequent live agent PR

- The user can type a novel scenario and receive a meaningful architecture interpretation and adaptive challenge, not a keyword-selected canned question.
- Every asserted framework relationship carries a canonical provision ID and publisher link; unsupported associations are explicitly marked as model interpretation or excluded.
- A failed citation validation, unresolved authentication, backend error or timeout never produces a success/approval verdict.
- The backend prevents unauthenticated abuse and has documented retention and privacy boundaries.
- The app cannot approve PRs, deploy code or infer actual SOX compliance from hypothetical facts.

## Validation

Run `node --test tests/challenge-agent-contract.test.mjs`. CI integration is separately proposed by corrective PR #174, which should be merged before relying on the new ESM tests in the main regression job.

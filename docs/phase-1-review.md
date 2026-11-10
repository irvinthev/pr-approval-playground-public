# Phase 1 review

## Baseline and structure

- Base main commit: `518fea6` (merged PR #90). Checkout was clean; 239/239 Node tests passed before edits.
- Branch: `v0.3/phase-1-content`. Unreleased proposal; no merge/deployment.
- Build: none. GitHub Pages serves root HTML/CSS/JS. No package.json, dependencies, backend, accounts or external API calls. CI syntax-checks root JS and runs `node --test tests/*.test.js`.
- Overview: index.html.
- Risk: ai-sdlc-risk.html, operating-model.js; shared stage explanations from shared-pipeline-context.js / shared-pipeline-nav.js.
- Engineering: engineering-blueprint.html, including inline content and rendering.
- Monitoring: continuous-monitoring.html normally redirects to engineering-blueprint.html?view=monitor; monitoring-data.js, monitoring-examples.js and unified-monitoring.js provide the visible lens. Legacy connected-case fragments remain supported.
- Assurance: independent-assurance.html; shared stage context plus retained case engine/deep-link redirects. Reference pages, RCM, downloads and experiments remain.
- New support page: limits.html, linked outside the five-item primary navigation.

## Reviewable page changes

- Overview: claim tags, Limits/Try it links and authority/enforcement/evidence closing checklist.
- Risk: cumulative proposed minimum sets for assistance, approval participation and autonomy; retains authority-first method, four dimensions, four outcomes, unknowns and no score. Closing authority checklist.
- Engineering: hybrid selected by default; policy failure/human fallback semantics, ownership/change control/assurance scope; Stage 0; seven-stage evidence/query intent and negative-test columns; unknown versions; tentative daily seeded canaries; implementation and monitoring checklists.
- Monitoring: tags and closing checklist in source and actual redirect destination. 24/24 versus 24/25 retained; management monitors, IA evaluates independently.
- Assurance: approval-of-record truth table; tentative rubber-stamp signal; stricter policy versus native GitHub statuses; original-preserving retrospective reassessment with effective/observed times; predefined shadow exit plan, qualified rule of three; verified/named OWASP Agentic Applications reference; advisory challenger excluded from evidence chain; deterministic reperformance checklist.
- Limits: shared boundaries and tag definitions replace repetitive global disclaimer paragraphs. Local uncertainty stays next to the claim.

## Assumptions and scope resolutions

1. “Text only, no new tooling” takes precedence in Phase 1 over migrating all content into /data. Full source migration/schema is explicitly pending P2-00; the current site does not meet that end-state constraint yet.
2. Existing Monitoring redirect is preserved; the visible Engineering monitor view gets the same takeaway. No page removed or URL renamed.
3. Proposed safeguards/minimum sets use Qualified. Fictional examples use Qualified for their stated bounded illustration, never Strong evidence of operation. Daily canary efficacy and rubber-stamp detection use Tentative.
4. Queries are plain-language query specifications, not invented SQL against an unknown schema. Runnable implementation remains Phase 2/3.
5. Unknown version is not cured by passing a canary. Human fallback cannot waive a known mandatory failure or an unverifiable mandatory condition.
6. Primary-page tags are conservative; they do not certify retained Advanced material or older source mappings. See open-validations.md.

## Validation

Baseline: 239/239 tests passed. Three initial post-edit failures were obsolete assertions requiring repeated Assurance disclaimer text. Updated them to inspect the linked Limits page, retaining their original boundary checks. One example assertion retains its “Illustrative result” label. Final results and browser checks are recorded below after execution.

## Claim inventory

See phase-1-claims.md for each added or revised claim and its tag. Static controls/table entries carry explicit inline tags; dynamic explanatory rendering uses text tags. No new risk or authorization evaluator is introduced.

## Executed checks

- Final regression suite: 239/239 passed. Root and inline script syntax checked separately.
- Desktop browser: Overview, Engineering, Assurance, Risk minimum-control table, Monitoring redirect destination and Limits rendered. Engineering's five-column checklist expanded and was readable; Assurance truth table rendered without document overflow at the observed desktop width. Hybrid sourcing appeared in the rendered Engineering detail.
- All six changed/new primary/support pages checked for existing local linked files and script/style assets; current redirect aliases remain covered by the existing tests.
- Browser log inspection showed extension-origin metadata errors, not site-origin errors. This was not full runtime/interaction coverage.
- Actual mobile viewport, screen reader and full keyboard walkthrough remain unverified. Existing mobile layouts are retained; Engineering's five-column table retains stacked mobile rows.
- Newly used OWASP, GitHub behavior and statistics sources verified through primary documents. Other pre-existing external links/reference mappings were not exhaustively rechecked.

Ready with qualifications for content review. Full /data compliance, runnable artifacts, private-overlay schema and Advanced reference/tag validation remain pending later approved work.

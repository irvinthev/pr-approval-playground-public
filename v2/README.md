# Field Guide V2 — five-page replacement preview

**Status:** design-review preview; not the published canonical Field Guide. **Challenge Lab: parked and unchanged.**

This is a subtractive redesign, not another layer added to the old pages. It replaces the *reading experience* with five focused chapters, one shared fictional case, one bounded interaction per chapter and a link to the next chapter. Each page keeps a link to the previous extended version **only as technical reference during review**.

| V2 chapter | Single question and interaction | Material outside the proposed main reading path |
| --- | --- | --- |
| Overview | What does a GitHub approval actually mean? Three authority patterns | Long workflow, repeated scenarios, multiple audience introductions |
| Risk & Governance | What failure makes two LOW labels misleading? Three failure paths | Risk scorecards, operating-model repetition, registers and inventory |
| Engineering & Safeguards | Who decides, acts and independently enforces? Four architectures | Repeated risk narratives, workpapers and stage simulations |
| Monitoring & Operations | What happens when approval becomes stale? Four incident phases | Multiple dashboards, fictional metrics and duplicated monitoring investigations |
| Independent Assurance | What does evidence substantiate? Three complementary methods | Detailed RCM builder and advanced workpapers |

## Source decisions
The [concise V2 experience blueprint](https://docs.google.com/document/d/10wt5MHoTX2-twJpuSRJw67BA9bRrFgLQDZH1tIGHO24/edit) controls page ownership and the five-chapter experience. The [detailed design reference](https://docs.google.com/document/d/1E0U7dPJlFsfSpvoOtsJSWGidpu2Y76XMYugU2Xk7au4/edit) informs content but is not an instruction to implement every concept.

## Out of scope
No Challenge Lab modifications, private Gemini/Vercel API, token storage, QualityBot integrations, production telemetry, actual policy enforcement, numeric risk scores or audit conclusions. Change Impact Lens — Policy Intelligence remains a separate, proposed follow-on.

## Review and activation
1. Review the five V2 preview pages at desktop and mobile sizes; verify that each page makes sense without opening the old chapter.
2. Verify chapter links, selected states, keyboard use, no horizontal overflow, accessible labels and no unexpected network requests.
3. Run the full regression suite and V2 tests. Capture and visually inspect screenshots; capture success is not visual approval.
4. **Only after explicit approval:** archive the five existing root pages with their technical references, promote the five V2 pages to the canonical URLs in one coordinated cutover, update deep-link aliases, and run all tests. Keep rollback by commit and archived reference URLs.
5. Verify GitHub Pages and any protected Vercel preview after cutover.

This preview is not an implemented company control, a policy, an audit conclusion, or evidence of production operations.

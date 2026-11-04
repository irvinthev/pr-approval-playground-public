# BL-08 — Control Objective Reconciliation and AI SDLC Gap Assessment

**Status:** Proposed mapping for review; not a canonical-inventory cutover  
**Date:** 2026-11-03  
**Scope:** Documentation and crosswalk only. No website navigation, simulations, evaluator, control definitions, or downloads changed.

## Decision being supported

The field guide is evolving from a single AI PR auto-approval example toward evaluation of **where AI participates in the SDLC, what authority it exercises, what can fail, and what safeguards/evidence matter**. This reconciliation evaluates the existing control assets before changing them. It does **not** claim that the sampled controls are implemented or operating at any company.

## Evidence and inventories inspected

| Source | Observed inventory | Evidence basis |
| --- | --- | --- |
| `control-matrix.html` | **14** control objectives: G01–G02, D01–D03, A01–A04, P01–P03, X01–X02 | Current HTML table; blob `358575af03d5366fa8f2969de426a1324247b03b` |
| `rcm-view.html` | **15** proposed safeguards: AI-01–AI-15 | In-page `controls` array (titles, risks, activities, evidence, tests) |
| `independent-assurance.html` | Links to 15-safeguard RCM View; states an existing downloadable **16-control** workbook uses a different inventory | Current page copy; blob `989216a157177c74bd30e95513e34d640a5d636b` |
| `downloads/AI_Approval_Example_RCM.xlsx` | **16 claimed by page**; individual control rows not reconciled in this pass | Workbook row-level extraction **pending**; no inferred 1:1 crosswalk |

**Inventory status:** The 14 and 15 sets have been mapped at the *objective* level below. The 16-control workbook must be inspected row by row before asserting a complete reconciliation or declaring any one inventory authoritative. Different numbers need not mean missing controls: several safeguards can implement one objective, and one safeguard may support multiple objectives.

## Preliminary crosswalk — 14 objectives to the 15-safeguard RCM

Mappings indicate **related intent**, not equivalence or verified control coverage.

| Foundational/AI objective | Existing objective in control library | Related RCM View safeguards | Reconciliation note |
| --- | --- | --- | --- |
| G01 | Approval policy & scope | AI-01, AI-02, AI-09 | Eligibility policy, management ownership and human exception route are separate implementation elements. |
| G02 | Independent administration | AI-03, AI-15 | Administrative independence and policy/enforcement change control are related but not identical. |
| D01 | Protected source changes | AI-07, AI-08 | Authorization mechanism versus GitHub checks and merge enforcement. |
| D02 | Risk-aware change classification | AI-01 | Dependency and scope screening; mapping completeness remains an evidence requirement. |
| D03 | Testing and validation | AI-08 | Mandatory tests and checks; does not alone establish reviewer/model decision quality. |
| A01 | Reviewer effectiveness | AI-05 | Adjudicated unsafe cases and false-low performance. |
| A02 | Agent permissions & inputs | AI-04, AI-06 (partial) | AI-04 covers identity/tool privilege; AI-06 covers output integrity. **Prompt-injection/input trust boundary is not fully explicit in AI-06.** |
| A03 | Model and policy changes | AI-14, AI-15 | Distinguish model/prompt/tool changes from deterministic eligibility and enforcement-policy changes. |
| A04 | Fail-safe behavior & monitoring | AI-06, AI-12 | Missing/conflicting/stale decisions should fail safely; operational drift/exception monitoring follows. |
| P01 | Build provenance and artifact integrity | AI-10 | Commit-to-artifact lineage. |
| P02 | Production route enforcement | AI-11 | Normal, privileged, and emergency deployment paths. |
| P03 | Monitoring, rollback and reconciliation | AI-12, AI-13 | Monitoring the approval process versus production recovery are distinct. |
| X01 | Traceable decision record | AI-06, AI-07, AI-10, AI-12 | Cross-cutting traceability; the four safeguards individually do not establish complete retained evidence. |
| X02 | Periodic control challenge | AI-12, AI-14, AI-15 | Ongoing review of exceptions, model changes, and protected policy changes. |

### 15-safeguard disposition

- **Retain as distinct proposed safeguards:** AI-01 eligibility; AI-02 management policy ownership; AI-03 authorization independence; AI-04 agent identity; AI-05 reviewer validation; AI-06 reviewer integrity; AI-07 independently governed authorization; AI-08 merge/CI enforcement; AI-09 human exception authority; AI-10 build provenance; AI-11 release enforcement; AI-12 monitoring approval behavior; AI-13 production recovery; AI-14 model/prompt change control; AI-15 approval policy/enforcement change control.
- **Do not collapse automatically:** AI-03 and AI-07 (admin independence vs decision execution); AI-05 and AI-06 (reviewer quality vs integrity of a particular verdict); AI-10 and AI-11 (artifact lineage vs release gate); AI-14 and AI-15 (AI behavior change vs independent enforcement change).
- **Potential overlaps requiring owner decision:** AI-01/AI-02/G01; AI-12/X02; AI-14/AI-15/G02. These should be clarified through scope and acceptance criteria, not removed merely because wording overlaps.

## Coverage by AI SDLC activity and delegated authority

For this assessment, authority is not a single numerical level:

- **Execution:** code/config modification and tool invocations.
- **Decision:** classification, review and authorization.
- **Production:** release, rollback and live remediation.
- **Governance:** modifying the rules, credentials, models or policies that govern those actions.

| AI activity | Authority introduced | Key failure mode | Related existing objective(s) / safeguard(s) | Coverage and open question |
| --- | --- | --- | --- | --- |
| AI-generated code | Execution | Generated defects, malicious dependencies, unsafe edits to tests/workflows | D03, A02, D01; AI-04, AI-08 | **Partial:** general testing and permissions covered; explicit AI-development scope, untrusted repo instructions and independence of test specifications need attention. |
| AI code review | Advisory decision | False negatives; common-mode misses; manipulated input/output | A01, A02, A03, A04; AI-05, AI-06, AI-14 | **Substantial for PR review:** validation, versioning and fallback addressed; scenario-specific empirical evidence is still required. |
| AI criticality classification | Decision affecting eligibility | Missed indirect dependency, incorrect protected-scope classification | G01, D02, A01; AI-01, AI-02, AI-05 | **Substantial conceptually:** distinguish deterministic mapping quality from probabilistic reviewer performance. |
| AI change authorization | Delegated approval authority | False approval, creator-controlled policy, stale SHA, bypass | G01, G02, D01, X01; AI-02, AI-03, AI-07, AI-08, AI-09 | **Substantial conceptually:** verify independence, exact revision and all merge paths in a real environment. |
| AI-directed deployment | Production execution/decision | Unsafe release, unauthorized path, incorrect artifact | P01, P02, P03; AI-10, AI-11, AI-13 | **Partial for agentic release:** conventional release enforcement covered; AI-specific tool permissions, bounded decisions and escalation need more explicit treatment. |
| AI monitoring and remediation | Advisory or production action | Missed anomaly, unsafe automated rollback/fix, feedback loop | A04, P03, X02; AI-12, AI-13 | **Partial:** observation and recovery covered; autonomous remediation authority, rollback scope and independent containment need a dedicated applicability test. |
| AI modifies governance rules | Governance authority | Self-expanding privileges or weakened enforcement | G02, A03, X02; AI-03, AI-14, AI-15 | **Strong prohibition/segregation conceptually:** do not assume two agents imply independent administration. |

**Coverage terms:** Substantial/partial describe *documentation relevance*, not evidence of effectiveness. Nothing in this table supplies a residual-risk rating.

## Genuine gaps and ambiguities (proposed backlog, not audit findings)

| Gap ID | Priority | Gap / question | Proposed resolution | Acceptance criterion |
| --- | --- | --- | --- | --- |
| REC-01 | P0 | The 16-control downloadable workbook is not row-level mapped to 14- and 15-item views. | Extract full workbook, map each ID to objective(s), and record duplicates/unique requirements. | Every workbook row has disposition and exact source; unexplained count differences resolved or disclosed. |
| REC-02 | P0 | Multiple inventories lack agreed identity and relationship semantics. | Define canonical **objective IDs**, separate optional implementation-safeguard IDs and test procedure IDs; document 1:many relationships. | One published crosswalk; no silent renumbering or lost RCM history. |
| REC-03 | P1 | Participation and authority across AI development, review, approval, deployment, monitoring are not consistently represented. | Add capability-based authority and stage applicability fields to the canonical inventory. | Readers can identify which objectives become applicable when AI gains a new permission/decision. |
| REC-04 | P1 | AI coding agent execution and prompt-injection boundaries need explicit applicability. | Extend A02/AI-04 or add narrowly scoped safeguard if gap remains after review. | Describes untrusted instructions, tool permissions, code/test mutation, isolation and evidence; no duplicate control by default. |
| REC-05 | P1 | AI-directed production action and remediation autonomy are less explicit than traditional release controls. | Extend P02/P03 and AI-11/AI-13 with bounded execution, escalation and recovery criteria. | Clear distinction between deterministic CI/CD and AI choosing/executing production actions. |
| REC-06 | P1 | Risk tolerance → eligibility → enforcement has no single visible decision mapping. | Define management-owned exclusions, conditions, human escalation, block and suspend paths. | No AI score or acceptance overrides a mandatory gate. |
| REC-07 | P1 | Model-review accuracy, administrative independence and common-mode error are sometimes conflated in discussion. | Maintain separate risk/control links for reviewer quality, admin independence, and correlated failure. | Crosswalk explains why two agents alone do not establish SoD or reviewer quality. |
| REC-08 | P2 | Evidence lifecycle and definitions differ across views. | Establish evidence status vocabulary: proposed, implemented, validated, period-operated; document retention and population limits. | No simulated logs or fictional screenshots presented as real operating evidence. |
| REC-09 | P2 | Control-objective mapping has not been connected to externally verified vendor operating practices. | Add source/date/claim/limitations records for OpenAI, Anthropic and Cursor, plus relevant standards. | Accurate source-specific references; no vendor practice treated as prescribed control or certification. |

## Proposed field-guide decision flow

1. Identify AI participation by activity.
2. Document **effective** execution, decision, production and governance permissions.
3. Identify credible failures and potential consequences given system/change criticality.
4. Match applicable existing objectives and safeguards (many-to-many).
5. Distinguish proposed design from verified safeguards; keep missing evidence visible.
6. Apply management-owned risk tolerance as enforceable eligibility, human review, block, or suspension conditions.
7. Present evidence questions without asserting an unsupported residual-risk score or SOX conclusion.

## Follow-up before any canonical inventory or site changes

1. Inspect all rows/tabs of `downloads/AI_Approval_Example_RCM.xlsx`; reconcile its 16 controls and ID references.
2. Decide whether `control-matrix.html` holds canonical **objectives** while `rcm-view.html` holds **safeguard implementations**, or whether a shared structured source should drive both.
3. Confirm identifier stability and backward links for Assurance exports and legacy RCM downloads.
4. Validate one objective-to-risk-to-evidence chain per AI activity *without fictional scenarios*.
5. Only then consider a separately reviewed implementation PR. Keep existing scenarios and simulators parked and unchanged.

## Constraints

This is a proposed documentation crosswalk. It was produced from the repository sources listed above. The workbook's internal rows, CI test results, current browser behavior and primary implementation evidence were **not verified** in this pass. No status in this document should be interpreted as a real-world control operating-effectiveness conclusion.

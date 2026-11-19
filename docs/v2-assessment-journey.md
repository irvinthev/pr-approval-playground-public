# V2 Assessment Journey — design-branch review

**Status:** public educational prototype; not an implemented or validated control system.

## Scope and navigation

On this branch, the root entry redirects to `v2/index.html`. The previous long-form Field Guide remains available as `field-guide-v2.html`. No original experiment, backend, integration, or data source is deleted.

The V2 journey has four stages:

1. **Overview:** choose proposed design or existing workflow; preview the fictional shared-library case.
2. **Risk Assessment:** describe decision authority, exposure, and reachable paths. Applicability and qualitative attention are determined separately from evidence.
3. **Engineering Expectations:** for the selected risk, inspect failure mechanism, expected behavior, alternative designs, independence/operating boundaries, source descriptions and framework roles.
4. **Assessment & Testing:** inspect a negative test hypothesis, explicitly record a *user-reported* evidence state, and export a local JSON summary or print.

## Analytical rules

- **Problem before control:** a design may be questioned or simplified before describing expected safeguards.
- **Authority before assessment:** advisory/routing, human-authorized execution, and autonomous AI approval are separate patterns.
- **Applicability is not residual risk:** a reported safeguard cannot remove a relevant failure mechanism from the matrix.
- **Priority is not an assurance rating:** the heuristic flags questions worth investigation; it does not compute probability, financial loss, or a universal risk ranking.
- **Source provenance:** fictional inputs, interpretation, technical vendor documentation, methodological guidance, and user-entered evidence are labeled distinctly. Broad framework URLs are orientation references, not provision-level validated crosswalks.
- **Evidence is not automatically accepted:** the site does not read GitHub configurations, analyze code, or verify uploaded evidence. Evidence status is recorded as a reviewer representation only.
- **Review before changing conclusions:** form edits stage changes. Only an explicit Review Risk Relevance action applies them. Changing the assessment environment invalidates prior evidence states and retains an event note in the in-browser review history.
- **Proposed vs operating:** design feasibility and management authorization are distinct from implementation or operating-effectiveness conclusions.

## Scenarios

Choose from the Risk Assessment page's **Compare fictional architecture scenarios** control:

| Profile | Distinguishing risk assertion |
| --- | --- |
| Shared-library autonomous approval | AI independently approves and exempt identity can reach merge |
| Agent submits an engineer's explicit approval | The human decides; agent execution needs revision-bound limits |
| Manager-review routing only | Managers receive review assignments; existing approval substitution is not indicated |
| Manager-review manager substitutes approval | Reviewer authority changes; do not infer a bot exemption without evidence |

The Manager-review scenarios are explicitly fictional variants; they do not claim a real organization has selected either model.

## Verification and limitations

Run `node --test tests/v2-assessment-model.test.mjs`. Tests compile the shipped inline script and assert scenario distinction, risk applicability, basic evidence separation, and absence of embedded provider secrets. These are **model and source checks**, not full browser, accessibility, security, or user-validation tests.

Prior to merge, inspect the Vercel branch/PR preview (if configured) at desktop and mobile widths. Confirm navigation, selector updates, focus interactions, export, print, and existing experimental pages. Do not include confidential proposals or credentials in the public static demo.

No persistence, multi-user collaboration, LLM inference, actual source excerpts, automated framework retrieval, evidence upload, or objective operating-effectiveness determination is implemented.

## Merge gate

Keep as a **draft PR** until review of:
- Data model distinction between risk applicability, priority, treatment and evidence.
- Routing-only vs substitution, human-executed vs autonomous authorization.
- Source labeling and public-data protections.
- Usability and responsive layout.
- Original public guide and experimental tools still reachable.

The current V2 represents one integrated prototype, not an assurance-ready assessment product.

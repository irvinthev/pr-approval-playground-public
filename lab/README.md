# Interactive Investigation Lab (illustrative)
A dependency-free, browser-native companion to the existing SDLC field guide. The interaction design comes from the MagicPath prototype, adapted to this repository's static GitHub Pages architecture. No production APIs, authentication, model inference or data collection.
## Run
Open the published /lab/ path through GitHub Pages. Locally, serve the repository root with `python3 -m http.server 8000` and open /lab/. (ES modules require HTTP.)
## Test
Run `cd lab && node --test evaluator.test.mjs` (requires a modern Node.js release). The pure evaluator is separate from the browser UI.
## Key decisions
* The AI reviewers' LOW/MEDIUM/HIGH verdicts are not the approval of record.
* Deterministic scope, independent administration and exact-revision CI are separate prerequisites.
* Missing evidence prevents a simulated release decision; risk acceptance is deliberately never inferred.
* A failed canary may occur after merge authorization, so the simulator separates authorization from release eligibility.
* Toggle states and exported traces are invented. No control effectiveness or audit evidence is implied.
## Follow-up
Compare with the existing sandbox evaluator to avoid duplicate rules, assess accessibility and decide whether to incorporate this view into the main navigation. Do not replace existing scenarios without a review of scenario parity.

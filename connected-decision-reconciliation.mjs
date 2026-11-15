// Static, source-linked architecture and reconciliation view for the A/B report.
// No GitHub calls, webhook subscriptions, telemetry ingestion, or claimed implementation.
const target=document.querySelector('#technical-basis');
if(!target)throw new Error('Shared technical basis not found');
const template=document.createElement('template');
template.innerHTML=`
<section id="reconciliation" class="recon" aria-labelledby="recon-heading">
  <div class="recon-header">
    <div>
      <span class="section-kicker">OPERATIONAL CAPABILITY TO EVALUATE</span>
      <h2 id="recon-heading">Can the system reconcile the human decision, API action, and recorded approval?</h2>
      <p>Three separate records are needed to reconstruct what was intended, what the agent attempted, and what GitHub actually recorded.</p>
    </div>
    <span class="recon-state">Not established in this scenario</span>
  </div>
  <div class="recon-chain" aria-label="Three records to reconcile">
    <article class="recon-stage">
      <span class="recon-step">01 · Human intent</span>
      <h3>Authorized decision</h3>
      <p>Identity, explicit approval instruction, repository, PR number, authorized commit SHA, and time.</p>
      <span class="recon-known">Human decision described · persistent record unknown</span>
    </article>
    <div class="recon-arrow" aria-hidden="true">→</div>
    <article class="recon-stage">
      <span class="recon-step">02 · Execution</span>
      <h3>Agent / API action</h3>
      <p>Tool, credential identity, requested PR and SHA, API call and response, timestamp, and correlation ID.</p>
      <span class="recon-known">Execution trace and scope enforcement unknown</span>
    </article>
    <div class="recon-arrow" aria-hidden="true">→</div>
    <article class="recon-stage">
      <span class="recon-step">03 · Recorded outcome</span>
      <h3>GitHub review</h3>
      <p>Persisted review ID, actor, commit ID, review state and submission time, read back independently.</p>
      <span class="recon-known">GitHub API supports retrieval · collection unknown</span>
      <a href="https://docs.github.com/en/rest/pulls/reviews" target="_blank" rel="noopener noreferrer">GitHub REST review fields ↗</a>
    </article>
  </div>
  <div class="recon-response">
    <div class="recon-response-head">
      <div><span class="section-kicker">OPERATIONAL DESIGN QUESTION</span><h3>What happens when the three records do not match?</h3></div>
      <span class="recon-state">Exception handling unknown</span>
    </div>
    <div class="recon-actions">
      <div><strong>Match</strong><p>Correlate instruction ID, PR, SHA, agent identity, GitHub review ID, state, and timing. Detect approvals without a corresponding instruction.</p></div>
      <div><strong>Detect</strong><p>Subscribe to <a href="https://docs.github.com/en/webhooks/webhook-events-and-payloads#pull_request_review" target="_blank" rel="noopener noreferrer">review events</a>, then independently compare to <a href="https://docs.github.com/en/rest/pulls/reviews" target="_blank" rel="noopener noreferrer">REST review records</a> to find unobserved or unexpected actions.</p></div>
      <div><strong>Respond</strong><p>Flag stale-SHA, unauthorized, duplicate, failed, or missing actions. Define investigation, recovery, and conditions for suspending execution.</p></div>
    </div>
  </div>
  <div class="recon-finding">
    <strong>What changes the assessment?</strong>
    <p>A working reconciliation that detects an unapproved revision or unmatched GitHub review and produces a traceable exception. An API success message or webhook receipt alone does not establish that capability.</p>
  </div>
</section>

<section id="technical-references" class="tech-refs" aria-labelledby="technical-references-title">
  <div class="section-heading">
    <div><span class="section-kicker">TECHNICAL REFERENCE LIBRARY</span><h2 id="technical-references-title">Sources behind the recommendations</h2></div>
    <span class="hint">What each source supports—and what it doesn't</span>
  </div>
  <div class="tech-ref-grid">
    <article class="tech-ref"><span>GITHUB DOCS · REVIEWS API</span>
      <h3><a href="https://docs.github.com/en/rest/pulls/reviews" target="_blank" rel="noopener noreferrer">Pull request reviews ↗</a></h3>
      <p><strong>Supports:</strong> Review creation and retrieval, IDs, actor, commit SHA, state, and submitted time.</p>
      <small><strong>Limit:</strong> Does not establish the human instruction or a complete reconciliation.</small>
    </article>
    <article class="tech-ref"><span>GITHUB DOCS · WEBHOOKS</span>
      <h3><a href="https://docs.github.com/en/webhooks/webhook-events-and-payloads#pull_request_review" target="_blank" rel="noopener noreferrer">Review events ↗</a></h3>
      <p><strong>Supports:</strong> Event-driven notification of review activity.</p>
      <small><strong>Limit:</strong> <a href="https://docs.github.com/en/webhooks/using-webhooks/handling-failed-webhook-deliveries" target="_blank" rel="noopener noreferrer">Failed deliveries need recovery ↗</a>; notifications alone cannot establish completeness.</small>
    </article>
    <article class="tech-ref"><span>GITHUB DOCS · RULESETS</span>
      <h3><a href="https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets" target="_blank" rel="noopener noreferrer">Stale-review rules ↗</a></h3>
      <p><strong>Supports:</strong> Configurable review gates and stale approval handling.</p>
      <small><strong>Limit:</strong> Does not establish the rules actually enabled or their exemptions.</small>
    </article>
    <article class="tech-ref"><span>CLAUDE CODE DOCS · TOOLS</span>
      <h3><a href="https://code.claude.com/docs/en/permissions" target="_blank" rel="noopener noreferrer">Agent permissions ↗</a></h3>
      <p><strong>Supports:</strong> Permission modes and tool-level rules for shell and MCP use.</p>
      <small><strong>Limit:</strong> Does not establish independent GitHub credential restrictions.</small>
    </article>
    <article class="tech-ref"><span>GITHUB DOCS · AUDIT LOG</span>
      <h3><a href="https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/reviewing-the-audit-log-for-your-organization" target="_blank" rel="noopener noreferrer">Organization audit log ↗</a></h3>
      <p><strong>Supports:</strong> Visibility into supported organizational events, actors and timestamps.</p>
      <small><strong>Limit:</strong> Do not assume every review or original human decision is represented.</small>
    </article>
  </div>
</section>`;
target.before(template.content.cloneNode(true));

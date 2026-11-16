/* V2 chapter-level investigations. Public-safe, deterministic, no model or network calls. */
(function () {
  'use strict';
  const chapters = {
    'legacy-homepage.html': {
      title: 'The same GitHub approval can mean three different things.',
      intro: 'Choose who made the decision. The recorded GitHub event alone cannot settle that question.',
      labels: ['Who decides?', 'Who performs the action?', 'What still needs evidence?'],
      choices: [
        {name:'Human approval', title:'A person reviews and approves', values:['A reviewer exercises judgment about the current PR revision.','The reviewer submits the GitHub approval.','The reviewer saw the relevant change, had the intended authority, and the revision was unchanged.'], link:'#overview-authority-preview'},
        {name:'Human-directed agent', title:'The agent executes an explicit human decision', values:['A person gives a specific, revision-bound approval instruction.','An agent uses an authorized tool and identity to submit the approval.','A retrievable instruction, tool invocation, credential scope, and GitHub event actually correspond.'], link:'#overview-authority-preview'},
        {name:'Autonomous approval', title:'Policy delegates a bounded decision', values:['A controlled management-approved policy permits automated authorization when conditions hold.','An authorized automation identity submits the decision.','Scope eligibility, effective policy, revision binding, independent enforcement, and exceptions are demonstrated.'], link:'#overview-authority-preview'}
      ]
    },
    'engineering-blueprint.html': {
      title: 'Who decides? Who acts? What enforces it?',
      intro: 'Compare four architecture choices before deciding which approval path to automate.',
      labels: ['Decision and execution', 'Independent enforcement', 'Tradeoff to resolve'],
      choices: [
        {name:'AI-assisted',title:'AI recommends; a person decides',values:['AI reviews code; a designated human authorizes the revision.','GitHub required reviews and checks remain effective without trusting AI output as authorization.','Is human review substantive, or is it a rubber stamp?'],link:'#engineering-build-plan'},
        {name:'Agent-executed',title:'Human judgment, agent execution',values:['A human gives explicit revision-specific approval; an agent carries out that instruction.','Restrict tool credentials and tie each GitHub action to the instruction and approved revision.','Agent speed cannot silently expand authority or survive a changed revision.'],link:'#engineering-build-plan'},
        {name:'Fast Track',title:'Simplify review where policy permits',values:['Management specifies a lighter human authorization process for eligible changes.','Deterministic scope and required checks still control which PRs may use the route.','Does reduced friction improve outcomes without removing needed expertise?'],link:'#engineering-build-plan'},
        {name:'Autonomous',title:'Delegate narrow approval authority',values:['Management approves a policy under which automation may authorize qualifying revisions.','Independent eligibility, credential limits, current-revision checks and protected merge gates enforce that policy.','Do mapping quality, AI false-low outcomes, bypass paths and exception costs justify expanded delegation?'],link:'#rr02-negative-test'}
      ]
    },
    'continuous-monitoring.html': {
      title: 'A PR changed after approval. What happens next?',
      intro: 'Select a fictional event. Monitoring must correlate decisions with the content that was actually merged and deployed.',
      labels: ['Observed in the fictional case', 'Relationship to verify', 'Proportionate response'],
      choices: [
        {name:'10:02 · Approve A',title:'Revision A has an approval',values:['The illustrative record covers source revision A under a particular policy version.','Was the decision made by a permitted actor under the applicable policy?','Retain the authorization and rule context; no violation is established by the approval event.'],link:'#fg-monitoring-dashboard'},
        {name:'10:08 · Push B',title:'The approved change is revised',values:['A new commit creates revision B; A remains a historical record.','Do branch rules and review tooling invalidate A for changed source and required context?','Require fresh authorization or revalidation where policy demands it.'],link:'#fg-monitoring-dashboard'},
        {name:'10:09 · Merge attempt',title:'A merge is attempted for B',values:['The source revision and authorization no longer clearly match. The gate outcome is not assumed.','Compare merge-queue decisions, rulesets and permitted bypass paths against B, not a naive equality with a squash-merge SHA.','Investigate a rejection as enforcement working; investigate a successful unapproved merge as a possible violation.'],link:'#monitoring-investigations'},
        {name:'10:10 · Reconcile',title:'Reconstruct the change-to-release chain',values:['A fictional mismatch is flagged between authorization, merge and release records.','Correlate original intent or policy, action identity, source revision, build and deployed artifact; assess missing feeds.','Triage unknown versus confirmed exception, contain the affected automation if warranted, and validate safe recovery.'],link:'#monitoring-guide'}
      ]
    },
    'independent-assurance.html': {
      title: 'What can the evidence actually establish?',
      intro: 'Choose an assurance assertion. Different methods support different conclusions.',
      labels: ['What this approach supports', 'What it does not establish alone', 'What else is needed'],
      choices: [
        {name:'Sample approvals',title:'Inspect selected approval records',values:['Whether selected approvals match specified requirements and documented reviewers.','Whether all changes, alternate merge routes, or production releases were in the population.','Establish population completeness and investigate whether recorded approval reflects valid authority and judgment.'],link:'#assurance-control-explorer'},
        {name:'Reconcile population',title:'Connect actual production outcomes',values:['For covered production changes, whether each can be traced to required source, review, merge and release records.','That telemetry is complete, tamper resistant, or that an AI classification was correct.','Validate source coverage, join keys, excluded paths, bypasses and evidence-pipeline integrity.'],link:'#fg-worked-investigation'},
        {name:'Challenge decisions',title:'Adjudicate AI and enforcement quality',values:['How the selected model and rules handle representative defects, edge cases and bypass attempts.','An unrestricted assertion that all future changes are safe or that two agreeing models are independent.','Use severity-aware adversarial cases, versioned policy, evaluation coverage and post-change monitoring.'],link:'#assurance-control-explorer'}
      ]
    }
  };
  const file = location.pathname.split('/').pop() || 'index.html';
  const model = chapters[file];
  const create = (tag, text, cls) => {
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    if (cls) el.className = cls;
    return el;
  };
  function boot() {
    const hero = document.getElementById('main-content');
    if (!hero) return;
    // Risk already contains an interactive failure-path explorer. Promote it; do not duplicate it.
    if (file === 'ai-sdlc-risk.html') {
      const explorer = document.getElementById('risk-explorer');
      if (explorer) hero.insertAdjacentElement('afterend', explorer);
      return;
    }
    if (!model || document.getElementById('field-guide-v2-focus')) return;
    const section = create('section', undefined, 'fgv2-focus');
    section.id = 'field-guide-v2-focus';
    section.setAttribute('aria-labelledby', 'fgv2-title');
    section.append(create('span', 'DECISION FIRST · CASE-SHARED-01 · FICTIONAL', 'fgv2-kicker'));
    const title = create('h2', model.title);
    title.id = 'fgv2-title';
    section.append(title, create('p', model.intro, 'fgv2-intro'));
    const selector = create('div', undefined, 'fgv2-selector');
    selector.setAttribute('role', 'group');
    selector.setAttribute('aria-label', 'Explore this chapter’s decision');
    const buttons = model.choices.map((choice, index) => {
      const button = create('button', choice.name);
      button.type = 'button';
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => select(index));
      selector.append(button);
      return button;
    });
    section.append(selector);
    const detail = create('div', undefined, 'fgv2-detail');
    detail.setAttribute('role', 'region');
    detail.setAttribute('aria-label', 'Selected decision explanation');
    const detailTitle = create('h3');
    detail.append(detailTitle);
    const fields = model.labels.map(label => {
      const row = create('div', undefined, 'fgv2-field');
      row.append(create('strong', label));
      const value = create('p');
      row.append(value);
      detail.append(row);
      return value;
    });
    const action = create('a', 'Explore this chapter in detail →', 'fgv2-link');
    detail.append(action);
    section.append(detail);
    const notice = create('p', 'Illustrative design reasoning. Not a live GitHub, AI, monitoring, or assurance determination.', 'fgv2-limit');
    section.append(notice);
    function select(index) {
      const chosen = model.choices[index];
      if (!chosen) return;
      buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
      detailTitle.textContent = chosen.title;
      chosen.values.forEach((value, i) => { fields[i].textContent = value; });
      action.href = chosen.link;
    }
    hero.insertAdjacentElement('afterend', section);
    select(0);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once: true});
  else boot();
})();
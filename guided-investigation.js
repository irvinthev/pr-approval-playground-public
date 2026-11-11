/* Optional guided RR-02 path: navigation only, no evaluator or approval logic. */
(function () {
  'use strict';
  const params = new URLSearchParams(location.search);
  if (params.get('journey') !== 'rr02') return;
  const filename = location.pathname.split('/').pop() || 'index.html';
  const chapters = [
    { file: 'index.html', title: 'Change', heading: 'What should happen when a change is outside AI approval scope?', description: 'Observe a correctly enforced exclusion. This contrasts with the next chapter: the hypothetical failure where unsafe scope is mistakenly allowed into the AI approval route.', local: '#scenario-lab', action: 'Inspect the blocked-change example' },
    { file: 'ai-sdlc-risk.html', title: 'Risk', heading: 'What if classification incorrectly permits automation?', description: 'Challenge the RR-02 risk: a change that should require human review is incorrectly considered eligible. What decision must management make about this boundary?', local: '#risk-explorer', action: 'Challenge the RR-02 risk decision' },
    { file: 'engineering-blueprint.html', title: 'Safeguards', heading: 'What would independently prevent the wrong approval?', description: 'Explore how Engineering might implement eligibility gates, approval authority, and merge enforcement—even if an AI reviewer classifies a change incorrectly.', local: '#technical-requirements', action: 'Examine independent technical safeguards' },
    { file: 'continuous-monitoring.html', title: 'Monitoring', heading: 'How would management detect and respond to a miss?', description: 'Trace a possible false-low-risk signal, responsible escalation, and retained records. Detection coverage must be validated rather than assumed.', local: '#classification-monitoring-bridge', action: 'Review detection and response' },
    { file: 'independent-assurance.html', title: 'Assurance', heading: 'What could management show an auditor?', description: 'Review the design, testing expectations, monitoring evidence, and open questions that management could present. The auditor must separately assess sufficiency and effectiveness.', local: '#classification-evidence-bridge', action: 'Review the management-to-auditor handoff' }
  ];
  const index = chapters.findIndex(c => c.file === filename);
  if (index < 0) return;
  const current = chapters[index];
  const url = (i) => {
    const target = chapters[i].file;
    const query = target === 'ai-sdlc-risk.html' ? '?risk=RR-02&journey=rr02' : '?journey=rr02';
    return './' + target + query + '#guided-investigation';
  };
  const root = document.createElement('nav');
  root.id = 'guided-investigation';
  root.className = 'guided-investigation';
  root.setAttribute('aria-label', 'Guided investigation progress');
  const steps = chapters.map((c, i) => '<li><a href="' + url(i) + '"' + (i === index ? ' aria-current="step"' : '') + '><span class="guided-step-number">' + (i + 1) + '</span><span>' + c.title + '</span></a></li>').join('');
  const footer = index < chapters.length - 1
    ? '<a class="guided-next" href="' + url(index + 1) + '">Continue: ' + chapters[index + 1].title + ' →</a>'
    : '<div class="guided-completion"><strong>Management-to-auditor handoff / illustrative only.</strong><p><b>Design to explain:</b> where AI may classify or recommend, and which independent rules control authorization and release.</p><p><b>Evidence to prepare:</b> effective policy and permissions, tested false-low-risk cases, exact revision and approval traces, production-path coverage, alerts and dispositions.</p><p><b>Still to establish:</b> actual configuration, population completeness, tested outcomes and operation over time. No actual company configuration, monitoring population, authorization outcome or control effectiveness has been verified; auditor evaluation remains separate.</p><a href="./index.html#workflow">Return to the field guide →</a></div>';
  root.innerHTML = '<div class="guided-head"><span class="guided-kicker">GUIDED INVESTIGATION / RR-02 · ' + (index + 1) + ' OF 5</span><strong>' + current.heading + '</strong><p>' + current.description + '</p></div><ol class="guided-steps">' + steps + '</ol><div class="guided-actions"><a class="guided-local" href="' + current.local + '">' + current.action + ' ↓</a>' + footer + '</div>';
  const hero = document.getElementById('main-content');
  if (hero) hero.insertAdjacentElement('afterend', root);
  if (location.hash === '#guided-investigation') {
    requestAnimationFrame(() => root.scrollIntoView({ block: 'start', behavior: 'instant' }));
  }
})();

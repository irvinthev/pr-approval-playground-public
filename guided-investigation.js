/* Optional guided RR-02 path: navigation only, no evaluator or approval logic. */
(function () {
  'use strict';
  const params = new URLSearchParams(location.search);
  if (params.get('journey') !== 'rr02') return;
  const filename = location.pathname.split('/').pop() || 'index.html';
  const chapters = [
    { file: 'index.html', title: 'Change', heading: 'What happened to the change?', description: 'Explore a fictional hard-gate exclusion. The next chapter examines the related failure where unsafe scope is mistakenly classified as eligible.', local: '#scenario-lab', action: 'Inspect the change scenario' },
    { file: 'ai-sdlc-risk.html', title: 'Risk', heading: 'What if the boundary failed?', description: 'Investigate RR-02: an unsafe change incorrectly enters the low-risk automated route. The exclusion demonstrated on Overview is a contrasting successful safeguard.', local: '#risk-explorer', action: 'Inspect RR-02 and the management decision' },
    { file: 'engineering-blueprint.html', title: 'Safeguards', heading: 'What independently enforces the limit?', description: 'Inspect deterministic scope and dependency checks, authorized review routes, and enforcement requirements. The architecture shown is illustrative.', local: '#technical-requirements', action: 'Inspect technical safeguards' },
    { file: 'continuous-monitoring.html', title: 'Monitoring', heading: 'What signal could reveal a failure?', description: 'Follow a possible false-low-risk classification from a meaningful signal through investigation, response and evidence retention.', local: '#classification-monitoring-bridge', action: 'Inspect the monitoring response' },
    { file: 'independent-assurance.html', title: 'Assurance', heading: 'What would justify reliance?', description: 'Evaluate population completeness, classification negative tests and authorization traces. This teaching case cannot establish real-world control effectiveness.', local: '#classification-evidence-bridge', action: 'Examine the evidence questions' }
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
    : '<div class="guided-completion"><strong>Investigation complete / illustrative only.</strong><p>You have traced a fictional case through risk, safeguards, monitoring and evidence questions. No actual company configuration, monitoring population, authorization outcome or control effectiveness has been verified.</p><a href="./index.html#workflow">Return to the field guide →</a></div>';
  root.innerHTML = '<div class="guided-head"><span class="guided-kicker">GUIDED INVESTIGATION / RR-02 · ' + (index + 1) + ' OF 5</span><strong>' + current.heading + '</strong><p>' + current.description + '</p></div><ol class="guided-steps">' + steps + '</ol><div class="guided-actions"><a class="guided-local" href="' + current.local + '">' + current.action + ' ↓</a>' + footer + '</div>';
  const hero = document.getElementById('main-content');
  if (hero) hero.insertAdjacentElement('afterend', root);
  if (location.hash === '#guided-investigation') {
    requestAnimationFrame(() => root.scrollIntoView({ block: 'start', behavior: 'instant' }));
  }
})();

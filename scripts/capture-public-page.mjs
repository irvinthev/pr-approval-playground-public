// PR visual QA: capture the checked-out site, not the deployed GitHub Pages site.
// Locally: python3 -m http.server 4173 &
//          npm install --no-save playwright && npx playwright install chromium
//          SITE_BASE_URL=http://127.0.0.1:4173/ node scripts/capture-public-page.mjs
import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { readdir } from 'node:fs/promises';

const base = process.env.SITE_BASE_URL || 'http://127.0.0.1:4173/';
const output = resolve('screenshots-demo');
const mode = process.env.QA_MODE === 'full' ? 'full' : 'targeted';
const baselinePages = [
  ['overview', 'index.html'],
  ['risk-management', 'ai-sdlc-risk.html'],
  ['assurance', 'independent-assurance.html'],
];
const pages = mode === 'full' ? [...baselinePages] : [];
// In targeted mode, capture the pages affected by the PR; avoid a full-site matrix.
try {
  const parent = process.env.PR_BASE_SHA;
  if (parent) {
    const changed = execFileSync('git', ['diff', '--name-only', parent, 'HEAD'], {encoding:'utf8'}).trim().split('\n').filter(Boolean);
    const add = file => {
      if (/^[a-zA-Z0-9._/-]+\.html$/.test(file) && !pages.some(([,p])=>p===file))
        pages.push(['changed-'+file.replace(/[^a-zA-Z0-9]+/g,'-'),file]);
    };
    for(const file of changed){
      if(file.endsWith('.html'))add(file);
      // Shared styles and scripts can affect all five principal chapters.
      if (/^(site\.css|guided-investigation\.(css|js)|shared-pipeline-(context|nav)\.(css|js)|page-orientation\.css)$/.test(file)){
        ['index.html','ai-sdlc-risk.html','engineering-blueprint.html','continuous-monitoring.html','independent-assurance.html'].forEach(add);
      }
      if (/^(risk-|sdlc-risk-)/.test(file) && /\.(js|css)$/.test(file))add('ai-sdlc-risk.html');
      if (/^(challenge-connected-report-(data\.mjs|view\.mjs|css)|challenge-agent-contract\.js|challenge-risk-path-catalog\.mjs|api\/challenge\.js|scripts\/capture-public-page\.mjs)$/.test(file))add('private-challenge.html');
      if (/^scripts\/capture-public-page\.mjs$/.test(file))add('index.html');
    }
  }
} catch(e) { console.warn('Changed page discovery unavailable: '+e.message); }
// Baseline page is a safe fallback for PRs with no changed HTML/CSS/JS mapping.
if (!pages.length) pages.push(['overview','index.html']);
if (mode === 'full' && !pages.some(([,p])=>p==='scenario-journey.html')) pages.push(['scenario-journey','scenario-journey.html']);
const viewports = [
  ['desktop', { width: 1280, height: 900 }],
  ['mobile', { width: 390, height: 844 }],
];
const records = [];
const failures = [];
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const check = (ok, message) => { if (!ok) throw new Error(message); };

async function capture(page, label, response, checks = []) {
  const filename = label + '.png';
  await page.screenshot({ path: resolve(output, filename), fullPage: true, animations: 'disabled' });
  const hash = createHash('sha256').update(await readFile(resolve(output, filename))).digest('hex');
  const item = {
    name: label,
    url: page.url(),
    title: await page.title(),
    capturedAtUtc: new Date().toISOString(),
    viewport: page.viewportSize(),
    httpStatus: response.status(),
    screenshot: filename,
    sha256: hash,
    checks,
  };
  records.push(item);
  await writeFile(resolve(output, label + '.json'), JSON.stringify(item, null, 2));
  console.log('CAPTURED ' + label + ' ' + hash.slice(0, 12));
}
async function checkChallengeAssessment(page, captureDecisionBrief) {
  let requests = [];
  const questions = [
    {question:'Can credentials overlap?',why:'Overlap changes the cutover design.',options:['Yes, during cutover','No, only one at a time']},
    {question:'Is cutover observed?',why:'Observation changes revocation timing.',options:['All consumers','Some consumers']}
  ];
  await page.route('**/api/challenge-session', route => route.fulfill({json:{active:false}}));
  await page.route('**/api/challenge', async route => {
    const request = route.request().postDataJSON();
    requests.push(request);
    const revised = request.turns.length === 1;
    const noQuestions = /PR Plan/.test(request.scenarioText);
    const delegated = /stacked pull requests/i.test(request.scenarioText);
    if (delegated) {
      const unknown = objective => ({objective,why:'Address a failure in the delegated workflow.',
        implementation:'not-assessed',referenceIds:[]});
      await route.fulfill({json:{
        mode:'live-model',continuityReceipt:'fictional-delegated',
        conclusions:[{application:'Keep approvals manual until the submission is revision-bound, repository rules require fresh review and agent access is narrow.',
          scenarioBasis:'A fictional engineer decides on four stacked PRs and the agent submits.',basisType:'engineering-judgment',
          openQuestion:'Could a changed revision merge on the original approval?',citations:[]}],
        counterargument:'Existing merge rules may already cover the key failure.',alternatives:['Use a narrow batch submitter.'],
        challenges:[
          {question:'A different revision could merge',reason:'After a push or rebase, an approval could apply to code the engineer never saw.',
            tests:['Check submission and merge behavior.'],alternatives:[]},
          {question:'Agent access could be too broad',reason:'The agent may have permissions outside the intended workflow.',tests:[],alternatives:[]}
        ],
        expectedSafeguards:[
          unknown('Bind submission to the reviewed revision'),
          unknown('Repository requires fresh review after changes'),
          unknown('Narrow the agent’s credential scope'),
          {objective:'Record the human decision per revision',why:'Tie the decision to the approved PR revision.',
            implementation:'reported-partial',implementationBasis:'The scenario reports an engineer decision.',referenceIds:[]}
        ],
        facts:[],approvalOutcomes:[],unknowns:['Effective repository rules'],
        clarifications:[{question:'Could a changed revision merge on the original approval?',
          why:'This determines whether to keep approvals manual.',options:['The repository blocks merge','The approval can still count']}],
        decisionPerspectives:{
          engineering:{position:'Compare a narrow batch submitter against broad coding-agent permissions.',
            considerations:['Handle a rebase and partial failure before retry.'],
            nextStep:'Test revision-bound execution in a sandbox.',
            pivot:'Would native review changes solve the friction?',referenceIds:['GH-REVIEWS']},
          risk:{position:'Broad delegated approval credentials create exposure if instructions and execution diverge.',
            considerations:['Determine scope and treatment of unmatched approvals.'],
            nextStep:'Clarify management risk ownership and treatment where warranted.',
            pivot:'Can unauthorized approvals be prevented or reconciled?',referenceIds:[]},
          assurance:{position:'A GitHub review is evidence of submission, not necessarily of human judgment on that revision.',
            considerations:['Correlate the original instruction with the API action and recorded review.'],
            nextStep:'Inspect an authorized and an unmatched approval sequence.',
            pivot:'What reconciled records establish the decision?',referenceIds:['GH-REVIEWS']}
        },
        decisionChallenge:{
          objective:'Reduce repeated review clicks without delegating human approval judgment.',
          tension:'PR-2 is rebased after the engineer authorized the earlier revision.',
          question:'Pause all reviews or proceed with independently authorized unaffected PRs?',
          boundary:{
            decision:'Engineer decides on each exact PR revision.',
            execution:'Agent submits the selected reviews through an assumed GitHub path.',
            enforcement:'GitHub rules may restrict merge, but settings are unverified.'
          },
          options:[
            {label:'Pause the entire batch',consequence:'All submissions stop pending renewed authorization.',
             tradeoff:'Simpler recovery, but it delays unaffected reviews.',
             verification:'Observe that no reviews are submitted after PR-2 changes.',
             managementImplication:'Lower recovery complexity but less potential throughput.',
             safeguardIndex:0},
            {label:'Submit only still-authorized reviews',
             consequence:'Unaffected revisions proceed only when dependencies and per-PR approval remain valid.',
             tradeoff:'More throughput, but partial completion is more complex.',
             verification:'Verify the selected SHA and dependency graph for every review submitted.',
             managementImplication:'Better throughput in some cases, but requires partial-batch recovery.',
             safeguardIndex:2}
          ]
        },
        operationalReview:{kind:'reconciliation',
          question:'Can the human instruction, agent API action and persisted review be reconciled?',
          detection:'Match human authorization, API request and recorded review by revision.',
          response:'Investigate unmatched reviews and stop additional submissions where needed.',
          implementation:'not-assessed',referenceIds:['GH-REVIEWS']},
        riskPath:{pathway:'delivery',
          failure:'The agent submits an approval for a revision the engineer did not authorize.',
          uncertainty:'Actual GitHub permissions and revision protections have not been checked.',
          steps:[
            {stageId:'authorization',roles:['origin'],event:'Agent submission is not rebound to the reviewed SHA.',
              interruption:'',evidence:'Recorded human decision and exact revision.'},
            {stageId:'merge',roles:['exposure','prevention'],event:'An outdated review might satisfy a merge gate.',
              interruption:'Block merges when review and current revision diverge.',
              evidence:'Repository rules, review commit and merge outcomes.'},
            {stageId:'monitor',roles:['detection'],event:'A missing human decision may be found after review submission.',
              interruption:'',evidence:'Independent reconciliation of human intent, API action and GitHub review.'}
          ]},
        engineeringReferences:[{id:'GH-REVIEWS',title:'GitHub pull request reviews',
          publisher:'GitHub Docs',url:'https://docs.github.com/en/rest/pulls/reviews',
          facts:['A review can be retrieved with its state and commit ID.'],
          limits:'The recorded review does not establish originating human authorization.',
          modelUsed:true}]
      }});
      return;
    }
    await route.fulfill({json:{
      mode:'live-model',continuityReceipt:revised?'fixture-reassessed':'fixture-initial',
      conclusions:[{application:'Pilot the change with bounded authority.',scenarioBasis:'A fictional proposal.',
        basisType:'engineering-judgment',openQuestion:'How is recovery handled?',citations:[]}],
      counterargument:'An existing service could reduce operating cost.',alternatives:['Use an existing service.'],
      challenges:[{question:'A partial rollout may fail',reason:'A downstream consumer could be late.',tests:[],alternatives:[]}],
      expectedSafeguards:[{objective:'Stage the transition',why:'Preserve service availability.',
        implementation:revised?'reported-partial':'not-assessed',implementationBasis:'Overlap reported for some consumers.',referenceIds:[]}],
      facts:[],approvalOutcomes:[],unknowns:['Coverage of slower consumers'],
      clarifications:revised||noQuestions?[]:questions,engineeringReferences:[],
      operationalReview:noQuestions?null:{kind:'monitoring',question:'Can a lagging consumer be detected?',
        detection:'Track credential rejection rates.',response:'Pause cutover and recover delayed consumers.',
        implementation:'not-assessed',referenceIds:[]},
      riskPath:noQuestions?null:{pathway:'operations',
        failure:'Some consumers could reject the newly rotated credential.',
        uncertainty:'Consumer inventory and the revocation timing have not been verified.',
        steps:[
          {stageId:'execute',roles:['origin'],event:'Old credentials are revoked before all consumers switch.',
            interruption:'',evidence:'Rotation timeline and consumer inventory.'},
          {stageId:'verify',roles:['exposure','prevention'],event:'A lagging consumer rejects connections.',
            interruption:'Verify critical consumer authentication before revocation.',
            evidence:'Authentication outcomes across consumer groups.'},
          {stageId:'observe',roles:['detection'],event:'Authentication errors reveal consumers still using old credentials.',
            interruption:'',evidence:'Failure metrics and alert events.'}
        ]},
      ...(revised?{reassessment:'Overlap changes the safeguard to Partial. The pilot recommendation stands.'}:{})
    }});
  });
  await page.locator('#token').fill('local-browser-fixture');
  await page.locator('#scenario').fill('An engineer reviews and approves four stacked pull requests. An agent submits those approvals.');
  await page.locator('#ask').click();
  await page.locator('#cdr-preview .v6-journey').waitFor();
  check(await page.locator('#result').evaluate(node=>node.classList.contains('cdr-active')&&node.classList.contains('v6-capable')),
    'The V6 journey should be the primary validated assessment');
  check(await page.locator('#cdr-preview .v6-title').isVisible(),
    'The engineering objective must lead the assessment');
  check(await page.locator('#cdr-preview .v6-actor').count()===3,
    'Decision, execution and enforcement must be visibly distinguished');
  check(await page.locator('#cdr-preview .v6-choice').count()===2,
    'The delegated scenario must present two comparable engineering strategies');
  check(await page.locator('#cdr-preview .v6-tab').count()===3,
    'V6 retains three connected assessment views');
  check(await page.locator('#cdr-preview .v6-stage-button').count()===3,
    'Only the model-mapped causal events should appear as selectable stages');
  check((await page.locator('#cdr-preview .v6-stage-title').innerText()).includes('Merge'),
    'Default to the consequential exposure stage rather than the earliest routine step');
  check(await page.locator('#cdr-preview .v6-outcome').count()===4,
    'Good/failure/interruption/evidence outcomes must have distinct cards');

  const initial=await page.locator('#cdr-preview .v6-consequence').innerText();
  await page.locator('#cdr-preview .v6-choice').nth(1).click();
  check((await page.locator('#cdr-preview .v6-consequence').innerText())!==initial,
    'A change in design choice must change its conditional outcome');
  check((await page.locator('#cdr-preview [data-v6-selection="failure"]').innerText()).includes('dependency graph'),
    'Selected choice must change the failure-path verification');
  await page.locator('.v6-stage-button').first().click();
  check((await page.locator('#cdr-preview .v6-stage-event').innerText()).includes('Agent submission'),
    'Selecting a causal stage must show the corresponding model event');
  await page.locator('.v6-safeguard-jump').click();
  check(await page.locator('#v6-panel-safeguards').isVisible(),
    'Related safeguard opens the Engineering Safeguards view');
  check(await page.locator('#v6-safeguard-2').evaluate(node=>node.open),
    'The selected option must link to its validated safeguard index');
  check((await page.locator('#v6-safeguard-2').innerText()).includes('Unknown'),
    'Missing implementation evidence must remain unknown');
  await page.locator('[data-tab="management"]').click();
  check(await page.locator('#v6-panel-management').isVisible(),'Management view should be available');
  check((await page.locator('[data-v6-selection="management"]').innerText()).includes('partial-batch recovery'),
    'Management implications must depend on the selected strategy');
  check((await page.locator('#v6-panel-management').innerText()).includes('Use a narrow batch submitter'),
    'A simpler alternative must remain available');
  check((await page.locator('.v6-management-card').innerText()).includes('Keep approvals manual'),
    'Management view must retain the actual model recommendation');
  await page.locator('.v6-support > summary').click();
  check(await page.locator('.v6-role').count()===3,
    'Role-specific questions should appear only once');
  check(await page.locator('.v6-reference').count()>=1,
    'Publisher sources must remain available in compact form');
  await page.locator('.v6-support > summary').click();
  check(requests.length===1,'V6 exploration must not request Gemini again');
  check(await page.evaluate(() => document.documentElement.scrollWidth<=innerWidth),
    'V6 journey must fit the viewport');
  await captureDecisionBrief();
  await page.locator('#v6-panel-management .v6-button').last().click();
  check(await page.locator('#result').evaluate(node=>node.classList.contains('v6-clarify-mode')),
    'Clarification should open a focused pane rather than the duplicate legacy report');
  check(!(await page.locator('#report-lead-risk').isVisible()),
    'Duplicate legacy risk report must remain visually hidden');
  check(await page.locator('#refine-panel').isVisible(),
    'The real clarification form must be accessible');
  check(await page.locator('#refinement-questions summary').count()===1,
    'The decision-changing question must remain available');
  await page.locator('#cdr-toggle').click();
  check(await page.locator('#result').evaluate(node=>node.classList.contains('cdr-active')),
    'Back to assessment returns to the single V6 report');

  // Scenario-adaptive fallback: no model choice or causal path must not invent one.
  requests=[];
  await page.locator('#examples summary').click();
  await page.locator('[data-example="plan"]').click();
  await page.locator('#ask').click();
  await page.locator('#cdr-preview .v6-journey').waitFor();
  check(await page.locator('.v6-choice').count()===0,
    'No fabricated design dilemma for an autonomous-approval fixture');
  check((await page.locator('.v6-choices').innerText()).includes('does not establish two comparable design strategies'),
    'A missing design choice should be explained without technical model jargon');
  check(await page.locator('.v6-stage-button').count()===0,
    'Null causal path must not turn into a fabricated pipeline');
  check(await page.locator('.v6-fallback-card').isVisible(),
    'A missing stage sequence should still show the validated primary failure mechanism');
  check((await page.locator('.v6-fallback-card').innerText()).includes('A partial rollout may fail'),
    'The fallback must use the scenario-specific model challenge rather than a generic empty state');
  await page.locator('.v6-fallback-card .v6-button').click();
  check(await page.locator('#v6-panel-safeguards').isVisible(),
    'A reader should be able to navigate from the failure mechanism to engineering safeguards');
  check(await page.locator('#cdr-controls').isHidden(),
    'A scenario with no clarification questions has no inert reassessment action');
  check(requests.length===1,'Reading fallback scenario should use one API request');

  // Non-GitHub architecture must retain its own operational stages.
  requests=[];
  await page.locator('#examples summary').click();
  await page.locator('[data-example="rotation"]').click();
  await page.locator('#ask').click();
  await page.locator('#cdr-preview .v6-journey').waitFor();
  check(await page.locator('.v6-stage-button').count()===3,
    'Credential rotation should show only its relevant operational stages');
  check((await page.locator('.v6-stage-buttons').innerText()).includes('Verify'),
    'Credential rotation should retain its operational lifecycle');
  check(!(await page.locator('.v6-journey').innerText()).includes('GitHub review ID'),
    'Credential rotation should not inherit delegated GitHub reconciliation');
  await page.locator('[data-tab="management"]').click();
  await page.locator('#v6-panel-management .v6-button').last().click();
  check(await page.locator('#refine-panel').isVisible(),
    'Real Gemini clarification must remain available in a non-GitHub scenario');
  await page.locator('#refinement-questions summary').first().click();
  await page.getByText('Yes, during cutover',{exact:true}).click();
  await page.locator('#refinement-questions summary').nth(1).click();
  await page.getByText('Some consumers',{exact:true}).click();
  await page.locator('#refinement-submit').click();
  await page.locator('#cdr-preview .v6-journey').waitFor();
  await page.locator('[data-tab="management"]').click();
  check((await page.locator('#v6-panel-management').innerText()).includes('Overlap changes the safeguard'),
    'Real Gemini follow-up must render a revised management consideration');
  check(requests.length===2,'One assessment and one batch follow-up should produce two API requests');
  check(requests[1].continuityReceipts[0]==='fixture-initial',
    'Signed continuity must remain bound to the initial assessment');
  check(/Yes, during cutover[\s\S]*Some consumers/.test(requests[1].turns[0].content),
    'Both clarification answers must be submitted in one follow-up');
  check(await page.locator('#cdr-controls').isHidden(),'Reassessment must be a one-time action');
  check(await page.evaluate(() => document.documentElement.scrollWidth<=innerWidth),
    'The reassessed journey must fit the viewport');

}

async function runCase(label, path, viewportName, viewport, scenario) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  let response;
  try {
    const url = new URL(path, base).toString();
    response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    check(response?.ok(), label + ': HTTP ' + response?.status());
    check((await page.locator('h1').count()) > 0, label + ': missing primary heading');

    const checks = ['HTTP ' + response.status(), 'h1 present'];
    if(path==='private-challenge.html'){
      await checkChallengeAssessment(page, () => capture(page, label+'-decision-brief', response,
        ['Fictional stacked-PR fixture','Initial decision brief','No horizontal overflow']));
      checks.push('Mocked assessment and reassessment', 'Expandable details make no requests',
        'Two answers in one signed follow-up', 'Zero-question case omits reassessment', 'No horizontal overflow');
      await page.locator('#token').fill('');
    }
    if (scenario?.startsWith('scenario-journey:')) {
      const [, variant, stepNumber, layer] = scenario.split(':');
      const title = {pass:'Standard low-risk pass',split:'AI split decision',excluded:'Hard gate scope exclusion',canary:'Production canary failure'}[variant];
      check(title, 'Unknown journey fixture ' + variant);
      check((await page.locator('#case-title').innerText()) === title, 'Unexpected scenario heading');
      check(await page.locator('[data-case][aria-pressed="true"]').getAttribute('data-case') === variant,'Selected scenario not reflected');
      check(await page.locator('#pipeline .step').count() === 5,'Journey must have five pipeline stages');
      if (stepNumber) {
        const target = Number(stepNumber)-1;
        await page.locator('#pipeline .step').nth(target).click();
        check(await page.locator('#stage-label').innerText() === 'STAGE '+stepNumber+' / 5','Pipeline stage navigation failed');
      }
      if (layer) {
        await page.locator('[data-layer="'+layer+'"]').click();
        check(await page.locator('[data-layer="'+layer+'"]').getAttribute('aria-selected') === 'true','Layer toggle failed');
      }
      check((await page.locator('#detail-text').innerText()).length > 35,'Stage detail missing');
      const expected = {
        split:{stage:3,state:'human'}, excluded:{stage:2,state:'blocked'},
        canary:{stage:5,state:'alert'}, pass:{stage:5,state:'pass'}
      }[variant];
      if (Number(stepNumber) === expected.stage) {
        check(await page.locator('#stage-state').getAttribute('class') === 'status '+expected.state,'Incorrect scenario decision state');
        checks.push('Divergence state: '+ expected.state);
      }
      checks.push('Five stages, selected scenario, '+(layer||'default')+' detail and stage navigation');
    }
    if (scenario === 'disclosure-deeplink') {
      const targetId = new URL(page.url()).hash.slice(1);
      const target = page.locator('#'+targetId);
      check(await target.count() === 1, 'Deep-linked section missing: '+targetId);
      const parent = target.locator('xpath=ancestor::details[contains(@class,"field-deep-dive")]');
      check(await parent.count() === 1, 'Deep-linked section not in disclosure');
      check(await parent.getAttribute('open') !== null, 'Deep link did not expand containing disclosure');
      check(await target.isVisible(), 'Deep-linked section is not visible');
      checks.push('Deep link automatically expands supporting content');
    }
    if (!scenario) {
      const disclosures = page.locator('details.field-deep-dive:visible');
      if (await disclosures.count()) {
        const first = disclosures.first();
        check(await first.getAttribute('open') === null, 'Supporting content should default collapsed');
        await first.locator(':scope > summary').click();
        check(await first.getAttribute('open') !== null, 'Disclosure did not open');
        check((await first.innerText()).length > 100, 'Supporting content missing after expansion');
        await first.locator(':scope > summary').click();
        check(await first.getAttribute('open') === null, 'Disclosure did not close');
        checks.push('Supporting material opens and closes without content loss');
      }
    }
    if (scenario === 'overview-authority-map') {
      const diagram = page.locator('#overview-authority-map');
      // The detailed architecture now lives in Engineering; keep the Overview's
      // text-based authority reference available as an explicit advanced disclosure.
      const disclosure = page.locator('details.overview-reference-collapse');
      if (await disclosure.count()) await disclosure.locator('summary').click();
      check(await diagram.isVisible(), 'Overview architecture diagram missing');
      check(await diagram.locator('.authority-map-routes .authority-map-route').count() === 2, 'Two approval routes required');
      check(await diagram.locator('.authority-map-external-model').isVisible(), 'External model boundary missing');
      check((await diagram.innerText()).includes('AI agreement alone is insufficient'), 'Automation authority warning missing');
      check((await diagram.innerText()).includes('Shadow analysis may observe, but cannot authorize'), 'Human route lacks shadow-mode limitation');
      const links = diagram.locator('.authority-map-links a');
      check(await links.count() === 2, 'Expected Engineering and Risk exploration links');
      check(await diagram.evaluate(el => el.getBoundingClientRect().width > 0), 'Diagram has no rendered width');
      checks.push('Authority map: model boundary, two routes and deep links');
    }
    if (scenario === 'guided-journey') {
      // Exercise the supported deep link directly. The Overview CTA is now a chapter guide,
      // so looking for a retired hero link creates an unrelated 30s timeout.
      await page.goto(new URL('index.html?journey=rr02#guided-investigation',base).toString(), {waitUntil:'domcontentloaded',timeout:10000});
      check(new URL(page.url()).searchParams.get('journey')==='rr02','Guided journey deep link did not load');
      check(await page.locator('#guided-investigation').isVisible(), 'Guided journey not visible on Overview');
      check(await page.locator('[data-scenario="excluded"]').getAttribute('aria-pressed') === 'true', 'Overview scenario not selected');
      const expected = ['Change', 'Risk', 'Safeguards', 'Monitoring', 'Assurance'];
      for (let i = 0; i < expected.length; i++) {
        const current = page.locator('.guided-steps a[aria-current="step"]');
        check(await current.count() === 1, 'Missing current chapter at step ' + i);
        check((await current.innerText()).includes(expected[i]), 'Wrong chapter at step ' + i);
        check(await page.locator('.guided-local').count() === 1, 'Local content action missing at step ' + i);
        if (i === 1) check((await page.locator('#risk-selected-id').innerText()).includes('RR-02'), 'Risk scenario context not preserved');
        if (i < expected.length - 1) {
          await page.locator('.guided-next').click();
          await page.locator('#guided-investigation').waitFor({state:'visible'});
        }
      }
      check((await page.locator('.guided-completion').innerText()).includes('No actual company configuration'), 'Illustrative conclusion missing');
      const handoff = await page.locator('.guided-completion').innerText();
      check(handoff.includes('Management-to-auditor handoff'), 'Management handoff heading missing');
      check(handoff.includes('Design to explain') && handoff.includes('Evidence to prepare') && handoff.includes('Still to establish'), 'Handoff does not separate design, evidence, and unknowns');
      check(handoff.includes('auditor evaluation remains separate'), 'Independent auditor judgment missing');
      checks.push('Handoff distinguishes management demonstration from auditor evaluation');
      check(await page.locator('.guided-steps a').count() === 5, 'Five chapters not retained');
      checks.push('Full five-page guided investigation, RR-02 and illustrative conclusion');
    }
    if (scenario === 'cross-page-rr02') {
      await page.locator('[data-scenario="excluded"]').click();
      const related = page.locator('#overview-related-risk');
      check(await related.isVisible(), 'Related risk link not visible in excluded scenario');
      await Promise.all([
        page.waitForURL(url => url.pathname.endsWith('/ai-sdlc-risk.html') && url.searchParams.get('risk') === 'RR-02' && url.hash === '#risk-explorer'),
        related.locator('a').click(),
      ]);
      check((await page.locator('#risk-selected-id').innerText()).includes('RR-02'), 'RR-02 was not restored from URL');
      check(await page.locator('[data-featured-risk="RR-02"]').getAttribute('aria-pressed') === 'true', 'RR-02 button did not reflect selection');
      checks.push('Overview exclusion → related RR-02 selected on Risk page');
      await Promise.all([
        page.waitForURL(url => url.pathname.endsWith('/engineering-blueprint.html') && url.hash === '#technical-requirements'),
        page.locator('#risk-engineering-next').click(),
      ]);
      check((await page.locator('#technical-requirements').count()) === 1, 'Engineering target missing');
      checks.push('Risk Management → Engineering technical requirements');
    }
    if (scenario === 'monitoring-assurance-rr02') {
      const disclosure = page.locator('#monitoring-investigations');
      check(await disclosure.count() === 1,'Additional investigations disclosure missing');
      if (await disclosure.getAttribute('open') === null) await disclosure.locator(':scope > summary').click();
      check(await disclosure.getAttribute('open') !== null,'Additional investigations did not expand');
      const bridge = page.locator('#classification-monitoring-bridge');
      check(await bridge.isVisible(), 'Monitoring RR-02 handoff is missing');
      check((await bridge.innerText()).includes('false-low-risk'), 'Classification signal explanation missing');
      await Promise.all([
        page.waitForURL(url => url.pathname.endsWith('/independent-assurance.html') && url.hash === '#classification-evidence-bridge'),
        bridge.locator('a[href*="classification-evidence-bridge"]').click()
      ]);
      const evidence = page.locator('#classification-evidence-bridge');
      check(await evidence.isVisible(), 'Assurance evidence handoff is hidden');
      check((await evidence.locator('.classification-evidence-grid > div').count()) === 3, 'Incomplete Assurance evidence questions');
      checks.push('Monitoring RR-02 signal → Assurance population, validation and response evidence');
      await Promise.all([
        page.waitForURL(url => url.pathname.endsWith('/continuous-monitoring.html') && url.hash === '#classification-monitoring-bridge'),
        evidence.locator('a[href*="classification-monitoring-bridge"]').click()
      ]);
      check(await page.locator('#classification-monitoring-bridge').isVisible(), 'Monitoring return link failed');
      checks.push('Assurance → Monitoring return link');
    }
    if (scenario === 'rr02-negative-test-covered' || scenario === 'rr02-negative-test-missed') {
      const missed = scenario.endsWith('missed');
      const sample = page.locator('#rr02-negative-test');
      check(await sample.isVisible(), 'Engineering negative test missing');
      check(await page.locator('#rr02-test-result').isHidden(), 'Test result should not be predetermined on screen');
      if (missed) await sample.locator('input[value="missed"]').check();
      // Capture the Engineering input state before execution; the final runCase
      // capture happens after navigation on the Assurance page.
      await capture(page, label + '-engineering-before', response, [...checks, 'Engineering fixture selected before execution']);
      await page.locator('#rr02-run-negative-test').click();
      check(await page.locator('#rr02-test-result').isVisible(), 'Simulation result did not appear');
      const actual = await page.locator('#rr02-observed').innerText();
      check(actual === (missed ? 'Auto-approval eligible (unsafe)' : 'Human review required'), 'Incorrect policy simulation result: ' + actual);
      check(await page.locator('#rr02-assurance-handoff').getAttribute('href') === './independent-assurance.html?rr02fixture=' + (missed ? 'missed' : 'covered') + '#rr02-negative-evidence', 'Incorrect Assurance handoff link');
      checks.push('Selected dependency fixture produces expected simulated outcome');
      // Preserve the Engineering outcome before the Assurance link changes pages.
      if (viewportName === 'mobile') {
        const widths = await page.evaluate(() => ({
          windowWidth: window.innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          bodyWidth: document.body.scrollWidth,
        }));
        check(Math.max(widths.documentWidth, widths.bodyWidth) - widths.windowWidth <= 2,
          label + ': Engineering result has horizontal overflow');
      }
      await capture(page, label + '-engineering-result', response,
        [...checks, 'Engineering result visible before Assurance navigation', ...(viewportName === 'mobile' ? ['No Engineering result horizontal overflow'] : [])]);
      await Promise.all([
        page.waitForURL(url => url.pathname.endsWith('/independent-assurance.html') && url.searchParams.get('rr02fixture') === (missed ? 'missed' : 'covered') && url.hash === '#rr02-negative-evidence'),
        page.locator('#rr02-assurance-handoff').click()
      ]);
      check(await page.locator('#rr02-negative-evidence').isVisible(), 'Assurance negative test evidence missing');
      const observed = await page.locator('#rr02-evidence-observed').innerText();
      check(observed.includes(missed ? 'auto-approval eligible (unsafe)' : 'human review required'), 'Assurance observation did not preserve selected fixture');
      checks.push('Engineering-to-Assurance handoff preserves selected fixture and limitations');
    }
    if (scenario === 'risk-rr02') {
      const selected = page.locator('#risk-selected-id');
      const initialTitle = await page.locator('#risk-selected-title').innerText();
      await page.locator('[data-featured-risk="RR-02"]').click();
      check((await selected.innerText()).includes('RR-02'), 'RR-02 not selected');
      check(await page.locator('[data-featured-risk="RR-02"]').getAttribute('aria-pressed') === 'true', 'RR-02 button not pressed');
      check((await page.locator('#risk-selected-title').innerText()) !== initialTitle, 'Scenario heading did not update');
      check((await page.locator('#risk-treatment-question').innerText()).length > 15, 'Management decision did not update');
      checks.push('RR-02 scenario updates title, pressed state and decision');
      await page.locator('details.risk-deeper summary').click();
      check(await page.locator('details.risk-deeper').getAttribute('open') !== null, 'Risk details did not expand');
      check((await page.locator('#risk-safeguard').innerText()).length > 15, 'Risk safeguard missing');
      checks.push('Risk safeguards expanded');
    }
    if (scenario === 'assurance-deep-link') {
      await page.goto(new URL('independent-assurance.html#document-assessment', base).toString(), { waitUntil: 'networkidle' });
      check(await page.locator('#assurance-methodology').getAttribute('open') !== null, 'Deep-linked methodology was not opened');
      check(await page.locator('#document-assessment').isVisible(), 'Deep-linked evidence section is hidden');
      checks.push('Direct evidence deep link reveals expanded methodology');
    }
    if (scenario?.startsWith('assurance-control:')) {
      const key = scenario.split(':')[1];
      const choices = page.locator('#ace-picker button[data-domain]');
      check(await choices.count()===6,'Assurance six-domain selector missing');
      await page.locator('#ace-picker button[data-domain="'+key+'"]').click();
      check(await page.locator('#ace-picker button[aria-pressed="true"]').getAttribute('data-domain')===key,'Wrong control selected');
      check(await page.locator('#ace-test-description').innerText().then(x=>x.length>50),'Independent technical test missing');
      check(await page.locator('#ace-evidence-description').innerText().then(x=>x.length>35),'Evidence mapping missing');
      check(await page.locator('#ace-links a').count()>=3,'RCM and testing links missing');
      check(new URL(page.url()).searchParams.get('control')===key,'Selected domain not reflected in URL');
      if(key==='policy'){
        check(await page.locator('#ace-links a[href*="rr02-negative-test"]').count()===1,'Missing RR-02 negative test');
        const asset=await page.request.get(new URL('assurance-control-map.svg',base).toString());
        check(asset.ok(), 'Downloadable control map missing');
        await page.locator('#ace-next').click();
        check(await page.locator('#ace-picker button[aria-pressed="true"]').getAttribute('data-domain')==='evaluation','Next control failed');
        await page.locator('#ace-previous').click();
        check(await page.locator('#ace-picker button[aria-pressed="true"]').getAttribute('data-domain')==='policy','Previous control failed');
      }
      checks.push('Domain selection, linked RCM/negative tests, URL and evidence');
    }
    if (scenario === 'assurance-expanded') {
      const details = page.locator('#authorization-evidence-case');
      await details.locator('summary').click();
      check(await details.getAttribute('open') !== null, 'Assurance example did not expand');
      check((await details.locator('.aec-body').innerText()).length > 100, 'Assurance example empty');
      checks.push('Authorization assurance example expanded');
    }
    if (viewportName === 'mobile') {
      const size = await page.evaluate(() => ({
        windowWidth: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body.scrollWidth
      }));
      const overflow = Math.max(size.documentWidth, size.bodyWidth) - size.windowWidth;
      check(overflow <= 2, label + ': horizontal overflow ' + overflow + 'px');
      checks.push('No document-level horizontal overflow');
    }
    check(errors.length === 0, label + ': uncaught browser errors: ' + errors.join(' | '));
    checks.push('No uncaught page errors');
    await capture(page, label, response, checks);
  } catch (e) {
    failures.push(label + ': ' + e.message);
    console.error('FAILED ' + label + ': ' + e.message);
    if (response?.ok()) {
      // Preserve the broken state for visual investigation.
      try { await capture(page, label + '-failure', response, ['FAILED: ' + e.message]); } catch {}
    }
  } finally { await page.close(); }
}
try {
  for (const [viewportName, viewport] of viewports) {
    for (const [name, path] of pages) {
      await runCase(name + '-' + viewportName, path, viewportName, viewport, null);
    }
    if(mode==='targeted')continue;
    for (const variant of ['pass','split','excluded','canary']) {
      const target = {pass:5,split:3,excluded:2,canary:5}[variant];
      for (const layer of ['authority','safeguard','evidence']) {
        await runCase('journey-'+variant+'-stage'+target+'-'+layer+'-'+viewportName,
          'scenario-journey.html?scenario='+variant, viewportName, viewport,
          'scenario-journey:'+variant+':'+target+':'+layer);
      }
    }
    for (const [short, file, anchor] of [
      ['overview','index.html','overview-map-unused'],
      ['risk','ai-sdlc-risk.html','risk-assessment-guide'],
      ['engineering','engineering-blueprint.html','required-ci-unused'],
      ['monitoring','continuous-monitoring.html','challenge-title'],
      ['assurance','independent-assurance.html','guidance-map']
    ]) {
      if (short === 'overview' || short === 'engineering') continue;
      await runCase('disclosure-anchor-'+short+'-'+viewportName,
        file+'#'+anchor, viewportName, viewport, 'disclosure-deeplink');
    }
    await runCase('risk-rr02-expanded-' + viewportName, 'ai-sdlc-risk.html', viewportName, viewport, 'risk-rr02');
    for (const key of ['governance','agent','policy','evaluation','authorization','monitoring']) {
      await runCase('assurance-control-'+key+'-'+viewportName,'independent-assurance.html?control='+key,viewportName,viewport,'assurance-control:'+key);
    }
    await runCase('assurance-evidence-expanded-' + viewportName, 'independent-assurance.html', viewportName, viewport, 'assurance-expanded');
    await runCase('assurance-evidence-deep-link-' + viewportName, 'independent-assurance.html', viewportName, viewport, 'assurance-deep-link');
    await runCase('cross-page-rr02-' + viewportName, 'index.html', viewportName, viewport, 'cross-page-rr02');
    await runCase('monitoring-assurance-rr02-' + viewportName, 'continuous-monitoring.html', viewportName, viewport, 'monitoring-assurance-rr02');
    await runCase('guided-investigation-' + viewportName, 'index.html', viewportName, viewport, 'guided-journey');
    await runCase('overview-authority-map-' + viewportName, 'index.html#overview-authority-map', viewportName, viewport, 'overview-authority-map');
    await runCase('rr02-negative-test-covered-' + viewportName, 'engineering-blueprint.html', viewportName, viewport, 'rr02-negative-test-covered');
    await runCase('rr02-negative-test-missed-' + viewportName, 'engineering-blueprint.html', viewportName, viewport, 'rr02-negative-test-missed');
  }
} finally { await browser.close(); }
const summary = {
  source: base,
  reference: process.env.GITHUB_SHA || 'local',
  capturedAtUtc: new Date().toISOString(),
  mode,
  captures: records.length,
  failures,
  note: 'Static-site PR visual QA. Screenshots are review aids, not historical control evidence.'
};
await writeFile(resolve(output, 'summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
if (failures.length) process.exitCode = 1;

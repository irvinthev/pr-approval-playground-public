/* Proposed domain-to-RCM relationships for the illustrative assurance field guide.
 * RCM control IDs/titles and primary SDLC stages are derived from the 15-control
 * AI Approval Proposed RCM (uploaded 2026-11-12). Domain groupings and secondary
 * SDLC associations are an interpretive crosswalk, not an RCM amendment. */
(function(root){
'use strict';
const controls={
 'AI-01':{name:'Automated Approval Eligibility',primary:'02 · Eligibility'},
 'AI-02':{name:'Policy Ownership & Approval',primary:'Cross-cutting'},
 'AI-03':{name:'Approval Authority & SoD',primary:'Cross-cutting'},
 'AI-04':{name:'Agent Identity & Permissions',primary:'03 · AI review'},
 'AI-05':{name:'AI Reviewer Validation',primary:'03 · AI review'},
 'AI-06':{name:'AI Review Integrity',primary:'03 · AI review'},
 'AI-07':{name:'Independent Automated Authorization',primary:'04 · Authorization'},
 'AI-08':{name:'Required Testing & Merge Enforcement',primary:'05 · Merge + build'},
 'AI-09':{name:'Human Approval & Escalation',primary:'04 · Authorization'},
 'AI-10':{name:'Build Provenance & Artifact Integrity',primary:'05 · Merge + build'},
 'AI-11':{name:'Production Release Authorization',primary:'07 · Production rollout'},
 'AI-12':{name:'Automated Approval Monitoring',primary:'Cross-cutting'},
 'AI-13':{name:'Production Monitoring & Recovery',primary:'07 · Production rollout'},
 'AI-14':{name:'AI Model & Prompt Change Management',primary:'03 · AI review'},
 'AI-15':{name:'Approval Policy & Enforcement Changes',primary:'Cross-cutting'}
};
const domains={
 governance:{controls:['AI-01','AI-02','AI-15'],stages:['02 · Eligibility','04 · Authorization'],change:'Review approvals and version history for scope, repo eligibility and responsible policy owners.',testing:'Challenge excluded repositories, unknown-impact dependencies and completeness of the independently sourced PR population.',operation:'Reconcile eligible and excluded populations to independent source events and investigate unexplained changes.'},
 agent:{controls:['AI-04','AI-06','AI-14'],stages:['03 · AI review','04 · Authorization'],change:'Verify review and access restrictions over agent identities, tool grants, prompts and model routing.',testing:'Test unauthorized tool use, prompt injection, untrusted reviewer outputs and the effects of permission changes.',operation:'Review effective agent permissions, configuration history and security exceptions during the relevant period.'},
 policy:{controls:['AI-01','AI-08','AI-15'],stages:['02 · Eligibility','04 · Authorization','05 · Merge + build'],change:'Reperform change approval and effective-version review for exclusions, thresholds, rules and bypass settings.',testing:'Run positive, protected-path, unknown-dependency, stale-SHA, failed-CI and bypass cases.',operation:'Sample eligibility and merge decisions against the policy versions effective when each decision occurred.'},
 evaluation:{controls:['AI-05','AI-06','AI-14'],stages:['03 · AI review','04 · Authorization'],change:'Confirm prompt, model, evaluator and validation-set changes are authorized and trigger regression testing.',testing:'Use adjudicated cases, paired reviewer disagreements, adversarial inputs and false-low-risk examples.',operation:'Review performance trends, exceptions, drift and retesting after material evaluation changes.'},
 authorization:{controls:['AI-03','AI-07','AI-08','AI-09','AI-10','AI-11'],stages:['04 · Authorization','05 · Merge + build','06 · Pre-production','07 · Production rollout'],change:'Verify independently authorized changes to approval identities, required checks, GitHub rulesets, build and release gates.',testing:'Reperform stale or unauthorized approval, failed CI, unauthorized merge, artifact substitution and release-bypass scenarios.',operation:'Trace independent merge and deployment populations to valid approvals, effective rules, trusted artifacts and exceptions.'},
 monitoring:{controls:['AI-12','AI-13','AI-15'],stages:['02 · Eligibility','04 · Authorization','07 · Production rollout'],change:'Inspect changes to alert logic, event collection, escalation thresholds and shutdown permissions.',testing:'Inject missing events, policy bypasses and canary failures; verify alert routing, investigation, suspension and rollback.',operation:'Reconcile independent populations and review alert-to-action timeliness, unresolved exceptions and corrective action.'}
};
root.AssuranceRcmCrosswalk=Object.freeze({controls,domains});
})(typeof window!=='undefined'?window:globalThis);

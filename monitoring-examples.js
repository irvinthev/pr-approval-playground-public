(function(root){
'use strict';
const examples=[
  {
    "key": "0:0",
    "name": "PR revision reconciliation",
    "cadence": "On PR updates + a five-minute reconciliation sweep.",
    "rule": "After the sample five-minute grace period, compare the source head SHA with intake and required-check SHAs.",
    "fields": {
      "pr": "PR",
      "sourceSHA": "Source head",
      "intakeSHA": "Intake revision",
      "checksSHA": "Checks revision",
      "ageMinutes": "Minutes since push"
    },
    "normal": {
      "pr": "#104",
      "sourceSHA": "rev-b",
      "intakeSHA": "rev-b",
      "checksSHA": "rev-b",
      "ageMinutes": 6
    },
    "exception": {
      "pr": "#104",
      "sourceSHA": "rev-b",
      "intakeSHA": "rev-a",
      "checksSHA": "rev-a",
      "ageMinutes": 6
    },
    "checks": [
      {
        "field": "intakeSHA",
        "op": "sameField",
        "value": "sourceSHA",
        "label": "Intake matches current head"
      },
      {
        "field": "checksSHA",
        "op": "sameField",
        "value": "sourceSHA",
        "label": "Checks cover current head"
      }
    ],
    "alert": "PR #104 is still represented by rev-a after rev-b was pushed. Assign workflow operations; reconcile intake and rerun applicable checks.",
    "qualification": "Fictional records and illustrative settings. Adapt timing, thresholds and source validation to the system; this is not a live monitor."
  },
  {
    "key": "1:0",
    "name": "Eligibility-to-invocation check",
    "cadence": "On every AI invocation.",
    "rule": "An AI invocation must have allowed impact and passing required CI for its revision.",
    "fields": {
      "pr": "PR",
      "revision": "Revision",
      "impact": "Dependency impact",
      "ciPassed": "Required CI passed",
      "aiInvoked": "AI invoked"
    },
    "normal": {
      "pr": "#105",
      "revision": "rev-c",
      "impact": "allowed",
      "ciPassed": true,
      "aiInvoked": true
    },
    "exception": {
      "pr": "#105",
      "revision": "rev-c",
      "impact": "unknown",
      "ciPassed": true,
      "aiInvoked": true
    },
    "checks": [
      {
        "field": "impact",
        "op": "equals",
        "value": "allowed",
        "label": "Impact is deterministically allowed"
      },
      {
        "field": "ciPassed",
        "op": "equals",
        "value": true,
        "label": "Required CI passed"
      }
    ],
    "alert": "PR #105 reached AI with unknown dependency impact. Stop the automatic route and assign the eligibility owner; resolve impact through human review.",
    "qualification": "Fictional records and illustrative settings. Adapt timing, thresholds and source validation to the system; this is not a live monitor."
  },
  {
    "key": "1:1",
    "name": "Eligibility configuration watch",
    "cadence": "On inventory or policy changes + a daily effective-version reconciliation.",
    "rule": "The active scope version must have independent approval, mapping validation and a current refresh status.",
    "fields": {
      "version": "Active scope version",
      "independentApproval": "Independent approval",
      "mappingValidated": "Mappings validated",
      "refreshCurrent": "Refresh status current"
    },
    "normal": {
      "version": "scope-v12",
      "independentApproval": true,
      "mappingValidated": true,
      "refreshCurrent": true
    },
    "exception": {
      "version": "scope-v13",
      "independentApproval": false,
      "mappingValidated": false,
      "refreshCurrent": true
    },
    "checks": [
      {
        "field": "independentApproval",
        "op": "equals",
        "value": true,
        "label": "Active version independently approved"
      },
      {
        "field": "mappingValidated",
        "op": "equals",
        "value": true,
        "label": "Mapping validation retained"
      },
      {
        "field": "refreshCurrent",
        "op": "equals",
        "value": true,
        "label": "Refresh status current"
      }
    ],
    "alert": "Scope-v13 is active without independent approval or mapping validation. Restrict the affected scope and investigate with the policy and dependency owners.",
    "qualification": "Fictional records and illustrative settings. Adapt timing, thresholds and source validation to the system; this is not a live monitor."
  },
  {
    "key": "2:0",
    "name": "Shared-miss evaluation watch",
    "cadence": "After model/prompt updates and scheduled challenge-set evaluations.",
    "rule": "Compare critical false-LOW cases in the adjudicated evaluation with the sample acceptance limit of zero.",
    "fields": {
      "model": "Model/prompt bundle",
      "evaluatedCases": "Adjudicated cases",
      "criticalSharedMisses": "Critical cases both reviewers missed",
      "acceptanceLimit": "Sample critical-miss limit"
    },
    "normal": {
      "model": "bundle-v4",
      "evaluatedCases": 40,
      "criticalSharedMisses": 0,
      "acceptanceLimit": 0
    },
    "exception": {
      "model": "bundle-v5",
      "evaluatedCases": 40,
      "criticalSharedMisses": 2,
      "acceptanceLimit": 0
    },
    "checks": [
      {
        "field": "criticalSharedMisses",
        "op": "atMostField",
        "value": "acceptanceLimit",
        "label": "Critical shared misses within sample limit"
      }
    ],
    "alert": "Both reviewers returned LOW for two critical unsafe cases. Assign the AI evaluation owner; restrict affected automation and revalidate. This small challenge set does not establish overall accuracy.",
    "qualification": "Fictional records and illustrative settings. Adapt timing, thresholds and source validation to the system; this is not a live monitor."
  },
  {
    "key": "2:1",
    "name": "Human fallback queue watch",
    "cadence": "On every nonqualifying result + a queue-age sweep.",
    "rule": "A nonqualifying AI result must enter human review. In this example, unassigned items older than 60 minutes need escalation.",
    "fields": {
      "pr": "PR",
      "bothQualify": "Both AI results qualify",
      "route": "Recorded route",
      "assigned": "Human reviewer assigned",
      "queueMinutes": "Queue age (minutes)"
    },
    "normal": {
      "pr": "#106",
      "bothQualify": false,
      "route": "human",
      "assigned": true,
      "queueMinutes": 15
    },
    "exception": {
      "pr": "#106",
      "bothQualify": false,
      "route": "auto-approval",
      "assigned": false,
      "queueMinutes": 75
    },
    "checks": [
      {
        "field": "route",
        "op": "equals",
        "value": "human",
        "label": "Nonqualifying result routed to human"
      },
      {
        "field": "assigned",
        "op": "equals",
        "value": true,
        "label": "Aged item has an assigned reviewer"
      }
    ],
    "alert": "PR #106 has nonqualifying findings but an automatic route, with no reviewer after 75 minutes. Withhold auto-approval and assign a qualified reviewer; inspect actual review rationale before closure.",
    "qualification": "Fictional records and illustrative settings. Adapt timing, thresholds and source validation to the system; this is not a live monitor."
  },
  {
    "key": "3:0",
    "name": "Approval prerequisite reconciliation",
    "cadence": "On every recorded automatic approval.",
    "rule": "Recompute eligibility, two qualifying results, required CI and exact-revision linkage independently from the approval label.",
    "fields": {
      "pr": "PR",
      "eligible": "Eligible scope",
      "bothQualify": "Both results qualify",
      "ciPassed": "Required CI passed",
      "headSHA": "Current head",
      "approvalSHA": "Approval revision"
    },
    "normal": {
      "pr": "#107",
      "eligible": true,
      "bothQualify": true,
      "ciPassed": true,
      "headSHA": "rev-e",
      "approvalSHA": "rev-e"
    },
    "exception": {
      "pr": "#107",
      "eligible": true,
      "bothQualify": true,
      "ciPassed": false,
      "headSHA": "rev-f",
      "approvalSHA": "rev-e"
    },
    "checks": [
      {
        "field": "eligible",
        "op": "equals",
        "value": true,
        "label": "Scope is eligible"
      },
      {
        "field": "bothQualify",
        "op": "equals",
        "value": true,
        "label": "Both AI results qualify"
      },
      {
        "field": "ciPassed",
        "op": "equals",
        "value": true,
        "label": "Required CI passed"
      },
      {
        "field": "approvalSHA",
        "op": "sameField",
        "value": "headSHA",
        "label": "Approval matches current head"
      }
    ],
    "alert": "PR #107 has a stale approval and failed CI. Assign the authorization owner and investigate; mandatory merge/release protections must still block independently of this alert.",
    "qualification": "Fictional records and illustrative settings. Adapt timing, thresholds and source validation to the system; this is not a live monitor."
  },
  {
    "key": "3:1",
    "name": "Effective-authority change watch",
    "cadence": "On permission, bypass or policy changes.",
    "rule": "Effective authority changes require independent authorization and an approved change record.",
    "fields": {
      "actor": "Actor",
      "change": "Effective change",
      "independentApproval": "Independent authorization",
      "changeRecord": "Approved change record"
    },
    "normal": {
      "actor": "policy-admin",
      "change": "Update approval rule",
      "independentApproval": true,
      "changeRecord": true
    },
    "exception": {
      "actor": "review-bot-custodian",
      "change": "Add merge bypass",
      "independentApproval": false,
      "changeRecord": false
    },
    "checks": [
      {
        "field": "independentApproval",
        "op": "equals",
        "value": true,
        "label": "Change independently authorized"
      },
      {
        "field": "changeRecord",
        "op": "equals",
        "value": true,
        "label": "Approved change record retained"
      }
    ],
    "alert": "A bot custodian added merge-bypass authority without independent authorization. Contain the change and assess affected decisions with the independent policy administrator.",
    "qualification": "Fictional records and illustrative settings. Adapt timing, thresholds and source validation to the system; this is not a live monitor."
  },
  {
    "key": "4:0",
    "name": "Build provenance reconciliation",
    "cadence": "On completed merges and builds.",
    "rule": "Mandatory checks must pass and the artifact provenance must resolve to the authorized merge source.",
    "fields": {
      "build": "Build",
      "route": "Approval route",
      "checksPassed": "Mandatory checks passed",
      "authorizedSource": "Authorized merge source",
      "provenanceSource": "Artifact provenance source"
    },
    "normal": {
      "build": "build-208",
      "route": "human-approved",
      "checksPassed": true,
      "authorizedSource": "merge-g",
      "provenanceSource": "merge-g"
    },
    "exception": {
      "build": "build-208",
      "route": "human-approved",
      "checksPassed": true,
      "authorizedSource": "merge-g",
      "provenanceSource": "merge-h"
    },
    "checks": [
      {
        "field": "checksPassed",
        "op": "equals",
        "value": true,
        "label": "Mandatory checks passed"
      },
      {
        "field": "provenanceSource",
        "op": "sameField",
        "value": "authorizedSource",
        "label": "Artifact derives from authorized source"
      }
    ],
    "alert": "Build-208 points to merge-h, while authorization covers merge-g. Hold promotion and assign the build owner to reconcile lineage or rebuild.",
    "qualification": "Fictional records and illustrative settings. Adapt timing, thresholds and source validation to the system; this is not a live monitor."
  },
  {
    "key": "5:0",
    "name": "Release-gate outcome watch",
    "cadence": "On failed gate decisions and completed promotions.",
    "rule": "Surface gate failures for triage; flag any completed promotion without a passing gate and matching artifact.",
    "fields": {
      "release": "Release",
      "gatePassed": "Release gate passed",
      "verifiedDigest": "Verified artifact",
      "promotedDigest": "Promoted artifact",
      "promotionCompleted": "Promotion completed"
    },
    "normal": {
      "release": "release-209",
      "gatePassed": true,
      "verifiedDigest": "digest-01",
      "promotedDigest": "digest-01",
      "promotionCompleted": true
    },
    "exception": {
      "release": "release-209",
      "gatePassed": false,
      "verifiedDigest": "digest-01",
      "promotedDigest": "digest-02",
      "promotionCompleted": true
    },
    "checks": [
      {
        "field": "gatePassed",
        "op": "equals",
        "value": true,
        "label": "Release gate passed"
      },
      {
        "field": "promotedDigest",
        "op": "sameField",
        "value": "verifiedDigest",
        "label": "Promoted artifact matches verified digest"
      }
    ],
    "alert": "Release-209 completed despite a failed gate and different artifact. Assign the release owner and incident response. A failed gate with no promotion is a blocked attempt, not proof of a deployed bypass.",
    "qualification": "Fictional records and illustrative settings. Adapt timing, thresholds and source validation to the system; this is not a live monitor."
  },
  {
    "key": "6:0",
    "name": "Independent deployment reconciliation",
    "cadence": "After releases + a daily reconciliation against a separately validated production source.",
    "rule": "Compare known independent deployment IDs with the monitored feed and reconcile approval/artifact linkage.",
    "fields": {
      "independentIDs": "Independent release IDs",
      "feedIDs": "Monitored feed IDs",
      "approvalLinksMatch": "Approval/artifact links match"
    },
    "normal": {
      "independentIDs": [
        "deploy-24",
        "deploy-25"
      ],
      "feedIDs": [
        "deploy-24",
        "deploy-25"
      ],
      "approvalLinksMatch": true
    },
    "exception": {
      "independentIDs": [
        "deploy-24",
        "deploy-25"
      ],
      "feedIDs": [
        "deploy-24"
      ],
      "approvalLinksMatch": true
    },
    "checks": [
      {
        "field": "feedIDs",
        "op": "sameSetField",
        "value": "independentIDs",
        "label": "Feed and known independent releases reconcile"
      },
      {
        "field": "approvalLinksMatch",
        "op": "equals",
        "value": true,
        "label": "Approval/artifact links reconcile"
      }
    ],
    "alert": "Deploy-25 is absent from the feed. Investigate the manual route and collection gap; matching the known IDs still does not prove the independent source is complete.",
    "qualification": "Fictional records and illustrative settings. Adapt timing, thresholds and source validation to the system; this is not a live monitor."
  },
  {
    "key": "6:1",
    "name": "Unsafe-approval response watch",
    "cadence": "On adjudicated unsafe approvals + incident-response status updates.",
    "rule": "A confirmed unsafe approval meeting the sample suspension criterion requires recorded suspension and an assigned incident owner.",
    "fields": {
      "incident": "Incident",
      "requiresSuspension": "Suspension required by policy",
      "automationSuspended": "Affected automation suspended",
      "ownerAssigned": "Incident owner assigned"
    },
    "normal": {
      "incident": "INC-210",
      "requiresSuspension": true,
      "automationSuspended": true,
      "ownerAssigned": true
    },
    "exception": {
      "incident": "INC-210",
      "requiresSuspension": true,
      "automationSuspended": false,
      "ownerAssigned": false
    },
    "checks": [
      {
        "field": "automationSuspended",
        "op": "equals",
        "value": true,
        "label": "Required suspension recorded"
      },
      {
        "field": "ownerAssigned",
        "op": "equals",
        "value": true,
        "label": "Incident owner assigned"
      }
    ],
    "alert": "INC-210 requires suspension, but automation remains enabled and no owner is assigned. Escalate to the incident commander and automation owner; restart requires separate authorized evidence.",
    "qualification": "Fictional records and illustrative settings. Adapt timing, thresholds and source validation to the system; this is not a live monitor."
  }
];
function evaluate(key,record){
 const example=examples.find(e=>e.key===key);if(!example)throw new Error('Unknown monitor example');
 const valid=record&&Object.entries(example.normal).every(([field,value])=>Array.isArray(value)?Array.isArray(record[field])&&record[field].every(v=>typeof v==='string'):typeof record[field]===typeof value&&(typeof value!=='number'||Number.isFinite(record[field])));
 if(!valid)return {state:'exception',reasons:['Sample input is incomplete or invalid; no conclusion can be drawn.'],message:'Sample input is incomplete or invalid; no deployment conclusion can be drawn.'};
 if(key==='0:0'&&record.ageMinutes<5)return {state:'pending',reasons:['Within the illustrative five-minute processing window; reconcile again after the window.']};
 if(key==='1:0'&&!record.aiInvoked)return {state:'clear',reasons:[]};
 if(key==='2:1'&&record.bothQualify)return {state:'clear',reasons:[]};
 if(key==='6:1'&&!record.requiresSuspension)return {state:'clear',reasons:[]};
 const reasons=example.checks.filter(check=>{
  if(key==='2:1'&&check.field==='assigned'&&record.queueMinutes<=60)return false;
  const actual=record[check.field],expected=record[check.value];let ok=false;
  if(check.op==='equals')ok=actual===check.value;
  if(check.op==='sameField')ok=actual===expected;
  if(check.op==='atMostField')ok=actual<=expected;
  if(check.op==='sameSetField')ok=actual.length===new Set(actual).size&&expected.length===new Set(expected).size&&actual.length===expected.length&&actual.every(v=>expected.includes(v));
  return !ok;
 }).map(c=>c.label);
 const message=key==='5:0'&&reasons.length?(record.promotionCompleted?example.alert:'Blocked attempt: release validation failed; no completed promotion is recorded. Investigate and correct the gate failure.'):example.alert;
 return {state:reasons.length?'exception':'clear',reasons,message};
}
const api={examples,evaluate};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MonitoringExamples=api;
})(typeof globalThis!=='undefined'?globalThis:this);

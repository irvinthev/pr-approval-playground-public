// Pure, client-independent decision model. All inputs are illustrative.
export const requiredSignals = ['repoAllowed','pathAllowed','ciPassed','authorAllowed','policyIndependent','commitCurrent','reviewerA','reviewerB','evidenceCaptured','deploymentHealthy'];
export function evaluate(input) {
 const checks = {
   repoAllowed: !!input.repoAllowed,
   pathAllowed: !!input.pathAllowed,
   ciPassed: !!input.ciPassed,
   authorAllowed: !!input.authorAllowed,
   policyIndependent: !!input.policyIndependent,
   commitCurrent: !!input.commitCurrent,
   reviewerA: input.reviewerA === 'LOW',
   reviewerB: input.reviewerB === 'LOW',
   evidenceCaptured: !!input.evidenceCaptured,
   deploymentHealthy: !!input.deploymentHealthy
 };
 const policyEligibility = checks.repoAllowed && checks.pathAllowed && checks.authorAllowed;
 const evidenceCompleteness = checks.evidenceCaptured && !!input.sha && !!input.policyVersion && !!input.reviewerA && !!input.reviewerB;
 const authorization = policyEligibility && checks.policyIndependent && checks.commitCurrent && checks.reviewerA && checks.reviewerB && checks.ciPassed && !input.killSwitch;
 const releaseEligibility = authorization && evidenceCompleteness && checks.deploymentHealthy;
 const riskAcceptance = 'NOT_EVALUATED'; // Risk acceptance must never be inferred from AI agreement.
 const failed = Object.entries(checks).filter(([,ok])=>!ok).map(([key])=>key);
 if (input.killSwitch) failed.unshift('killSwitch');
 const outcome = !authorization ? 'HUMAN_REVIEW' : !evidenceCompleteness ? 'EVIDENCE_HOLD' : !checks.deploymentHealthy ? 'RELEASE_HALT' : 'ELIGIBLE_FOR_POLICY_GATED_MERGE';
 return {policyEligibility,evidenceCompleteness,authorization,releaseEligibility,riskAcceptance,checks,failed,outcome,reason:failed[0]||'All simulated prerequisites satisfied'};
}

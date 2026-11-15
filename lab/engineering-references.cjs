'use strict';
// Curated public engineering sources; not live retrieval, policy rules, or proof of deployment.
const references=[
  {
    "id": "GH-CODEOWNERS",
    "publisher": "GitHub",
    "title": "About code owners",
    "kind": "technical-documentation",
    "url": "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners",
    "terms": [
      "codeowners",
      "code owners",
      "code ownership",
      "review routing"
    ],
    "facts": [
      "CODEOWNERS designates responsible users or teams and requests their review when applicable files change.",
      "Branch protection or rulesets may separately require code-owner approval; CODEOWNERS does not submit approval."
    ],
    "limits": "Cannot establish that a repository enforces required code-owner review.",
    "reviewedAsOf": "2026-11-14"
  },
  {
    "id": "GH-REVIEWS-API",
    "publisher": "GitHub",
    "title": "REST API: pull request reviews",
    "kind": "technical-documentation",
    "url": "https://docs.github.com/en/rest/pulls/reviews",
    "terms": [
      "review submission",
      "submit approval",
      "auto approval",
      "auto-approve",
      "approvals",
      "review api",
      "github app",
      "pull request",
      "pr review"
    ],
    "facts": [
      "The REST API supports creating reviews and distinguishes pending from submitted pull-request reviews.",
      "The create-review API accepts a commit_id and documents pull-request write permission requirements."
    ],
    "limits": "Submitted reviews do not prove branch-gate acceptance or meaningful human judgment.",
    "reviewedAsOf": "2026-11-14"
  },
  {
    "id": "GH-CLI-REVIEW",
    "publisher": "GitHub",
    "title": "gh pr review CLI reference",
    "kind": "technical-documentation",
    "url": "https://cli.github.com/manual/gh_pr_review",
    "terms": [
      "gh pr review",
      "github cli",
      "cli approval",
      "command line approval",
      "claude cli"
    ],
    "facts": [
      "The GitHub CLI provides gh pr review to submit a pull-request review."
    ],
    "limits": "CLI execution does not establish authorization, reviewed revision, or merge outcome.",
    "reviewedAsOf": "2026-11-14"
  },
  {
    "id": "GH-PROTECTED-BRANCHES",
    "publisher": "GitHub",
    "title": "About protected branches",
    "kind": "technical-documentation",
    "url": "https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches",
    "terms": [
      "branch protection",
      "stale approval",
      "rebase",
      "revised diff",
      "revision",
      "latest commit",
      "merge gate",
      "merge protection"
    ],
    "facts": [
      "GitHub can require pull-request reviews and optionally dismiss stale approvals when the reviewed diff changes.",
      "GitHub can optionally require code-owner review or approval of the most recent reviewable push."
    ],
    "limits": "Configurable options do not prove a particular repository enables them.",
    "reviewedAsOf": "2026-11-14"
  },
  {
    "id": "GH-RULESETS",
    "publisher": "GitHub",
    "title": "About rulesets",
    "kind": "technical-documentation",
    "url": "https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets",
    "terms": [
      "ruleset",
      "rulesets",
      "bypass permission",
      "merge gate",
      "merge rule",
      "branch restriction"
    ],
    "facts": [
      "Rulesets constrain branch or tag interactions and can specify actors with bypass rights.",
      "Rulesets and classic branch protection have distinct configuration capabilities."
    ],
    "limits": "Cannot infer a repository's effective rulesets, layering or bypass actors.",
    "reviewedAsOf": "2026-11-14"
  },
  {
    "id": "GH-MERGE-QUEUE",
    "publisher": "GitHub",
    "title": "Managing a merge queue",
    "kind": "technical-documentation",
    "url": "https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue",
    "terms": [
      "merge queue",
      "merge_group",
      "merge latency",
      "merge conflict",
      "release throughput",
      "busy branch"
    ],
    "facts": [
      "A merge queue checks required CI conditions against a candidate using latest target-branch and queued changes.",
      "Merge queues can change integration throughput without changing review decision authority."
    ],
    "limits": "Availability and effective gates depend on plan, configuration and CI integration.",
    "reviewedAsOf": "2026-11-14"
  },
  {
    "id": "GH-MCP-SERVER",
    "publisher": "GitHub",
    "title": "Official GitHub MCP Server",
    "kind": "technical-documentation",
    "url": "https://github.com/github/github-mcp-server",
    "terms": [
      "github mcp",
      "mcp server",
      "agent tools",
      "mcp access",
      "agent github"
    ],
    "facts": [
      "GitHub's MCP server provides tools that can read repository information and perform permitted repository operations.",
      "Actual capabilities depend on toolsets, authenticated identity and credentials."
    ],
    "limits": "Tool availability does not prove permission was granted or an action occurred.",
    "reviewedAsOf": "2026-11-14"
  },
  {
    "id": "GH-ACTIONS-TOKEN",
    "publisher": "GitHub",
    "title": "Authenticate workflows using GITHUB_TOKEN",
    "kind": "technical-documentation",
    "url": "https://docs.github.com/en/actions/tutorials/authenticate-with-github_token",
    "terms": [
      "github actions",
      "github_token",
      "workflow token",
      "action credential",
      "ci token",
      "workflow permission"
    ],
    "facts": [
      "GitHub Actions can authenticate API requests with GITHUB_TOKEN and configure its permissions.",
      "GitHub advises limiting granted token permissions."
    ],
    "limits": "Other CLI, environment and external credentials must be considered separately.",
    "reviewedAsOf": "2026-11-14"
  },
  {
    "id": "CLAUDE-PERMISSIONS",
    "publisher": "Anthropic",
    "title": "Claude Code: Configure permissions",
    "kind": "technical-documentation",
    "url": "https://code.claude.com/docs/en/permissions",
    "terms": [
      "claude code",
      "claude approval",
      "claude permission",
      "permission mode",
      "permission rule",
      "agent delegated",
      "cli approval"
    ],
    "facts": [
      "Claude Code provides permission modes and tool-specific rules for access decisions.",
      "Permission rules and hooks influence confirmations but are not GitHub's own authorization boundary."
    ],
    "limits": "Actual behavior depends on session mode, rules and configuration.",
    "reviewedAsOf": "2026-11-14"
  },
  {
    "id": "CLAUDE-HOOKS",
    "publisher": "Anthropic",
    "title": "Claude Code: Hooks reference",
    "kind": "technical-documentation",
    "url": "https://code.claude.com/docs/en/hooks",
    "terms": [
      "pretooluse",
      "tool hook",
      "claude hook",
      "tool callback",
      "hook event",
      "tool intercept",
      "approval hook"
    ],
    "facts": [
      "Claude Code documents hook events including PreToolUse and related action controls.",
      "Hook outcomes depend on event type, matcher behavior and the execution route."
    ],
    "limits": "Hooks alone do not prove all GitHub actions must pass through the hook.",
    "reviewedAsOf": "2026-11-14"
  },
  {
    "id": "CLAUDE-SECURITY",
    "publisher": "Anthropic",
    "title": "Claude Code: Security",
    "kind": "technical-documentation",
    "url": "https://code.claude.com/docs/en/security",
    "terms": [
      "claude security",
      "prompt injection",
      "untrusted instructions",
      "permission mode",
      "autonomous agent",
      "model security"
    ],
    "facts": [
      "Anthropic describes Claude Code's permission-based architecture and safeguards.",
      "Vendor safeguard descriptions do not establish effectiveness for a particular integration."
    ],
    "limits": "Specific permissions, bypass behavior and deployed configurations require verification.",
    "reviewedAsOf": "2026-11-14"
  },
  {
    "id": "CLAUDE-SANDBOX",
    "publisher": "Anthropic",
    "title": "Claude Code: Sandboxed Bash tool",
    "kind": "technical-documentation",
    "url": "https://code.claude.com/docs/en/sandboxing",
    "terms": [
      "sandbox",
      "shell command",
      "bash",
      "filesystem isolation",
      "network isolation",
      "execution boundary"
    ],
    "facts": [
      "Claude Code documents configurable filesystem and network isolation for Bash execution.",
      "Documentation distinguishes sandbox enforcement from permission settings and varying modes."
    ],
    "limits": "Do not assume MCP or API pathways are covered by the Bash sandbox.",
    "reviewedAsOf": "2026-11-14"
  },
  {
    "id": "ANTHROPIC-CISO",
    "publisher": "Anthropic",
    "title": "Zero risk isn't the job: a CISO's guide to agentic AI",
    "kind": "practitioner-perspective",
    "url": "https://claude.com/resources/articles/ciso-guide-to-agentic-ai",
    "terms": [
      "deputy ciso",
      "agentic risk",
      "delegated identity",
      "blast radius",
      "agent identity",
      "risk acceptance",
      "ciso"
    ],
    "facts": [
      "Anthropic's Deputy CISO discusses bounding and observing agentic risk rather than striving for zero risk.",
      "The article presents practitioner reasoning, not a guarantee of implemented technical behavior."
    ],
    "limits": "Vendor practitioner perspective, not proof of other organizations' outcomes.",
    "reviewedAsOf": "2026-11-14"
  },
  {
    "id": "GOOGLE-SAIF",
    "publisher": "Google",
    "title": "Secure AI Framework: Security Controls",
    "kind": "framework-guidance",
    "url": "https://saif.google/secure-ai-framework/controls",
    "terms": [
      "saif",
      "secure ai framework",
      "agent permissions",
      "agent observability",
      "agent user control",
      "delegated authority",
      "least privilege"
    ],
    "facts": [
      "SAIF discusses agent permissions, approval for actions on users' behalf, and agent observability.",
      "Framework guidance does not prescribe a universal GitHub PR approval interface."
    ],
    "limits": "Do not misstate framework guidance as a mandatory software delivery architecture.",
    "reviewedAsOf": "2026-11-14"
  },
  {
    "id": "OWASP-AGENTIC",
    "publisher": "OWASP",
    "title": "Agentic AI: Threats and Mitigations",
    "kind": "security-research",
    "url": "https://genai.owasp.org/resource/agentic-ai-threats-and-mitigations/",
    "terms": [
      "agentic threat",
      "agent security",
      "prompt injection",
      "excessive agency",
      "tool abuse",
      "untrusted"
    ],
    "facts": [
      "OWASP offers threat-model-oriented guidance on emerging agentic risks and mitigations."
    ],
    "limits": "Threat taxonomy does not establish an exploit exists or succeeds in a specific system.",
    "reviewedAsOf": "2026-11-14"
  },
  {
    "id": "OPA-POLICY",
    "publisher": "Open Policy Agent",
    "title": "OPA documentation",
    "kind": "technical-documentation",
    "url": "https://www.openpolicyagent.org/docs",
    "terms": [
      "opa",
      "rego",
      "policy-as-code",
      "policy as code",
      "deterministic policy",
      "policy engine",
      "policy evaluation"
    ],
    "facts": [
      "OPA evaluates structured inputs against policies written in Rego.",
      "A separate integration must enforce an OPA decision in GitHub, CI/CD or another platform."
    ],
    "limits": "OPA is an implementation component, not an inherently separate approval authority model.",
    "reviewedAsOf": "2026-11-14"
  },
  {
    "id": "DORA-METRICS",
    "publisher": "DORA",
    "title": "Software delivery performance metrics",
    "kind": "empirical-research",
    "url": "https://dora.dev/guides/dora-metrics/",
    "terms": [
      "dora",
      "lead time",
      "cycle time",
      "throughput",
      "delivery performance",
      "deployment frequency",
      "change fail",
      "recovery time",
      "developer productivity"
    ],
    "facts": [
      "DORA measures delivery throughput and delivery instability.",
      "Faster approvals alone do not demonstrate improved production delivery quality."
    ],
    "limits": "Metrics do not establish causal benefits of an individual proposed approval method.",
    "reviewedAsOf": "2026-11-14"
  },
  {
    "id": "GOOGLE-SRE-CANARY",
    "publisher": "Google SRE",
    "title": "Release engineering and canarying",
    "kind": "engineering-practice",
    "url": "https://sre.google/workbook/canarying-releases/",
    "terms": [
      "canary",
      "rollback",
      "rollout",
      "production failure",
      "deployment safety",
      "deploy",
      "reliability"
    ],
    "facts": [
      "Canary releases expose a limited share of production traffic to help detect defects before wider rollout.",
      "Deployment monitoring and rollback authority are distinct from PR approval and merge authority."
    ],
    "limits": "Effective canarying requires appropriate signals, thresholds, routing and recovery.",
    "reviewedAsOf": "2026-11-14"
  },
  {
    "id": "CURSOR-AGENT",
    "publisher": "Cursor",
    "title": "Cursor Agent overview",
    "kind": "technical-documentation",
    "url": "https://cursor.com/docs/agent/overview",
    "terms": [
      "cursor",
      "ai coding",
      "agent assisted",
      "agentic coding",
      "code generation",
      "coding agent"
    ],
    "facts": [
      "Cursor Agent can edit source and run terminal commands in coding workflows.",
      "Review and approval effectiveness depends on an integrating workflow, not the agent capability alone."
    ],
    "limits": "Vendor capability is not independent proof of correctness or security.",
    "reviewedAsOf": "2026-11-14"
  }
];

function selectEngineeringReferences(scenario,turns=[],limit=5){
 const text=[scenario,...(Array.isArray(turns)?turns.filter(t=>t && t.role==='user').slice(-2).map(t=>t.content):[])].join(' ').slice(0,6000).toLowerCase();
 const scored=references.map(r=>({r,score:r.terms.reduce((n,term)=>n+(text.includes(term)?(term.includes(' ')?3:2):0),0)})).filter(x=>x.score>0);
 scored.sort((a,b)=>b.score-a.score || a.r.id.localeCompare(b.r.id));
 return scored.slice(0,Math.max(0,Math.min(5,limit))).map(x=>x.r);
}
function referencePrompt(records){
 if(!records.length)return 'No curated engineering reference matched this scenario. Do not invent documentation or technical guarantees.';
 return records.map(r=>[
   '[REFERENCE '+r.id+'] '+r.title+' ('+r.publisher+'; '+r.kind+'; reviewed '+r.reviewedAsOf+')',
   'Publisher: '+r.url,
   ...r.facts.map(x=>'Curated fact: '+x),
   'Limit: '+r.limits
 ].join('\n')).join('\n\n');
}
module.exports={references,selectEngineeringReferences,referencePrompt};

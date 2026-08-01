/** Hand-written Listen mode scripts — coach voice, not page dump. */

export const phaseListenScripts: Record<string, string[]> = {
  'phase-0': [
    'Welcome to the ISC mental model. If you only remember one thing from this phase, remember this: Identity Security Cloud is the governance brain. It correlates people to accounts across systems, and it drives joiner, mover, and leaver decisions.',
    'People get confused here all the time. An identity is the person or machine ISC governs. An account is that identity’s record on a specific source — Active Directory, Salesforce, whatever. One person usually has many accounts.',
    'Entitlements are permissions on a source. Access profiles bundle entitlements. Roles sit higher — business-shaped access that often groups profiles. Lifecycle states like Active or Terminated live on the identity profile and drive provisioning downstream.',
    'Picture the chain: identity profile and lifecycle sit above the identity; the identity connects to accounts on sources; entitlements hang off those; profiles and roles compose the access story.',
    'Here’s the tip for design reviews: emergency disable sets a Terminated lifecycle — resolved by name, never by a hardcoded I D — so ISC cascades disables. Peer clone submits access requests; it does not bypass approvals.',
    'When do you reach for code instead of the UI? When an external system must trigger something — ITDR, SIEM, automation — or when the UI cannot express the workflow. Otherwise configure in product first.',
  ],
  'phase-1': [
    'This phase is about explaining a failing call without guessing. Scripts authenticate with a Personal Access Token using OAuth client credentials. You post to the token endpoint, get a bearer token that lasts about twelve minutes, and reuse that token for the run.',
    'The S D Ks refresh tokens for you. Raw REST must not mint a new token on every call — that burns rate limits. Think on the order of about one hundred requests per access token per ten seconds.',
    'Separate authentication from authorization. A four oh one means the token is missing, expired, or invalid. A four oh three means the token worked, but you’re not allowed — missing scope, wrong user level on the PAT owner, or an endpoint that needs user context client credentials cannot provide. A four twenty-nine means back off.',
    'Here’s the tip: store secrets in the OS keychain or a vault. Never paste a client secret into chat, and never commit a dot env file.',
    'For a read-only reporting job, ask for specific read scopes — not scopes all — and pair that with a user level that can read but not mutate.',
  ],
  'phase-2': [
    'This is the most important fluency upgrade in July two thousand twenty-six: you must be bilingual about API versioning.',
    'Legacy yearly collections still work — slash v two zero two six slash accounts, and even slash latest. But greenfield work targets per-service paths like slash identities slash v one. Prefer those for anything new.',
    'Why did SailPoint move? Yearly bumps forced churn even when a service had no breaking change. Per-service semantic versioning only bumps majors when the contract actually breaks.',
    'Watch out: slash latest can silently retarget when routing changes. Treat it as unsafe for production. Pin explicit service versions.',
    'Legacy yearly, v three, and beta still have support tickets through Q two twenty twenty-eight, and hard end of life in Q one twenty twenty-nine. Brownfield should plan migration; greenfield should not start on yearly paths.',
    'In the TypeScript S D K two point x, you import resource A P Is without year namespaces, and method names carry the version suffix — list accounts v one, and so on. Use the official migration scripts; don’t hand-rewrite everything.',
  ],
}

export const moduleListenScripts: Record<string, string[]> = {
  m0: [
    'Module zero is the platform model for senior design. Every integration mutates or reads a small set of objects. If you confuse identity with account, you’ll pick the wrong A P I and sound junior in review.',
    'ISC governs identities. Accounts live on sources. Entitlements hang off accounts and sources. Access profiles bundle entitlements; roles compose business access. Lifecycle on the identity profile drives joiner, mover, and leaver provisioning.',
    'Resolve every object by name at runtime. Tenant GUIDs are not portable across sandbox and prod. Never hardcode lifecycle state I Ds.',
    'Who owns the change? H R and authoritative sources feed aggregation and transforms — batch truth. Security and ITDR need A P I lifecycle or account disable in seconds. Business access goes through access request and approvals. A net-new SaaS app needs a connector story, not a nightly invent-accounts script.',
    'Say this in design review: emergency disable sets Terminated by name so provisioning cascades. Peer clone submits access requests — it does not bypass governance.',
  ],
  m1: [
    'Module one is authentication and least privilege. Prefer a Personal Access Token for scripts and automations. Post client credentials to the OAuth token endpoint, then send Authorization Bearer on A P I calls.',
    'Reuse one token per run. Minting a token per request mainly causes four twenty-nines and wasted latency. Modern client I Ds are UUIDs with dashes; legacy undashed I Ds fail silently.',
    'When you see four oh three with a valid token, check scopes, the PAT owner’s user level, and whether the endpoint needs a user context client credentials cannot supply. Don’t rotate the secret first and call it done.',
    'Name PATs per integration, list scopes in the runbook, keyring locally and vault in prod, and revoke on offboarding. Log request I Ds — never secrets.',
  ],
  m2: [
    'Module two is the dual-world versioning brief for July two thousand twenty-six. Greenfield pins to per-service slash resource slash v N. Brownfield inventories scripts and workflow H T T P actions, then migrates before Q one twenty twenty-nine.',
    'Map legacy slash v two zero two six slash resource to slash resource slash v N using the official migration table. Entitlements and a few outliers may already be on v two — check the table; don’t assume everything is v one.',
    'Slash latest is an unsafe production alias under the new strategy because it can retarget silently. Prefer explicit pins.',
    'S D K two point x uses resource A P Is and method suffixes. Run the migration scripts for TypeScript, Python, Go, and PowerShell, then review v two outliers by hand.',
    'If a workflow H T T P action still hits yearly paths, that’s technical debt on a clock. Treat Workflow Analyzer mindset even when you’re offline: find them, rewrite them, verify.',
  ],
}

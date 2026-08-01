# Phase — Domain API fluency

> **Unit ID:** `phase-3`  
> **Path:** A · Fluency  
> **Source of truth for Listen mode.** Edit paragraphs below; blank lines separate spoken utterances.

---

Cold open. Domain fluency means you can design an integration verbally — joiner, mover, leaver, emergency disable, access request, peer clone, and search — before you open an editor.

The outcome is simple to say and hard to fake: pick the right objects and the right call sequence without guessing. Resolve by name. Verify after mutate. Preserve governance.

Module three A — identities, accounts, lifecycle. Find the identity with a filter on alias or name. Never hardcode lifecycle state GUIDs — they are tenant-specific. List lifecycle states on the identity profile, find Terminated by name, set the lifecycle state, then GET to confirm before and after.

Say this for emergency disable: I set lifecycle to Terminated, resolved by name, so Identity Security Cloud provisions disables downstream. I don’t invent per-app disable loops unless the source is unmanaged.

Say this for joiner: the identity lands through an authoritative source and aggregation, or through an A P I create path when that is how your tenant is designed. The identity profile maps attributes and transforms. Lifecycle Active — resolved by name — drives provisioning to managed sources. I do not invent per-app account creates when lifecycle and the connector should do the work.

Say this for mover: department, title, or role changes go through governed paths — attribute sync from the authoritative source, role assignment, or access request — not raw entitlement writes that skip approvals. Resolve roles and profiles by name. Verify with a GET after the change.

Module three B — access requests and approvals. You can request roles, access profiles, or entitlements. Approvals still apply. Cancel, close, and status A P Is exist. Access-request-config may be on v one or v two after migration — check the table and Open A P I. Prefer slash entitlements slash v one from the current spec.

Say this for peer clone: peer clone should submit access requests, not bypass governance. Dry-run first, then submit.

Module three C — sources and entitlements. Accounts live on sources. Entitlements hang off accounts. Aggregation has latency; real-time A P I action is a different clock. Don’t design as if the last aggregate is always fresh.

Module three D — Search. Search is index queries, not the same as list filters. Limit can go up to ten thousand, then page with search after. Prefer collection filters for straightforward real-time I T D R lookups; use Search for richer analytics where index lag is acceptable.

Module three E — collection parameters, filters, and PATCH — the H T T P method. Memorize operator tokens — these are the literal filter strings you type, not casual English: equals — E Q; not equals — N E; contains — C O; starts with — S W; greater than — G T; less than — L T; present — P R; in — I N; plus and and or. Example spoken slowly: alias space E Q space quote j dot doe quote. Collections also take limit, offset, count, and sorters — collection page size tops out around two hundred fifty. PATCH uses JSON Patch with content type application slash json-patch plus json — not a casual partial JSON body.

Worked sequence for a leaver: resolve identity by alias, resolve lifecycle I D by name, set state, verify with GET. That pattern is the spine of scenario one in this repo — rewrite it mentally onto slash identities slash v one paths for current work.

Watch-outs. Hardcoding Leave of Absence or Terminated I Ds. Disabling accounts in a for-loop while ignoring lifecycle. Using Search when a simple list filter would do — or the reverse for huge reporting. Skipping dry-run on peer clone. Forgetting verify GET after mutation.

When you’re back at the screen, take the micro-check on disabling Jennifer Thomas — first step is GET identities with an alias filter, then resolve lifecycle by name. Drill aloud: joiner versus mover versus leaver in one sentence each, five filter operator tokens with an example, find identity without a GUID, and when Search beats list filters.

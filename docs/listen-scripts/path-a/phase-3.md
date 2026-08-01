# Phase — Domain API fluency

> **Unit ID:** `phase-3`  
> **Path:** A · Fluency  
> **Source of truth for Listen mode.** Edit paragraphs below; blank lines separate spoken utterances.

---

Cold open. Domain fluency means you can design an integration verbally — joiner, mover, leaver, emergency disable, access request, peer clone, and search — before you open an editor.

The outcome is simple to say and hard to fake: pick the right objects and the right call sequence without guessing. Resolve by name. Verify after mutate. Preserve governance.

Module three A — identities, accounts, lifecycle. Find the identity with a filter on alias or name. Never hardcode lifecycle state GUIDs — they are tenant-specific. List lifecycle states on the identity profile, find Terminated by name, set the lifecycle state, then G E T to confirm before and after.

Say this for emergency disable: I set lifecycle to Terminated, resolved by name, so Identity Security Cloud provisions disables downstream. I don’t invent per-app disable loops unless the source is unmanaged.

Module three B — access requests and approvals. You can request roles, access profiles, or entitlements. Approvals still apply. Cancel, close, and status A P Is exist. Some config paths may be on v two after migration — check the table.

Say this for peer clone: peer clone should submit access requests, not bypass governance. Dry-run first, then submit.

Module three C — sources and entitlements. Accounts live on sources. Entitlements hang off accounts. Aggregation has latency; real-time A P I action is a different clock. Don’t design as if the last aggregate is always fresh.

Module three D — Search. Search is index queries, not the same as list filters. Limit can go up to ten thousand, then page with search after. Prefer collection filters for straightforward real-time I T D R lookups; use Search for richer analytics where index lag is acceptable.

Module three E — collection parameters, filters, and P A T C H. Memorize operators: equals, not equals, contains, starts with, greater and less than family, present, in, and, or. P A T C H uses JSON Patch with the json-patch content type — not a casual partial JSON body.

Worked sequence for a leaver: resolve identity by alias, resolve lifecycle I D by name, set state, verify with G E T. That pattern is the spine of scenario one in this repo — rewrite it mentally onto slash identities slash v one paths for current work.

Watch-outs. Hardcoding Leave of Absence or Terminated I Ds. Disabling accounts in a for-loop while ignoring lifecycle. Using Search when a simple list filter would do — or the reverse for huge reporting. Skipping dry-run on peer clone. Forgetting verify G E T after mutation.

When you’re back at the screen, take the micro-check on disabling Jennifer Thomas — first step is G E T identities with an alias filter, then resolve lifecycle by name. Drill aloud: find identity without a GUID, what’s wrong with hardcoding a lifecycle I D, and when Search beats list filters.

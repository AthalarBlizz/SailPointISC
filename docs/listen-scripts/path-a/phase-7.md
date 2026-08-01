# Phase — Production craft

> **Unit ID:** `phase-7`  
> **Path:** A · Fluency  
> **Source of truth for Listen mode.** Edit paragraphs below; blank lines separate spoken utterances.

---

Cold open. Production craft is how you sound like someone who has shipped Identity Security Cloud integrations — not someone who only completed a tutorial.

Outcome: talk secrets, verify-after-mutate, pagination, object I D discipline, version pins, observability, and agentic development as standards — then capture them in a one-page architecture decision record — A D R.

Secrets: one Personal Access Token per integration. Track expiration. Revoke on offboarding. Keyring locally; vault in production. Never paste secrets into A I tools or commit them. Name P A Ts for audit.

Verify after mutate: after any mutation — lifecycle change, account disable, access request submit — follow with a GET. Show before and after. That evidence is required for I T D R and audits. Assuming success is not a strategy.

Idempotency is a separate question: what happens if the same disable is posted twice? Design so a retry does not create a second request storm or an undefined state — safe to re-run, or explicitly rejected as already done.

Pagination and bulk: limit, offset, and count on collections. Search uses search after past large result sets. Batch thoughtfully. Respect four twenty-nine with backoff. Don’t melt the tenant with eager parallelism.

Object I D discipline: resolve by name every time. Tenant GUIDs are not portable across sandbox and prod. Lifecycle states, roles, access profiles, sources — none of them travel as hardcoded I Ds.

Change management: prefer slash service slash v one pins. Treat experimental as non-prod. Watch the deprecated response header. Slash latest is not a production versioning strategy under the July twenty twenty-six model.

Observability: log request I Ds and correlation. Monitor deprecation headers. Name integrations so operators can find the owner. Agentic development: local Open A P I specs plus project rules beat model memory — especially during the twenty twenty-six versioning transition.

Say this in your architecture decision record — A D R — title line: greenfield I S C integration standards for our team, July twenty twenty-six. Include auth with P A T and least privilege, S D K versus REST decision rule, per-service version pins, secret storage, dry-run flags, verify GET, and the migration deadline — support through Q two twenty twenty-eight, hard end of life Q one twenty twenty-nine.

Watch-outs. Secrets in chat. Skipping verify after mutate. Hardcoded GUIDs. Shipping slash latest. Ignoring four twenty-nine. Declaring migration done because the S D K upgraded while a cron still hits yearly paths.

When you’re back at the screen, take the micro-check — after set lifecycle state, GET and compare before and after. Then drill three production must-haves aloud, and draft or refine that one-page A D R before you leave the phase.

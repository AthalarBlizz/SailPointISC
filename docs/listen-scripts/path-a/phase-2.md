# Phase — Versioning dual-world

> **Unit ID:** `phase-2`  
> **Path:** A · Fluency  
> **Source of truth for Listen mode.** Edit paragraphs below; blank lines separate spoken utterances.

---

Cold open. This is the most important fluency upgrade in July two thousand twenty-six. You must be bilingual about A P I versioning — or every design conversation will age poorly.

Outcomes: contrast yearly versus per-service models accurately, map a legacy path to a new path, recommend greenfield to per-service v N and brownfield migrate before Q one twenty twenty-nine, and explain public versus experimental with the experimental header.

Legacy yearly collections still work — slash v two zero two six slash accounts, slash v three, beta, and even slash latest. But greenfield work targets per-service paths like slash identities slash v one, slash accounts slash v one, slash access-requests slash v one.

Why did SailPoint move? Yearly bumps forced churn even when a service had no breaking change. Per-service semantic versioning only bumps majors when the contract actually breaks. Docs flatten to current service docs first; legacy specs stay for maintenance.

Slash latest was introduced early twenty twenty-six as a yearly-alias shortcut. Under the July twenty twenty-six strategy, treat it as unsafe for production. It auto-routes and can break silently when routing flips. Prefer explicit slash service slash v N pins.

Legacy yearly, v three, and beta still have support tickets through Q two twenty twenty-eight, and hard end of life in Q one twenty twenty-nine. Migration is urgent strategically but not overnight — the deadline is Q one twenty twenty-nine. Brownfield inventories and migrates; greenfield does not start on yearly paths.

In the TypeScript software development kit two point x, you import resource A P Is without year namespaces, and method names carry the version suffix — list accounts v one, and so on. Old S D Ks used year namespaces on the class. Use the official migration scripts; don’t hand-rewrite everything. Review v two outliers by hand — some access-request-config and entitlements cases already map to v two.

Experimental endpoints still need the header X hyphen SailPoint hyphen Experimental set to true. They may break with little notice. Public A P Is avoid breaking changes within a major version.

Say this to leadership: we pin per-service versions for new work. We inventory scripts and workflow H T T P actions for yearly and slash latest debt. We migrate with official scripts and the path table before end of life — support ends Q two twenty twenty-eight; endpoints stop Q one twenty twenty-nine.

Watch-outs. Shipping slash latest because it always follows current. Treating Q one twenty twenty-nine as someone else’s problem with no inventory. Assuming every migrated path is v one. Using this workshop’s yearly samples as the greenfield default — great for patterns, wrong as the target for new code.

When you’re back at the screen, take the path-shape micro-check: greenfield emergency disable picks slash identities slash v one, not yearly or slash latest. Then drill: why yearly was abandoned, is slash latest O K in production mid twenty twenty-six — no — and whether sailpoint dot v two zero two five is broken yet — not yet, but plan the migration.

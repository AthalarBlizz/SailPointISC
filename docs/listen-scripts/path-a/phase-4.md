# Phase — TypeScript

> **Unit ID:** `phase-4`  
> **Path:** A · Fluency  
> **Source of truth for Listen mode.** Edit paragraphs below; blank lines separate spoken utterances.

---

Cold open. TypeScript is first-class for Identity Security Cloud — but it appears in three surfaces. Conflating them in conversation is a senior tell in the wrong direction.

Outcomes: scaffold a TypeScript A P I project with the SailPoint C L I, call a v one method with filters, and explain when you’d write a connector instead of an external script.

Surface one: the I S C A P I software development kit — sailpoint-api-client on npm. You use it to call I S C REST from Node or TypeScript apps. Nightly compliance jobs live here.

Surface two: SaaS Connectivity — the connector S D K plus the local spcx debugger. That is for custom cloud connectors and loopbacks — aggregate and provision semantics for a Source.

Surface three: connector customizers — TypeScript hooks that mutate before or after out-of-the-box connector operations. Different problem than calling the platform A P I from a cron job.

In sailpoint-api-client two point x, method versioning is in the name. Import resource A P Is without year namespaces. Call list accounts v one, list transforms v one, and so on. Legacy one point x used year namespaces on the class — Accounts V two zero two five A P I — and plain method names.

Scaffold with the C L I: sail sdk init typescript for a project, sail sdk init config for credentials shape. Migration from one point x to two point oh uses the official migration script — then review outliers.

Say this in review: for a nightly compliance report in Node, I use the A P I S D K. For a new SaaS H R app with no out-of-the-box connector, I reach for the connector S D K. Same language, different job.

Offline practice shape: load base URL, client I D, and client secret from environment — with the same keyring discipline as this workshop’s Python path — and sketch disable identity by alias with clear steps and a to-do for live calls. Compare that design to scenario one’s REST style — same integration, different caller language.

Watch-outs. Importing the connector S D K for a reporting job. Hand-rolling yearly paths in a new TypeScript service. Skipping the migration script and renaming classes by guesswork. Treating workshop yearly samples as the greenfield TypeScript default.

When you’re back at the screen, take the surface micro-check — nightly Node compliance is the A P I client, not SaaS Connectivity. Then drill: how method versioning works in the TypeScript S D K two point x, and A P I S D K versus connector S D K for compliance versus a net-new SaaS H R app.

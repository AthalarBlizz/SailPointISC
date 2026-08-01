# Phase — SDK choices & REST

> **Unit ID:** `phase-5`  
> **Path:** A · Fluency  
> **Source of truth for Listen mode.** Edit paragraphs below; blank lines separate spoken utterances.

---

Cold open. Picking the wrong runtime is how good designs become unmaintainable handoffs. This phase is the decision tree: TypeScript, Python, Go, PowerShell, raw REST, and the SailPoint command line interface — C L I.

The outcome: choose among those tools for a real scenario, and know when the C L I scaffolds versus when you ship an integration spec.

Decision rule from this workshop: if the code runs on its own as a script or service you own — use an S D K, a software development kit. If another system is calling Identity Security Cloud — I T D R, S I E M, ServiceNow, webhooks — give them direct REST, not an S D K import.

TypeScript S D K: Node services, SaaS connectors, modern web tooling. Python S D K: automation scripts, data and ops — this workshop’s home turf. Prefer Python two point x for new work; this repo pins one point four for workshop compatibility with yearly namespaces.

Go and PowerShell: platform preference, Windows ops, compiled services — same per-service mental model and migration story. SailPoint C L I: project init, config, connector workflows — not a substitute for production auth design.

Direct REST means a language-agnostic call sheet: method, path, headers, body, required scopes, Personal Access Token guidance. Paths should be per-service — slash service slash v N — not yearly and not slash latest.

Migration story for each S D K: official scripts rewrite year or beta namespaces to resource A P Is and add version suffixes on methods. Review v two outliers manually. Align clients with per-service paths before Q one twenty twenty-nine.

Say this when ServiceNow asks for the Python package: usually no. Give them a REST call sheet, P A T scopes, and pinned per-service paths. The S D K belongs in a process you own and run.

Worked example: refactor one scenario’s shape into an Open A P I-oriented call sheet for another platform — method, path spoken as slash identities slash v one style, headers including bearer token, body, and verify GET. That is an integration spec, not a long-running S D K app.

Watch-outs. Asking another team to npm install or pip install your favorite S D K. Putting slash latest in a handoff doc so they never migrate. Treating workshop one point four Python imports as the forever standard. Forgetting the C L I exists for scaffold and then reinventing project layout.

When you’re back at the screen, take the ServiceNow micro-check — best artifact is REST call sheet plus P A T scopes plus per-service paths. Then drill: should ServiceNow import Python — usually no — and what’s the migration story across S D Ks.

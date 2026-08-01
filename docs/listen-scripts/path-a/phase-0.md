# Phase — ISC mental model

> **Unit ID:** `phase-0`  
> **Path:** A · Fluency  
> **Source of truth for Listen mode.** Edit paragraphs below; blank lines separate spoken utterances.

---

Cold open. Before you call any Identity Security Cloud A P I, you need the nouns. If you confuse identity with account, or access request with lifecycle, you will design the wrong integration — and sound junior in a design review.

By the end of this phase you should explain what Identity Security Cloud — I S C — is for in one sentence, name the core objects and how they relate, and know when the U I is enough versus when you reach for an A P I or an S D K — a software development kit.

I S C is the governance brain. It correlates people to accounts across connected systems, and it drives joiner, mover, and leaver decisions plus governed access.

An identity is the person or machine I S C governs. An account is that identity’s record on a specific source — Active Directory, Salesforce, a SaaS app. One person usually has many accounts.

A source is the connected system. Entitlements are permissions or groups on that source. Access profiles bundle entitlements. Roles sit higher — business-shaped access that often groups profiles. On-prem sources often connect through a virtual appliance — V A. Cloud SaaS apps often use SaaS Connectivity connectors that run in SailPoint cloud.

Lifecycle states like Active or Terminated live on the identity profile. They drive provisioning downstream. Aggregation pulls accounts and entitlements in. Provisioning pushes create, update, disable, or delete out.

Picture the chain: identity profile and lifecycle sit above the identity; the identity connects to accounts on sources; entitlements hang off those; profiles and roles compose the access story. Certifications are periodic review campaigns. Access requests are governed asks with approvals.

Say this in a design review: emergency disable sets a Terminated lifecycle — resolved by name, never by a hardcoded I D — so I S C cascades disables. Peer clone submits access requests; it does not bypass approvals.

When do you reach for code? When an external system must trigger something — I T D R, identity threat detection and response, S I E M, security information and event management, or other automation — or when the U I cannot express the workflow. Otherwise configure in product first.

Watch out for these traps. Treating identity and account as synonyms. Hardcoding tenant-specific object I Ds. Waiting for the next H R file when security needs someone disabled now. Aggregation is batch and slow; compromised accounts need immediate A P I-driven action.

When you’re back at the screen, take the vocab micro-check: one person with an A D login and a Salesforce login is one identity and two accounts. Then answer the drills out loud — entitlement versus profile versus role, why H R sync is not enough for I T D R, and when U I loses to A P I.

# M11 — SailPoint CLI — scaffold, config, connectors

**Track:** SDKs & CLI  
**Est. time:** 2 hr  
**Goal:** Use the CLI as the standard bootstrap path for SDK and connector projects  
**Fluency refresh:** Path A `phase-5` in [curriculum.md](../curriculum.md)

## Senior outcomes

- Init TypeScript (or other) SDK projects and config via CLI.
- Explain CLI’s role in connector local debug workflows (with spcx).
- Keep CLI config free of committed secrets.

## When to use

- Greenfield project bootstrap
- Onboarding developers to a standard layout
- Connector build/test loops

## When not

- As a substitute for production secret management
- As the runtime for high-volume integrations (use services + SDKs)

## Core content

The CLI is the standard bootstrap path for SDK and connector projects — not a production secret store or high-volume runtime.

### Core commands

- `sail sdk init typescript my-project`
- `sail sdk init config`
- Connector workflows use CLI + spcx for local debug — see M15.

### Team standards

- Document required CLI version in README.
- Commit templates from `sail sdk init`, not one-off folder layouts.
- Separate “API project” vs “connector project” scaffolds — do not mix packages casually.

> Treat CLI config like .env — local only, gitignored, vault in CI.

> Docs: https://developer.sailpoint.com/docs/tools/cli

## Failure modes

- Committing sail config with client secrets.
- Every engineer hand-rolling different TS layouts.
- Using CLI interactive login patterns in headless prod runners.

## Enterprise checklist

- [ ] CLI version pinned in onboarding doc
- [ ] gitignore for local config/secrets
- [ ] CI uses vault-injected env, not developer CLI profiles
- [ ] Connector vs API project templates distinguished

## Checkpoints

1. **What CLI commands start a TypeScript API project and config?**
   - sail sdk init typescript <name> and sail sdk init config.
2. **Why isn’t the CLI enough for production auth?**
   - Production needs vault-managed secrets, non-interactive injection, rotation, and audit — not developer workstation CLI profiles.

## Interactive learning

Open **Path B → CLI** in the web app (`#/module/m11`) for full implementation patterns, code samples, and labs.

Runtime source of truth: `web/src/content/implementation/`.

# Phase — Authentication & HTTP

> **Unit ID:** `phase-1`  
> **Path:** A · Fluency  
> **Source of truth for Listen mode.** Edit paragraphs below; blank lines separate spoken utterances.

---

Cold open. This phase is about explaining a failing call without guessing. Auth and H T T P craft separate people who debug in minutes from people who rotate secrets at random.

You should be able to walk a Personal Access Token through client-credentials end to end, separate user level from scopes, diagnose four oh one, four oh three, and four twenty-nine correctly, and store secrets with keyring discipline — never in source or chat.

Scripts authenticate with a Personal Access Token — P A T — via OAuth client credentials. You post to the token endpoint, get a bearer token that lasts about twelve minutes, and send Authorization Bearer on A P I calls.

Reuse one token for the run. The software development kit — S D K — refreshes tokens for you. Raw REST must not mint a new token on every call — that wastes latency and hammers the token endpoint. Rate limits are on the order of about one hundred requests per access token per ten seconds — confirm current docs before quoting S L As.

Modern P A T client I Ds are UUIDs with dashes. Legacy undashed I Ds fail. Authentication is not authorization. The token proves who you are; scopes and user level decide what you may do.

Scopes to name aloud: S P colon scopes colon default is minimal public endpoints. S P colon scopes colon all is everything the user level permits — avoid it as a habit. Prefer specific scopes ending in colon read or colon manage. Required scopes live on each operation in the Open A P I — look them up, don’t guess.

Four oh one means the token is missing, expired, or invalid. Four oh three means the token worked, but you’re not allowed — missing scope, wrong user level on the P A T owner, or an endpoint that needs user context client credentials cannot provide. Four twenty-nine means back off and retry with respect.

Say this when someone reports a four oh three with a valid token: don’t rotate the secret first. Check scopes, the owner’s user level, and whether the endpoint needs a user context that client credentials cannot supply.

For a read-only reporting job, ask for specific colon-read scopes — not scopes all — and pair that with a user level that can read but not mutate. Name P A Ts per integration so audit trails make sense.

Secrets: this workshop uses python-keyring into the OS keychain. Never paste a client secret into chat. Never commit a dot env file. In production, use a vault. Revoke on offboarding.

Watch-outs. Minting a token per request. Confusing four oh one with four oh three. Assuming a valid bearer token means every endpoint will accept it. Defaulting to scopes all. Quoting rate limits as gospel without checking current docs when S L As matter.

When you’re back at the screen, take the micro-check on create access request returning four oh three — the answer is missing scope or insufficient user level, not a bad secret. Then drill aloud: walk the bearer token flow, explain that four oh three, and state least-privilege scoping for a read-only job.

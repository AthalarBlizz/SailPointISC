# Listen scripts (source of truth)

Spoken coach scripts for the learning app’s **Listen** mode live here as Markdown.

The web app loads these files at build time. Edit a paragraph here, rebuild (or refresh in `npm run dev`), and Listen mode speaks the new text.

## Layout

| Path | Units |
|------|--------|
| `path-a/` | Fluency phases `phase-0` … `phase-8` |
| `path-b/` | Implementation modules `m0` … `m20` |

File name = unit ID (e.g. `path-a/phase-2.md`, `path-b/m14.md`).

## Format

1. Optional `#` title and blockquote metadata at the top (ignored when speaking).
2. A `---` separator (optional).
3. **Body:** one spoken utterance per paragraph. Separate paragraphs with a blank line.

```markdown
# Phase — Example

> **Unit ID:** `phase-0`

---

First thing the coach says.

Second utterance after a pause.

Third utterance.
```

Do not put code fences, tables, or raw URLs in the body — those are awkward for speech.

## Speech style guide

**Letter-space** acronyms engineers say letter-by-letter (so TTS does not invent a word):

| Say | Not |
|-----|-----|
| `I S C`, `A P I`, `S D K`, `P A T`, `H T T P`, `H R` | bare `ISC`, `API`, `SDK`, `PAT` |
| `I T D R`, `I T S M`, `S I E M`, `S O A R`, `R P A` | bare `ITDR`, `ITSM`, … |
| `V A`, `C L I`, `A D R`, `S L A`, `S L O`, `C I`, `I D`, `U I` | bare forms TTS may mangle |
| `Open A P I` | `OpenAPI` mashed into one token |

**Say as words** (product / tech names): TypeScript, PowerShell, BeanShell, Python, OAuth, JSON, YAML (“yaml”), REST, SaaS, Node, npm, ServiceNow, Salesforce, Postman, GUID (“goo-id”).

**Define once, then short form:** first mention “software development kit — S D K” or “Personal Access Token — P A T”, then **S D K** / **P A T** only. Do not expand “software development kit” on every later mention.

**HTTP methods:** say `GET`, `PUT`, or `PATCH` as method words — never letter-space `P A T C H` (collides with **P A T**). Prefer “PATCH — the H T T P method” on first use in a unit if helpful.

**Paths:** “slash identities slash v one”, “slash latest”.

**Niche tools:** gloss on first hear in that path (e.g. “spcx — the SaaS Connectivity local debugger”, “K M S — a key management service”).

## Review workflow

1. Open the unit’s `.md` file in this folder.
2. Edit or reorder paragraphs.
3. Save. In local app: `cd web && npm run dev` and use Listen on that phase/module.
4. Commit when the script sounds right.

There is no second copy in TypeScript — this directory is the only authored source.

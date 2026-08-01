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

Do not put code fences, tables, or raw URLs in the body — those are awkward for speech. Spell acronyms the way you want them spoken (e.g. `I S C`, `A P I`).

## Review workflow

1. Open the unit’s `.md` file in this folder.
2. Edit or reorder paragraphs.
3. Save. In local app: `cd web && npm run dev` and use Listen on that phase/module.
4. Commit when the script sounds right.

There is no second copy in TypeScript — this directory is the only authored source.

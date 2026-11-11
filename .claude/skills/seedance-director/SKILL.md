---
name: seedance-director
description: "Unified Seedance 2.0 / 2.5 production orchestrator. Use when turning a script, scene, storyboard, or set of reference assets into production-ready English Seedance prompts — T2V, I2V, first/last-frame, R2V (omni-reference), V2V, video edit, and video extension — with script analysis, shot design, @Image/@Video/@Audio role assignment, continuity tracking, timestamps, negative constraints, QC, and credit budgeting. Routes to the installed specialist skills (seedance, seedance-forge, cinematic-director, ai-video-storyboard, video-prompt-craft, cinematic-direction, story-and-shots, character-consistency, dialogue-and-audio, video-qa, assembly-and-delivery) and resolves the places where they disagree. Prefer this skill over the individual ones whenever the target model is Seedance."
license: MIT
user-invocable: true
---

# Seedance Director

An orchestration layer. It does not replace the specialist skills installed
next to it; it decides which one to consult at each stage, applies the
Seedance-version-specific rules they lack, and settles their conflicts in one
place (`references/skill-map-and-conflicts.md`). The specialist skills are
vendored unmodified.

**Precedence, highest first:**

1. The user's explicit instructions and the facts of their assets.
2. The live limits of the surface being used (query the generation tool or
   read its UI; never trust a remembered number over the tool).
3. This skill and its `references/`.
4. The specialist skills, as craft vocabulary and templates.

## Hard rules

1. **Analyze before writing.** No prompt is written until the scene has a
   beat map and every shot has a story function (stage 2). The only exception
   is the fast track below.
2. **Pick the model version first.** Seedance 2.0 and 2.5 are planned
   differently (clip length, shots per generation, reference budget, edit and
   extend mechanics). Read `references/version-rules.md` and state the version
   in every deliverable. Never mix 2.0 and 2.5 rules in one prompt.
3. **One role per reference.** Every uploaded asset is tagged
   (`@Image1`, `@Video1`, `@Audio1`), every tag appears in the prompt, and each
   tag is given exactly one job. `references/modes-and-references.md`.
4. **Continuity is a ledger, not a memory.** Identity, wardrobe, props,
   positions, screen direction and light are recorded per shot as
   end-state → next start-state. `references/continuity.md`.
5. **Only what the camera can see or the mix can hear.** No filler
   (`cinematic`, `epic`, `beautiful`, `stunning`, `masterpiece`, `8K`), no
   inner states, no resolution or fps words inside the prompt body — those are
   generation settings.
6. **One primary action and one camera behavior per timed beat.**
7. **Final prompts are in English**, self-contained, paste-ready, with a
   `Preserve:` line and an `Avoid:` line.
8. **Lint, then QC, then deliver.** Run `scripts/lint_prompt.py` on every
   prompt and walk `references/negatives-and-qc.md` before handing over.
9. **Never spend credits unasked.** This skill writes prompts and plans. It
   generates only when the user says to, and then follows
   `references/credit-optimization.md` (draft tier first, finalize passes
   only).
10. **Likeness and IP.** No real-person likeness without the user confirming
    consent or rights; no franchise characters or logos. Do not suggest
    routing around a platform's face or content checks. Director names are a
    planning lens only — translate them into technique tokens and keep the
    names out of the final prompt.

## Workflow

### 1. Intake (ask once, at most three questions)

Extract or infer: target version (2.0 / 2.5) and surface, total runtime,
aspect ratio, deliverable (single clip / sequence), available assets (list
each file: type, what it shows, duration), must-keep and must-avoid, audio
plan (native / reference audio / post), and credit sensitivity. Proceed on
stated assumptions when the gaps are not blocking.

### 2. Script and scene analysis

Per scene, write down (compact, not an essay):

- literal event, dramatic question, turn
- emotional movement: start → pressure → turn → end
- **visual thesis**: one concrete, filmable rule
- beat map: each beat = one visible change, with a beat card
  (main moving thing, start state → end state, the one camera move, failure
  risk)

Method: `cinematic-director` steps 1–2 and `story-and-shots`
(beat card in `../story-and-shots/references/quality-gates.md`). A beat with no visible change is
cut or rewritten.

### 3. Direction: look and coverage

Lock one look for the project — lens family, light source and quality,
palette, texture, motion language — as a short **style block** reused
verbatim. Then design coverage: shot size, angle, one move, blocking
(start position → motion → end position → eyeline), transition per join.

Vocabulary: `cinematic-direction` (camera, light, style lenses),
`../cinematic-director/references/cinematic-language.md` (shot functions),
optional director lens from `../cinematic-director/references/director_styles/`
(exactly one). Seedance-specific camera and timing rules:
`references/camera-and-timing.md`.

### 4. Asset lock

Register every recurring character, product, prop and location with an ID,
a frozen ≤120-word description, and its reference files
(`character-consistency`). Map each file to a tag and a single role, check the
count against the version's limits, and decide what is *not* uploaded.
`references/modes-and-references.md`.

### 5. Generation plan

For each shot choose mode, duration, and whether it shares a generation with
its neighbours. This is where 2.0 and 2.5 diverge most
(`references/version-rules.md`) and where most credits are saved or wasted
(`references/credit-optimization.md`). Output a shot table: ID, beat,
mode, duration, assets, start state, end state, risk, tier (draft/final).

### 6. Write the prompts

Use the mode template from `references/modes-and-references.md`. Order inside
a prompt: reference roles → subject and action → setting (T2V only) → camera
→ timed beats → audio → `Preserve:` → `Avoid:`. For phrasing patterns from
real community prompts, search the corpus:
`python3 ../seedance-forge/scripts/search.py "<keywords>" --top 5` — use
matches as structural scaffolds only and cite their `sourceLink`.

### 7. Harden and check

1. `python3 scripts/lint_prompt.py --version 2.5 --mode r2v --duration 10 --images 2 --videos 1 --audio 0 prompt.txt`
2. Walk the pre-flight list in `references/negatives-and-qc.md`.
3. Fix, re-lint, deliver.

### 8. Deliver

Use `assets/shot-package-template.md`: one package per generation with
settings, asset map, the prompt in a single code block, continuity in/out,
QC watch-points, and the attempt budget. For sequences add the shot table,
the continuity ledger, and the assembly notes (`assembly-and-delivery`).

### 9. After generation (when the user shares results)

Review against the shot's brief (`video-qa`): verdict is ship / fix / cut.
A fix changes **one** variable. Update the continuity ledger from the
*accepted* take's real last frame, not from the plan.

## Fast track

One clip, no recurring assets, no continuity burden: do stages 1, 5, 6, 7
in a single reply — one-line intent, settings, one prompt, lint. Do not run
the full pipeline for a one-off.

## Where things live

| Need | Read |
|---|---|
| 2.0 vs 2.5 limits and prompting differences | `references/version-rules.md` |
| Mode templates, @ reference roles | `references/modes-and-references.md` |
| Timestamps, camera rules per version | `references/camera-and-timing.md` |
| Identity, wardrobe, props, positions, joins | `references/continuity.md` |
| Negative constraints, pre-flight and post-gen QC | `references/negatives-and-qc.md` |
| Draft/final tiers, retake budget, cost levers | `references/credit-optimization.md` |
| Which specialist skill to use, and conflict rulings | `references/skill-map-and-conflicts.md` |
| Delivery format | `assets/shot-package-template.md` |
| Style bible, shot list, series bible, Fountain templates | `assets/cinema-skills-templates/` |
| Prompt linter | `scripts/lint_prompt.py` |

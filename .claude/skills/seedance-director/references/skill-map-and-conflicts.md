# Skill Map and Conflict Rulings

The specialist skills are installed unmodified beside this one. They were
written by different people for different targets, so they overlap and, in
places, contradict each other. Nothing was merged into them. This file says
which one to consult for what, and which side wins where they disagree
**when the target is Seedance**. Skill names below are folders in the
skills directory this skill is installed in (two levels up from this file).

## Routing

| Stage | Consult | For |
|---|---|---|
| Script and subtext breakdown, beat map, blocking | `cinematic-director` | Steps 1–6, Mode A/B output, `cinematic-director/assets/shot-plan-template.md` |
| Named-director lens | `cinematic-director/references/director_styles/` | Exactly one lens, as technique only |
| Beats, shot list, gates, fast track | `story-and-shots` | Beat card, six quality gates |
| Long-form social or ad structure (> one generation) | `ai-video-storyboard` | Platform cadences, hook/build/payoff patterns, post checklist |
| Camera, light, colour, style-lens vocabulary | `cinematic-direction` | Tokens for the style block and Camera line |
| Shot-brief grammar, I2V subtraction, failure modes | `video-prompt-craft` | The eight slots; `i2v-prompting.md`; `failure-modes.md` |
| Recurring characters, products, props | `character-consistency` | Asset registry, reference sheets |
| Seedance platform facts, @ syntax, templates, troubleshooting | `seedance` | Platform access, scene templates, retake protocol |
| Real-prompt phrasing and structure examples | `seedance-forge` | `seedance-forge/scripts/search.py` over the 2,366-row corpus (2.0-era) |
| Dialogue, voiceover, subtitles, mix | `dialogue-and-audio` | Line timing, post audio |
| Reviewing generated clips | `video-qa` | Checklist, failure taxonomy, `contact_sheet.py` |
| Stitching and export | `assembly-and-delivery` | `concat.py`, platform exports |
| A non-Seedance model | `model-adapters` | Its adapter sheets (there is no Seedance sheet; this skill is the Seedance adapter) |
| Style bible, shot list, series bible, Fountain | `assets/cinema-skills-templates/` | Document templates from cinema-skills |

## Rulings

| # | Topic | The disagreement | Ruling for Seedance |
|---|---|---|---|
| 1 | Prompt length | `seedance`: 40–110 words. `ai-video-storyboard`: 40–80. `video-prompt-craft`: eight-slot brief, longer. `seedance-forge` corpus: often 1,000+ characters | By mode and version — see the text-length row in `version-rules.md`. I2V is the shortest; 2.5 multi-shot the longest |
| 2 | Clip duration | `seedance`: keep under 10 s. `seedance-forge`: 15 s is the community standard. `cinematic-director`: 3–6 s for hard motion. `video-prompt-craft`: < 5 s when identity-critical | By content complexity — the duration table in `camera-and-timing.md`. 15 s and 30 s are caps, not targets |
| 3 | Shots per generation | `seedance` and the corpus pack 5–10 timed shots into one clip. `cinematic-director` and `cinematic-direction`: one action, one move per clip | Version-split: 2.0 one shot per generation; 2.5 up to ~6 shots of ≥ 3 s when location, cast and light are shared |
| 4 | Timestamp format | `[0:00–0:05]`, `[00:00-00:03]`, `0:00–0:05:`, `0–3s:` | `[MM:SS-MM:SS]`, contiguous, ending at the duration |
| 5 | Compound camera moves | `seedance`: sequence two moves. Others: one move per shot | One move per timed range; sequencing across ranges is allowed; stacking in one range is not |
| 6 | Reference tag spelling | `seedance`: `@Image1`. `seedance-forge`: also `@img1`, `@character_ref`, prose | `@Image1` / `@Video1` / `@Audio1` only, unless the surface names uploads differently |
| 7 | Describing a referenced subject | `character-consistency`: paste the frozen description into every prompt. `seedance` and `video-prompt-craft` I2V: do not re-describe the image | Verbatim description in T2V only. With an image, cite the tag and put anchors in `Preserve:` |
| 8 | Negative prompts | `video-prompt-craft`: full categorized block, separate field where available. `cinematic-director`: only relevant ones | Inline `Avoid:` line, 3–6 risk-selected items |
| 9 | Quality words | `ai-video-storyboard`: always end with "cinematic 1080p, synchronized audio". `seedance`, `cinematic-direction`: no filler | Dropped. Resolution and audio are settings; "cinematic" is filler |
| 10 | Tech specs in the prompt | `seedance-forge`: append "15 seconds, 24fps, no subtitles" | Duration, resolution, aspect are settings in the shot package. `subtitles` goes in `Avoid:` |
| 11 | Model-specific tuning | `ai-video-storyboard`: write model-agnostic prompts, no model hacks. `model-adapters`: write agnostic first, adapt after | Use them for structure only. The final prompt is Seedance-specific and version-specific |
| 12 | Native audio | `seedance`: native audio is a feature, use it. `dialogue-and-audio`: treat generated audio as scratch, finish in post | Decide once per project. Native for ambience, effects and short timed lines; reference audio for exact lip-sync; post for the final mix and anything long |
| 13 | Re-roll policy | `seedance`: generate 3–5 times before judging a prompt. `video-qa`: two strikes, then replan | The attempt budget in `credit-optimization.md`: ≤ 2 unchanged re-rolls and ≤ 2 one-variable revisions at draft tier, then replan |
| 14 | Prompt language | `cinematic-director`: Chinese or bilingual can help on Seedance surfaces | English, per this skill's brief. Offer a Chinese version only if the user asks |
| 15 | 2.0 video editing | `seedance` lists an Edit mode but its comparison table says 2.0 editing is "not supported" | 2.0 has no dedicated edit or extend mode on most surfaces; both are prompt-driven through a video reference and less controllable. 2.5 has dedicated modes. Templates for each are in `modes-and-references.md` |
| 16 | Face-check blocks | `seedance` troubleshooting suggests routing a blocked face upload through a third-party API | Not followed. Use consented, licensed or stylized references |
| 17 | Named people and franchises | Some `seedance-forge` corpus entries name real public figures and franchise characters. `cinematic-director`: lenses are method only | Corpus entries are structural examples only. No real-person likeness without consent, no franchise IP, no director names in final prompts |
| 18 | Intake questions | `seedance`: ask type, mood, duration, materials. `ai-video-storyboard`: five questions. `cinematic-director`: proceed on assumptions | One message, at most three questions, otherwise proceed on stated assumptions |
| 19 | Output wrapper | `ai-video-storyboard` adds a "Why this works" essay; `cinematic-director` has six output modes | `assets/shot-package-template.md`. Rationale is one line per shot, not an essay |
| 20 | "Fast" wording | `seedance`: avoid the word "fast". Corpus prompts use "fast cuts", "rapid" freely | Avoid on the whole shot; allowed on one named element |

## Upstream skills deliberately not installed

| Skill | Source | Why |
|---|---|---|
| `prompt-master` | cajias/agentic-video-skills | General LLM/image/code prompt optimizer. Its trigger ("write a prompt for … video AI") collides with this workflow, its output lock (single block, target line, no explanation) conflicts with the shot package, and it has no Seedance guidance |
| `better-writing` | cajias/agentic-video-skills | Prose editing; outside this workflow |
| `muse-google-veo-web` | svenkatreddy/universal-video-skills | Veo-via-Google-Flow browser procedure; backend-specific to a different model |
| (all of) cinema-skills | DenisHumen/cinema-skills | The repository contains no `SKILL.md` yet — only structure, planned-skill checklists and templates. The templates are vendored under `assets/cinema-skills-templates/` |

## Known gaps in the vendored skills (left as upstream shipped them)

- The `ai-video-storyboard` skill points to four reference files of its own
  (shot types, camera moves, lighting, genre templates); none exist
  upstream. Use the `cinematic-direction` references instead.
- The I2V reference in `video-prompt-craft` links to a shot-brief example
  that lives in the upstream repository's examples folder, not in the skill.
- `model-adapters` has no Seedance sheet.
- `seedance-forge`'s corpus predates 2.5; its conventions describe 2.0-era
  community practice.
- `video-qa/scripts/identity_score.py` needs `torch` and an embedding model;
  without them it exits with an install hint.

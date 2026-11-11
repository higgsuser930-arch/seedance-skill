# Seedance Skill

<p align="center">
  <img src="https://img.shields.io/badge/Seedance-2.0%20%7C%202.5-blue?style=flat-square" alt="Seedance 2.0 | 2.5">
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License: MIT">
  <img src="https://img.shields.io/badge/platform-Claude%20Code-purple?style=flat-square" alt="Platform: Claude Code">
</p>

A comprehensive Claude Code skill for ByteDance's Seedance 2.0/2.5 AI video generation model. Consolidates the best practices, prompting techniques, and operational knowledge from 6 community repositories into a single, meticulously structured skill file.

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Usage](#usage)
- [What's Inside](#whats-inside)
- [Example Output](#example-output)
- [Acknowledgments](#acknowledgments)
- [Contributing](#contributing)
- [License](#license)

## Features

| Category | Coverage |
|----------|----------|
| **Generation Modes** | T2V, I2V, V2V, R2V, FLF2V, Edit, Extend — each with tailored prompting rules |
| **Platform Support** | Dreamina, Jimeng, CapCut, Doubao, Fal AI, Volcengine/Ark, Runway, Replicate, MuAPI |
| **@ Reference System** | Syntax, role assignment, file allocation strategies, and common mistakes |
| **Prompt Framework** | 6D formula with subject, action, scene, camera, lighting, and timing |
| **Camera Direction** | 14 camera movements, compound sequences, shot-size pairings |
| **Lighting Design** | 11 lighting styles — the single most impactful lever on output quality |
| **Scene Templates** | 7 ready-to-use templates for products, characters, motion, multi-shot, and more |
| **Sequence Workflow** | Multi-clip continuity tracking, canonical state management, clip budgeting |
| **Quality Gates** | Anti-slop checklist, visibility tests, directing coherence rules |
| **Troubleshooting** | 10 common problems with root-cause analysis and fixes |
| **Version Comparison** | Detailed 2.0 vs 2.5 differences across all input/output dimensions |

## Quick Start

```bash
npx skills add jeurtr/seedance-skill --agent claude-code -g
```

Then ask Claude Code:

```
Generate a 10-second product promo video for a black leather handbag.
I have 3 reference images of the product.
```

The skill activates automatically — no `/seedance` invocation needed.

## Installation

### Via npx skills CLI

The [`skills`](https://www.npmjs.com/package/skills) CLI (by Vercel Labs) is the standard way to install agent skills across multiple coding agents:

```bash
# Install to all detected agents (default)
npx skills add jeurtr/seedance-skill -g

# Target a specific agent
npx skills add jeurtr/seedance-skill --agent claude-code -g
npx skills add jeurtr/seedance-skill --agent codex -g
npx skills add jeurtr/seedance-skill --agent opencode -g
```

The `skills` CLI supports Claude Code, Codex, OpenCode, Cursor, Windsurf, Copilot, Cline, and 68+ other agents. By default it installs to `~/.agents/skills/` (the shared agent skills directory), with per-agent routing handled automatically.

> **Claude Code users:** Claude Code resolves skills from `~/.claude/skills/`, not `~/.agents/skills/`. Use `--agent claude-code` to route correctly, or copy manually.

### Manual copy (always works)

```bash
# Claude Code (user-level)
mkdir -p ~/.claude/skills/seedance
cp SKILL.md ~/.claude/skills/seedance/SKILL.md

# Claude Code (project-level)
mkdir -p .claude/skills/seedance
cp SKILL.md .claude/skills/seedance/SKILL.md

# Codex / OpenCode
mkdir -p ~/.agents/skills/seedance
cp SKILL.md ~/.agents/skills/seedance/SKILL.md
```

### Git clone

```bash
git clone git@github.com:jeurtr/seedance-skill.git
mkdir -p ~/.claude/skills/seedance
cp seedance-skill/SKILL.md ~/.claude/skills/seedance/SKILL.md
```
```

## Usage

Describe what you want to create in plain language. The skill handles prompt structure, camera vocabulary, lighting, and constraints internally.

```
/seedance 帮我写一个15秒的产品广告提示词，产品是黑色皮质手提包
```

```
Create a cinematic short: a man walks through a rainy Tokyo alley at night,
camera tracking alongside him, neon reflections in puddles, 8 seconds.
```

For best results, mention:

1. **What you want** — video type, mood, duration
2. **What you have** — reference images, videos, audio files
3. **Any constraints** — aspect ratio, platform, budget

## What's Inside

```
SKILL.md (467 lines, 19 KB)
├── Soul — Three governing principles for every interaction
├── Quick Start — 6-step intake workflow
├── Platform Access — Endpoints and access paths for all surfaces
├── Input Constraints — 2.0 and 2.5 limits, formats, output specs
├── Modes — T2V, I2V, V2V, R2V, FLF2V, Edit, Extend with per-mode rules
├── @ Reference System — Syntax, role assignment, allocation table
├── Core Prompt Formula — 6D framework with worked examples
├── Camera Vocabulary — 14 movements, compound moves, shot pairings
├── Lighting Keywords — 11 styles (the single biggest quality lever)
├── Visual Style Anchors — Concrete replacements for vague adjectives
├── 7 Scene Templates — Product ads, narrative, motion transfer, multi-shot,
│   long take, beat-matching, lip-sync
├── Multi-Shot Sequence Workflow — Continuity tracking and clip budgeting
├── Anti-Slop Checklist — Quality gates before delivering any prompt
├── Troubleshooting — 10 issues with root causes, fixes, and retake protocol
├── 2.0 vs 2.5 Comparison — Feature-by-feature breakdown
├── Pro Tips — 13 community-vetted best practices
└── Quick Reference — Compressed format for character-limited surfaces
```

## Unified Seedance Production Pack

This repository also ships a project-level skill pack in `.claude/skills/`:
twelve community skills vendored unmodified, plus one orchestration skill,
`seedance-director`, that routes between them and settles their conflicts
for Seedance 2.0 and 2.5.

| Skill | Role |
|---|---|
| `seedance-director` | **Entry point.** Script analysis → direction → asset lock → generation plan → prompts → lint/QC → delivery. Separate 2.0 and 2.5 rules; T2V, I2V, first/last frame, R2V, V2V, edit, extend |
| `seedance` | Seedance platform facts, @ syntax, templates (this repo's original skill) |
| `seedance-forge` | Searchable corpus of 2,366 community Seedance 2.0 prompts |
| `cinematic-director` | Script breakdown, beat map, blocking, shot lists, director lenses |
| `ai-video-storyboard` | Multi-shot structure for social and ad formats |
| `video-prompt-craft` | Shot-brief grammar, I2V subtraction, failure modes |
| `cinematic-direction` | Camera, lighting, colour, style-lens vocabulary |
| `story-and-shots` | Beats, shot lists, quality gates |
| `character-consistency` | Asset registry and reference sheets |
| `dialogue-and-audio` | Dialogue timing, voiceover, subtitles, mix |
| `video-qa` | Clip review, failure taxonomy, contact sheets |
| `assembly-and-delivery` | ffmpeg stitching and platform exports |
| `model-adapters` | Adapter sheets for non-Seedance models |

Claude Code loads `.claude/skills/` automatically when a session is opened in
this repository. To use the pack elsewhere:

```bash
./scripts/install-skills.sh                   # -> ~/.claude/skills
./scripts/install-skills.sh --project ~/film  # -> ~/film/.claude/skills
python3 scripts/verify_skills.py              # structure, integrity, links, scripts
```

Start with `/seedance-director`, or just describe a scene and name the
Seedance version. Conflict rulings between the skills, and the upstream
skills that were deliberately left out, are in
`.claude/skills/seedance-director/references/skill-map-and-conflicts.md`.
Sources and licenses: `.claude/skills/THIRD_PARTY_NOTICES.md`.

## Example Output

Given a product photo as `@Image1`, the skill produces prompts like:

```
@Image1 (product hero shot) on a minimalist pedestal against pure black background.
Slow orbit around @Image1 with subtle rise, soft box three-point lighting
with rim light accent on product edges. Translucent glass panels with light
refractions floating depth. Clean commercial tabletop, controlled reflections,
no clutter. Gimbal-smooth motion. 4K sharp details.
```

## Acknowledgments

This skill synthesizes work from the following community projects:

| Repository | Key Contribution |
|------------|-----------------|
| [Emily2040/seedance-2.0](https://github.com/Emily2040/seedance-2.0) | Operating loop architecture, soul principles, sequence gate system |
| [dexhunter/seedance2-skill](https://github.com/dexhunter/seedance2-skill) | @ reference system, input constraints, mode-specific patterns |
| [Anil-matcha/awesome-seedance-2.5-api-prompts](https://github.com/Anil-matcha/awesome-seedance-2.5-api-prompts) | API reference, 2.5 feature comparison, shot script format |
| [makesupday/Awesome-Seedance-2.0](https://github.com/makesupday/Awesome-Seedance-2.0-Prompt-and-Examples) | Curated prompt collection, troubleshooting matrix |
| [robonuggets/seedance-skill](https://github.com/robonuggets/seedance-skill) | Liquid glass motion graphics patterns, Fal AI integration |
| [rich5000/seedance-prompt-guide](https://github.com/rich5000/seedance-prompt-guide) | Scenario templates, Chinese-English bilingual coverage |

## Contributing

Contributions are welcome. If you have:

- A new scene template that produced consistently good results
- A camera or lighting keyword the model responds well to
- A troubleshooting fix for a recurring issue
- Translations to additional languages

Please open a pull request or issue.

### Structure

- `SKILL.md` — English skill file
- `zh/SKILL.md` — Chinese skill file
- Keep the same section structure across translations
- Follow the existing format: concise tables, concrete examples, actionable rules

## License

MIT © [jeurtr](https://github.com/jeurtr)

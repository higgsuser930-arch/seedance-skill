# Seedance Skill

> Comprehensive Claude Code skill for ByteDance's Seedance 2.0/2.5 AI video generation model.

Covers prompt engineering, camera direction, lighting, multi-shot storytelling, API integration, and troubleshooting — across all Seedance surfaces (Dreamina, Jimeng, CapCut, Doubao, Fal AI, Volcengine, Runway, and more).

## What's Inside

- **7 modes**: T2V, I2V, V2V, R2V, FLF2V, Edit, Extend — each with mode-specific prompting rules
- **@ reference system**: role assignment, file allocation strategy, common mistakes
- **6D prompt formula**: Subject + Action + Scene + Camera + Lighting + Timing
- **Camera vocabulary**: 14 movements, compound moves, shot-size pairings
- **Lighting keywords**: 11 styles — the single biggest lever on output quality
- **7 scene templates**: product ads, character narrative, motion transfer, multi-shot, one-take, beat-matching, lip-sync
- **Multi-shot sequence workflow**: clip budgeting, continuity tracking, canonical state
- **Anti-slop checklist**: quality gates before delivering any prompt
- **Troubleshooting**: 10 common issues with root causes and fixes
- **Pro tips**: 13 battle-tested best practices from the community
- **2.0 vs 2.5 comparison**: input limits, features, resolution, formats

## Install

### Option A: Via `npx skills` (recommended)

```bash
npx skills add jialei/seedance-skill
```

### Option B: Manual copy

```bash
# English
cp SKILL.md ~/.claude/skills/seedance/SKILL.md

# Or to your project
cp SKILL.md .claude/skills/seedance/SKILL.md
```

### Option C: Git clone

```bash
git clone https://github.com/jialei/seedance-skill.git
cp seedance-skill/SKILL.md ~/.claude/skills/seedance/SKILL.md
```

## Usage

In Claude Code, invoke the skill:

```
/seedance
```

Or just describe what you want to create:

```
Generate a 10-second product promo video for a black leather handbag.
I have 3 reference images of the product.
```

## Quick Example

**Prompt written by this skill:**

```
@Image1 (product hero shot) on a minimalist pedestal against pure black background.
Slow orbit around @Image1 with subtle rise, soft box three-point lighting
with rim light accent on product edges. Translucent glass panels with light
refractions floating depth. Clean commercial tabletop, controlled reflections,
no clutter. Gimbal-smooth motion. 4K sharp details.
```

## Sources

This skill consolidates content from 6 community repositories:

| Repository | Stars | Core Contribution |
|------------|-------|-------------------|
| [Emily2040/seedance-2.0](https://github.com/Emily2040/seedance-2.0) | — | Operating loop, soul principles, gates, sequence management |
| [dexhunter/seedance2-skill](https://github.com/dexhunter/seedance2-skill) | 2.8k | @ reference system, constraints, capability patterns |
| [Anil-matcha/awesome-seedance-2.5-api-prompts](https://github.com/Anil-matcha/awesome-seedance-2.5-api-prompts) | 258 | API reference, 2.5 features, camera vocab, shot scripts |
| [makesupday/Awesome-Seedance-2.0-Prompt-and-Examples](https://github.com/makesupday/Awesome-Seedance-2.0-Prompt-and-Examples) | — | Curated prompts, troubleshooting, community pro tips |
| [robonuggets/seedance-skill](https://github.com/robonuggets/seedance-skill) | 90 | Liquid glass motion graphics, Fal AI integration |
| [rich5000/seedance-prompt-guide](https://github.com/rich5000/seedance-prompt-guide) | 18 | 7 scenario templates, Chinese + English |

## License

MIT

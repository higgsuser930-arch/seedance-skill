# Seedance 2.0 vs 2.5 — Separate Rule Sets

_Last verified: 2026-11-11. Numbers below are perishable. Sources: the
`seedance` skill in this pack, the Higgsfield model catalogue
(`seedance_2_0`, `seedance_2_0_mini`, `seedance_2_5`) queried on that date,
and third-party launch write-ups. Third-party sources disagree with each
other on some 2.0 totals and on 2.5 4K. Before planning around any number,
read it from the surface you will generate on._

Pick one column and stay in it for the whole generation.

## Hard limits

| | Seedance 2.0 | Seedance 2.5 |
|---|---|---|
| Duration per generation | 4–15 s, whole seconds | 4–30 s, whole seconds |
| Reference images | ≤ 9 | ≤ 30 |
| Reference videos | ≤ 3, ≤ 15 s combined | ≤ 10, ≤ 30 s combined |
| Reference audio | ≤ 3, ≤ 15 s combined | ≤ 10, ≤ 30 s combined |
| Total files | ≤ 12 (verify — some surfaces differ) | ≤ 50 |
| Aspect ratios | 21:9, 16:9, 4:3, 1:1, 3:4, 9:16 (+ auto) | same |
| Resolution | 480p / 720p everywhere; 1080p / 4K only on some surfaces and tiers | 480p / 720p / 1080p |
| Tiers (Higgsfield) | `std` (all resolutions), `fast` (480p/720p), separate *Mini* model (480p/720p) | `draft` 480p pass that can be finalized to 1080p within seven days |
| Dedicated edit mode | No — prompt-driven through a video reference | Yes (`video_edit`, one source video, billed by source duration) |
| Dedicated extension mode | No — prompt-driven through a video reference | Yes (`video_extension`, `forward` or `backward`) |
| Native audio | Yes, toggle | Yes, toggle; tighter lip-sync |
| Output container | MP4 | MP4, MOV on some surfaces |

## Planning rules that differ

| Decision | Seedance 2.0 | Seedance 2.5 |
|---|---|---|
| Unit of generation | **One shot** (or one continuous take) per generation. Sequences are separate generations chained by last frame. | **One scene** per generation: several shots in a single pass are reliable when they share location, cast and light. |
| Shots in one generation | 1 by default; at most 2–3 timed beats, at most one in-clip cut | Up to ~6 shots; each shot ≥ 3 s; one location family unless a cut is written explicitly |
| Working duration | 5–8 s for performance or identity-critical shots; 8–10 s for simple motion; 12–15 s only for a slow single move with one subject | 8–15 s for a single shot; 15–30 s only for a planned multi-shot scene. Longer is not better: the tail still degrades first |
| Subjects | One primary subject; two at most, with fixed left/right positions | Two to three recurring characters hold across shots when each has its own identity image |
| Camera | One move per generation, or two sequential moves (`Start: … Then: …`) | One move per timed shot; cuts between shots are written as `Cut to` or separate timestamp lines |
| Reference budget | 1–4 purposeful files. Rule of thumb: one image per ~2 s of video, never near the cap | More files are usable, but each still gets one role. Group them: identity set, location set, style, motion, audio |
| Text length | 40–110 words (I2V: 25–70) | Single shot: 60–120 words. Multi-shot: a ≤ 40-word header plus 15–30 words per timed shot, ≤ ~260 words total |
| Cross-shot identity | Re-attach the same identity image to every generation and restate `Preserve:` each time | Same, plus restate identity anchors once in the header rather than in every shot line |
| Edit | Supply the clip as `@Video1`, say it is the source, name the single change, and restate everything that must stay. Expect more collateral drift; trim the source to the affected seconds | Use the edit mode. Prompt is the delta only: what changes, what replaces it, what stays locked. Duration and aspect come from the source |
| Extend | Supply the clip as `@Video1`, write `Extend @Video1 by N seconds`, and describe only the new action starting from its real last frame. Set duration to the new portion | Use the extension mode and its direction. Prompt describes only the added portion; `backward` prompts describe what leads *into* the first frame |
| Audio | Native audio for ambience and short lines; one speaker per generation | Native audio for ambience, effects and dialogue; two speakers per generation are workable when each line sits in its own timed beat |
| Iteration tier | Draft on `fast` or Mini at 480p/720p, re-run the passing prompt on `std` at final resolution (new sample — re-QC it) | Draft with `draft: true`, then finalize the *same* take with `draft_job_id` |

## Things that are the same in both

- Tag syntax and one-role-per-reference discipline.
- Only visible action; one primary action per timed beat.
- No separate negative-prompt field on most surfaces — constraints go in an
  `Avoid:` line at the end of the prompt.
- Uploads of identifiable real faces may be blocked on official surfaces.
  Use consented, licensed or stylized references; do not work around the check.
- Readable on-screen text is unreliable. Keep signage out of focus or
  composite real text in post.
- Quality degrades toward the end of a clip. End the action 1 s before the
  clip ends and hold.

## Choosing the version

| Situation | Use |
|---|---|
| Single hero shot, product spin, simple I2V | 2.0 (cheaper tiers, 4K on some surfaces) |
| Budget drafts and tests | 2.0 `fast` / Mini |
| Multi-shot scene in one pass, 15–30 s | 2.5 |
| Changing one element of an accepted clip | 2.5 edit mode |
| Lengthening an accepted clip, or adding a lead-in | 2.5 extension mode |
| Many recurring characters or locations in one generation | 2.5 |
| Needs 4K | Check the surface; on Higgsfield that is 2.0 `std`, not 2.5 |

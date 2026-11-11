# Negative Constraints and Quality Checks

## Negative constraints

Most Seedance surfaces have no separate negative-prompt field. Constraints
go in a final `Avoid:` line. If the surface does expose a negative field,
move the line there unchanged.

**How to write the line**

- 3–6 items for a single shot, up to 8 for a multi-shot generation. A wall
  of negatives dilutes the ones that matter.
- Name concrete failures, not vibes: `morphing face`, not `bad quality`.
- Choose them from the shot's actual risks (the beat card's failure risk),
  not from habit.
- Where a positive instruction exists, prefer it and keep the negative as a
  backstop: `static camera` does more than `no camera shake`.
- Never negate something the prompt also asks for.

**Pick list by risk**

| Risk present in the shot | Add |
|---|---|
| Any person | `morphing face`, `face change` |
| Hands in frame | `extra fingers`, `distorted hands` |
| Full-body motion | `extra limbs`, `sliding feet` |
| Recurring character | `wardrobe change`, `hairstyle change` |
| Fixed cast count | `additional people` |
| Signs, screens, packaging | `readable text`, `distorted logos` |
| Any delivery shot | `subtitles`, `watermark` |
| Static or slow camera intended | `camera shake`, `sudden zoom` |
| Single continuous take | `cuts`, `scene change` |
| Locked background | `warping background` |
| Realism | `plastic skin`, `slow motion` (if real-time is intended) |
| Period or world rules | name the specific anachronism: `modern cars` |
| Edit / extend | `re-framing`, `restarting the action`, `new characters` |

**Project block.** Keep one project-wide `Avoid:` core (usually
`subtitles, watermark, morphing face`) and add shot-specific items to it.
When a generation fails in a new way, add that failure to the block.

## Pre-flight QC (before any credit is spent)

Run the linter, then check by eye. Every item is pass/fail.

**Story**
- [ ] The shot has a stated story function and one visible change.
- [ ] Start state and end state are both written.

**Version and mode**
- [ ] Version stated; duration, file counts and resolution inside that
      version's limits.
- [ ] Mode matches the assets (a literal opening frame is I2V, not R2V).
- [ ] 2.0: one shot per generation. 2.5 multi-shot: every shot ≥ 3 s.

**References**
- [ ] Every uploaded file is tagged; every tag has exactly one role.
- [ ] Each video reference says what to ignore.
- [ ] No file is uploaded without a job.

**Direction**
- [ ] Shot size, angle and one movement per timed range.
- [ ] Camera and subject motion are in separate sentences.
- [ ] One named light source with direction.
- [ ] Timestamps contiguous, from 00:00 to the duration; last range holds.

**Continuity**
- [ ] Start state equals the previous accepted shot's end state.
- [ ] Wardrobe version, props in hand, frame side, screen direction stated.
- [ ] `Preserve:` present, ≤ 6 items, ordered by drift risk.

**Language**
- [ ] English; no filler adjectives; no inner states; no fps/resolution
      words in the body.
- [ ] Word count inside the mode's budget.
- [ ] `Avoid:` present, specific, not contradicting the prompt.

**Rights**
- [ ] No real-person likeness without confirmed consent; no third-party
      characters or logos; reference clips are owned or licensed.

**Credits**
- [ ] Tier chosen (draft or final) and an attempt budget written down.

## Post-generation QC (when a result exists)

Method and failure names: `../../video-qa/`.

1. **Against the brief.** Does the clip do the story job in its shot-table
   row? Pretty is not a pass.
2. **Tail first.** Inspect the last two seconds hardest.
3. **Frame evidence.** First frame, last frame, and each beat boundary.
   `python3 ../../video-qa/scripts/contact_sheet.py clip.mp4 -o sheet.jpg`
4. **Identity and wardrobe** against the reference files, not memory.
5. **Join check** against the previous and next shot: position, direction,
   light, props.
6. **Audio:** line timing, lip-sync, unwanted music or doubled ambience.
7. **Verdict:** ship / fix / cut. A fix names the one variable to change.

| Failure seen | Likely cause | Single change to make |
|---|---|---|
| Looks like a slideshow | Prompt describes an image, not an action | Add start → motion → end and an environmental reaction |
| Reference ignored | Not tagged, or role unclear | Tag it; one role; say what to ignore |
| Reference's setting leaked in | Video reference unqualified | Add `ignore its subject and setting` |
| Jitter, flicker | `fast`, stacked moves | Slow the whole shot; one move |
| Tail collapses | Too long for the content | Shorten; end action 1 s early |
| Wrong beat timing | Ranges too short or too many | Fewer, longer ranges |
| Edit changed more than asked | Delta not isolated | Name one change; list what stays; trim the source |
| Extension restarts or cuts | Prompt re-describes the source | Describe only the new portion from the real last frame |
| Lip-sync off | Line too long, or two speakers in one range | Shorten the line; one speaker per range; audio reference |
| Unwanted in-clip cut | Long duration, no continuity statement | `Single continuous take, no cuts.` |

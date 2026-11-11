# Credit Optimization

Prices change and differ per surface; this file contains no prices on
purpose. Read the live quote from the generation tool before every paid
step. What does not change is what the cost is made of:

```text
cost ≈ seconds × resolution/tier multiplier × attempts  (+ surcharge for video references; edit is billed on source length)
```

`attempts` is the term a prompt controls. Everything below reduces one of
these factors.

## Before spending anything (free)

1. **Lint and pre-flight every prompt.** A prompt that fails the linter
   should never reach a generator.
2. **Cut shots in the plan, not in the edit.** If removing a shot changes
   nothing in the story, it costs zero ungenerated.
3. **Settle the look on stills.** Generate keyframes with an image model
   first. An approved keyframe turns a risky T2V shot into a cheap, short I2V.
4. **Trim reference videos** to the seconds that carry the motion. Use an
   image reference instead whenever motion is not what the file supplies.
5. **Do not upload what you do not tag.**

## The tier ladder

| Step | Seedance 2.0 | Seedance 2.5 |
|---|---|---|
| Draft | `fast` mode or the Mini model, 480p/720p, shortest duration that contains the beat | `draft: true` (480p) |
| Judge | Composition, action, timing, continuity — not fine detail | Same |
| Final | Re-run the *passing prompt* on `std` at delivery resolution. This is a new sample: QC it again | Finalize the *passing take* with `draft_job_id` (within seven days). Billed for the draft's full duration |

Never iterate at final resolution. Never finalize a take that has not passed
post-generation QC. If the surface offers free or unlimited allowances on
certain configurations, do drafting there.

## Duration

- Generate the shortest clip that holds the beat plus a 1 s hold. Trim in
  the edit; do not pay for padding.
- **Isolate risk.** Hands, lip-sync, contact, crowds: put them in their own
  4–6 s generation. A failed 5 s clip costs a sixth of a failed 30 s one.
- **Bundle the safe.** In 2.5, low-risk shots that share location, cast and
  light go in one multi-shot generation — one pass, no join to repair. Keep
  the bundle only if every shot in it passes; one failing shot means
  regenerating just that shot separately rather than the bundle.
- 2.0: do not chain to 15 s by default. Two 6 s shots joined by a last
  frame usually cost less in retries than one 12 s take.

## Fix, don't regenerate

| Situation | Cheapest route |
|---|---|
| One wrong element in an otherwise good clip | Edit (2.5 edit mode). Billed on source length, so trim the source to the affected seconds first |
| Good clip, too short | Extend. Duration = new seconds only |
| Good clip, bad tail | Trim the tail in the edit; extend from the last good frame if length is needed |
| Small flaw, visible for a few frames | Fix in post (cut around, reframe, speed ramp) |
| Wrong text, logo, or caption | Composite in post; do not re-roll for text |
| Wrong audio only | Replace in post; keep the picture |

## Attempt budget

Write the budget in the shot package before generating.

| Tier | Budget |
|---|---|
| Draft | Up to 2 unchanged re-rolls for a stochastic miss; up to 2 revisions, each changing one variable |
| Final | 1 run, plus 1 re-run if the final sample itself fails QC |

After two failed revisions, stop prompting and change the plan: shorten the
shot, simplify the action, switch to I2V from a locked keyframe, split it,
or cut around it. Log each attempt (what changed, what happened); the log
is what stops the same credit being spent twice.

## Order of operations for a sequence

1. Style proof: one wide and one close-up at draft tier. Fix the style
   block here.
2. Hardest shot next. If it cannot be made, the plan changes before the
   easy shots are paid for.
3. Remaining shots at draft tier, in story order, each anchored to the
   previous accepted last frame.
4. Rough-assemble the drafts. Cut and re-time now.
5. Finalize only the shots that survive the rough cut.

## Audio

Decide once per project: native audio, reference audio, or silent with
sound in post. If all sound is done in post, turn native audio off — it
removes a failure surface and, on surfaces that price audio, cost. Do not
re-roll a good picture for a bad ambience track.

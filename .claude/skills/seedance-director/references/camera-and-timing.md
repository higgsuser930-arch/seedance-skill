# Camera Instructions and Timestamps

Vocabulary lives in `../../cinematic-direction/references/camera-language.md`
and `../../cinematic-director/references/cinematic-language.md`. This file
holds only the Seedance-specific rules for using it.

## Timestamps

**Format:** `[MM:SS-MM:SS]`, plain hyphen, whole seconds, one line or
sentence per range.

```text
[00:00-00:03] Wide, low angle. She steps onto the roof edge and stops.
[00:03-00:06] Slow push-in to a medium close-up as she looks down.
[00:06-00:08] She closes her hand around the key. Hold.
```

**Rules**

- Ranges are contiguous, start at `00:00`, and end exactly at the duration
  setting. A prompt whose beats add up to 9 s on a 10 s clip gets an invented
  tenth second.
- In an extension, time restarts at `00:00` for the new portion.
- Minimum range: 2 s for a beat inside one shot; 3 s for a separate shot.
  Maximum: 5 s — split anything longer, or it smears.
- The final range is an end state plus `Hold.` Action finishes about 1 s
  before the clip does.
- Timestamps are strong guidance, not frame-accurate. Where sync must be
  exact (a cut on a music hit, a line on a gesture), supply an audio or video
  reference to carry the timing and plan to trim in the edit.

**When to use them**

| Case | 2.0 | 2.5 |
|---|---|---|
| Single action ≤ 6 s | No timestamps; write start → action → end in prose | Same |
| One shot with a turn, 6–15 s | 2–3 ranges | 2–4 ranges |
| Multi-shot in one generation | Avoid; if needed, 2 shots, one cut | 3–6 ranges, one per shot, each stating shot size |
| Dialogue | Each line inside its own range | Same; alternate speakers in separate ranges |

## Camera

Write three things, in this order: **shot size**, **angle**, **one
movement with a speed word**. `Medium close-up, eye level, slow push-in.`
If the camera does not move, write `static camera` — stillness must be
chosen, or the model drifts.

- **One move per timed range.** Sequence compound moves; never stack them:
  `[00:00-00:04] slow dolly-in. [00:04-00:07] pan right to the doorway.`
  not `dolly in while panning right`.
- **Motivate it.** Push-in on a realization, pull-back on isolation,
  tracking with pursuit, static for dread or dialogue. If the move has no
  story reason, use static or a slow push-in.
- **Separate camera from subject.** Subject motion in one sentence, camera
  in another. `She walks left to right. Camera tracks with her at waist
  height.`
- **State screen direction** for anything that moves across frame or exits:
  `exits frame right`. The next shot's entry must match.
- **Pairings that hold:** wide + static or slow dolly; medium + tracking or
  gentle handheld; close-up + small push-in or static. Avoid pans on
  close-ups and whip pans at the end of a clip.
- **Speed words:** `slow`, `steady`, `gradual`, `brisk`. Avoid `fast`,
  `rapid`, `fast-paced` on the whole shot — they produce jitter. If one
  element must be quick, name that element only: `the blade flicks once`.
- **Lens and focus as tokens**, sparingly: `35mm`, `85mm, shallow depth of
  field`, `rack focus from the cup to her face`. One lens statement per shot.
- **I2V:** movement only; framing is already in the image.
- **Camera from a reference video:** write `following the camera path of
  @Video1` and do not also describe a different move in words.

## In-clip cuts

| | 2.0 | 2.5 |
|---|---|---|
| Default | No cuts; one continuous shot | Cuts allowed between timed ranges |
| How to write a cut | `Cut to:` once, at most | New timestamp line beginning with the new shot size; `Cut to` optional |
| Continuous take | `Single continuous take, no cuts.` | Same — say it, or 2.5 may insert a cut on long durations |
| Match cut / transition | Do it in the edit | `Match cut on [shape/action]` between two ranges is workable; verify |

## Duration by complexity

| Shot content | Seconds |
|---|---|
| Face performance, hands, lip-sync, fight contact | 4–6 |
| One person, one action, moving camera | 5–8 |
| Product move, environment, establishing | 6–10 |
| Slow single move, no performance | 10–15 |
| Multi-shot scene (2.5 only) | 12–30, ≥ 3 s per shot |

When a shot fails twice at a given length, shorten it before rewriting it.

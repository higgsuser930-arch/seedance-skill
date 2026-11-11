# Modes and the @ Reference System

## Tag rules

- Canonical tags: `@Image1…`, `@Video1…`, `@Audio1…`, numbered by upload
  order **within each media type**. Do not write `@img1`, `@image1`,
  `@character_ref` or "the first image" — corpus prompts use them, but mixed
  spellings are a common reason a reference is ignored.
- Some surfaces show their own labels for uploads. If the UI or API names the
  files differently, use its names and keep the one-role rule.
- Every uploaded file is tagged in the prompt. A file that is not tagged is
  wasted upload and, for video, wasted credits. If it has no job, do not
  upload it.
- Declare roles in the first lines, then use the tag again at the point where
  it applies (in a multi-shot prompt, in each shot line the asset appears in).
- **One role per tag.** If one image must supply face *and* outfit, say
  `identity and wardrobe` as a single identity role; never ask one file for
  identity + pose + scene + style.
- Name the aspect when the file contains more than you want:
  `@Image2 — wardrobe only, ignore the face and background`.

## Role vocabulary

| Media | Roles (pick one per file) | Declaration pattern |
|---|---|---|
| Image | first frame · last frame · character identity · wardrobe · product geometry · prop · location/set · style/palette · composition/layout | `@Image1 is the first frame.` / `@Image2 is MARA's identity (face, hair, build).` |
| Video | camera movement · subject motion/choreography · edit rhythm/pacing · effect or transition to replicate · source clip to edit · source clip to extend | `@Video1 is camera-movement reference only; ignore its subject and setting.` |
| Audio | dialogue to lip-sync · voice timbre · music bed / beat grid · ambience or sound effect | `@Audio1 is the dialogue track for MARA; lip-sync to it.` |

Always say what to **ignore** in a video reference. An unqualified motion
reference leaks its subject, setting and grade into the result.

## Mode selection

| You have | You want | Mode |
|---|---|---|
| Nothing | A shot from words | T2V |
| One still that *is* the opening frame | That frame to move | I2V (first frame) |
| Opening and closing stills | A controlled transition between them | FLF (first + last frame) |
| Identity/location/style/motion/audio files that are *not* literal frames | A new shot built from them | R2V (omni-reference) |
| A clip whose motion, camera or rhythm you want on new content | Restyle / motion transfer | V2V (video as motion or camera reference) |
| An accepted clip with one thing wrong | Change that thing only | Edit |
| An accepted clip that ends too soon (or needs a lead-in) | More seconds | Extend |

First-frame and reference roles are different. A first-frame image is
reproduced; a reference image is interpreted. Do not put a character sheet in
the first-frame slot.

## Templates

Bracketed slots are filled; lines whose slot is empty are deleted. Timestamps
follow `camera-and-timing.md`.

### T2V — describe everything

```text
[SUBJECT — frozen description, pasted verbatim] [one visible action] in [SETTING: place, time, weather, 2–3 concrete props].
Camera: [shot size], [angle], [one movement, with speed].
[00:00-00:03] [action]. [00:03-00:06] [action]. [00:06-00:08] [end state, held].
Light: [source, direction, quality]. Look: [style block].
Audio: [dialogue with speaker named] / [foley] / [ambience].
Preserve: [counts, positions, screen direction, wardrobe].
Avoid: [3–6 specific failure modes].
```

### I2V — subtract; describe only motion

The image already fixes identity, wardrobe, setting, framing and light.
Re-describing them invites the model to reinvent them.

```text
@Image1 is the first frame; keep its composition, subject and lighting exactly.
From this frame, [subject noun only] [one action with direction and speed], [environmental reaction].
Camera: [movement only — framing is in the image].
[00:00-00:03] [motion]. [00:03-00:05] [end state, held].
Audio: [...].
Preserve: [face, wardrobe, prop positions, background layout from @Image1].
Avoid: [...].
```

Name anything the image shows only partially (an occluded prop, a
background figure the story needs).

### FLF — first and last frame

```text
@Image1 is the first frame. @Image2 is the last frame and the final visual target.
The shot moves from [first-frame state] to [last-frame state] through [one continuous action].
Camera: [one movement that explains the change in framing].
Preserve: [identity, wardrobe, location, light direction] across the whole move.
Avoid: [cuts, morphing between frames, extra people].
```

The two frames must share identity, wardrobe, location and light. If they
are far apart, split into two generations with an intermediate keyframe.

### R2V — omni-reference

```text
@Image1 is [CHARACTER]'s identity. @Image2 is the location. @Image3 is style and palette only.
@Video1 is camera-movement reference only; ignore its subject and setting.
@Audio1 is the music bed; cut on its beat.
[CHARACTER from @Image1] [action] in [the location of @Image2].
Camera: [shot size, angle], following the move of @Video1.
[timed beats]
Audio: [...].
Preserve: @Image1 face, hair and wardrobe; the layout of @Image2.
Avoid: [...].
```

### V2V — motion, camera or rhythm transfer

```text
@Video1 is [subject-motion | camera-movement | edit-rhythm] reference only; take [the choreography | the camera path | the cut timing] and ignore its [subject, setting, grade].
@Image1 is [CHARACTER]'s identity.
[CHARACTER from @Image1] performs the movement of @Video1 in [new setting].
Camera: [state it, unless the camera is what @Video1 supplies].
Preserve: timing and body mechanics of @Video1; identity of @Image1.
Avoid: [copying the reference's background, face or clothing].
```

Use only reference clips the user owns or is licensed to use.

### Edit — change one layer

Seedance 2.5 (dedicated edit mode; duration and aspect follow the source):

```text
@Video1 is the source clip. Change only [the one element]: replace [X] with [Y — described, or @Image1].
Keep everything else identical: performance, timing, camera path, framing, background, lighting, audio.
Avoid: [changes to face, wardrobe, or any untouched element; added objects].
```

Seedance 2.0 (prompt-driven; no dedicated mode on most surfaces):

```text
@Video1 is the source clip to edit, not a style reference. Reproduce it shot-for-shot with one change: [X] becomes [Y].
Keep: [list the five things most likely to drift — face, wardrobe, camera path, background, timing].
Avoid: [re-framing, re-timing, new cuts, added objects].
```

One edit per pass. Two changes are two passes; stacking them makes failures
undiagnosable. Trim the source to the seconds that need the change.

### Extend — continue accepted footage

Before writing, look at the **actual last frame** (or first, for backward) of
the accepted clip: pose, position, eyeline, props in hand, light.

Seedance 2.5 (extension mode, `forward` or `backward`):

```text
Continue from the final frame: [subject] [next single action], [where it ends].
Camera: [continue the existing move | settle to static].
[00:00-00:03] [...]. [00:03-00:05] [end state, held].
Audio: [continue the ambience; next line if any].
Preserve: identity, wardrobe, props in hand, location, light direction and grade of the source.
Avoid: cuts, scene change, new characters, restarting the action.
```

Seedance 2.0:

```text
@Video1 is the clip to extend. Extend @Video1 by [N] seconds, continuing seamlessly from its last frame.
[same body as above]
```

Rules: the duration setting is the **new portion only**; timestamps restart
at 00:00 for the new portion; do not re-describe what already happened; do
not introduce a beat that belongs to a later shot. After two chained
extensions in one scene, re-anchor from the canonical identity image instead
of extending again — drift compounds.

### Dialogue and lip-sync

```text
@Image1 is [SPEAKER]'s identity. @Audio1 is [SPEAKER]'s dialogue track; lip-sync to it.
Medium close-up, static camera. [SPEAKER] speaks to [eyeline target].
[00:00-00:04] [SPEAKER] (quiet, level): "Line under twelve words."
Audio: room tone only under the voice, no music.
Preserve: @Image1 face and wardrobe; mouth shapes match @Audio1.
Avoid: subtitles, on-screen text, extra people, camera movement.
```

Without an audio file, put the quoted line inside its timed beat with the
speaker named. Never use pronouns when more than one character speaks.

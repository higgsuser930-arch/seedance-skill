# Shot Package Template

One package per generation. Delete lines that do not apply.

````markdown
## S03 — [story function, e.g. "Decision: she keeps the key"]

| Setting | Value |
|---|---|
| Model | Seedance 2.5 |
| Mode | omni_reference (R2V) |
| Duration | 8 s |
| Aspect ratio | 16:9 |
| Tier / resolution | draft 480p → finalize 1080p |
| Native audio | on |

**Assets (upload in this order)**

| Tag | File | Role |
|---|---|---|
| @Image1 | `mara_front.png` | MARA identity (face, hair, wardrobe) |
| @Image2 | `roof_wide.png` | location |
| @Video1 | `pushin_ref.mp4` (4 s) | camera movement only |

**Prompt**

```text
@Image1 is MARA's identity. @Image2 is the location. @Video1 is camera-movement reference only; ignore its subject and setting.
MARA from @Image1 stands at the parapet of the rooftop in @Image2 at night, a brass key in her right hand.
Camera: medium close-up, eye level, following the slow push-in of @Video1.
[00:00-00:03] She looks down at the street, rain running off her hair.
[00:03-00:06] She opens her right hand and looks at the key.
[00:06-00:08] She closes her fist around it and lifts her chin. Hold.
Light: sodium street glow from below, cool rim from the skyline behind.
Audio: steady rain on gravel, distant traffic, no music.
Preserve: MARA's face, copper bob and olive jacket from @Image1; key in right hand; she stays frame left facing right; one steel vent behind her.
Avoid: morphing face, extra fingers, additional people, readable text, camera shake, subtitles.
```

**Continuity**
- In: hands on the ledge, hair wet, frame left facing right (S02 accepted end frame).
- Out: right fist closed at chest height, chin up, eyeline to skyline.

**QC watch-points:** right hand during the open/close; face in the last 2 s; vent count.

**Attempt budget:** draft ≤ 2 re-rolls + ≤ 2 one-variable revisions; final 1 (+1).

**Rationale (one line):** push-in lands on the closed fist — the decision is the shot.
````

## Sequence wrapper (multi-shot projects)

1. **Brief** — version, surface, runtime, aspect, audio plan, assumptions.
2. **Analysis** — dramatic question, emotional movement, visual thesis (≤ 6 lines).
3. **Style block** — the reusable look line(s).
4. **Asset registry** — IDs, frozen descriptions, files.
5. **Shot table** — ID · beat · mode · duration · assets · start → end · risk · tier.
6. **Shot packages** — as above, in generation order (style proof and hardest shot first).
7. **Continuity ledger** — `references/continuity.md` §3.
8. **Credit plan** — generations × seconds per tier, what is drafted, what is finalized.
9. **Assembly notes** — joins, transitions, audio in post.

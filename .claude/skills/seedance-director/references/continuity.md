# Continuity

The model remembers nothing between generations. Continuity is carried by
three things only: the same reference files, the same words, and a ledger of
states. Registry and reference-sheet discipline come from
`../../character-consistency/`; this file adds the ledger and the
Seedance-specific wiring.

## 1. Asset registry (before the first generation)

| ID | Type | Frozen description (≤ 120 words, observable facts only) | Never | Files → default tag |
|---|---|---|---|---|
| `MARA-01` | character | 34, sharp jaw, copper jaw-length bob parted left, lean; olive bomber jacket, black t-shirt, dark jeans, white sneakers; small silver hoops; faint scar through left eyebrow | long hair, brown jacket, glasses | `mara_front.png` → identity |
| `KEY-01` | prop | brass skeleton key, 7 cm, round bow, two teeth | silver, modern key | `key.png` → prop |
| `ROOF-01` | location | flat gravel rooftop, knee-high parapet on the north side, one steel vent left of centre, city lights beyond | railings, furniture | `roof_wide.png` → location |

- A wardrobe or look change is a new version (`MARA-02`), never an edit in
  place. Earlier shots keep citing the old ID.
- IDs are for the plan. In the prompt, use the character's name plus the
  tag: `MARA from @Image1`.

## 2. How identity is carried, by mode

| Mode | Identity comes from | In the prompt |
|---|---|---|
| T2V | Words only | Paste the frozen description verbatim, every time |
| I2V / FLF | The frame | Do not re-describe; list anchors in `Preserve:` |
| R2V / V2V | Identity image | `NAME from @ImageN`; anchors in `Preserve:`; no paraphrased face description |
| Edit / Extend | The source clip | `Preserve:` names what must not change |

The same identity file is attached to **every** generation the character
appears in. Tag numbers follow upload order, so they may change between
generations — re-map them in each shot package rather than assuming
`@Image1` is always the lead.

## 3. Continuity ledger (one row per shot)

| Shot | Characters · wardrobe version | Props: state and which hand | Position in frame · facing | Screen direction | Eyeline | Light: source · direction · time | Start state | End state | Must match next |
|---|---|---|---|---|---|---|---|---|---|
| S01 | MARA-01 | KEY-01 in jacket pocket | frame left, facing right | enters L→R | toward parapet | sodium street glow from below, night, wet gravel | walking in | stopped at parapet, both hands on ledge | hands on ledge; hood down; hair wet |
| S02 | MARA-01 | KEY-01 right hand, held low | centre, facing camera | static | down at key | same | hands on ledge | key in closed right fist | fist closed, right hand |

Rules:

- **End state of N = start state of N+1**, written in the same words.
- **Plan vs. actual.** After a take is accepted, overwrite the planned end
  state with what the last frame really shows. Rejected takes never enter
  the ledger.
- **Accumulating state** (rain-soaked hair, a torn sleeve, a lit cigarette,
  a wound) is tracked from the shot where it starts and restated in every
  later shot's `Preserve:` line.
- **The 180° line.** Record which side of the action line the camera is on.
  A shot that crosses it needs a neutral shot or a visible move across.
- **Counts are contracts.** People, vehicles, stalls, candles: state the
  number in the prompt and in `Preserve:`.
- **Scene boundary.** New location or time of day resets light, position
  and extension depth. Re-anchor from the canonical reference files, not
  from the previous clip's last frame.

## 4. Joining shots

| Join type | Technique |
|---|---|
| Continuous action across a cut | Export the accepted clip's last frame → use as the next shot's first frame (I2V). Strongest continuity available. |
| Same scene, new angle | R2V with the same identity and location files; restate wardrobe, props-in-hand and light in `Preserve:`. |
| Lengthening a shot | Extend (see `modes-and-references.md`). Max two chained extensions, then re-anchor. |
| Time or place jump | Fresh generation from canonical references. Write the transition in the shot list, perform it in the edit. |

In Seedance 2.5 multi-shot generations, the ledger still applies *inside*
the prompt: each timed shot line states position and prop state when they
change, and the header carries the anchors once.

## 5. The Preserve line

Short, specific, ordered by drift risk:

```text
Preserve: MARA's face, copper bob and olive jacket from @Image1; brass key in her right hand; wet hair; she stays frame left facing right; one steel vent behind her; sodium light from below.
```

Six items at most. A `Preserve:` line that lists everything protects
nothing.

## 6. Drift repair

| Symptom | First change to try (one at a time) |
|---|---|
| Face changes | Shorten the clip; closer framing; re-attach identity image; reduce subject motion and let the camera move instead |
| Wardrobe changes | Add the garment and colour to `Preserve:`; add a wardrobe reference with a wardrobe-only role |
| Prop vanishes or swaps hands | Keep the hand occupied and named in every beat; shorten |
| Position or direction flips | State frame side and facing in the first sentence; add `exits frame right` |
| Location changes | Use a location image, or I2V from a location-locked keyframe; add `no scene change` |
| Light shifts between shots | Name source and direction identically in both prompts; do not rely on a mood word |
| Extra people | State the count; tighten framing; add `no additional people` |

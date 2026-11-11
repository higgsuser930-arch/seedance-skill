#!/usr/bin/env python3
"""Lint a Seedance prompt against the seedance-director rules.

Stdlib only. Reads the prompt from a file argument or stdin.

  python3 lint_prompt.py --version 2.5 --mode r2v --duration 8 \
      --images 2 --videos 1 --audio 0 prompt.txt
  python3 lint_prompt.py --self-test

Exit code 0 = no errors (warnings allowed), 1 = errors, 2 = bad usage.
"""
import argparse
import re
import sys

LIMITS = {
    "2.0": {"duration": (4, 15), "images": 9, "videos": 3, "audio": 3, "total": 12},
    "2.5": {"duration": (4, 30), "images": 30, "videos": 10, "audio": 10, "total": 50},
}
MODES = ("t2v", "i2v", "flf", "r2v", "v2v", "edit", "extend")
# (min, max) words; multi-shot 2.5 prompts get the larger ceiling.
WORD_BUDGET = {
    "t2v": (40, 120), "i2v": (20, 70), "flf": (20, 80), "r2v": (40, 120),
    "v2v": (30, 110), "edit": (15, 80), "extend": (20, 90),
}
MULTISHOT_MAX = {"2.0": 130, "2.5": 260}
FILLER = [
    "cinematic", "epic", "beautiful", "stunning", "masterpiece", "breathtaking",
    "amazing", "awesome", "gorgeous", "professional", "high quality",
    "ultra-detailed", "ultra detailed", "hyper-realistic", "award-winning",
]
SETTINGS_WORDS = [r"\b[48]k\b", r"\b(480|720|1080|2160)p\b", r"\b\d{2,3}\s?fps\b"]
SPEED_WORDS = [r"\bfast-paced\b", r"\brapid(ly)?\b", r"\bfast\b"]
INNER_STATE = [r"\bfeels?\b", r"\brealizes?\b", r"\bremembers?\b", r"\bthinks?\b"]
CAMERA_MOVES = [
    "push-in", "push in", "pull-back", "pull back", "pull-out", "pull out",
    "dolly", "pan ", "pans ", "tilt", "tracking", "tracks ", "orbit", "arc ",
    "crane", "boom", "zoom", "whip", "handheld", "fpv",
]
TAG = re.compile(r"@(Image|Video|Audio)(\d+)\b")
LOOSE_TAG = re.compile(r"@([A-Za-z_]+\d*)")
STAMP = re.compile(r"\[(\d{1,2}):(\d{2})\s*[-–—]\s*(\d{1,2}):(\d{2})\]")
ROLE_WORDS = re.compile(
    r"\b(is|as|for|from|provides?|supplies|of|following|performs?|matching|to)\b", re.I)


def lint(text, version, mode, duration, images, videos, audio):
    errors, warnings = [], []
    lim = LIMITS[version]
    lo, hi = lim["duration"]

    # --- settings vs version limits
    if not lo <= duration <= hi:
        errors.append(f"duration {duration}s outside Seedance {version} range {lo}-{hi}s")
    for kind, n in (("images", images), ("videos", videos), ("audio", audio)):
        if n > lim[kind]:
            errors.append(f"{n} {kind} exceeds Seedance {version} limit of {lim[kind]}")
    if images + videos + audio > lim["total"]:
        errors.append(f"{images + videos + audio} files exceeds Seedance {version} total of {lim['total']}")

    # --- mode vs assets
    need = {"i2v": (images >= 1, "at least one image (the first frame)"),
            "flf": (images >= 2, "two images (first and last frame)"),
            "r2v": (images + videos + audio >= 1, "at least one reference file"),
            "v2v": (videos >= 1, "a reference video"),
            "edit": (videos >= 1, "the source video"),
            "extend": (videos >= 1 or version == "2.5", "the source video")}
    if mode in need and not need[mode][0]:
        errors.append(f"mode {mode} needs {need[mode][1]}")
    if mode == "t2v" and images + videos + audio:
        warnings.append("mode is t2v but reference files are declared; use i2v/r2v or drop the files")

    # --- tags
    declared = {"Image": images, "Video": videos, "Audio": audio}
    used = {}
    for kind, idx in TAG.findall(text):
        used.setdefault(kind, set()).add(int(idx))
    for raw in LOOSE_TAG.findall(text):
        if not re.fullmatch(r"(Image|Video|Audio)\d+", raw):
            errors.append(f"non-canonical tag @{raw}; use @Image1 / @Video1 / @Audio1")
    for kind, count in declared.items():
        for i in sorted(used.get(kind, ())):
            if i < 1 or i > count:
                errors.append(f"@{kind}{i} is used but only {count} {kind.lower()} file(s) are declared")
        for i in range(1, count + 1):
            if i not in used.get(kind, ()):
                # 2.5 extension/edit modes take the source through the mode, not a tag
                if version == "2.5" and mode in ("extend", "edit") and kind == "Video":
                    continue
                errors.append(f"@{kind}{i} is uploaded but never tagged in the prompt")
    for kind, idxs in used.items():
        for i in idxs:
            tag = f"@{kind}{i}"
            first = text.find(tag)
            sentence = re.split(r"(?<=[.;\n])", text[first:first + 200])[0]
            if not ROLE_WORDS.search(sentence) and not ROLE_WORDS.search(text[max(0, first - 40):first]):
                warnings.append(f"{tag} has no clear role where it first appears")
    for i in sorted(used.get("Video", ())):
        if mode in ("r2v", "v2v") and not re.search(r"\b(ignore|only)\b", text, re.I):
            warnings.append(f"@Video{i}: say what to take and what to ignore (e.g. 'camera-movement reference only; ignore its subject')")
            break

    # --- timestamps
    stamps = [(int(a) * 60 + int(b), int(c) * 60 + int(d)) for a, b, c, d in STAMP.findall(text)]
    if stamps:
        if stamps[0][0] != 0:
            errors.append("timestamps must start at 00:00")
        for (s, e), nxt in zip(stamps, stamps[1:] + [None]):
            if e <= s:
                errors.append(f"timestamp range {s}-{e}s is empty or reversed")
            elif e - s > 5:
                warnings.append(f"range {s}-{e}s is longer than 5s; split it")
            elif e - s < 2:
                warnings.append(f"range {s}-{e}s is shorter than 2s; merge it")
            if nxt and nxt[0] != e:
                errors.append(f"timestamps not contiguous: {e}s then {nxt[0]}s")
        if stamps[-1][1] != duration:
            errors.append(f"timestamps end at {stamps[-1][1]}s but duration is {duration}s")
        if version == "2.0" and len(stamps) > 3:
            warnings.append(f"{len(stamps)} timed ranges on 2.0; keep to 3 or split into separate generations")
        if version == "2.5" and len(stamps) > 6:
            warnings.append(f"{len(stamps)} timed ranges; keep to 6 per generation")
    elif duration > 6 and mode not in ("edit",):
        warnings.append(f"{duration}s clip with no timestamps; add [MM:SS-MM:SS] beats")
    if re.search(r"\d+\s?[-–]\s?\d+\s?s\b|(?<!\[)\b\d:\d{2}\s?[-–]\s?\d:\d{2}(?!\])", text):
        warnings.append("non-canonical timestamp format; use [MM:SS-MM:SS]")

    # --- language
    low = text.lower()
    for w in FILLER:
        if re.search(r"\b" + re.escape(w) + r"\b", low):
            warnings.append(f"filler word '{w}': replace with something visible")
    for pat in SETTINGS_WORDS:
        m = re.search(pat, low)
        if m:
            warnings.append(f"'{m.group(0)}' is a generation setting; remove it from the prompt body")
    for pat in SPEED_WORDS:
        m = re.search(pat, low)
        if m:
            warnings.append(f"'{m.group(0)}' causes jitter on a whole shot; slow it or apply to one named element")
            break
    for pat in INNER_STATE:
        m = re.search(pat, low)
        if m:
            warnings.append(f"inner state '{m.group(0)}': describe visible behaviour instead")
            break
    if re.search(r"[\u4e00-\u9fff\u3040-\u30ff]", text):
        warnings.append("non-English text found; final prompts are English")

    # --- structure
    if not re.search(r"^\s*Preserve:", text, re.M):
        (errors if images + videos else warnings).append("missing 'Preserve:' line")
    avoid = re.search(r"^\s*Avoid:(.*)$", text, re.M)
    if not avoid:
        errors.append("missing 'Avoid:' line")
    else:
        items = [x for x in re.split(r"[,;]", avoid.group(1)) if x.strip()]
        if len(items) > 8:
            warnings.append(f"{len(items)} items in Avoid:; keep the 3-8 that match this shot's risks")
    if mode != "edit" and not re.search(r"\b(camera|static|locked)\b", low) and not any(m in low for m in CAMERA_MOVES):
        warnings.append("no camera instruction; state shot size, angle and one movement (or 'static camera')")

    # camera moves stacked in one sentence
    for sentence in re.split(r"(?<=[.\n])", text):
        hits = {m.strip() for m in CAMERA_MOVES if m in sentence.lower()}
        if len(hits) >= 3 or re.search(r"\bwhile (panning|tilting|zooming|orbiting|tracking)\b", sentence, re.I):
            warnings.append("several camera moves in one sentence; one move per timed range: " + sentence.strip()[:70])
            break

    # --- length
    words = len(re.findall(r"[A-Za-z0-9@'’-]+", STAMP.sub("", text)))
    wmin, wmax = WORD_BUDGET[mode]
    if len(stamps) >= 3:
        wmax = max(wmax, MULTISHOT_MAX[version])
    if words > wmax:
        warnings.append(f"{words} words; budget for {mode} on {version} is {wmin}-{wmax}")
    elif words < wmin:
        warnings.append(f"{words} words; under the {wmin}-word floor for {mode}, likely missing slots")

    return errors, warnings, words


GOOD = """@Image1 is MARA's identity. @Image2 is the location. @Video1 is camera-movement reference only; ignore its subject and setting.
MARA from @Image1 stands at the parapet of the rooftop in @Image2 at night, a brass key in her right hand.
Camera: medium close-up, eye level, following the slow push-in of @Video1.
[00:00-00:03] She looks down at the street, rain running off her hair.
[00:03-00:06] She opens her right hand and looks at the key.
[00:06-00:08] She closes her fist around it and lifts her chin. Hold.
Light: sodium street glow from below, cool rim from the skyline behind.
Audio: steady rain on gravel, distant traffic, no music.
Preserve: MARA's face, copper bob and olive jacket from @Image1; key in right hand; she stays frame left facing right.
Avoid: morphing face, extra fingers, additional people, readable text, camera shake, subtitles."""

BAD = """A beautiful cinematic 4k shot of a woman (@img1) who feels sad on a roof, fast-paced,
camera dolly in while panning right and zooming. 0-4s she walks. [00:00-00:04] walk [00:05-00:12] stop"""


def self_test():
    e, w, _ = lint(GOOD, "2.5", "r2v", 8, 2, 1, 0)
    assert not e, f"good prompt produced errors: {e}"
    assert not w, f"good prompt produced warnings: {w}"
    e, w, _ = lint(BAD, "2.0", "r2v", 10, 1, 0, 0)
    joined = " | ".join(e + w)
    for needle in ("non-canonical tag", "never tagged", "not contiguous", "end at 12s",
                   "missing 'Avoid:'", "missing 'Preserve:'", "filler word 'cinematic'",
                   "generation setting", "jitter", "inner state", "several camera moves",
                   "non-canonical timestamp"):
        assert needle in joined, f"bad prompt did not trigger: {needle}\n{joined}"
    e, _, _ = lint(GOOD, "2.0", "r2v", 20, 12, 1, 0)
    assert any("outside Seedance 2.0" in x for x in e) and any("exceeds" in x for x in e)
    e, _, _ = lint("Continue.\nPreserve: face.\nAvoid: cuts.", "2.5", "extend", 5, 0, 0, 0)
    assert not e, e
    print("lint_prompt self-test: PASS (4 cases)")
    return 0


def main():
    p = argparse.ArgumentParser(description="Lint a Seedance prompt (seedance-director rules).")
    p.add_argument("file", nargs="?", help="prompt file; stdin if omitted")
    p.add_argument("--version", choices=sorted(LIMITS), default="2.5")
    p.add_argument("--mode", choices=MODES, default="t2v")
    p.add_argument("--duration", type=int, default=5, help="seconds (for extend: the new portion)")
    p.add_argument("--images", type=int, default=0)
    p.add_argument("--videos", type=int, default=0)
    p.add_argument("--audio", type=int, default=0)
    p.add_argument("--self-test", action="store_true")
    a = p.parse_args()
    if a.self_test:
        return self_test()
    text = open(a.file, encoding="utf-8").read() if a.file else sys.stdin.read()
    if not text.strip():
        print("empty prompt", file=sys.stderr)
        return 2
    errors, warnings, words = lint(text, a.version, a.mode, a.duration, a.images, a.videos, a.audio)
    print(f"Seedance {a.version} | {a.mode} | {a.duration}s | {words} words")
    for e in errors:
        print(f"  ERROR  {e}")
    for w in warnings:
        print(f"  WARN   {w}")
    print(f"{len(errors)} error(s), {len(warnings)} warning(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())

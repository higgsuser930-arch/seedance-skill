#!/usr/bin/env python3
"""Verify the installed Seedance skill pack.

  python3 scripts/verify_skills.py                 # checks .claude/skills in this repo
  python3 scripts/verify_skills.py --dir ~/.claude/skills
  python3 scripts/verify_skills.py --write-manifest   # maintainers: re-record vendored hashes

Per skill it checks: SKILL.md exists, frontmatter has name + description,
name matches the folder, vendored files are byte-identical to what was
recorded at install time, local file references resolve, and bundled
scripts run. Stdlib only. Exit code 1 if any skill is not operational.
"""
import argparse
import hashlib
import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
MANIFEST = "vendor-manifest.json"
ORCHESTRATOR = "seedance-director"

# Upstream provenance. `own` = written in this repository.
SOURCES = {
    "seedance": ("jeurtr/seedance-skill", "9b12d582d6a18702edf399f3e4440d948e479d82", "MIT"),
    "seedance-forge": ("StreetJammer/seedance-forge", "90962bd25d31c7cbd6c8ae5cbae6acd4d3a651eb", "MIT (package.json)"),
    "cinematic-director": ("cajias/agentic-video-skills", "204cefd08bbb87fd4681f1f2b0dccbc444a978c1", "MIT; upstream wuwangzhang1216/DirectorSKILL"),
    "ai-video-storyboard": ("cajias/agentic-video-skills", "204cefd08bbb87fd4681f1f2b0dccbc444a978c1", "MIT stated in SKILL.md, no license file; upstream aicontentskills/ai-video-storyboard-skill"),
    **{n: ("svenkatreddy/universal-video-skills", "0c384d395290eaebf416e4bcfc4a7bb19b20aaac", "MIT") for n in (
        "video-prompt-craft", "cinematic-direction", "story-and-shots", "character-consistency",
        "dialogue-and-audio", "assembly-and-delivery", "model-adapters", "video-qa")},
    ORCHESTRATOR: ("own", None, "MIT"),
}
REQUIRED = sorted(SOURCES)

# References the upstream authors left dangling; reported, not counted as failure.
KNOWN_UPSTREAM_GAPS = {
    "ai-video-storyboard": {"references/shot-types.md", "references/camera-moves.md",
                            "references/lighting.md", "references/genre-templates.md"},
    "video-prompt-craft": {"../../examples/shot-brief.md"},
}

PATH_RE = re.compile(r"`([^`\s]+\.(?:md|py|csv|json|fountain))`|\]\(([^)#\s]+\.(?:md|py|csv|json))\)")


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def files_of(skill_dir):
    return sorted(p for p in skill_dir.rglob("*") if p.is_file() and "__pycache__" not in p.parts)


def frontmatter(text):
    if not text.startswith("---"):
        return None
    end = text.find("\n---", 3)
    if end < 0:
        return None
    block = text[3:end]
    out = {}
    for key in ("name", "description"):
        m = re.search(rf"^{key}:\s*(.*)$", block, re.M)
        if m:
            val = m.group(1).strip().strip("\"'")
            if val in (">-", ">", "|", "|-", ""):  # folded/literal scalar: take following indented lines
                tail = block[m.end():]
                val = " ".join(l.strip() for l in re.findall(r"^\s+\S.*$", tail.split("\n\n")[0], re.M))
            out[key] = val
    return out


def check_links(skill_dir, name):
    missing, known = [], []
    for md in skill_dir.rglob("*.md"):
        text = md.read_text(encoding="utf-8", errors="replace")
        text = re.sub(r"```.*?```", "", text, flags=re.S)  # ignore examples in code fences
        for a, b in PATH_RE.findall(text):
            ref = a or b
            if ref.startswith(("http", "/", "~", "$", "<")) or any(c in ref for c in "*{<[") or "/" not in ref:
                continue
            # project-workspace paths the skills tell the user to create
            if ref.split("/")[0] in ("assets", "script", "shots", "prompts", "refs", "looks", "sources",
                                     "edit", "grade", "audio", "exports", "node_modules", "templates") \
                    and not (skill_dir / ref).exists() and not (md.parent / ref).exists():
                if name != ORCHESTRATOR and ref.split("/")[0] != "assets":
                    continue
                if ref.split("/")[0] != "assets":
                    continue
            if (md.parent / ref).exists() or (skill_dir / ref).exists() or (skill_dir.parent / ref).exists():
                continue
            if ref in KNOWN_UPSTREAM_GAPS.get(name, ()):
                known.append(ref)
            else:
                missing.append(f"{md.relative_to(skill_dir)} -> {ref}")
    return sorted(set(missing)), sorted(set(known))


def run(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, timeout=120, **kw)


def script_checks(root):
    """Functional smoke tests. Returns {skill: [(label, ok, detail)]}."""
    res = {}

    def add(skill, label, ok, detail=""):
        res.setdefault(skill, []).append((label, ok, detail))

    py = sys.executable
    lint = root / ORCHESTRATOR / "scripts" / "lint_prompt.py"
    if lint.exists():
        r = run([py, str(lint), "--self-test"])
        add(ORCHESTRATOR, "lint_prompt.py --self-test", r.returncode == 0, (r.stdout + r.stderr).strip()[-120:])

    search = root / "seedance-forge" / "scripts" / "search.py"
    if search.exists():
        r = run([py, str(search), "rooftop rain", "--top", "3", "--json"])
        ok = False
        try:
            hits = json.loads(r.stdout)
            ok = r.returncode == 0 and len(hits) == 3 and all(h.get("sourceLink") for h in hits)
        except ValueError:
            pass
        add("seedance-forge", "search.py corpus query (3 hits with sourceLink)", ok, r.stderr.strip()[-120:])

    concat = root / "assembly-and-delivery" / "scripts" / "concat.py"
    sheet = root / "video-qa" / "scripts" / "contact_sheet.py"
    ident = root / "video-qa" / "scripts" / "identity_score.py"
    ffmpeg = shutil.which("ffmpeg")
    if concat.exists() or sheet.exists():
        if not ffmpeg:
            for s, p in (("assembly-and-delivery", concat), ("video-qa", sheet)):
                if p.exists():
                    r = run([py, str(p), "--help"])
                    add(s, f"{p.name} --help (ffmpeg not installed; full test skipped)", r.returncode == 0)
        else:
            with tempfile.TemporaryDirectory() as tmp:
                tmp = Path(tmp)
                for n in ("a", "b"):
                    run([ffmpeg, "-y", "-v", "error", "-f", "lavfi", "-i",
                         "testsrc=duration=2:size=320x240:rate=24", "-pix_fmt", "yuv420p", str(tmp / f"{n}.mp4")])
                if concat.exists():
                    r = run([py, str(concat), str(tmp / "a.mp4"), str(tmp / "b.mp4"), "-o", str(tmp / "m.mp4")])
                    add("assembly-and-delivery", "concat.py joins two clips",
                        r.returncode == 0 and (tmp / "m.mp4").exists(), (r.stdout + r.stderr).strip()[-120:])
                if sheet.exists():
                    r = run([py, str(sheet), str(tmp / "a.mp4"), "-o", str(tmp / "s.jpg"), "--n", "4"])
                    add("video-qa", "contact_sheet.py writes a sheet",
                        r.returncode == 0 and (tmp / "s.jpg").exists(), (r.stdout + r.stderr).strip()[-120:])
    if ident.exists():
        r = run([py, str(ident), "--help"])
        add("video-qa", "identity_score.py --help (scoring itself needs torch; optional)", r.returncode == 0)
    return res


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", default=str(REPO / ".claude" / "skills"))
    ap.add_argument("--write-manifest", action="store_true")
    a = ap.parse_args()
    root = Path(a.dir).expanduser().resolve()
    manifest_path = REPO / ".claude" / "skills" / MANIFEST

    if a.write_manifest:
        data = {"note": "sha256 of every vendored file as copied from upstream; verify_skills.py fails if one changes",
                "skills": {}}
        for name in REQUIRED:
            if name == ORCHESTRATOR:
                continue
            repo, commit, lic = SOURCES[name]
            d = root / name
            data["skills"][name] = {"source": f"https://github.com/{repo}", "commit": commit, "license": lic,
                                    "files": {str(p.relative_to(d)): sha(p) for p in files_of(d)}}
        manifest_path.write_text(json.dumps(data, indent=1) + "\n")
        print(f"wrote {manifest_path}")
        return 0

    manifest = json.loads(manifest_path.read_text())["skills"] if manifest_path.exists() else {}
    scripts = script_checks(root)
    rows, failed = [], 0
    names = {}
    for name in REQUIRED:
        d, problems, notes = root / name, [], []
        skill_md = d / "SKILL.md"
        if not skill_md.is_file():
            rows.append((name, "MISSING", ["no SKILL.md"], []))
            failed += 1
            continue
        fm = frontmatter(skill_md.read_text(encoding="utf-8"))
        if not fm or not fm.get("name") or not fm.get("description"):
            problems.append("frontmatter lacks name/description")
        else:
            if fm["name"] != name:
                problems.append(f"frontmatter name '{fm['name']}' != folder '{name}'")
            if fm["name"] in names:
                problems.append(f"duplicate skill name with {names[fm['name']]}")
            names[fm["name"]] = name
            if len(fm["description"]) < 40:
                problems.append("description too short to trigger reliably")
        if name in manifest:
            rec = manifest[name]["files"]
            changed = [f for f, h in rec.items() if not (d / f).is_file() or sha(d / f) != h]
            extra = [str(p.relative_to(d)) for p in files_of(d) if str(p.relative_to(d)) not in rec]
            if changed:
                problems.append(f"{len(changed)} vendored file(s) modified or missing: {', '.join(changed[:3])}")
            if extra:
                notes.append(f"{len(extra)} file(s) not in manifest")
            if not changed:
                notes.append(f"{len(rec)} files identical to upstream @{manifest[name]['commit'][:7]}")
        missing, known = check_links(d, name)
        if missing:
            (problems if name == ORCHESTRATOR else notes).append("unresolved reference(s): " + "; ".join(missing[:4]))
        if known:
            notes.append(f"{len(known)} reference(s) missing upstream (known gap)")
        for label, ok, detail in scripts.get(name, []):
            (notes if ok else problems).append(("ok: " if ok else "FAILED: ") + label + (f" [{detail}]" if not ok and detail else ""))
        status = "OPERATIONAL" if not problems else "BROKEN"
        failed += bool(problems)
        rows.append((name, status, problems, notes))

    stray = sorted(p.name for p in root.iterdir() if p.is_dir() and (p / "SKILL.md").exists() and p.name not in REQUIRED)
    print(f"Skill directory: {root}\n")
    for name, status, problems, notes in rows:
        src = SOURCES[name][0]
        print(f"[{status:<11}] {name:<24} ({'this repo' if src == 'own' else src})")
        for p in problems:
            print(f"      ! {p}")
        for n in notes:
            print(f"      - {n}")
    if stray:
        print(f"\nOther skills present (not part of this pack): {', '.join(stray)}")
    print(f"\n{len(rows) - failed}/{len(rows)} skills operational")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env bash
# Install the Seedance skill pack into a Claude Code skills directory.
#
#   ./scripts/install-skills.sh                    # -> ~/.claude/skills (all projects)
#   ./scripts/install-skills.sh --project ~/film   # -> ~/film/.claude/skills
#   ./scripts/install-skills.sh --target DIR       # -> DIR
#   ./scripts/install-skills.sh --link             # symlink instead of copy
#
# Inside this repository nothing needs installing: Claude Code discovers
# .claude/skills/ automatically. Use this to make the pack available elsewhere.
# Do not install globally AND keep working inside this repo with the same
# pack, or every skill is listed twice.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$ROOT/.claude/skills"
TARGET="${HOME}/.claude/skills"
MODE="copy"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project) TARGET="$(cd "${2:?--project needs a path}" && pwd)/.claude/skills"; shift 2 ;;
    --target)  TARGET="${2:?--target needs a path}"; shift 2 ;;
    --link)    MODE="link"; shift ;;
    -h|--help) sed -n '2,12p' "$0"; exit 0 ;;
    *) echo "unknown argument: $1" >&2; exit 2 ;;
  esac
done

mkdir -p "$TARGET"
TARGET="$(cd "$TARGET" && pwd)"
if [[ "$TARGET" == "$SRC" ]]; then
  echo "Target is the pack itself; nothing to do." >&2; exit 0
fi

n=0
for skill in "$SRC"/*/; do
  [[ -f "$skill/SKILL.md" ]] || continue
  name="$(basename "$skill")"
  rm -rf "${TARGET:?}/$name"
  if [[ "$MODE" == "link" ]]; then ln -s "${skill%/}" "$TARGET/$name"; else cp -R "${skill%/}" "$TARGET/$name"; fi
  echo "  + $name"
  n=$((n + 1))
done
echo "Installed $n skill(s) into $TARGET"
echo "Verify with: python3 $ROOT/scripts/verify_skills.py --dir $TARGET"

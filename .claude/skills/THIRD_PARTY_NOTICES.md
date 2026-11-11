# Third-Party Notices

The skills in this directory other than `seedance-director` are vendored,
byte-for-byte, from the repositories below. Their content was not edited;
`vendor-manifest.json` records a SHA-256 for every file and
`scripts/verify_skills.py` fails if one changes. License and attribution
files were copied alongside where upstream ships them.

| Skill folder(s) | Source | Commit | License |
|---|---|---|---|
| `seedance` | https://github.com/jeurtr/seedance-skill | `9b12d58` | MIT (`seedance/LICENSE`) |
| `seedance-forge` | https://github.com/StreetJammer/seedance-forge | `90962bd` | MIT, as declared in upstream `package.json`; no license file upstream. The prompt corpus (`references/seedance-prompts.csv`) is community-authored; each row carries its `sourceLink` and author — credit the source when echoing a prompt's structure |
| `cinematic-director` | https://github.com/cajias/agentic-video-skills (`plugins/cinematic-director`), itself vendored from wuwangzhang1216/DirectorSKILL | `204cefd` | MIT (`cinematic-director/LICENSE`) |
| `ai-video-storyboard` | https://github.com/cajias/agentic-video-skills (`plugins/ai-video-storyboard`), itself vendored from aicontentskills/ai-video-storyboard-skill | `204cefd` | Upstream ships no license file; its `SKILL.md` states "MIT — use freely". See `ai-video-storyboard/ATTRIBUTION.md` |
| `video-prompt-craft`, `cinematic-direction`, `story-and-shots`, `character-consistency`, `dialogue-and-audio`, `assembly-and-delivery`, `model-adapters`, `video-qa` | https://github.com/svenkatreddy/universal-video-skills (`skills/`) | `0c384d3` | MIT (`LICENSE` in each folder) |
| `seedance-director/assets/cinema-skills-templates/` | https://github.com/DenisHumen/cinema-skills (`templates/`) | `0ea4971` | MIT (`LICENSE` in that folder) |

Files added next to vendored content (not part of upstream skill folders):
`NOTICE.agentic-video-skills` in the two cajias-sourced skills (upstream's
repo-level NOTICE), and `LICENSE` in the eight universal-video-skills folders
(upstream's repo-level LICENSE).

Not installed, and why: see
`seedance-director/references/skill-map-and-conflicts.md`.

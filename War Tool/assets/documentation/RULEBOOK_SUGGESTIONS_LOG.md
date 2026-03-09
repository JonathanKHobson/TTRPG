# Rulebook Suggestions Log

Purpose:
- Record simulator-driven rulebook recommendations without editing the master rulebook directly.
- Keep future rulebook parity work traceable to simulator behavior and planning decisions.

Status vocabulary:
- `Proposed`
- `Accepted for future rulebook`
- `Implemented in simulator`
- `Closed`

## Entry template

### `RSG-XXX` - Title

- **Date:** YYYY-MM-DD
- **Source of truth:** file(s) and section(s)
- **Current simulator behavior:** what the app or current planning lane says
- **Suggested rulebook wording:** proposed rulebook language
- **Rationale:** why this should eventually be reflected in the rulebook
- **Status:** one of the statuses above

---

## Entries

### `RSG-001` - Three-pool vocabulary alignment

- **Date:** 2026-03-08
- **Source of truth:** `fantasy-war-sim-help-wiki.html`; `assets/documentation/README_War_Table_v3_Dev_Guide.md`
- **Current simulator behavior:** The simulator documents and supports `threePool` language: `Total dice -> Usable dice -> Dice to roll`.
- **Suggested rulebook wording:** Introduce the same three-pool vocabulary in the strategic battle procedure so the simulator and rulebook describe the same battle flow.
- **Rationale:** Current simulator language is more explicit than the master rulebook on how pool stages differ. Future rulebook updates should match the shipped simulator vocabulary.
- **Status:** `Implemented in simulator`

### `RSG-002` - Quality tags derived from Total dice

- **Date:** 2026-03-08
- **Source of truth:** `Fantasy-War-Sim_Three-Pool-Calibration-PRD.md`
- **Current simulator behavior:** The simulator now derives army quality tags from `Total dice from Size + STR` and shows them in Battle setup and saved Armies views.
- **Suggested rulebook wording:** Add a player-facing quality band system tied to `Total dice` only: `Squalid` through `Mythical`.
- **Rationale:** This creates a stable bridge between battle readability, army scale, and future simulator warnings.
- **Status:** `Implemented in simulator`

### `RSG-003` - Class ceiling language

- **Date:** 2026-03-08
- **Source of truth:** `Fantasy-War-Sim_Three-Pool-Calibration-PRD.md`
- **Current simulator behavior:** The simulator now enforces class-specific quality ceilings as pre-battle blocks for Rebels, Bandits, Thieves, and other Standard classes.
- **Suggested rulebook wording:** Add explicit quality ceilings for certain army classes and clarify that armies above those thresholds are outside standard battle scale for those classes.
- **Rationale:** Current rules mention quality ceilings in places, but the planned simulator behavior needs cleaner, enforceable language.
- **Status:** `Implemented in simulator`

### `RSG-004` - Supply-strain warning language for oversized armies

- **Date:** 2026-03-08
- **Source of truth:** `Fantasy-War-Sim_Three-Pool-Calibration-PRD.md`
- **Current simulator behavior:** The simulator now shows advisory Supply-strain warnings beginning at `Very Wealthy`, without applying Supply mechanics.
- **Suggested rulebook wording:** Add GM-facing and player-facing guidance that exceptionally large hosts may strain Supply in campaign play, even before a formal Supply-meter mechanic is in use.
- **Rationale:** This lets the rules communicate that oversized armies carry campaign consequences, not just battlefield upside.
- **Status:** `Implemented in simulator`

### `RSG-005` - Standard battle-scale guidance

- **Date:** 2026-03-08
- **Source of truth:** `Fantasy-War-Sim_Three-Pool-Calibration-PRD.md`; `fantasy-war-sim-help-wiki.html`
- **Current simulator behavior:** The simulator now surfaces battle-scale guidance directly through quality tags, oversized-host warnings, and battle-start ceiling blocks tied to `Total dice`.
- **Suggested rulebook wording:** Clarify the standard intended battle scale for the default system and explain that very large hosts should be treated as unusual, split, or otherwise managed outside the baseline expectations.
- **Rationale:** This improves modifier visibility and prevents the rulebook from implying a broader default numeric space than the simulator is meant to support comfortably.
- **Status:** `Implemented in simulator`

# Fantasy War Sim Three-Pool Calibration Roadmap

Updated: March 8, 2026  
Lane status: planning baseline preserved; phase 1 and phase 2 simulator work now shipped

This roadmap is the staged execution order for the next planning and implementation lane around three-pool calibration, quality tags, class ceilings, and future-facing Supply warnings.

This is **not** the shipped implementation log. It remains the planning baseline for the lane, even after the first implementation slice landed.

Related planning docs:
- `Fantasy-War-Sim_Three-Pool-Calibration-PRD.md`
- `assets/documentation/RULEBOOK_SUGGESTIONS_LOG.md`
- `assets/documentation/WAR_TABLE_v3_STABILIZATION_TICKET_LOG.md`
- `assets/documentation/WAR_TABLE_v3_STABILIZATION_CHANGE_LOG.md`

## Delivery rules

- No changes to `fantasy-war-sim.html` in this planning lane.
- No direct edits to the master rulebook markdown in this planning lane.
- The implemented-behavior dev guide remains implementation truth only.
- All simulator-driven rulebook recommendations go through the suggestions log first.
- User-facing language must stay plain-language and action-oriented.

## Problem framing

The simulator already has a valid `threePool` architecture:
- `Total dice`
- `Usable dice`
- `Dice to roll`

The next lane is not about changing that structure. It is about:
- clarifying army budget expectations
- making quality visible
- defining class ceilings
- introducing future-facing Supply-strain warnings
- reducing player confusion in compact UI labels

## Phase 0 - Planning and language lock

### Goals

- Lock the planning package before any code changes.
- Confirm the quality-tag mapping from `Total dice`.
- Confirm class ceiling behavior as pre-battle block, not save-time block.
- Confirm `Very Wealthy+` warning language.
- Confirm the documentation workflow for simulator-to-rulebook parity.

### In scope

- PRD / dev handoff
- suggestions log
- planning ticket section
- planning change-log section
- front-door doc links

### Out of scope

- simulator code
- CSS
- rulebook edits
- Supply mechanics

### Risks

- planning language drifts from current simulator truth
- warning copy becomes too technical
- quality tags are mistaken for lore-only flavor

### Exit criteria

- planning artifacts exist and cross-link cleanly
- quality thresholds are fully specified
- class ceilings are fully specified for the first implementation pass
- future warning text is approved for use in later UI work

## Phase 1 - Quality-tag and warning logic

### Goals

- Compute quality tags from `Total dice from Size + STR`
- Surface the tags in the simulator
- Surface `Very Wealthy+` warnings without adding Supply mechanics

### In scope later

- quality-tag display
- warning display
- help/wiki wording updates where needed

### Out of scope later

- battle blocking
- Supply-meter rules
- master rulebook changes

### Risks

- quality tags clutter the UI
- warnings overwhelm players when they are only advisory

### Exit criteria

- tags are derived from `Total dice` only
- warnings do not change battle math
- tags and warnings are visible and understandable in UX review

## Phase 2 - Pre-battle ceiling enforcement

### Goals

- Enforce class ceilings at battle start
- Preserve edit/save flows
- Give clear corrective guidance

### In scope later

- pre-battle validation
- block message copy
- compatibility with current battle-start flow

### Out of scope later

- army editing restrictions
- auto-splitting armies
- Supply mechanics

### Risks

- blocks feel arbitrary
- users think armies are corrupted rather than out of bounds

### Exit criteria

- battle start is blocked only when a ceiling is exceeded
- save/edit flows remain intact
- messages tell the player how to fix the issue

## Phase 3 - UI wording and badge cleanup

### Goals

- Make compact battle labels clearer
- Keep technical truth in detailed views
- Reduce confusion between the three pools

### Candidate compact terms

- `Battle dice` for current `Usable dice`
- `Roll dice` for current `Dice to roll`
- `Roll cap` for current `Dice to roll cap`

### Risks

- shorter wording hides meaning
- detailed help and compact labels drift apart

### Exit criteria

- compact labels are shorter and clearer
- detailed help still explains `Total dice -> Usable dice -> Dice to roll`
- wording is consistent across battle card, help wiki, and summaries

## Phase 4 - Simulator-rulebook parity follow-up

### Goals

- convert accepted simulator planning decisions into rulebook-ready suggestions
- prepare future rulebook editing work from the suggestions log

### In scope later

- parity review
- suggestion status updates
- rulebook edit candidates for a later lane

### Out of scope later

- direct edits in this lane

### Risks

- simulator behavior changes faster than parity review
- rulebook wording lags the app again

### Exit criteria

- accepted simulator behaviors have corresponding suggestions-log entries
- future rulebook edit work can be planned cleanly from the log

## Initial implementation tickets for the future coding lane

| Ticket | Scope | Priority | Status | Notes |
| --- | --- | --- | --- | --- |
| WT-131 | PRD and planning package | P0 | Drafted | Planning artifact set for this lane |
| WT-132 | Rulebook suggestions log | P0 | Drafted | Seed parity entries before implementation |
| WT-133 | Quality-tag mapping spec | P0 | Ready for implementation | Map `Total dice` to `Squalid -> Mythical` |
| WT-134 | Class ceiling enforcement spec | P0 | Ready for implementation | Pre-battle block, not save-time block |
| WT-135 | Supply-strain warning UX spec | P1 | Ready for implementation | `Very Wealthy+` language only, mechanics later |
| WT-136 | Badge and terminology cleanup spec | P1 | Planned | Compact label review and UX cleanup |
| WT-137 | Regression and rollout plan | P0 | Planned | Preserve current `threePool` truth while adding the new layer |

## Notes for the later coding phase

- Do not reopen the basic `threePool` architecture without new evidence.
- Treat `Total dice` as the only source for quality tagging.
- Treat Supply warnings as language before mechanics.
- Keep planning docs and implemented-behavior docs separate.

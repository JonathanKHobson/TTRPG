# Fantasy War Sim Army Logic Stabilization Roadmap

Updated: March 8, 2026
Build target: `2026-03-08-army-logic-p2`

This roadmap is the living execution order for the army-logic stabilization pass. The execution logs remain:
- `assets/documentation/WAR_TABLE_v3_STABILIZATION_TICKET_LOG.md`
- `assets/documentation/WAR_TABLE_v3_STABILIZATION_CHANGE_LOG.md`
- `assets/documentation/WAR_TABLE_v3_IMPLEMENTATION_DRIFT_LOG.md`

## Delivery Rules

- One micro-ticket at a time.
- P0 must stay green locally before any P1 work opens.
- Hosted parity remains blocked until `WAR_TABLE_HOSTED_URL` is available, unless an explicit local-only continuation waiver is recorded in the drift log.
- No new UI, no schema uplift, no persistent per-army runtime state.

## Current Lane

- Active lane: local army-logic stabilization is complete through the optional P2 Fire Cult / nearby-action pass under an explicit hosted-parity waiver.
- Local regression status: full `chromium-local` Playwright suite green on March 8, 2026.
- Hosted regression status: still blocked in this workspace because `WAR_TABLE_HOSTED_URL` is not set.

## Ticket Queue

| Ticket | Scope | Priority | Status | Notes |
| --- | --- | --- | --- | --- |
| WT-119 | Baseline, roadmap, seeded logs, build-label refresh | P0 | Fixed | Added this roadmap, seeded logs, confirmed local build label, recorded hosted-parity block. |
| WT-120 | Bandits hidden attack bonus | P0 | Fixed | Attacker-only hidden bonus now lives in direct context and is blocked by enemy intel. |
| WT-121 | Gunners mixed-die loadout | P0 | Fixed | Mixed dice now share a common class-dice-shape helper with deterministic threshold coverage. |
| WT-122 | Vampire sunlight parity | P0 | Fixed | Direct sunlight still penalizes battle math and now also persists post-battle STR loss with visible reporting. |
| WT-123 | Snow Elves / Fire Cult bespoke riders | P0 | Fixed | Narrow opponent-specific rider layer added without changing generic matchup parsing. |
| WT-124 | Hel’s Legion doubled-loss rule | P0 | Fixed | Post-resolution loss amplification now uses pre-round size snapshots and visible reporting. |
| WT-125 | Undead victory growth | P1 | Fixed | Uses the existing post-resolution helper, pre-round snapshots, and additive `specialEffects` reporting. |
| WT-126 | Fiends conversion | P1 | Fixed | End-of-battle `d6` conversion now respects lost-units gating plus enemy Fiends resistance/immunity checks. |
| WT-127 | Transparency pass | P1 | Fixed | Pool summaries now surface matchup, doctrine, phenomena, nearby, and post-battle class effects in result, War Report, and history. |
| WT-128 | Fire Cult weather-lock spike | P1 | Fixed | Fire Cult now normalizes pre-battle weather and clamps post-battle drift into the `CLEAR` / `DRY` / `HEAT` lane without reordering weather flow or adding UI. |
| WT-129 | Shield-Brethren narrow parity follow-up | P2 | Fixed | Defender-side city/fort/choke bulwark is now direct-context math; nearby aura remains manual support; represented surprise immunity is enforced. |
| WT-130 | Nearby-action parity audit / polish | P2 | Fixed | Nearby actions are now regression-covered; defender-only hinder actions key off source-side role, and the remaining audited nearby paths are confirmed or explicitly deferred. |

## P0 Exit Criteria

- Direct-context parity still passes for Rebels, Forest Fey, and Pikes.
- Bandits, Gunners, Vampires, Snow Elves, Fire Cult, and Hel’s Legion have deterministic regression coverage.
- Root README and dev guide match the shipped build.
- Hosted parity gap remains logged until a hosted URL is available, even though local continuation has been explicitly waived through WT-130.

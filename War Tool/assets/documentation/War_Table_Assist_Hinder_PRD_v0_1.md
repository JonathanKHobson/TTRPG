# War Table — Assist / Hinder System PRD (v0.1)
**Status:** Draft  
**Date:** 2026-03-05  
**Owner:** Kyle (Product / UX)  
**Surface:** Web (War Table tool)  
**Primary references (local path):**  
- `/Users/jonathanhobson/Downloads/War Tool ChatGPT/assets/documentation/War_Encounter_Rules_Reformatted_v2.md`  
- `/Users/jonathanhobson/Downloads/War Tool ChatGPT/assets/documentation/Assist_Hinder_Rules_Extraction_v0_1.md`  

---

## 1. One-liner
Add a **Nearby Armies Assist / Hinder** system that lets the GM select **saved armies** as nearby allies/enemies and automatically applies **rules-authored proximity/conditional modifiers** to the battle’s dice math, with clear breakdown visibility.

> **Decision for this PRD:** No broad “generic help rule.” Only implement **specific rules that already exist** in the ruleset.

---

## 2. Background & Context
War Table currently resolves battles primarily from:
- Army class base dice math (Size + STR)
- Matchup modifiers (immunity/resistance/vulnerability/deadly)
- Weather/time/structures conditions
- Doctrines (augment doctrines, including mage-specific doctrines)

However, the ruleset contains multiple **case-specific support and interference mechanics** where **nearby units** (or units in the same location) alter:
- ally dice pools (buffs)
- enemy dice pools (debuffs)
- the dice roll itself (remove lowest/highest die)
- STR or Size (indirectly changing dice pools)

This PRD defines how to model those mechanics as a cohesive feature without adding a universal “any nearby army can help” rule.

---

## 3. Goals & Non-goals

### 3.1 Goals (must achieve)
1. Support selecting **nearby ally armies** (Assist) and **nearby enemy armies** (Hinder) for each side.
2. Apply **rules-authored proximity/conditional effects** that change the battle outcome (dice pool, die manipulation, STR/Size adjustments).
3. Keep MVP buildable: **dice math only** (no movement simulation; no terrain-speed system).
4. Provide a readable dice breakdown that shows **which nearby army caused which change**.
5. Persist assist/hinder selections into battle history so outcomes are reproducible.

### 3.2 Non-goals (explicitly out of scope for v0.1)
- No universal “Help” rule (future optional).
- No movement tracking (no speed/terrain movement costs).
- No complex spatial map UI.
- No automated “distance calculation” between armies (GM will set range/relationship).
- No trade doctrine systems.

---

## 4. User segments / personas
| Persona | Context | Needs | Primary actions |
|---|---|---|---|
| GM / Campaign Runner | Live session, fast decisions | Speed + clarity | Add nearby armies quickly, run battle, trust the math |
| Power user | Repeated use | Efficiency | Reuse saved armies as assistants, minimal clicks |
| Learner / Rules-reader | Learning mechanics | Explainability | See *why* dice changed (but not drown in text) |
| Accessibility user | Keyboard-only / assistive tech | Operable UI | Add/remove assistants and run battle without mouse |

---

## 5. Scope of rules to implement (Rules-as-written)
This scope is grounded in **Assist_Hinder_Rules_Extraction_v0_1.md**. For Phase 1, implement only the extracted rules that:
- explicitly reference **adjacent**, **within 1 space (5 miles)**, **within 2 spaces**, or **same location**, AND
- alter dice pools directly OR alter STR/Size in a way that changes dice pools.

### 5.1 MVP rule sources (P0 set)
**Assist / Hinder rules to implement in v0.1:**
- **Archers** — ally defense buff within 2 spaces; enemy defense debuff at 2 spaces (cavalry exception)
- **Mages** — Ward Screen (+2d6 ally defense within 1 space), Arcane Volley (-2d6 enemy defense; spies/assassins exception), and Anti-Magic suppression interaction
- **Shield-Brethren** — ally defensive aura within 1 space; choke/city/fort defensive debuff
- **Spies** — adjacent ally can remove lowest d6
- **Assassins** — adjacent enemy remove highest d6 (unseen)
- **Builders** — same-location siege prep (+1d6 next battle); repair removes -1d6 worth of penalties (GM-adjudicated)
- **Thieves** — STR transfer within 1 space (enemy -1d4 STR, thieves +1d4 STR)
- **Mel’s Army** — STR theft within 1 space (special hidden bonus); hidden attack bonus; “Spy benefit” adjacency effect
- **Forest Fey** — “restore +10 units” within 1 space (Size change); forest defense bonus (optional context field)
- **Rebels** — home defense +1d6 within 1 space (optional context field)
- **Pikes** — flanked-by-two-enemies penalty (-1d6) (optional multi-enemy context)

> Some of these require “context tags” (home territory, forest environment, choke point). This PRD includes a minimal way to represent context without introducing movement.

---

## 6. UX / UI Overview (Battle screen)

### 6.1 New UI sections (per side)
Add two panels under each army:
- **Nearby Allies (Assist)**
- **Nearby Enemies (Hinder)**

Each section:
- Lists selected nearby armies as **chips/cards** (name + class + key tags)
- Allows **Add** and **Remove**
- Each selected nearby army can optionally have an **active assist action** selector (if the army has multiple possible effects)

### 6.2 Selection source
**Phase 1:** choose from **saved armies only**  
**Phase 2:** allow “Create new army for assist” from within the picker (optional)

### 6.3 Range input (GM-provided)
For each nearby army, the user sets a “Range”:
- `Adjacent`
- `Within 1 space (5 miles)`
- `Within 2 spaces (10 miles)`
- `Same location`

This avoids building distance calculation and keeps the tool deterministic.

### 6.4 Context tags (minimal, optional but recommended)
Add a small “Battle Context” row in Conditions (or Assist panel) with checkboxes:
- `Home territory` (for Rebels)
- `Forest environment (Heartland)` (for Forest Fey / Treants rules if enabled later)
- `City/Fort/Choke point` (for Shield-Brethren bulwark debuff)
- `Hidden attacker` (for Mel’s Army / some stealth rules) — optional, but helps correctness

These are not “terrain movement.” They’re just context flags that already affect dice in the rules.

---

## 7. Data model (conceptual, implementation-agnostic)

### 7.1 Assist entry
Each side holds zero or more “assist entries” and “hinder entries”.

Minimum fields:
- `armyId` (ref to saved army)
- `side` (attacker|defender)
- `relationship` (assist|hinder)
- `range` (adjacent|1_space|2_spaces|same_location)
- `activeEffect` (optional; e.g., Mage chooses Ward Screen vs Arcane Volley)
- `notes` (optional; for GM)

### 7.2 Persistence
Must persist:
- on-screen state during session
- into battle history entries
- into export/import (existing JSON pattern)

---

## 8. Rules engine integration

### 8.1 When effects apply
Effects apply during **dice pool calculation** and/or during **roll resolution**:
- Dice pool modifiers: +Xd6 / -Xd6 / die-step changes
- Roll modifiers: remove lowest/highest die
- STR/Size modifiers: adjust derived dice pool (must log why)

### 8.2 Stacking rules
Unless explicitly capped by a rule, effects stack additively.
To reduce runaway stacking in v0.1, add a **guardrail cap**:
- Default cap: **max ±6 dice from Assist/Hinder sources per side per phase** (configurable in Settings)
- Roll-manipulation effects (remove lowest/highest) are separate from dice-count cap.

> This cap is a product guardrail for usability. If you don’t want caps, we can remove them, but stacking will get chaotic fast with multiple sources.

### 8.3 Anti-Magic interactions (doctrine + proximity)
Anti-Magic has explicit proximity suppression for Mage abilities in the rules.
Implementation requirement:
- If an enemy army with Anti-Magic is within `1_space`, **Mage assist actions do not apply** for that phase.
- Mage dice type changes against Anti-Magic are handled in the doctrine engine (already in doctrine scope), but Assist/Hinder must respect suppression.

---

## 9. Functional Requirements (FR) + Acceptance Criteria (AC)

### 9.1 Core UI + persistence
**FR-AH-001 (P0): Add/remove nearby armies (saved only)**
- As a GM, I can add saved armies as Nearby Allies/Enemies for either side.

**AC-AH-001**
- Given I am on the Battle page  
- When I click “Add Nearby Ally/Enemy”  
- Then I can pick from saved armies  
- And the selected army appears in the appropriate list  
- And I can remove it.

**FR-AH-002 (P0): Range selection per entry**
- Each assist/hinder entry must have a range category.

**AC-AH-002**
- Given a nearby army entry exists  
- When I set its range (Adjacent/1-space/2-space/Same location)  
- Then the rules engine applies only effects whose triggers match that range.

**FR-AH-003 (P0): Persist assist/hinder state into battle history**
**AC-AH-003**
- Given a battle is executed  
- When the battle is saved to history  
- Then the history entry includes all assist/hinder entries, their range, and active effect selections  
- And replaying the same battle yields the same outcome.

### 9.2 Rules-based effects (MVP set)

**FR-AH-010 (P0): Archers assist/hinder**
**AC-AH-010**
- Given Archers are listed as Nearby Allies within 2 spaces  
- When an allied army is defending  
- Then that allied army gains +2d6.
- Given Archers are attacking an enemy 2 spaces away  
- Then enemy defense suffers -2d6 (Cavalry exception -1d6).

**FR-AH-011 (P0): Mages Ward Screen / Arcane Volley**
**AC-AH-011**
- Given a Mage army is Nearby Ally within 1 space  
- When the GM selects “Ward Screen”  
- Then the defending allied army gains +2d6.  
- When the GM selects “Arcane Volley”  
- Then the enemy defense suffers -2d6 (Spies/Assassins exception -1d6).

**FR-AH-012 (P0): Anti-Magic suppression of Mage abilities**
**AC-AH-012**
- Given a Mage assist action is selected  
- And an enemy army with Anti-Magic is within 1 space  
- When dice are calculated  
- Then Mage assist actions do not apply and the breakdown explains suppression.

**FR-AH-013 (P0): Spies adjacent ally die manipulation**
**AC-AH-013**
- Given a Spy army is adjacent to the allied engaged army  
- When the roll resolves  
- Then the ally may remove their lowest rolled d6 from play.

**FR-AH-014 (P0): Assassins adjacent enemy die manipulation**
**AC-AH-014**
- Given an Assassin army is adjacent to the enemy engaged army  
- When the roll resolves  
- Then the enemy loses their highest rolled d6 from play.

**FR-AH-015 (P0): Shield-Brethren aura + bulwark context**
**AC-AH-015**
- Given Shield-Brethren are Nearby Allies within 1 space  
- When an allied army is defending  
- Then the allied army gains +1d6.  
- Given “City/Fort/Choke point” context is enabled  
- When Shield-Brethren are the defenders  
- Then the opposing army suffers -2d6.

**FR-AH-016 (P0): Builders same-location siege prep / repair**
**AC-AH-016**
- Given Builders and Siege are in the same location  
- When “Siege Prep” is selected  
- Then Siege gains +1d6 in its next battle (not repeatedly stackable).  
- Given Builders and an allied army are in the same location  
- When “Repair & Reinforce” is selected  
- Then remove -1d6 worth of penalties (logged; GM-adjudicated).

**FR-AH-017 (P0): Thieves / Mel’s Army STR transfer within 1 space**
**AC-AH-017**
- Given Thieves are within 1 space of an enemy army  
- When “Steal STR” is selected  
- Then enemy STR decreases and Thieves STR increases by the same amount (d4 for Thieves; d10 for Mel’s).  
- Then the dice breakdown shows the STR delta and resulting dice pool change.

**FR-AH-018 (P0): Forest Fey restore size within 1 space**
**AC-AH-018**
- Given Forest Fey are within 1 space and “Restore” is selected  
- Then the target ally’s Size increases by +10 units  
- And the resulting dice pool change is shown.

### 9.3 Settings
**FR-AH-020 (P0): Toggle Assist/Hinder system**
**AC-AH-020**
- Given Assist/Hinder is disabled in Settings  
- Then Nearby Allies/Enemies UI is hidden/disabled  
- And no assist/hinder effects apply.

**FR-AH-021 (P1): Cap configuration**
**AC-AH-021**
- Given cap settings are available  
- When cap is adjusted  
- Then max assist/hinder dice deltas respect the configured cap.

---

## 10. Non-Functional Requirements (NFR)

- **NFR-AH-001 Accessibility:** Nearby army selection and chip removal is keyboard-operable; focus states visible.
- **NFR-AH-002 Determinism:** Same inputs yield same outputs; saved history can replay deterministically.
- **NFR-AH-003 Maintainability:** Effects are data-driven (one source of truth mapping rule → effect).
- **NFR-AH-004 Performance:** Adding nearby entries should not cause noticeable UI lag (no heavy re-render loops).

---

## 11. Observability / Debugging (local)
Add a collapsible “Rules Log” section to the dice breakdown:
- “Applied Assist/Hinder Effects”
- each line shows: source army, range, effect, +/- dice (or roll rule), and why it triggered.

This is critical for validating correctness with complex stacking.

---

## 12. Roadmap (Phases + Slices)

### Phase 1 — MVP Assist/Hinder (rules-accurate)
**Slice A:** UI + persistence  
- Add Nearby Allies/Enemies selectors (saved armies only)  
- Range fields  
- Persist to history and JSON export

**Slice B:** Implement P0 effect set  
- Archers / Mages / Anti-Magic suppression  
- Spies / Assassins roll-manipulation  
- Shield-Brethren aura + choke context  
- Builders prep/repair  
- Thieves/Mel STR transfer  
- Forest Fey restore size

**Phase gate:** 10+ scripted test scenarios match expected dice math and are reproducible from history.

### Phase 2 — Expansion + clarity
- “Create new assist army” from picker
- More context tags (forest/swamp/home/hidden) wired to rules
- UI polish (compact lists, search within assist picker)

### Phase 3 — Optional general Help rule (future)
- Evaluate whether a universal help mechanic is needed
- If so, design separately with caps and playtest impact

---

## 13. Risks & Mitigations
| Risk | Likelihood | Impact | Mitigation |
|---|---:|---:|---|
| Stacking produces wild outcomes | Medium | High | Cap assist dice deltas per side; detailed breakdown log |
| Ambiguity in “range” without map | Medium | Medium | GM selects range explicitly per entry |
| Special-case rules creep | Medium | High | Make effects data-driven; keep PRD scope list as contract |
| UI complexity increases | Medium | Medium | Keep MVP UI minimal: list + range + optional action selector |

---

## 14. RACI
| Workstream | Responsible | Accountable | Consulted | Informed |
|---|---|---|---|---|
| Rules-to-effects mapping | Dev | Kyle | Playtesters | Stakeholders |
| UI integration (battle) | Dev | Kyle | Kyle | Stakeholders |
| Persistence/history | Dev | Kyle | — | Stakeholders |
| QA scenarios | Kyle + Dev | Kyle | Playtesters | Stakeholders |

---

## 15. Open Questions (decisions required before build)
1. Do we require range input for every entry (recommended), or assume “true” and let GM just select effects?
2. For Mages: do we enforce “choose one option” per phase (Ward Screen vs Arcane Volley), as written?
3. Do we include “hidden” as a tracked toggle for v0.1 (needed for Mel’s Army bonuses)?

---

## Appendix A — References to extracted rule sources
See `Assist_Hinder_Rules_Extraction_v0_1.md` for the full carved-out passages and citations used as the basis for this PRD.

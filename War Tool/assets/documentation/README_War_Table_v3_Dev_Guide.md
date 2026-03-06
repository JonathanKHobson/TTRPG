# War Table v3 — Developer Source-of-Truth Guide

This document is the implementation truth for:
- `/Users/jonathanhobson/Downloads/War Tool ChatGPT/War_Table_v3.html`

Policy:
- Document implemented behavior only.
- Do not document planned or unshipped behavior as implemented.
- If code and this README diverge, update this README in the same change.

Companion docs:
- `/Users/jonathanhobson/Downloads/War Tool ChatGPT/assets/documentation/ARCHITECTURE_INDEX_War_Table_v3.md`
- `/Users/jonathanhobson/Downloads/War Tool ChatGPT/assets/documentation/BACKEND_CLEANUP_PARITY_CHECKLIST.md`

## Current Snapshot (refreshed March 5, 2026)

- App file: `/Users/jonathanhobson/Downloads/War Tool ChatGPT/War_Table_v3.html`
- App lines: `7,878`
- Dev guide lines before this refresh: `543`
- Persistence schema: `SCHEMA_VERSION = 6`
- Storage key: `warTableState`
- Architecture: single-file local-first app (HTML + CSS + JS + embedded rules data)

## Major Implemented Changes Since Baseline

1. Core UI polish and readability passes
- Light parchment theme and structural cleanup across Battle, Armies, Factions, History, and Settings.
- Results area restructured with headline-first summary and collapsible details.
- Turn and utility control hierarchy normalized.

2. Armies/Factions workflow upgrades
- Save vs Update Army behavior via `loadedArmyId`.
- Dedicated faction creation modal (`#factionModal`) with army assignment chips.
- Explicit factions model retained and merged with army-derived factions.
- Armies defeated styling (`size = 0`).

3. Doctrines (Augment) integration
- Doctrine registry, normalization, eligibility filtering, GM override setting.
- Battle-side and army-modal doctrine chip management.
- Doctrine runtime toggles and phase penalties.
- Doctrine math integrated in compute path.

4. Assist/Hinder integration
- Nearby allies/enemies per side, action/range/hidden controls.
- Context toggles and per-side runtime handling.
- Assist/hinder effects integrated into battle math and roll operations.
- Assist/hinder draft persisted in `battleDraft`.

5. Result and War Report upgrades
- War Report modal added and settings-toggleable.
- Battle-time weather snapshot used for details/readouts.
- Result wording cleanup (`Compare-style`, `Roll Details`, `Dice Comparisons`).
- Outcome precedence standardized through shared resolver.

6. CSV productivity features
- Armies CSV import/export (upsert by case-insensitive name).
- Factions CSV import/export.
- All-content CSV bundle ZIP import/export (`armies.csv`, `factions.csv`, `manifest.json`).

7. Recent transparency/speed pass
- Dice math breakdown now includes Advantage/Disadvantage + net reroll display.
- Commit Dice expanded microcopy simplified (single-input model, blank = auto).
- History cards upgraded to mini war reports with expandable full context.
- Shared `runBattleRound(options)` execution path introduced.
- War Report now supports `Battle Again` and `Auto-Resolve Until Stop`.

## Top-Level Architecture

Single file layout in `War_Table_v3.html`:

1. CSS layer
- Tokens, component styles, modal styles, history/report styles.
- Base parchment gradient + grain.
- Desktop-only texture overlay (`body::after`) for map tile.

2. HTML app shell
- Tabs: battle, armies, factions, history, settings.
- Modals: army, faction, rename faction, confirm, import report, war report.

3. JavaScript sections
- Rules/data constants.
- Weather models and helpers.
- Utilities and normalizers.
- Persistence and migration (`schema v6`).
- Engines:
  - doctrine effects
  - assist/hinder effects
  - pool computation
  - resolution functions
- Domain actions (army/faction/history mutations).
- Renderers (battle/history/settings/etc).
- Modal handlers.
- Import/export adapters.
- Event binding in `bind()`.

Section/index markers exist in code via `// [SECTION] ...` and `// [INDEX] ...` comments for fast navigation.

## Persistence Contracts

### Storage

- Key: `warTableState`
- Schema: `6`

### Persisted state shape

```json
{
  "schemaVersion": 6,
  "updatedAt": "ISO timestamp",
  "armies": [],
  "factions": [],
  "battleHistory": [],
  "weather": {},
  "settings": {},
  "battleDraft": {
    "assistHinder": {
      "attacker": { "assistNearby": [], "hinderNearby": [], "context": {}, "runtime": {} },
      "defender": { "assistNearby": [], "hinderNearby": [], "context": {}, "runtime": {} }
    }
  }
}
```

### Settings contract (current)

```json
{
  "resolutionMode": "risk | quick",
  "quickLossPreset": "standard | flat10 | flat20",
  "allowOverCap": false,
  "overrideDoctrineEligibility": false,
  "assistHinderEnabled": true,
  "assistHinderDiceCap": 6,
  "showWarReportModal": true
}
```

### Saved army contract

```json
{
  "id": "uuid",
  "name": "string",
  "faction": "string",
  "classId": "string",
  "size": 0,
  "str": 0,
  "notes": "string",
  "doctrines": [],
  "createdAt": "ISO timestamp",
  "updatedAt": "ISO timestamp"
}
```

### Doctrine instance contract

```json
{
  "doctrineId": "elemental_ammunition",
  "choice": { "damageType": "fire" }
}
```

Rules:
- Doctrine IDs normalize via doctrine alias map.
- Duplicate doctrine IDs per list are removed.
- `elemental_ammunition` requires valid `choice.damageType`.

### Runtime side state (battle)

Each side (`attacker`, `defender`) includes:

```json
{
  "classId": null,
  "size": null,
  "str": null,
  "manualDiceDelta": 0,
  "diceOverride": "auto",
  "autoCommit": true,
  "capOverride": false,
  "adv": 0,
  "disadv": 0,
  "loadedArmyId": null,
  "doctrines": [],
  "doctrineRuntime": {},
  "assistNearby": [],
  "hinderNearby": [],
  "assistContext": {},
  "assistRuntime": {}
}
```

Notes:
- `autoCommit` remains in runtime state for compatibility but commit UX is now single-input (blank = auto).

## Core Persistence Functions

- `emptyState()`
- `loadPersisted()`
- `persist(saved)`
- `persistWeather(ws)`
- `normalizeSettings(settings)`
- `sanitizeArmyRecord(rawArmy)`
- `normalizeBattleDraft(draft)`

Behavior:
1. `loadPersisted()` always returns schema v6 shape and normalizes army/settings/draft payloads.
2. `persist(saved)` writes full canonical payload, and snapshots assist/hinder draft when writing live state.
3. `persistWeather(ws)` updates weather in storage while preserving other fields.
4. Import paths sanitize and normalize before mutation.

## Battle Execution Contract

## `runBattleRound(options)` (shared execution path)

`runBattleRound` now centralizes a single battle round and is used by:
- Battle button click
- War Report `Battle Again`
- War Report `Auto-Resolve Until Stop`

Returned payload (success):

```json
{
  "ok": true,
  "source": "battle-btn | war-report-single | war-report-auto",
  "stopReason": "null | attacker_defeated | defender_defeated | mutual_destruction | phenomena_triggered | safety_limit",
  "weatherAdvance": { "advanced": true, "phenomenaTriggered": false },
  "result": {},
  "attRoll": {},
  "defRoll": {},
  "attComp": {},
  "defComp": {},
  "ahBattle": {},
  "rollOpLogs": [],
  "weatherUsed": {}
}
```

Failure returns `{ ok: false, issues: [...] }`.

## Battle flow order (implemented)

1. Snapshot current weather into `weatherUsed`.
2. Resolve assist/hinder for battle mode.
3. Compute attacker/defender pools.
4. Validate readiness and commit constraints.
5. Roll committed dice.
6. Apply assist roll ops (remove lowest/highest as configured).
7. Apply advantage/disadvantage rerolls.
8. Resolve outcome (`risk` or `quick`).
9. Apply doctrine and assist runtime boundaries.
10. Persist draft + render base UI.
11. Store `state.lastResult`.
12. Render inline result.
13. Append history entry.
14. Auto-advance weather for next battle (if enabled).
15. Open War Report modal if setting enabled.

## Stop reason semantics

- `attacker_defeated`: attacker size <= 0 after resolution.
- `defender_defeated`: defender size <= 0 after resolution.
- `mutual_destruction`: both sizes <= 0 after resolution.
- `phenomena_triggered`: post-battle weather advance generated `PHENOMENA`.
- `safety_limit`: auto-resolve guardrail reached max rounds.

## Math / Transparency Contracts

## `computePool(sideKey, st, opts)`

Still the primary battle pool pipeline. Breakdown includes:
- base dice from size/str
- matchup
- weather
- class specials
- doctrine effects
- assist/hinder effects
- roll modifiers block:
  - Advantage count
  - Disadvantage count
  - Net reroll direction/magnitude
- pre-cap/cap/manual lines

Important:
- Advantage/Disadvantage lines are transparency-only in breakdown; rerolls are applied later in roll phase.

## Commit Dice UX contract

- Single commit input per side.
- Blank input means auto-commit full computed pool.
- Numeric input means manual commit count, clamped to pool size.
- Commit summary in section header shows `auto: N` or `manual: N`.
- Expanded helper text: `Leave blank to auto-commit full pool.`

## War Report Modal Contract

Modal ID: `warReportModal`

Key controls:
- `warReportClose`
- `warReportClosePrimary`
- `warReportDetails`
- `warReportBattleAgainBtn`
- `warReportAutoResolveBtn`
- `warReportAutoStatus`

Behavior:
1. Shows outcome banner + losses + updated sizes.
2. `View Details` contains weather used, roll details, dice comparisons, and dice math breakdown.
3. `Battle Again` runs one round through `runBattleRound` and refreshes modal content in place.
4. `Auto-Resolve Until Stop` loops rounds via `runBattleRound` until stop condition.
5. During auto loop, action buttons are disabled/hidden based on state.
6. On stop, status text shows stop reason.
7. Esc/cancel and close buttons stop auto mode and close modal safely.

## Auto-resolve stop behavior

Auto-resolve stops when:
- defeat occurs (`attacker_defeated`, `defender_defeated`, `mutual_destruction`), or
- newly triggered `PHENOMENA` occurs on post-battle weather advance (`phenomena_triggered`), or
- safety guardrail triggers (`safety_limit`, 500 rounds).

## History Contract (Enriched)

`appendHistory(...)` now writes both legacy fields and enriched summary/detail fields.

Additive fields include:
- `outcomeHeadline`
- `losses`
- `updatedSizes`
- `commitUsed`
- `diceTypeUsed`
- `manualOverrides`
- `advDis`
- `rolls`
- `comparisons`
- `stopReason`
- `weatherUsed`, `weatherUsedLabel`

Plus existing snapshots:
- attacker/defender class/size/str/pool/doctrines
- doctrine summaries
- assist/hinder summaries
- nearby entry snapshots
- roll operation logs
- transfer rolls

Backward compatibility:
- `renderHistoryList()` is null-safe for older records missing new fields.

## History UI Contract

`renderHistoryList()` now renders each item as:
1. Mini summary (always visible)
- outcome
- losses
- updated sizes
- stop badge (when present)
- timestamp

2. Expandable full context
- weather/mode summary
- side-by-side attacker/defender context cards
- doctrines
- nearby summaries + selected nearby entries
- commit and die type
- manual overrides + cap overrides
- adv/dis counts
- roll ops + transfer rolls
- roll details
- dice comparisons (risk mode)

## Doctrines Contract (Current)

Canonical doctrine IDs:
- `anti_air`
- `anti_magic`
- `heavy_artillery`
- `fire_artillery`
- `elemental_ammunition`
- `armor_piercing`
- `heavy_protection`
- `battlefield_weavers`
- `counterspell_cadre`
- `wild_surge_license`
- `ritual_artillery`
- `ward_smiths`
- `soul_binders`
- `spellthief_detachment`

Core doctrine helpers:
- `normalizeDoctrineId`
- `normalizeDoctrineInstance`
- `normalizeDoctrineList`
- `computeDoctrineEffects`

Runtime behavior:
- doctrine runtime toggles apply phase-based effects.
- `applyDoctrinePhaseBoundary` consumes and queues penalties per rules.

## Assist/Hinder Contract (Current)

Data-driven action catalog:
- `AH_ACTIONS`
- `AH_ACTION_BY_ID`

Core helpers:
- `sanitizeNearbyEntry`
- `normalizeNearbyEntryList`
- `normalizeAssistContext`
- `normalizeAssistRuntime`
- `normalizeAssistHinderDraft`
- `resolveAssistHinderEffects`

Settings hooks:
- `assistHinderEnabled`
- `assistHinderDiceCap`

Draft persistence:
- stored under `saved.battleDraft.assistHinder`
- restored into runtime side state on load.

## Tab-by-Tab UI Contracts

## Battle tab

- Side panels include class, size/str, doctrines, nearby, commit, KPI, breakdown, context, manual override.
- Commit section uses single-input model.
- Breakdown includes adv/dis/net transparency lines.
- Inline result remains present and auto-updated.

## Armies tab

- CRUD + search.
- CSV import/export buttons.
- `armyCount` badge updated by renderer.
- Save/Update from battle uses `loadedArmyId`.

## Factions tab

- Dedicated `New Faction` modal flow.
- Search, JSON import/export, CSV import/export.
- `factionCount` badge maintained.
- Empty factions supported.

## History tab

- Auto-saved entries only (no manual save button path).
- Mini war report cards with expandable details.

## Settings tab

- Unified save path via `saveWeatherSettings`.
- Saves weather + battle rules + doctrine eligibility + assist/hinder controls + war report modal setting.

## Import / Export Contracts

## JSON
- Full export/import via `doExportAll` / `doImportAll`.
- Includes armies/factions/history/weather/settings and battleDraft.

## CSV
- Armies CSV:
  - upsert by case-insensitive name.
  - fail-fast validation.
- Factions CSV:
  - explicit factions merge behavior.
- ZIP bundle:
  - `armies.csv`
  - `factions.csv`
  - `manifest.json`

## History export
- Exports `battleHistory` as currently persisted objects.

## Visual Layer Contract

Base background:
- gradient + subtle grain overlay.

Desktop texture enhancement:
- map texture overlay on desktop breakpoints.
- fallback remains base background.

Primary asset path:
- `/Users/jonathanhobson/Downloads/War Tool ChatGPT/assets/backgrounds/bg-map-parchment-tile.webp`

Optional retina:
- `/Users/jonathanhobson/Downloads/War Tool ChatGPT/assets/backgrounds/bg-map-parchment-tile@2x.webp`

## Key IDs and Function Anchors

High-use IDs:
- Battle controls: `battleBtn`, `copyResult`, `attackerCommit`, `defenderCommit`
- War Report: `warReportModal`, `warReportBattleAgainBtn`, `warReportAutoResolveBtn`, `warReportAutoStatus`
- Settings: `showWarReportModal`, `assistHinderEnabled`, `assistHinderDiceCap`, `overrideDoctrineEligibility`
- Faction modal: `factionModal`, `factionName`, `factionArmySelect`, `factionArmyChips`, `factionModalSave`

High-risk functions:
- `runBattleRound`
- `computePool`
- `computeDoctrineEffects`
- `resolveAssistHinderEffects`
- `appendHistory`
- `renderHistoryList`
- `openWarReportModal`
- `setWarReportActionState`
- `persist`
- `persistWeather`

## Fragile Areas / Safe Change Rules

1. `runBattleRound` ordering
- Avoid changing operation order unless intentionally changing mechanics.
- Weather snapshot and post-battle auto-advance timing are critical.

2. History payload compatibility
- `appendHistory` and `renderHistoryList` must remain backward-compatible.
- New history fields must be additive and null-safe in renderer.

3. Breakdown transparency lines
- `computePool` display lines should not accidentally alter math values.

4. Modal loop lifecycle
- `_warReportAutoRunning` and `_warReportAutoToken` guard against stale loops and close races.

5. Persistence boundaries
- `persist` should remain canonical for full-state writes.
- `persistWeather` should remain weather-focused and non-destructive.

## Known Mismatches / Technical Debt

1. About card version string is stale:
- Settings About currently shows `Phase 3.1 (Weather System)` despite much broader implemented scope.

2. Legacy runtime key retained:
- `autoCommit` remains in side runtime state though current commit UX is single-input auto/manual by blank/value.

3. Mixed icon language:
- Some UI surfaces still use mixed emoji/SVG patterns from historical passes.

4. Auto-resolve safety stop:
- `safety_limit` exists as protective stop reason and is expected behavior.

## Documentation QA Checklist

1. README states schema v6 and `battleDraft.assistHinder`.
2. README reflects current settings keys including `showWarReportModal`.
3. README documents `runBattleRound` and war report chain controls.
4. README documents enriched history fields and null-safe rendering behavior.
5. README documents single-input commit behavior and microcopy.
6. README documents adv/dis transparency in breakdown.
7. README documents auto-resolve stop behavior including `phenomena_triggered` and safety guard.
8. README does not present unimplemented behavior as shipped.

## Maintenance Checklist

When features change in code, update this README in the same change:

1. Schema/state contract section.
2. Settings keys/defaults.
3. Runtime side shape.
4. History payload contract.
5. Key IDs/functions table.
6. Known mismatches/tech debt list.
7. Snapshot counts/date.


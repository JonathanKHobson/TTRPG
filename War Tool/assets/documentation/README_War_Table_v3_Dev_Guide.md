# War Table v3 — Developer Source-of-Truth Guide

This document is the implementation truth for:
- `/Users/jonathanhobson/Downloads/War Tool ChatGPT/War_Table_v3.html`

Policy:
- Document implemented behavior only.
- Do not document planned/unshipped behavior as if it exists.
- If code and this README diverge, update this README in the same change.

## Current Snapshot (as of March 5, 2026)

- App file: `/Users/jonathanhobson/Downloads/War Tool ChatGPT/War_Table_v3.html`
- Lines: `5,252`
- Developer guide file: `319` lines before this rewrite (stale), now refreshed
- Persistence schema: `SCHEMA_VERSION = 5`
- Storage key: `warTableState`
- HTML IDs in app: `183`
- JS functions: `129`
- Architecture: single-file HTML app (HTML + CSS + JS + embedded rules data), no build system

## Major Implemented Changes Since Baseline

1. Light parchment UI pass with center-column restructure and refined controls.
2. P0 polish:
- Battle icon replaced with clean crossing swords SVG.
- Advance Turn demoted to neutral secondary button (`.turnBtn`) and grouped under Battle CTA.
- Form control right padding updated for select chevron breathing room.
- Bottom utility row and bottom-card details padding corrected.
3. P1 cleanup:
- Results panel restructured: headline + summary first; Rolls and Risk comparisons collapsed.
- Battle history is auto-saved after each roll; manual history save button removed.
- Factions tab parity pass (header actions, search, import/export).
- History heading icon switched to SVG.
- Army modal helper text reduced and spacing tightened.
- Commit-rule hints now conditional (`.commitRule.visible` only when invalid).
4. Add-ons:
- Unified Save Settings row moved below Battle Rules card.
- Save/Update Army context flow via `loadedArmyId`.
- Armies tab defeated styling for size `0`.
5. Factions UX parity + dedicated faction creation modal:
- Armies/Factions header style parity and count badges.
- Dedicated `#factionModal` with faction name + existing-army assignment chips.
- Empty factions supported as explicit saved entities.
6. Doctrines integration (Augment):
- Doctrine data model, selectors, chips, persistence, eligibility rules, GM override.
- Battle-side doctrine runtime toggles and next-phase penalty handling.
- Doctrine effects integrated into dice math (`computeDoctrineEffects` + `computePool`).
- Doctrine snapshots included in history and copy result payload.
7. Desktop textured background layer:
- Non-blocking map texture overlay on desktop only (`min-width: 1024px`) with reduced-data fallback.

## File Structure (Top-Level)

1. `<style>` contains all CSS, including:
- tokens (`:root`)
- base parchment gradients
- grain overlay (`body::before`)
- desktop map texture overlay (`body::after`)
- component classes for all tabs/modals/doctrines/factions
2. `<body>` contains:
- app shell (`.app`)
- tabs: battle, armies, factions, history, settings
- dialogs: `#armyModal`, `#factionModal`, `#renameFactionModal`, `#confirmModal`
3. `<script>` contains:
- rules/weather data and utility functions
- doctrine constants + normalizers
- persistence/migration layer (schema v5)
- battle engine
- CRUD and modal flows
- render functions
- event wiring in `bind()`

## Public Data Contracts

### Persisted App State (`warTableState`)

```json
{
  "schemaVersion": 5,
  "updatedAt": "ISO timestamp",
  "armies": [],
  "factions": [],
  "battleHistory": [],
  "weather": {},
  "settings": {}
}
```

### Settings Contract

```json
{
  "resolutionMode": "risk | quick",
  "quickLossPreset": "standard | flat10 | flat20",
  "allowOverCap": false,
  "overrideDoctrineEligibility": false
}
```

### Saved Army Contract

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

### Doctrine Instance Contract

```json
{
  "doctrineId": "elemental_ammunition",
  "choice": { "damageType": "fire" }
}
```

Rules:
- `doctrineId` must normalize to a known doctrine.
- Duplicates are removed by `doctrineId`.
- `elemental_ammunition` requires a valid `choice.damageType`.

### Runtime Side State Contract (Battle)

```json
{
  "classId": null,
  "size": null,
  "str": null,
  "manualDiceDelta": 0,
  "diceOverride": "auto",
  "autoCommit": true,
  "loadedArmyId": null,
  "doctrines": [],
  "doctrineRuntime": {
    "useArmorPiercing": false,
    "useBattlefieldWeavers": false,
    "useWardSmiths": false,
    "useWildSurge": false,
    "phasePenalty": 0,
    "nextPhasePenalty": 0
  }
}
```

## Persistence and Migration (Schema v5)

Core functions:
- `emptyState()`
- `loadPersisted()`
- `persist(saved)`
- `persistWeather(ws)`
- `sanitizeArmyRecord(rawArmy)`
- `normalizeSettings(settings)`

Behavior:
1. `loadPersisted()` reads localStorage, sanitizes armies, normalizes settings, and migrates older data into v5 shape.
2. `persist(saved)` writes full state payload with schema version and normalized settings.
3. `persistWeather(ws)` updates weather in stored payload while preserving other saved fields.
4. Armies are sanitized on load/import/write; invalid class IDs are dropped.
5. Missing doctrines on legacy armies normalize to `[]`.

## Doctrine System

### Canonical Doctrine IDs

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

### Normalization and Eligibility

Core helpers:
- `normalizeDoctrineId`
- `normalizeDoctrineChoice`
- `normalizeDoctrineInstance`
- `normalizeDoctrineList`
- `isDoctrineEligibleForClass`
- `parseDeadlyDoctrineIds`

Behavior:
1. Doctrine labels/aliases normalize to stable IDs.
2. Side/modal doctrine lists are unique by doctrine ID.
3. Eligibility filtering is enforced in pickers when `overrideDoctrineEligibility = false`.
4. GM override ON shows all doctrines.
5. Grandfather behavior is visible:
- ineligible existing chips remain attached when override is turned off
- these chips are rendered with `.chip.ineligible` + `Grandfathered` flag

### Doctrine UI Surfaces

Battle side panels:
- Attacker IDs: `attDoctrineSelect`, `attDoctrineAddBtn`, `attDoctrineDamageType`, `attDoctrineChips`, `attDoctrineRuntime`, `attDoctrineQueued`
- Defender IDs: `defDoctrineSelect`, `defDoctrineAddBtn`, `defDoctrineDamageType`, `defDoctrineChips`, `defDoctrineRuntime`, `defDoctrineQueued`

Army modal:
- `armyDoctrineSelect`, `armyDoctrineAddBtn`, `armyDoctrineDamageType`, `armyDoctrineChips`

Faction modal does not edit doctrines directly.

### Doctrine Runtime (Per-Phase)

- Toggles are shown only if doctrine is present.
- A battle click is a phase boundary.
- `applyDoctrinePhaseBoundary(attRoll, defRoll)`:
1. converts used toggles into next-phase penalty where applicable
2. transfers `nextPhasePenalty` to `phasePenalty`
3. clears per-phase usage toggles
4. applies Wild Surge min-roll complication (`roll === 1`) as additional queued penalty

### Doctrine Effects in Battle Math

`computeDoctrineEffects(sideKey, st, selfCls, oppCls, ws)` contributes:
- `dice` delta
- `dieStep` delta
- `forcedAutoSides` override
- detailed breakdown lines (`lines`, `plainLines`)

Implemented interactions include:
1. Deadly Doctrine trigger:
- Parses class `raw.deadlyDoctrines`
- If opponent has matching doctrine ID, applies `RULES.modifierShorthand.deadly` (typically `-3`) per trigger
2. `heavy_artillery`:
- `+1` die step
3. `anti_air` vs `aerial-cavalry`:
- `+3` dice
4. `anti_magic` vs enemy `mages`:
- `+3` dice
5. Enemy `anti_magic` vs self `mages`:
- forces auto dice to `d4` before manual override
6. `armor_piercing` vs enemy `heavy_protection`:
- if used this phase: negate + `+1` die
- else enemy protection applies `-1` die
7. `elemental_ammunition`:
- requires damage type
- applies immunity/resistance/vulnerability/deadly token checks from opponent raw class text
- applies affinity checks against opponent preferred/undesired weather text
- applies drawback `-1` die if resisted/immune
8. `fire_artillery`:
- adds fire pressure bonus based on opponent fire vulnerability/deadly token matches
- applies cold/wet weather self-penalty `-1` in rain/downpour/cold/snow/blizzard/thunderstorm
9. `wild_surge_license` when used this phase:
- `+1` die step

## Battle Math Execution Order

In `computePool()` (exact order):
1. Resolve class and opponent class.
2. Apply class weather specials (including STR penalties) first.
3. Compute base dice from effective size/STR.
4. Apply matchup modifier totals.
5. Apply preferred/undesired weather modifier totals.
6. Apply doctrine dice modifier totals (`computeDoctrineEffects`).
7. Apply role cap (attacker cap 10, defender cap 8).
8. Apply manual dice delta.
9. Enforce cap again unless `allowOverCap`.
10. Resolve auto die type.
11. Apply doctrine auto die force (`forcedAutoSides`).
12. Apply doctrine die-step adjustments.
13. Apply manual dice override if not `auto` (manual wins last).
14. Build dice list and render breakdown.

## Battle, Result, and History Contracts

1. Result UI (`#resultArea`) shows headline/summary immediately.
2. `#rollsDetails` defaults closed each render.
3. `#riskDetails` only displays for risk-mode results.
4. Copy button is `Copy` and temporary `Copied!` state resets to `Copy`.
5. History is auto-appended in battle handler immediately after `renderResult(...)`.
6. History entries include:
- attacker/defender doctrine snapshots
- doctrine summary lines
7. History list empty state explicitly says battles are auto-saved.

## Armies and Factions Systems

### Armies Tab

- Header includes `+ New Army` and `#armyCount` badge.
- Search (`#armySearch`) filters by army name, faction name, and class name.
- `renderArmyList()` always sets total `armyCount` from full saved armies length (not filtered).
- Armies with size `0` render with `army-defeated` styling and `Defeated` badge.

### Factions Tab

- Header includes `#factionCount`, `+ New Faction`, import/export actions.
- Search (`#factionSearch`) filters faction names.
- `renderFactionList(filter)` shows army count per faction.

### Explicit Faction Model

- `state.saved.factions` is first-class persisted data.
- `recomputeFactions(saved)` preserves explicit faction names and also includes army-discovered factions (case-insensitive dedupe, first canonical casing retained).

### Dedicated Faction Modal (`#factionModal`)

Modal IDs:
- `factionName`
- `factionArmySelect`
- `factionArmyAddBtn`
- `factionArmyChips`
- `factionModalError`
- `factionModalSave`

Flow:
1. Open via `newFactionModal()` -> `openFactionModal()`.
2. Enter faction name (required).
3. Optional: load existing armies via dropdown + chips.
4. Duplicate draft chips prevented.
5. Save validates unique faction name case-insensitively.
6. Empty faction save is allowed.
7. Selected armies are authoritatively assigned to the new faction (reassignment allowed).

### Rename/Delete Semantics

- `renameFaction(oldName, newName)` updates explicit faction entry and linked armies.
- `deleteFaction(name)` removes explicit faction entry and clears faction labels on linked armies (armies remain).

## Save/Update Army Flow

Core behavior:
1. `loadArmyIntoSide()` sets side `loadedArmyId`, clones saved doctrines, resets doctrine runtime.
2. Render updates side button labels:
- `Save as Army` when no loaded army
- `Update Army` when `loadedArmyId` exists
3. `openUpdateArmyModalFromSide(side)`:
- opens edit modal when loaded ID exists
- overlays live side `size`, `str`, and side doctrines
4. `commitArmyModal()` validates elemental doctrine choices and persists doctrine list.
5. If updated army is currently loaded on a side, side doctrines refresh from saved record.

## Settings Tab Contracts

Unified Save Settings button: `#saveWeatherSettings`

Click handler saves all of:
1. Weather/season config
2. Battle rules:
- `resolutionMode`
- `quickLossPreset`
- `allowOverCap`
- `overrideDoctrineEligibility`
3. Persists `state.saved.settings` and `state.saved.weather`
4. Calls `persistWeather` and `persist`
5. Shows toast and inline saved message

Sync helper:
- `document._weatherSettingsSync` mirrors runtime state to settings controls on settings tab open.

## Import/Export Contracts

### Full State

- Export: `doExportAll()` -> includes schemaVersion + full `state.saved`.
- Import: `doImportAll(data)` updates armies/factions/history/weather/settings; normalizes settings and sanitizes armies.

### Armies Import

- Reads `data.armies`.
- Sanitizes each army with `sanitizeArmyRecord`.
- Dedupes by army ID.

### Factions Export/Import

- Export groups armies by faction name into `{ factions: [{ name, armies[] }] }`.
- Import accepts names + grouped armies.
- Adds new factions case-insensitively.
- Adds armies when ID is new and class is valid.
- Doctrines on imported armies are normalized.

### History Export

- Exports `battleHistory` array only.

## Visual Layer and Background Texture

Base layers:
1. `body` parchment gradient background.
2. `body::before` grain overlay.
3. `body::after` map texture overlay on desktop only.

Texture contract:
- Enabled only at `@media (min-width: 1024px)`.
- Disabled under `@media (prefers-reduced-data: reduce)`.
- Uses:
  - `assets/backgrounds/bg-map-parchment-tile.webp`
  - optional high-density `assets/backgrounds/bg-map-parchment-tile@2x.webp` via `image-set`.
- Progressive enhancement: if image fails, gradient still renders.

## Key IDs and Functions (High-Use Contracts)

IDs used heavily by JS (do not rename without code updates):
- Battle core: `battleBtn`, `turnBtn`, `resultArea`, `rollsDetails`, `riskDetails`, `copyResult`
- Side doctrine UI: `attDoctrine*`, `defDoctrine*`
- Army modal doctrine UI: `armyDoctrine*`
- Faction modal: `factionModal`, `factionName`, `factionArmySelect`, `factionArmyChips`, `factionModalSave`
- Counts/search: `armyCount`, `factionCount`, `armySearch`, `factionSearch`
- Settings: `saveWeatherSettings`, `overrideDoctrineEligibility`

High-sensitivity functions:
- `computePool`
- `computeDoctrineEffects`
- `applyDoctrinePhaseBoundary`
- `render`
- `bind`
- `loadPersisted`
- `persist`
- `persistWeather`
- `sanitizeArmyRecord`
- `renderArmyList`
- `renderFactionList`
- `openUpdateArmyModalFromSide`
- `commitArmyModal`
- `commitFactionModal`

## Fragile Areas / Safe Change Rules

1. ID Contract:
- Do not rename/remove IDs without updating all `$()` references.
2. `bind()` Listener Safety:
- Null element + direct `addEventListener` can break all listeners below it.
3. Battle Math:
- `computePool` and `computeDoctrineEffects` changes can alter gameplay and UI breakdown simultaneously.
4. Persistence Writes:
- Keep `persist`/`persistWeather` out of render loops.
5. Dialog Placement:
- Keep `<dialog>` elements top-level in body; do not nest inside scroll containers.
6. Doctrine Validation:
- Preserve required elemental damage-type checks on add and save paths.
7. Faction Semantics:
- Keep explicit `saved.factions` behavior and recompute merge behavior aligned.

## Known Mismatches / Technical Debt

1. Settings About card still displays `Phase 3.1 (Weather System)` despite additional implemented systems (doctrines, faction modal, texture layer).
2. Some UI copy/icons remain mixed emoji/SVG across tabs by design history.
3. Faction import/export format is names/group-based, not faction-ID-based.
4. Weather persistence uses both `persistWeather` and full `persist`; this is intentional but duplicated write paths require care.

## Documentation QA Checklist

1. Schema version in docs matches code (`5`).
2. Settings contract includes `overrideDoctrineEligibility`.
3. Army contract includes doctrines.
4. Doctrine instance contract includes elemental `choice.damageType` requirement.
5. Battle math order matches `computePool` implementation.
6. Dedicated faction modal flow is documented (not army modal reuse).
7. History auto-save behavior is documented.
8. Save/Update Army contextual behavior via `loadedArmyId` is documented.
9. Desktop texture overlay contract and fallbacks are documented.
10. README avoids documenting unimplemented roadmap behavior.

## Maintenance Checklist (Required on Feature Changes)

When behavior changes, update this file in the same PR:
1. Update schema/state contracts if any persisted keys changed.
2. Update doctrine catalog/eligibility tables if doctrine logic changed.
3. Update tab contracts and key IDs if UI IDs changed.
4. Update key function list if core functions were added/renamed.
5. Update major-changes section with shipped behavior.
6. Re-run quick doc QA checklist before merge.


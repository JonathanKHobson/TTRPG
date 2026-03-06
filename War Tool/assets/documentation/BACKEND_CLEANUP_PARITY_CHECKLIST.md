# War Table v3 — Backend + CSV Parity Checklist

Purpose:
- Verify cleanup/refactor and CSV additions did not break existing behavior.

Scope:
- Logic parity (state, persistence, rules engine, handlers)
- CSV/ZIP mass import-export coverage

## Test Matrix

### 1) App Boot + Defaults

1. Open app with empty localStorage.
2. Confirm no console errors.
3. Confirm defaults:
- `resolutionMode = risk`
- `quickLossPreset = standard`
- `allowOverCap = no`
- `overrideDoctrineEligibility = no`

### 2) Existing Battle Flow (Risk)

1. Configure valid attacker/defender.
2. Run battle in risk mode.
3. Verify:
- result panel appears
- rolls details collapsed by default
- risk details visible only in risk mode
- history entry auto-created

### 3) Existing Battle Flow (Quick)

1. Switch to quick mode.
2. Run battle.
3. Verify:
- quick summary text
- risk details hidden
- history still auto-created

### 4) Existing Doctrine Assignment + Runtime

1. Add doctrines to attacker and defender.
2. Add Elemental Ammunition and choose type.
3. Toggle phase doctrines where available.
4. Run battle and verify:
- no validation regressions
- queued next-phase penalties behave as before

### 5) Existing Save/Update Army Context

1. Load a saved army into attacker.
2. Confirm button label reads `Update Army`.
3. Open modal from attacker and save update.
4. Verify same army record updates and doctrine payload is retained.

### 6) Existing Faction Modal

1. Create new empty faction.
2. Create faction with loaded existing armies.
3. Attempt duplicate faction name (case-insensitive).
4. Verify:
- duplicates blocked
- selected armies reassigned correctly

### 7) Armies CSV Export/Import

1. Export armies CSV.
2. Re-import unchanged CSV.
3. Verify no duplicates and no data loss.
4. Edit CSV rows for same names (case variations), change size/str/faction/notes/doctrines.
5. Import and verify updates applied to existing records (same IDs retained).

### 8) Armies CSV Fail-Fast Validation

1. Import CSV with one invalid row (bad class or bad doctrine token).
2. Verify:
- import report dialog title indicates failure/no changes
- no rows are imported/updated
- error list includes row numbers and reason

### 9) Factions CSV Export/Import

1. Export factions CSV.
2. Import with new faction names.
3. Verify only missing factions are added.
4. Verify absent rows do not delete existing factions.

### 10) CSV Bundle ZIP Export/Import

1. Export CSV bundle ZIP.
2. Wipe local data.
3. Import bundle.
4. Verify restored factions + armies.
5. Verify bundle missing any required file fails with no mutations.

### 11) Existing JSON Import/Export Paths

1. Export full JSON state.
2. Import full JSON state.
3. Verify existing behavior unchanged.

### 12) Utility Actions

1. Run Reset.
2. Run Prefill.
3. Run Swap.
4. Verify no console errors and semantics unchanged.

### 13) UI Routing + Copy

1. Switch across all tabs.
2. Use Copy result button after battle.
3. Verify no console errors and payload still includes doctrine/weather lines.

## Baseline Capture

Store compare artifacts:
- `war_table_export.json`
- `war_table_armies.json`
- `war_table_factions.json`
- `war_table_armies.csv`
- `war_table_factions.csv`
- `war_table_content_bundle.zip`

## Pass Criteria

- No new console errors.
- No schema/shape drift in persisted payloads.
- Existing mechanics unchanged.
- CSV fail-fast policy enforced (no partial apply on validation errors).

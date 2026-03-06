# War Table v3 — Architecture Index (Single-File Navigation)

Primary code file:
- `/Users/jonathanhobson/Downloads/War Tool ChatGPT/War_Table_v3.html`

Notes:
- Line numbers are approximate and should be refreshed after major edits.
- Fast navigation in code is via markers: `// [SECTION] ...` and `// [INDEX] ...`.

## Section Markers

- `DATA_RULES` around line `1594`
- `DATA_WEATHER` around line `2596`
- `UTILS_CORE` around line `2992`
- `DATA_DOCTRINES` around line `3021`
- `PERSISTENCE_STORAGE` around line `3213`
- `ENGINE_INDEX` around line `3318`
- `ENGINE_MATH` around line `3355`
- `STATE_RUNTIME` around line `3663`
- `DOMAIN_ACTIONS` around lines `3694`, `3776`
- `ENGINE_RESOLUTION` around line `3812`
- `UI_RENDER` around lines `3915`, `4355`, `4440`, `4493`, `4523`
- `UI_MODALS` around lines `4554`, `4654`, `4789`
- `IMPORT_EXPORT` around line `4826`
- `UI_HANDLERS` around lines `5607`, `5625`, `5683`

## Function Index (High-Traffic)

Persistence:
- `persistWeather(ws)` around line `2983`
- `loadPersisted()` around line `3265`
- `persist(saved)` around line `3286`

Engine:
- `computeDoctrineEffects(...)` around line `3423`
- `computePool(...)` around line `3583`

Rendering:
- `render()` around line `4282`
- `refreshArmyAndFactionLists()` around line `3922`
- `syncAllSettingsControlsFromState()` around line `3956`

CSV:
- `parseCsv(text)` around line `4900`
- `serializeCsv(rows, headers)` around line `4891`
- `validateArmiesCsv(rows)` around line `5081`
- `upsertArmiesFromCsv(rows)` around line `5152`
- `exportArmiesCsv()` around line `5204`
- `importArmiesCsv(file)` around line `5218`
- `exportFactionsCsv()` around line `5291`
- `importFactionsCsv(file)` around line `5297`
- `exportAllCsvBundle()` around line `5443`
- `importAllCsvBundle(file)` around line `5462`

Import/export:
- `doImportAll(data)` around line `5516`
- `importFactions(file)` (JSON) around line `5554`

Event wiring:
- `bind()` around line `5687`

## Dependency Hotspots

1. `computePool` depends on:
- class index lookups
- weather modifiers/specials
- doctrine effect layer
- state settings cap/override values

2. `render` depends on:
- `computePool`
- doctrine render helpers
- weather render helper
- mutable UI IDs (strict ID contract)

3. `bind` depends on:
- all expected IDs being present
- helper sync methods for settings controls
- globally available inline `onclick` targets

4. Import paths depend on:
- `sanitizeArmyRecord`
- `normalizeSettings`
- `recomputeFactions`
- CSV validators (`validateArmiesCsv`, `prepare*CsvImport`)

5. Bundle import depends on:
- ZIP store reader (`zipReadStore`)
- full validation before mutation
- ordered apply (factions then armies)

## Safe Editing Order

1. Update constants/data contracts.
2. Update sanitizers/normalizers.
3. Update engine math.
4. Update render helpers.
5. Update handlers/wiring.
6. Re-run parity checklist.

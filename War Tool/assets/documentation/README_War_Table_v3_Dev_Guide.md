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

## Current Snapshot (refreshed March 6, 2026)

- App file: `/Users/jonathanhobson/Downloads/War Tool ChatGPT/War_Table_v3.html`
- App lines: `7,818`
- Help wiki file: `/Users/jonathanhobson/Downloads/War Tool ChatGPT/War_Table_Help_Wiki.html`
- Help wiki lines: `1,099`
- Shared base stylesheet: `/Users/jonathanhobson/Downloads/War Tool ChatGPT/assets/css/war-table-theme.css`
- Shared runtime theme stylesheet: `/Users/jonathanhobson/Downloads/War Tool ChatGPT/assets/css/war-table-state-themes.css`
- Help layout stylesheet: `/Users/jonathanhobson/Downloads/War Tool ChatGPT/assets/css/war-table-help.css`
- Base stylesheet lines: `1,043`
- Runtime theme stylesheet lines: `437`
- Help layout stylesheet lines: `397`
- Dev guide lines before this refresh: `707`
- Persistence schema: `SCHEMA_VERSION = 7`
- Storage key: `warTableState`
- Architecture: local-first app (HTML + shared CSS + JS + embedded rules data)

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

8. Theme/CSS extraction + state-theme routing pass
- Shared stylesheet linked from HTML head: `assets/css/war-table-theme.css`.
- Additive runtime stylesheet linked after base: `assets/css/war-table-state-themes.css`.
- Stable global/component styles were extracted first, then remaining inline page styles were migrated.
- `War_Table_v3.html` no longer contains an inline `<style>` block.
- Runtime theming now routes through root `body` `data-*` attributes (season/weather/phenomena/intensity/defeat and theme toggles).

9. P2.1 phenomena identity pass
- Strange phenomena now use signature effect tokens (overlay layers, border/frame tokens, sparkle/streak/speckle controls) rather than tint-only differentiation.
- Dramatic mode now amplifies phenomena overlays/framing more meaningfully.
- Defeat-state route now derives from live side sizes first (lastResult stop reason is fallback only when sizes are unavailable).
- Center result headline wrap behavior tightened for narrow widths.

10. Help Wiki expansion (PRD A Scope 1+2 + PRD B Scope 3)
- Added native in-product Help Wiki page: `War_Table_Help_Wiki.html`.
- Added technical helper framework sections: Start Here, Battle Guide, Armies/Factions, Import/Export, Settings Reference, War Report/History, FAQ, Glossary.
- Replaced Game Rules placeholder with full rules helper sections: Rules Landing, Quick Start, Strategic Core, Army Classes, Doctrines, Weather/Terrain, Command Meters, Optional Mechanics, and Appendix.
- Added full in-page indexed search with keyboard navigation and visible content highlighting.
- Added CSV template downloads: `assets/templates/war_table_armies_template.csv` and `assets/templates/war_table_factions_template.csv`.
- Added Help links in app footer and Settings card, opening wiki in new tab.

11. Rules reading-mode reframe (Field Manual + Full Rulebook)
- Help Wiki rules area is player/GM-facing field-manual content (no PRD/source-file/status-label framing in the rules surface).
- Removed rules-area terminology bridge copy and standardized wording to `Compare-style`.
- User-facing mode wording is standardized to `Compare-style`; internal mode key remains `risk`.
- Added explicit quick-vs-full navigation:
  - Quick rules: `War_Table_Help_Wiki.html`
  - Full rules: `War_Encounter_Rules_2026_v4.html`
- Added reciprocal links between both pages.
- Cleaned full rulebook page to War Table styling by removing Google Docs-export style blob and loading shared theme stack.
- Added rulebook-specific long-form stylesheet: `assets/css/war-table-rulebook.css`.
- Added full rulebook left-rail utility system:
  - indexed in-page search
  - hierarchical table-of-contents navigation
  - quick actions (PDF download + Google Docs link)
- In-content long ToC is retained but collapsed under `Table of Contents`.
- Help Wiki and Full Rulebook UI copy is user-facing by default (player/GM language, no dev-status framing in visible copy).

12. Help -> app cross-link routing
- Added hash-tab routing in app shell for deep links:
  - `#tab-battle`
  - `#tab-armies`
  - `#tab-factions`
  - `#tab-history`
  - `#tab-settings`
- `switchTab()` is now reachable through hash routing on load and `hashchange`.

## Top-Level Architecture

App layout:

1. HTML shell in `War_Table_v3.html`
- Structure, controls, IDs, and all JavaScript logic.
- No inline CSS block remains.

2. Shared CSS base layer in `assets/css/war-table-theme.css`
- Tokens, component styles, modal styles, history/report styles, and page-specific battle styles.
- Base parchment gradient + grain.
- Desktop-only texture overlay (`body::after`) for map tile.

3. Shared CSS runtime state layer in `assets/css/war-table-state-themes.css`
- Additive weather/phenomena/defeat visual routing only.
- No mechanics logic in CSS; all state comes from body dataset flags.

4. Rulebook reading layer in `assets/css/war-table-rulebook.css`
- Long-form typography and table readability for the full rulebook surface.
- Extends shared theme styles without changing app mechanics or contracts.
- Loaded after base CSS to keep deterministic override order.

5. Help page CSS layout layer in `assets/css/war-table-help.css`
- Help page shell layout, nav/search/results styling, long-form readability helpers, and responsive behavior.
- Relies on shared theme tokens/components from base/runtime stylesheets.

6. JavaScript sections in `War_Table_v3.html`
- Rules/data constants.
- Weather models and helpers.
- Utilities and normalizers.
- Persistence and migration (`schema v7`).
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

6. JavaScript in `War_Table_Help_Wiki.html`
- Client-side indexed search for headings/sections/FAQ/glossary.
- Result ranking, keyboard navigation, anchor focus/scroll behavior.
- Copy-to-clipboard helpers for CSV example blocks.

Section/index markers exist in code via `// [SECTION] ...` and `// [INDEX] ...` comments for fast navigation.

## CSS Source-of-Truth Contract

- Canonical base stylesheet: `/Users/jonathanhobson/Downloads/War Tool ChatGPT/assets/css/war-table-theme.css`
- Canonical runtime state stylesheet: `/Users/jonathanhobson/Downloads/War Tool ChatGPT/assets/css/war-table-state-themes.css`
- Help layout stylesheet: `/Users/jonathanhobson/Downloads/War Tool ChatGPT/assets/css/war-table-help.css`
- HTML load order:
  1. `<link rel="stylesheet" href="assets/css/war-table-theme.css" />`
  2. `<link rel="stylesheet" href="assets/css/war-table-state-themes.css" />`
  3. `<link rel="stylesheet" href="assets/css/war-table-help.css" />` (Help wiki page only)
- There is no inline style fallback in `War_Table_v3.html` anymore.
- Base component rules go in `war-table-theme.css`; state-driven visual routing rules go in `war-table-state-themes.css`.
- Help-page-only layout/search/readability rules go in `war-table-help.css`.
- Keep asset URLs in CSS relative to the CSS file location (example: `../backgrounds/...` for map textures).

## Runtime Theme Routing Contract

Theme route is applied on `body` via `applyThemeRoute(resolveThemeRoute())` from `render()`.

Dataset keys:
- `data-season`
- `data-weather`
- `data-phenomena`
- `data-intensity`
- `data-state`
- `data-defeat-side`
- `data-theme-weather-enabled`
- `data-theme-phenomena-enabled`
- `data-theme-defeat-enabled`
- `data-theme-strength`

Precedence:
1. base parchment
2. season tint
3. weather layer
4. phenomena layer
5. intensity scaling
6. defeat layer

Defeat side routing:
- Primary source: live attacker/defender sizes (`0` => defeated).
- Fallback source: `lastResult.stopReason` only when live sizes are unavailable (`null`/unset).
- Outputs: `attacker`, `defender`, `mutual`, or `none`.

## Persistence Contracts

### Storage

- Key: `warTableState`
- Schema: `7`

### Persisted state shape

```json
{
  "schemaVersion": 7,
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
  "showWarReportModal": true,
  "weatherThemesEnabled": true,
  "phenomenaThemesEnabled": true,
  "defeatThemesEnabled": true,
  "themeStrengthMode": "subtle | dramatic"
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
1. `loadPersisted()` always returns schema v7 shape and normalizes army/settings/draft payloads.
2. Legacy bridge maps weather-level theme flags (`weather.enablePhenomenaTheme`, `weather.enableDefeatTheme`) into canonical `settings.*ThemesEnabled` when missing.
3. `persist(saved)` writes full canonical payload, and snapshots assist/hinder draft when writing live state.
4. `persistWeather(ws)` updates weather in storage while preserving other fields.
5. Import paths sanitize and normalize before mutation.

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
- Saves weather + battle rules + doctrine eligibility + assist/hinder controls + war report modal setting + theme toggles/strength mode.
- Theme controls:
  - `settingsWeatherThemesEnabled`
  - `settingsPhenomenaThemesEnabled`
  - `settingsDefeatThemesEnabled`
  - `settingsThemeStrengthMode`
- Includes Help/Wiki card with CTA link to `War_Table_Help_Wiki.html` (new tab).

## App tab hash routing

- App supports direct tab routing by URL hash:
  - `War_Table_v3.html#tab-battle`
  - `War_Table_v3.html#tab-armies`
  - `War_Table_v3.html#tab-factions`
  - `War_Table_v3.html#tab-history`
  - `War_Table_v3.html#tab-settings`
- `parseTabFromHash()` validates allowed tabs.
- `applyHashTabRoute()` applies route on load and on `hashchange`.
- Tab clicks now update hash via `history.replaceState(...)` to preserve deep-link state.

## Help Wiki page

- Dedicated documentation surface at `War_Table_Help_Wiki.html`.
- Includes anchored sections:
  - `#start-here`
  - `#battle-guide`
  - `#armies-factions`
  - `#import-export`
  - `#settings-reference`
  - `#war-report-history`
  - `#faq`
  - `#glossary`
  - `#game-rules-placeholder`
  - `#rules-landing`
  - `#rules-quick-start`
  - `#rules-strategic-core`
  - `#rules-army-classes`
  - `#rules-doctrines`
  - `#rules-weather-terrain`
  - `#rules-command-meters`
  - `#rules-optional-mechanics`
  - `#rules-appendix`
- Includes indexed search input (`#helpSearchInput`) with result list (`#helpSearchResults`) and status (`#helpSearchStatus`).
- Includes copy buttons for inline CSV examples and direct download links for template files.
- Uses two reading modes:
  - quick field-manual rules inside Help Wiki (player/GM-facing language)
  - full canonical rulebook at `War_Encounter_Rules_2026_v4.html`
- Rules sections keep the same anchor/search architecture but no longer display implementation-status labels in player-facing content.
- Help chip/badge layout remains, with wording rewritten to player/GM-friendly microcopy.

## Full Rulebook page

- Canonical long-form rules page at `War_Encounter_Rules_2026_v4.html`.
- Loads shared theme stack:
  - `assets/css/war-table-theme.css`
  - `assets/css/war-table-state-themes.css`
  - `assets/css/war-table-rulebook.css`
- Includes reciprocal link back to Help Wiki quick rules.
- Contains full rules text coverage with gameplay meaning preserved.
- Adds sticky left-rail cards:
  - `Find in Rulebook` (`#rulebookSearchInput`, `#rulebookSearchResults`, `#rulebookSearchStatus`)
  - `Table of Contents` (`#rulebookTocList`) generated from `h1..h4`
  - `Quick Actions` (PDF download, Google Docs, back-to-top)
- Uses a load-time DOM transform to wrap the inline long ToC into collapsed details (`Table of Contents`), preserving source content while improving readability.

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
- Help wiki template assets:
  - `assets/templates/war_table_armies_template.csv`
  - `assets/templates/war_table_factions_template.csv`

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

Implementation location:
- Base visual rules are defined in `assets/css/war-table-theme.css`.
- Runtime weather/phenomena/defeat routing is defined in `assets/css/war-table-state-themes.css`.
- No inline HTML CSS is used.

Phenomena identity contract (P2.1):
- Runtime CSS exposes tokenized signatures per phenomenon:
  - `--phen-overlay-a/b/c`
  - `--phen-border`, `--phen-frame-shadow`
  - `--phen-sparkle-opacity`, `--phen-streak-opacity`, `--phen-speckle-opacity`
  - `--phen-vignette-strength`, `--phen-corner-pool`
- Phenomena must differ by composition/shape language, not color only.
- Dramatic mode primarily increases phenomena impact, while normal weather stays restrained.

## Key IDs and Function Anchors

High-use IDs:
- Battle controls: `battleBtn`, `copyResult`, `attackerCommit`, `defenderCommit`
- War Report: `warReportModal`, `warReportBattleAgainBtn`, `warReportAutoResolveBtn`, `warReportAutoStatus`
- Settings: `showWarReportModal`, `assistHinderEnabled`, `assistHinderDiceCap`, `overrideDoctrineEligibility`, `settingsWeatherThemesEnabled`, `settingsPhenomenaThemesEnabled`, `settingsDefeatThemesEnabled`, `settingsThemeStrengthMode`
- Faction modal: `factionModal`, `factionName`, `factionArmySelect`, `factionArmyChips`, `factionModalSave`
- Help wiki: `helpSearchInput`, `helpSearchResults`, `helpSearchStatus`
- Rules helper anchors: `game-rules-placeholder`, `rules-landing`, `rules-quick-start`, `rules-strategic-core`, `rules-army-classes`, `rules-doctrines`, `rules-weather-terrain`, `rules-command-meters`, `rules-optional-mechanics`, `rules-appendix`

High-risk functions:
- `runBattleRound`
- `switchTab`
- `parseTabFromHash`
- `applyHashTabRoute`
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

6. Shared stylesheet ordering
- Because CSS is externalized, load order and selector specificity are critical:
  1. `war-table-theme.css` (base components/tokens)
  2. `war-table-state-themes.css` (runtime state themes)
  3. `war-table-help.css` (Help wiki layout/search/readability; loaded on Help page only)
- Keep `applyThemeRoute()` observer-only (no battle mechanics coupling), and test battle/history/modal surfaces together.

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

1. README states schema v7 and `battleDraft.assistHinder`.
2. README reflects current settings keys including `showWarReportModal`.
3. README documents `runBattleRound` and war report chain controls.
4. README documents enriched history fields and null-safe rendering behavior.
5. README documents single-input commit behavior and microcopy.
6. README documents adv/dis transparency in breakdown.
7. README documents auto-resolve stop behavior including `phenomena_triggered` and safety guard.
8. README does not present unimplemented behavior as shipped.
9. README states CSS source-of-truth includes `assets/css/war-table-theme.css`, `assets/css/war-table-state-themes.css`, and `assets/css/war-table-help.css` (help page), and notes no inline `<style>` in app HTML.

## Maintenance Checklist

When features change in code, update this README in the same change:

1. Schema/state contract section.
2. Settings keys/defaults.
3. Runtime side shape.
4. History payload contract.
5. Key IDs/functions table.
6. Known mismatches/tech debt list.
7. Snapshot counts/date.

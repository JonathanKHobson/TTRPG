# War Table v3 - Developer Source-of-Truth Guide

This document is the implementation source of truth for the shipped app.

Primary implementation files:
- `/Users/jonathanhobson/Downloads/War Tool ChatGPT/War_Table_v3.html`
- `/Users/jonathanhobson/Downloads/War Tool ChatGPT/assets/css/war-table-theme.css`

Policy:
- Document implemented behavior only.
- Do not document planned or unshipped behavior as implemented.
- If code and this README diverge, update this README in the same change.

Companion docs:
- `/Users/jonathanhobson/Downloads/War Tool ChatGPT/assets/documentation/ARCHITECTURE_INDEX_War_Table_v3.md`
- `/Users/jonathanhobson/Downloads/War Tool ChatGPT/assets/documentation/BACKEND_CLEANUP_PARITY_CHECKLIST.md`

## Current Snapshot (refreshed March 6, 2026)

- App file: `/Users/jonathanhobson/Downloads/War Tool ChatGPT/War_Table_v3.html`
- App lines: `8,601`
- Help wiki file: `/Users/jonathanhobson/Downloads/War Tool ChatGPT/War_Table_Help_Wiki.html`
- Help wiki lines: `1,076`
- Rulebook file: `/Users/jonathanhobson/Downloads/War Tool ChatGPT/War_Encounter_Rules_2026_v4.html`
- Rulebook lines: `12,642`
- Shared base stylesheet: `/Users/jonathanhobson/Downloads/War Tool ChatGPT/assets/css/war-table-theme.css`
- Base stylesheet lines: `1,317`
- Shared runtime theme stylesheet: `/Users/jonathanhobson/Downloads/War Tool ChatGPT/assets/css/war-table-state-themes.css`
- Runtime theme stylesheet lines: `437`
- Help layout stylesheet: `/Users/jonathanhobson/Downloads/War Tool ChatGPT/assets/css/war-table-help.css`
- Help layout stylesheet lines: `341`
- Rulebook stylesheet: `/Users/jonathanhobson/Downloads/War Tool ChatGPT/assets/css/war-table-rulebook.css`
- Rulebook stylesheet lines: `290`
- Persistence schema: `SCHEMA_VERSION = 7`
- Storage key: `warTableState`
- Architecture: local-first app (single HTML app shell + shared CSS + in-file JS + localStorage persistence)

## Code Reference Index

- `/Users/jonathanhobson/Downloads/War Tool ChatGPT/War_Table_v3.html` - `battleBtn`, `showWarReportModal`, `runBattleRound`, `openWarReportModal`, `startWarReportAutoResolve`, `setWarReportActionState`, `requestWarReportAutoStop`, `closeWarReportModal`, `clearWarReportLastBattlePreview`, `buildWarReportBattleContextKey`
- `/Users/jonathanhobson/Downloads/War Tool ChatGPT/War_Table_v3.html` - `warReportRoundLimit`, `warReportWeatherStrip`, `warReportStagingWrap`, `warReportStagingNotice`, `warReportStageAttCommit`, `warReportStageDefCommit`, `warReportPreviousWrap`, `warReportSessionLine`, `warReportSessionSummary`, `warReportRoundList`, `warReportAutoStatus`
- `/Users/jonathanhobson/Downloads/War Tool ChatGPT/assets/css/war-table-theme.css` - `.battleGrid`, `.card.center`, `#resultHeadline`, `#warReportModal .dlgFoot`, `.warReportActionRow`, `.warReportAutoControls`

## Canonical Architecture Contract

1. HTML shell in `War_Table_v3.html`
- All UI structure, IDs, event bindings, runtime state, and battle logic.
- No inline `<style>` block remains.

2. Base CSS in `assets/css/war-table-theme.css`
- Tokens, components, modals, battle center card, and responsive layout rules.

3. Runtime theme CSS in `assets/css/war-table-state-themes.css`
- Additive weather/phenomena/defeat visual routing from `body` dataset values.

4. Help and rulebook surfaces
- `War_Table_Help_Wiki.html` with `assets/css/war-table-help.css`.
- `War_Encounter_Rules_2026_v4.html` with `assets/css/war-table-rulebook.css` plus shared theme stack.

5. CSS load-order contract
- App page loads base theme first, then runtime state theme.
- Help page adds help layout stylesheet on top of shared styles.
- Rulebook adds rulebook stylesheet on top of shared styles.

## Persistence and Runtime State Contract

Storage:
- Key: `warTableState`
- Schema: `7`

Persisted top-level payload:
- `schemaVersion`
- `updatedAt`
- `armies`
- `factions`
- `battleHistory`
- `weather`
- `settings`
- `battleDraft.assistHinder`

Settings keys:
- `resolutionMode`
- `quickLossPreset`
- `allowOverCap`
- `overrideDoctrineEligibility`
- `assistHinderEnabled`
- `assistHinderDiceCap`
- `showWarReportModal`
- `weatherThemesEnabled`
- `phenomenaThemesEnabled`
- `defeatThemesEnabled`
- `themeStrengthMode`

Runtime side state compatibility note:
- `autoCommit` is still present for backward compatibility, while commit UX is now single-input (`blank = auto`, numeric = manual).
- Side setup UX is runtime-only and non-persisted:
  - `setupMode: "chooser" | "creating" | "loaded"`
  - `armyNameDraft: string`

Core persistence helpers:
- `emptyState`
- `loadPersisted`
- `persist`
- `persistWeather`
- `normalizeSettings`
- `normalizeBattleDraft`

## Battle Engine Contract

### Shared execution path

`runBattleRound(options)` is the shared single-round execution engine.

Used by:
- direct battle flow from `battleBtn` when `showWarReportModal` is disabled
- War Report single-round action (`warReportBattleAgainBtn`)
- War Report auto flow (`startWarReportAutoResolve`)

Important:
- `runBattleRound` does not open the War Report modal.
- Modal open/transition behavior is managed by call-site UI handlers (`battleBtn`, `openWarReportModal`, War Report actions).

### `runBattleRound` order contract

1. Snapshot current weather into `weatherUsed`.
2. Resolve assist/hinder for battle mode.
3. Compute pools.
4. Validate readiness and commit constraints.
5. Roll committed dice.
6. Apply assist roll operations.
7. Apply advantage/disadvantage roll operations.
8. Resolve outcome (`risk` or `quick`).
9. Apply doctrine and assist runtime boundaries.
10. Persist draft + rerender base surfaces.
11. Store `state.lastResult`.
12. Render inline result area.
13. Append battle history entry.
14. Auto-advance weather for next battle if enabled.
15. Return payload to caller.

Stop reasons:
- `attacker_defeated`
- `defender_defeated`
- `mutual_destruction`
- `phenomena_triggered`
- `safety_limit`

## Battle Side Progressive Setup Contract

Each battle side panel (`attacker`, `defender`) uses a three-state setup flow:
- `chooser`
- `creating`
- `loaded`

Chooser mode:
- Shows saved-army loader + `Create new army` CTA.
- Hides defeated styling/banner and advanced controls.

Creating mode:
- Shows `Army Name` draft input, class, size, STR, commit, pool summary, dice type.
- Shows one collapsed `Advanced setup` disclosure containing doctrines, nearby, breakdown, context, manual override.
- `Army Name` is draft-only and never auto-persists.

Loaded mode:
- Same visible layout as creating mode.
- Keeps class/size/STR editable inline.
- Uses loaded army name as initial `armyNameDraft`.
- Shows defeated banner/styling when size is `0`.

Transitions:
- `Create new army`: `chooser -> creating` and clears side runtime battle setup.
- `Load`: `chooser -> loaded` via `loadArmyIntoSide`.
- `Set up another army` / `Cancel setup`: `creating|loaded -> chooser` using side-local reset.
- `resetAll()`: both sides return to chooser.
- `prefillExample()`: both sides become creating (manual, unsaved setup).
- `swapSides()`: swaps setup state and draft names along with side runtime state.

Implementation helpers:
- `normalizeSideSetupMode`
- `setSideSetupMode`
- `resetSideToChooser`
- `syncSideSetupVisibility`
- `collapseSideAdvancedSetup`

## War Report Contract (State Machine)

Modal ID:
- `warReportModal`

Primary modes:
- `staging`
- `single-result`
- `auto-running`
- `auto-stopped`

Accepted mode set in `openWarReportModal` also includes `auto-session` for session rendering compatibility.

### Entry and battle-button gating

`battleBtn` behavior:
- If `state.settings.showWarReportModal !== false`: open War Report in `staging` and do not execute a round.
- If disabled: execute one round immediately via `runBattleRound({ source: "battle-btn" })`.

This means `showWarReportModal` currently behaves as:
- "Battle opens War Report staging first"
and not as:
- "Battle popup only after a round has already run"

### `staging` mode contract

Displayed:
- weather strip (`warReportWeatherStrip`) with current weather/time
- staging notice (`warReportStagingNotice`): no round has been run yet
- attacker and defender compact summaries
- central `VS` block
- commit-dice inputs:
  - `warReportStageAttCommit`
  - `warReportStageDefCommit`
- optional previous-battle summary/details (`warReportPreviousWrap`) when preview context is valid

Hidden in staging:
- outcome banner and defeated callout
- result columns
- details accordion (`warReportDetails`)

Primary action label:
- `Start Battle` when no valid last preview
- `Battle Again` when valid last preview exists

### Result modes (`single-result`, `auto-running`, `auto-stopped`)

Displayed:
- outcome banner (`warReportOutcome`)
- defeated callout (`warReportDefeatedCallout`) when applicable
- side result columns
- details accordion with:
  - session summary blocks in auto modes
  - weather used / next weather
  - roll details
  - comparisons
  - dice math breakdown

Weather presentation:
- top strip always shows current weather/time
- when payload exists, strip includes weather-used context
- details section shows weather-used and post-round next weather labels

### Auto-battle contract

Auto action controls:
- `warReportAutoResolveBtn` (`Auto-Battle`)
- `warReportRoundLimit` (`Until stop`, `3`, `5`, `10`, `25`, `50`)
- `warReportAutoStatus` live region (`role="status"`, `aria-live="polite"`, `aria-atomic="true"`)

Session runtime source of truth:
- `_warReportAutoSession`

Session helpers:
- `createWarReportAutoSession`
- `appendWarReportAutoSessionRound`
- `finalizeWarReportAutoSession`
- `renderWarReportSessionBlocks`

Stop behavior order in `startWarReportAutoResolve`:
1. domain stop reason from payload
2. user stop request (`_warReportAutoStopRequested`)
3. selected round limit reached
4. safety limit reached (500 rounds)

Stop/close semantics:
- While auto-running, both close controls are relabeled to `Stop` and call `requestWarReportAutoStop` only.
- Manual stop keeps modal open and transitions to `auto-stopped`.
- Esc/cancel during auto-running behaves as stop-and-stay-open because `cancel` is prevented and routed through `closeWarReportModal`.
- When not auto-running, close controls behave normally and dismiss the dialog.
- Round-limit selector resets to `Until stop` after auto run finalization.

## War Report Previous-Battle Preview Validity Contract

Runtime-only preview state:
- `_warReportViewState.lastBattlePreview`
- `_warReportViewState.lastBattleContextKey`
- `_warReportViewState.lastBattleTurn`

Preview is not persisted and is lost on refresh/runtime restart.

Validity check:
- turn identity must match (`getWarReportTurnIdentity`)
- context key must match (`buildWarReportBattleContextKey`)

`buildWarReportBattleContextKey` includes:
- attacker/defender `classId`
- attacker/defender `size`
- attacker/defender `str`
- attacker/defender `manualDiceDelta`
- attacker/defender `diceOverride`
- attacker/defender `capOverride`
- attacker/defender `adv`
- attacker/defender `disadv`
- normalized doctrines on both sides
- raw commit input values (`attackerCommit`, `defenderCommit`)
- turn identity

Not included in preview context key:
- weather/time values

Implication:
- manual weather/time changes alone do not invalidate previous-battle preview.

Explicit preview clears happen on:
- army loading/reset flows
- attacker/defender class changes
- attacker/defender size and STR input edits
- `Advance Turn`
- wipe/reset paths
- refresh/runtime restart

## Center Engagement Card and CSS Containment Contract

The center card uses a constrained layout model to prevent overflow bleed in narrow desktop center-column widths.

Implemented base selectors in `assets/css/war-table-theme.css`:
- `.battleGrid` desktop template uses `minmax(0, 1fr) minmax(0, 300px) minmax(0, 1fr)`
- `.battleGrid > * { min-width: 0; }`
- `.card.center { overflow: hidden; min-width: 0; contain: inline-size; }`
- center subtree shrink rules:
  - `.card.center .vs`
  - `.card.center .battleActions`
  - `.card.center .result`
  - `.card.center .alert`
  - `.card.center details`
  - `.card.center .row`

Result text containment:
- `.result .who` and `#resultHeadline` are single-line with ellipsis.
- `#validationMsg`, `#resultSummary`, and detail-content wrappers use safe wrapping (`overflow-wrap`).

Action and narrow-width hardening:
- `.card.center .battleActions` stretches controls to container width.
- `.card.center .turnBtn` is width-constrained to avoid bleed.
- Narrow desktop breakpoint tunes center padding/font pressure.

## War Report Modal Layout and Control Styling Contract

War Report footer layout in `war-table-theme.css`:
- `#warReportModal .dlgFoot` uses grid areas for:
  - action row
  - status
  - primary close/stop button

Button alignment/styling:
- action row aligns single and auto controls in one group
- `#warReportClose` and `#warReportClosePrimary` share standard button sizing and rectangular appearance
- stop/close relabeling happens in JS only via `setWarReportActionState`

## History and Transparency Contracts

History:
- `appendHistory` writes enriched battle entries with round context, weather snapshots, roll logs, assist/hinder context, and stop reason.
- `renderHistoryList` remains null-safe for older entries.

Math transparency:
- `computePool` breakdown includes advantage/disadvantage counts and net reroll display.
- These lines are transparency outputs; reroll operations are applied in roll phase helpers.

Assist/Hinder and doctrines:
- Existing doctrine and assist/hinder contracts remain additive and compatible with the shared battle path.
- No battle-math semantics were changed by the War Report staging/session work.

## Key IDs and Function Anchors

High-use IDs:
- Battle controls: `battleBtn`, `turnBtn`, `resultArea`, `resultHeadline`, `copyResult`, `attackerCommit`, `defenderCommit`
- Battle setup flow: `attChooserWrap`, `defChooserWrap`, `attSetupWrap`, `defSetupWrap`, `attCreateArmyBtn`, `defCreateArmyBtn`, `attSetupChangeBtn`, `defSetupChangeBtn`, `attackerArmyNameDraft`, `defenderArmyNameDraft`, `attAdvancedSetupDetails`, `defAdvancedSetupDetails`
- War Report core: `warReportModal`, `warReportClose`, `warReportClosePrimary`, `warReportBattleAgainBtn`, `warReportAutoResolveBtn`, `warReportAutoStatus`
- War Report staging/session: `warReportWeatherStrip`, `warReportStagingNotice`, `warReportStagingWrap`, `warReportStageAttCommit`, `warReportStageDefCommit`, `warReportPreviousWrap`, `warReportRoundLimit`, `warReportSessionLine`, `warReportSessionSummary`, `warReportRoundList`
- Settings: `showWarReportModal`, `assistHinderEnabled`, `assistHinderDiceCap`, `overrideDoctrineEligibility`, `settingsWeatherThemesEnabled`, `settingsPhenomenaThemesEnabled`, `settingsDefeatThemesEnabled`, `settingsThemeStrengthMode`

High-risk functions:
- `runBattleRound`
- `openWarReportModal`
- `startWarReportAutoResolve`
- `setWarReportActionState`
- `closeWarReportModal`
- `requestWarReportAutoStop`
- `setSideSetupMode`
- `resetSideToChooser`
- `syncSideSetupVisibility`
- `collapseSideAdvancedSetup`
- `buildWarReportBattleContextKey`
- `clearWarReportLastBattlePreview`
- `appendHistory`
- `renderHistoryList`
- `persist`
- `persistWeather`

## Fragile Areas and Safe Change Rules

1. Battle-button staging gate
- Do not accidentally reintroduce immediate battle execution when `showWarReportModal` is enabled.

2. Battle engine order
- Preserve weather snapshot timing and post-battle weather advance timing in `runBattleRound`.

3. War Report preview validity
- Keep preview context-key fields and invalidation pathways consistent with current UX contract.

4. Auto loop lifecycle
- Respect `_warReportAutoToken`, `_warReportAutoRunning`, and `_warReportAutoStopRequested` lifecycle rules to avoid stale-loop races.

5. Center card containment selectors
- Avoid removing center-specific shrink/overflow constraints.
- Test both desktop 3-column layout and mobile/single-column layout after center-card CSS edits.

6. Side setup state is runtime-only
- Do not persist `setupMode` or `armyNameDraft` into storage schema.
- Keep side reset transitions local to the selected side.

7. Stylesheet ordering
- Preserve base theme before runtime state theme.

## Known Mismatches and Technical Debt

1. Settings label mismatch
- UI label still reads `War Report popup after Battle`, but runtime behavior now opens staging before first round.

2. About version string is stale
- About card still shows `Phase 3.1 (Weather System)`.

3. Legacy runtime key retained
- `autoCommit` remains in side runtime state for compatibility.

4. Battle setup naming is draft-only by design
- `armyNameDraft` is UI state only; save/update remains modal-driven and explicit.

5. Mixed icon language
- Some surfaces still mix emoji and SVG iconography.

## Documentation QA Checklist

1. README matches current `battleBtn` staging gate behavior with `showWarReportModal`.
2. README does not claim `runBattleRound` opens the War Report modal.
3. README uses current War Report mode labels and includes session runtime objects.
4. README documents previous-battle preview validity and explicit invalidation behavior.
5. README documents center-card containment selectors and one-line headline truncation behavior.
6. README reflects current auto-battle controls (`Auto-Battle`, round limit selector, stop semantics).
7. README keeps persistence schema/storage keys accurate.
8. README avoids documenting unshipped PRD behavior as implemented.

## Maintenance Checklist

When behavior changes, update this README in the same change:
1. Current snapshot counts/date.
2. Battle flow and War Report mode contracts.
3. Preview validity/invalidation rules.
4. CSS containment and layout contracts for center card and modal actions.
5. Key IDs and function anchors.
6. Known mismatches/technical debt list.

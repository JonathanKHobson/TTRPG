# Fantasy War Sim - Developer Source-of-Truth Guide

This document is the implementation source of truth for the shipped app.

Primary implementation files:
- `fantasy-war-sim.html`
- `assets/css/war-table-theme.css`

Policy:
- Document implemented behavior only.
- Do not document planned or unshipped behavior as implemented.
- If code and this README diverge, update this README in the same change.

Companion docs:
- `assets/documentation/FANTASY_WAR_SIM_ARMY_LOGIC_STABILIZATION_ROADMAP.md`
- `assets/documentation/ARCHITECTURE_INDEX_War_Table_v3.md`
- `assets/documentation/fantasy-war-sim-class-matchup-logic-guide.md`
- `assets/documentation/fantasy-war-sim-dice-modifier-logic-guide.md`
- `assets/documentation/WAR_TABLE_v3_STABILIZATION_TICKET_LOG.md`
- `assets/documentation/WAR_TABLE_v3_STABILIZATION_CHANGE_LOG.md`
- `assets/documentation/WAR_TABLE_v3_IMPLEMENTATION_DRIFT_LOG.md`
- `CLAUDE_HANDOFF.md`

Explanatory overlays:
- The two `fantasy-war-sim-*-logic-guide.md` docs are plain-English mapping guides for humans and audit agents.
- They are not the canonical implementation contract.

## Current Snapshot (refreshed March 8, 2026)

- App file: `fantasy-war-sim.html`
- App lines: `10,636`
- Legacy fallback file: `War_Table_v3.html`
- Fallback behavior: compatibility redirect to `fantasy-war-sim.html` only
- Help wiki file: `fantasy-war-sim-help-wiki.html`
- Help wiki lines: `1,083`
- Rulebook file: `War_Encounter_Rules_2026_v4.html`
- Rulebook lines: `12,642`
- Shared base stylesheet: `assets/css/war-table-theme.css`
- Base stylesheet lines: `1,592`
- Shared runtime theme stylesheet: `assets/css/war-table-state-themes.css`
- Runtime theme stylesheet lines: `437`
- Help layout stylesheet: `assets/css/war-table-help.css`
- Help layout stylesheet lines: `341`
- Rulebook stylesheet: `assets/css/war-table-rulebook.css`
- Rulebook stylesheet lines: `290`
- Persistence schema: `SCHEMA_VERSION = 7`
- Storage key: `warTableState`
- Architecture: local-first app (single HTML app shell + shared CSS + in-file JS + localStorage persistence)
- Frontend brand: `Fantasy War Sim`
- Intentional legacy internals: `warTableState`, `war-table-*` CSS filenames, and doc filenames that still carry `War_Table_v3`

## Code Reference Index

- `fantasy-war-sim.html` - `battleBtn`, `showWarReportModal`, `runBattleRound`, `applyPostResolutionSpecialRules`, `openWarReportModal`, `startWarReportAutoResolve`, `setWarReportActionState`, `requestWarReportAutoStop`, `closeWarReportModal`, `clearWarReportLastBattlePreview`, `buildWarReportBattleContextKey`
- `fantasy-war-sim.html` - `warReportRoundLimit`, `warReportWeatherStrip`, `warReportStagingWrap`, `warReportStagingNotice`, `warReportStageAttCommit`, `warReportStageDefCommit`, `warReportPreviousWrap`, `warReportSessionLine`, `warReportSessionSummary`, `warReportRoundList`, `warReportAutoStatus`
- `fantasy-war-sim.html` - `startNewRuntimeSession`, `advanceRuntimeBattleTurn`, `nextRuntimeBattleIndex`, `handleStartNewSessionFromUi`, `appendHistory`, `renderHistoryList`, `newHistorySessionBtn`, `newBattleSessionBtn`
- `assets/css/war-table-theme.css` - `.battleGrid`, `.card.center`, `#resultHeadline`, `#warReportModal .dlgFoot`, `.warReportActionRow`, `.warReportAutoControls`, `.battleBottomActions`, `.historyGroups`, `.historySessionGroup`, `.historyTurnGroup`, `.historyToggleBtn`

## Canonical Architecture Contract

1. HTML shell in `fantasy-war-sim.html`
- All UI structure, IDs, event bindings, runtime state, and battle logic.
- No inline `<style>` block remains.
- `War_Table_v3.html` is not part of the main implementation path; it is a compatibility redirect only.

2. Base CSS in `assets/css/war-table-theme.css`
- Tokens, components, modals, battle center card, and responsive layout rules.

3. Runtime theme CSS in `assets/css/war-table-state-themes.css`
- Additive weather/phenomena/defeat visual routing from `body` dataset values.

4. Help and rulebook surfaces
- `fantasy-war-sim-help-wiki.html` with `assets/css/war-table-help.css`.
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
- `quickLossPreset` (default `rulesAsWritten`)
- `dicePoolMode`
- `allowOverCap`
- `overrideDoctrineEligibility`
- `assistHinderEnabled`
- `assistHinderDiceCap`
- `showWarReportModal`
- `weatherThemesEnabled`
- `phenomenaThemesEnabled`
- `defeatThemesEnabled`
- `themeStrengthMode`

Visible build label:
- `APP_BUILD = "2026-03-08-three-pool-scale-p1"`
- Rendered in header, About, and footer for local/hosted parity checks.

Runtime side state compatibility note:
- `autoCommit` is still present for backward compatibility, while commit UX is now single-input (`blank = auto`, numeric = manual).
- Side setup UX is runtime-only and non-persisted:
  - `setupMode: "chooser" | "creating" | "loaded"`
  - `armyNameDraft: string`

Runtime session/turn state (non-persisted):
- `runtimeSessionId`
- `runtimeSessionStartedAt`
- `runtimeSessionLabel`
- `runtimeBattleTurn` (starts at `1`)
- `runtimeBattleIndexInTurn` (in-turn counter, starts at `1`)

History entry additive metadata (persisted per battle record):
- `sessionId`
- `sessionStartedAt`
- `sessionLabel`
- `turnNumber`
- `battleIndexInTurn`

Runtime session/turn helpers:
- `startNewRuntimeSession({ source })`
- `advanceRuntimeBattleTurn()`
- `nextRuntimeBattleIndex()`

Dirty-state helpers:
- `getSideArmyDirtyState(sideKey)` compares only saveable army fields (`armyNameDraft`, `classId`, `size`, `str`, `doctrines`).
- `getSettingsDirtyState()` compares the canonical normalized settings/weather save snapshot built from the same fields as `saveSettingsFromControls()`.

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

Battle-start validation gate:
- `validateReady(attComp)` now includes class-ceiling checks through `getArmyScaleValidationIssue(sideKey, state)`.
- The same gate is hit by direct battle runs and War Report battle-start actions because both flows execute through `runBattleRound`.
- Ceiling failures disable the main Battle button in normal render flow and surface the same block through the existing validation message container.
- Fresh-load setup gaps are rendered through `renderBattleReadinessMessage(issues)` as neutral guidance in `#validationMsg` when every issue is a missing-field/setup issue.
- Invalid-action and runtime-error paths still escalate `#validationMsg` into assertive alert treatment through the shared `setLiveMessage()` helper.

### `runBattleRound` order contract

1. Snapshot current weather into `weatherUsed`, then apply any ticketed pre-battle weather normalization that must happen before pool calculation.
2. Resolve assist/hinder for battle mode.
3. Compute pools.
4. Validate readiness and commit constraints.
5. Roll committed dice.
6. Apply assist roll operations.
7. Apply advantage/disadvantage roll operations.
8. Resolve outcome (`risk` or `quick`).
9. Apply post-resolution special rules (`applyPostResolutionSpecialRules`) without changing weather timing.
10. Apply doctrine and assist runtime boundaries.
11. Persist draft + rerender base surfaces.
12. Auto-advance weather for next battle if enabled, then apply any ticketed post-battle weather clamp that preserves the current weather-order contract.
13. Store `state.lastResult`.
14. Render inline result area.
15. Append battle history entry.
16. Return payload to caller.

Stop reasons:
- `attacker_defeated`
- `defender_defeated`
- `mutual_destruction`
- `phenomena_triggered`
- `safety_limit`

### Modifier order contract

`computePool()` is now mode-aware:

- `legacy` preserves the shipped direct-cap flow:
  1. effective size / STR inputs
  2. base dice from size and STR
  3. intrinsic class effects
  4. matchup layer
  5. bespoke matchup rider layer
  6. generic weather layer
  7. class weather specials
  8. direct self / battle-context layer
  9. doctrine layer
  10. phenomena layer
  11. nearby assist / hinder layer
  12. manual override
  13. cap / floor handling
  14. class dice-shape pass
  15. roll generation and roll-operation effects
  16. resolution

- `threePool` is an intentional rules change:
  1. effective size / STR inputs
  2. Total dice from size and STR only
  3. Usable-dice cap (`softDiceCaps`) applied to Total dice
  4. post-usable-cap dice modifiers:
     - intrinsic
     - matchup
     - bespoke matchup rider
     - generic weather
     - class weather special dice bonuses
     - direct context
     - doctrine
     - phenomena
     - nearby assist / hinder `diceDelta`
     - manual override
  5. Dice to roll cap applied unless `allowOverCap` or side `capOverride` bypasses it
  6. class dice-shape pass (Mutants / Gunners mixed dice)
  7. roll generation and roll-operation effects
  8. resolution

Consumer contract:
- in `threePool`, `diceSidesList.length` means `Usable dice`
- actual rolled count means `getCommitCount()`
- consumers must not assume usable pool and rolled count are the same number
- `resolveQuick()` now has an explicit tie branch keyed by `quickLossPreset`; `resolveRisk()` remains independent and preserves the defender floor on ties

Battle-scale derivation contract:
- `computeTotalDiceFromArmyStats(size, str)` is the canonical helper for battle-scale derivation.
- `getArmyScaleProfile({ size, str, classId })` returns runtime-only scale metadata:
  - `totalDice`
  - `qualityTag`
  - `qualityRank`
  - `supplyWarning`
  - `ceilingTag`
  - `ceilingRank`
  - `ceilingExceeded`
  - `ceilingExempt`
  - `classCategory`
- Quality derives from `Total dice` only and ignores matchup, weather, doctrines, nearby, manual dice delta, cap override, and roll-stage modifiers.
- `computePool()` exposes this as `derivedScale` for render-time consumers only. It is not persisted.

Quality mapping:
- `1-2`: `Squalid`
- `3-5`: `Very Poor`
- `6-7`: `Poor`
- `8`: `Modest`
- `9`: `Average`
- `10`: `Comfortable`
- `11`: `Wealthy`
- `12-13`: `Very Wealthy`
- `14`: `Aristocratic`
- `15-19`: `Legendary`
- `20+`: `Mythical`

Ceiling and warning rules in the shipped build:
- `Rebels` max `Poor`
- `Bandits` max `Average`
- `Thieves` max `Average`
- all other `Standard` classes max `Aristocratic`
- `Special` and `Faction` classes are ceiling-exempt in this pass
- `Very Wealthy+` warnings are advisory only and do not touch Supply mechanics or battle math

Matchup layer scope:
- immunity
- resistance
- vulnerability
- deadly
- approved matchup alias / conditional overrides
- deadly-doctrine triggers

Direct self / battle-context scope for this pass is ticket-limited to:
- Rebels + Home Territory while defending
- Forest Fey + Forest Environment while defending
- Pikes + Flanked by Two Enemies
- Bandits + Hidden / Surprise while attacking unless enemy intel cancels it
- Shield-Brethren defender-side bulwark pressure at city / fort / choke
- Shield-Brethren suppression of represented surprise-positioning bonuses against the main defending army

Nearby assist/hinder no longer serves as the primary path for the direct-context mechanics above.

Bespoke matchup rider scope for this pass:
- Snow Elves vs Forest Fey / Treants
- Fire Cult vs Snow Elves

Post-resolution special-rules scope for this pass:
- Vampire direct-sunlight persistent STR loss
- Hel’s Legion doubled-loss amplification on wins
- Undead victory growth against eligible non-special classes
- Fiends end-of-battle conversion roll with resistance/immunity gating

Weather guard scope for this pass:
- Fire Cult pre-battle weather normalization into the `CLEAR` / `DRY` / `HEAT` lane
- Fire Cult post-battle weather drift clamping back into that same lane, with additive reporting only and no weather-order rewrite

Additive reporting fields now flow through `state.lastResult`, War Report payloads, and history entries:
- `specialEffects.round`
- `specialEffects.attacker.pool`
- `specialEffects.attacker.postBattle`
- `specialEffects.defender.pool`
- `specialEffects.defender.postBattle`

Pool-summary contract:
- `collectPoolSpecialEffectSummary()` now dedupes and includes matchup, doctrine, phenomena, and nearby-action summaries in addition to the earlier intrinsic / dice-shape / bespoke-rider / class-weather / direct-context lines.
- `shield_bulwark` nearby action is legacy-disabled; main-battle Shield-Brethren bulwark now lives in direct context, while `shield_aura` remains the nearby path for adjacent allied defenders.
- Nearby-action role gating now evaluates defender-only hinder actions against the source side's battle role instead of the affected side's role.

## Battle Side Progressive Setup Contract

Each battle side panel (`attacker`, `defender`) uses a three-state setup flow:
- `chooser`
- `creating`
- `loaded`

Chooser mode:
- Shows saved-army loader + `Create new army` CTA.
- Shows an explicit `or` divider between load and create actions.
- Hides defeated styling/banner and advanced controls.

Creating mode:
- Shows `Army Name` draft input, class, size, STR, commit, pool summary, dice type.
- Shows a derived battle-scale stack between Size/STR and commit controls:
  - neutral scale summary
  - optional Supply warning
  - optional ceiling-overflow warning
- Shows one collapsed `Advanced setup` disclosure containing doctrines, nearby, breakdown, context, manual override.
- `Army Name` is draft-only and never auto-persists.
- Side-invoked `Save Army` opens modal with `armyNameDraft` prefilled.

Loaded mode:
- Same visible layout as creating mode.
- Keeps class/size/STR editable inline.
- Uses loaded army name as initial `armyNameDraft`.
- Shows defeated banner/styling when size is `0`.
- Keeps the same derived battle-scale stack visible as creating mode.

Transitions:
- `Create new army`: `chooser -> creating` and clears side runtime battle setup.
- `Load`: `chooser -> loaded` via `loadArmyIntoSide`.
- `Set up another army` / `Cancel setup`: `creating|loaded -> chooser` using side-local reset.
- `Save/Update` from side-origin modal: side transitions/retains `loaded`, binds `loadedArmyId`, and syncs side class/size/STR/doctrines from saved result.
- `prefillExample()`: both sides become creating (manual, unsaved setup).
- `swapSides()`: swaps setup state and draft names along with side runtime state.
- `resetAll()`: clears only battle-side setup/result/preview/context state and preserves settings, weather, history, and runtime session.
- `handleStartNewSessionFromUi()`: clears both sides, starts a fresh runtime session at battle turn `1`, rebuilds runtime weather from saved weather configuration, and does not create a persisted empty session record.

Implementation helpers:
- `normalizeSideSetupMode`
- `setSideSetupMode`
- `resetSideToChooser`
- `syncSideSetupVisibility`
- `collapseSideAdvancedSetup`
- `setArmyModalContext`

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
- `Start Battle Roll` when no valid last preview
- `Run Battle Again` when valid last preview exists

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
- `warReportRoundLimit` — default option `Until stop` (empty value `""`); numbered options display as `3 rounds`, `5 rounds`, `10 rounds`, `25 rounds`, `50 rounds` with numeric `value` attributes
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

`getWarReportTurnIdentity` now keys on runtime session + dedicated battle turn:
- `${runtimeSessionId}:${runtimeBattleTurn}`
- It is intentionally decoupled from weather turn/season identity.

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
- `appendHistory` writes enriched battle entries with round context, weather snapshots, roll logs, assist/hinder context, stop reason, additive session/turn metadata (`sessionId`, `sessionStartedAt`, `sessionLabel`, `turnNumber`, `battleIndexInTurn`), and battle-time army-name snapshots (`attacker.name`, `defender.name`).
- `renderHistoryList` groups flat records as `session -> battle turn -> battle cards` while remaining null-safe for older entries and legacy imports.
- History may synthesize one runtime-only empty current-session placeholder when the active runtime session has no recorded battles yet.
- Session and turn groups render collapsed by default; users expand on demand via toggle buttons.
- The runtime-only placeholder is visually distinct, expanded by default, never persisted, never exported, and replaced on refresh when a fresh runtime session starts.
- `newHistorySessionBtn` and `newBattleSessionBtn` both clear battle setup, start a new runtime session, reset dedicated battle turn/index to `1`, rebuild runtime weather from saved configuration, and do not clear history.
- `turnBtn` advances weather turn/season behavior as before, and also advances dedicated battle turn (separate counter).
- Battle actions (`battleBtn`, War Report `Battle Again`, War Report `Auto-Battle`) do not create or advance battle turns.
- Records without session metadata are grouped under `Older History`.
- Battle-scale metadata is intentionally not added to persisted history entries in this pass.

Math transparency:
- `computePool` breakdown includes advantage/disadvantage counts and net reroll display.
- These lines are transparency outputs; reroll operations are applied in roll phase helpers.

Assist/Hinder and doctrines:
- Existing doctrine and assist/hinder contracts remain additive and compatible with the shared battle path.
- No battle-math semantics were changed by the War Report staging/session work.

## Dirty-State and Navigation Contract

Army dirty-state:
- `guardArmyDirtyTransition()` gates reset, new session, swap, load-over-existing-side, and `Set up another army`.
- Save/Update continues through the originating side modal by resuming the blocked action after `commitArmyModal()`.
- Discard reverts only the saveable army fields for the affected side before retrying the blocked action.

Settings dirty-state:
- Leaving Settings uses `requestTabSwitch()` plus the shared dirty-guard modal.
- `beforeunload` protection is enabled only for unsaved settings and relies on browser-native behavior.
- `saveSettingsFromControls()` is the canonical settings persistence path for both the Save button and navigation guard.
- `saveSettingsFromControls()` and `normalizeSettings()` are also the canonical seams for `dicePoolMode` persistence, import normalization, and discard/reset parity.
- `openDirtyGuard()` now explicitly focuses `#dirtyGuardCancel` (`Stay`) after `showModal()` so keyboard users land on the safest action first.

## Validation and Feedback Accessibility Contract

Feedback helpers:
- `setLiveMessage(el, options)` is the shared contract for switching message text plus semantics.
- `clearLiveMessage(el)` restores neutral/default semantics when a transient message should no longer behave like a live alert.

Assertive error surfaces:
- `#validationMsg` escalates to `role="alert"` / `aria-live="assertive"` for blocking invalid-action and runtime-error states.
- `#armyModalError`, `#factionModalError`, and `#renameFactionError` are explicit assertive alert containers.

Polite status surfaces:
- `#saveArmyToast`, `#weatherSettingsSaved`, and `#importMsg` expose `role="status"` / `aria-live="polite"` / `aria-atomic="true"`.
- `#warReportAutoStatus` remains the existing polite status contract for auto-battle progress.

## Key IDs and Function Anchors

High-use IDs:
- Battle controls: `battleBtn`, `turnBtn`, `resultArea`, `resultHeadline`, `copyResult`, `attackerCommit`, `defenderCommit`
- Battle bottom actions: `prefillExample`, `resetBtn`, `swapSides`, `newBattleSessionBtn`
- Battle setup flow: `attChooserWrap`, `defChooserWrap`, `attSetupWrap`, `defSetupWrap`, `attCreateArmyBtn`, `defCreateArmyBtn`, `attSetupChangeBtn`, `defSetupChangeBtn`, `attackerArmyNameDraft`, `defenderArmyNameDraft`, `attAdvancedSetupDetails`, `defAdvancedSetupDetails`, `attackerScaleSummary`, `defenderScaleSummary`, `attackerSupplyWarning`, `defenderSupplyWarning`, `attackerCeilingWarning`, `defenderCeilingWarning`
- Battle chooser UX class: `chooserOr`
- History controls: `newHistorySessionBtn`, `exportHistoryBtn`, `clearHistoryBtn`, `historyList`
- History placeholder/test hooks: `history-runtime-placeholder`, `historyRuntimeChip`, `historyPlaceholderBody`
- War Report core: `warReportModal`, `warReportClose`, `warReportClosePrimary`, `warReportBattleAgainBtn`, `warReportAutoResolveBtn`, `warReportAutoStatus`
- War Report staging/session: `warReportWeatherStrip`, `warReportStagingNotice`, `warReportStagingWrap`, `warReportStageAttCommit`, `warReportStageDefCommit`, `warReportPreviousWrap`, `warReportRoundLimit`, `warReportSessionLine`, `warReportSessionSummary`, `warReportRoundList`
- Settings: `showWarReportModal`, `assistHinderEnabled`, `assistHinderDiceCap`, `overrideDoctrineEligibility`, `settingsWeatherThemesEnabled`, `settingsPhenomenaThemesEnabled`, `settingsDefeatThemesEnabled`, `settingsThemeStrengthMode`, `settingsDirtyBadge`
- Dirty guard: `dirtyGuardModal`, `dirtyGuardPrimary`, `dirtyGuardSecondary`, `dirtyGuardCancel`

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
- `openSaveArmyModal`
- `openUpdateArmyModalFromSide`
- `commitArmyModal`
- `buildWarReportBattleContextKey`
- `clearWarReportLastBattlePreview`
- `startNewRuntimeSession`
- `advanceRuntimeBattleTurn`
- `nextRuntimeBattleIndex`
- `handleStartNewSessionFromUi`
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
- Keep army-modal side-origin context runtime-only.
- Keep battle-scale / quality-tag derivation runtime-only; do not add saved-army fields or import/export schema changes in this pass.

7. Stylesheet ordering
- Preserve base theme before runtime state theme.

8. Session/turn metadata flow
- Keep battle-history storage flat; do not migrate to nested persisted structures.
- Keep additive metadata optional/null-safe for import compatibility.
- Do not couple dedicated battle turn progression to battle actions.

9. Grouped history accessibility
- Session/turn groups use native `<details>/<summary>` elements, NOT standalone `<button>` elements. The `historyToggleBtn` string is a CSS class on `<summary>`, not an element type.
- Explicit `aria-expanded` is set on each `<summary>` in the template and kept in sync via the `toggle` event listener (`querySelector(":scope > summary").setAttribute("aria-expanded", ...)`).
- Keep keyboard focus and toggle semantics intact when editing `renderHistoryList`.

## Known Mismatches and Technical Debt

1. Legacy runtime key retained
- `autoCommit` remains in side runtime state for compatibility.

2. Battle setup naming remains draft-only until explicit save
- `armyNameDraft` pre-fills side-origin save modal, but only `Save/Update` writes persisted army records.

3. Mixed icon language
- Some surfaces still mix emoji and SVG iconography.

4. Dedicated battle turn is runtime-only
- Session/turn counters and the empty-session placeholder reset on refresh by design and are not persisted top-level state.

5. Browser unload behavior is limited
- `beforeunload` protection exists for unsaved settings, but custom messaging and exact behavior vary by browser.

6. Hosted parity still requires explicit verification
- The UI now exposes a build label, but local-vs-hosted drift still needs issue-by-issue confirmation using the parity checklist.

7. Shield-Brethren cavalry-charge suppression is still structurally deferred
- The narrow parity pass now covers defender-side bulwark math, allied aura support, and represented surprise-positioning immunity, but there is still no first-class cavalry-charge subsystem to suppress.

8. War Report modal initial focus — resolved 2026-03-07
- `openWarReportModal` now explicitly focuses `#warReportBattleAgainBtn` after `showModal()` in staging/result modes, and `#warReportClose` (Stop) in auto-running mode, overriding native dialog focus-first-focusable behavior that previously landed on the ✕ close button.

9. First-run battle guidance and feedback semantics — resolved 2026-03-08
- Fresh-load setup gaps no longer reuse the same error-first treatment as invalid-action/runtime errors.
- Keep the guidance/alert distinction intact when editing `render()`, `renderBattleReadinessMessage()`, or `showBattleRuntimeError()`.

## Documentation QA Checklist

1. README matches current `battleBtn` staging gate behavior with `showWarReportModal`.
2. README does not claim `runBattleRound` opens the War Report modal.
3. README uses current War Report mode labels and includes session runtime objects.
4. README documents previous-battle preview validity and explicit invalidation behavior.
5. README documents center-card containment selectors and one-line headline truncation behavior.
6. README reflects current auto-battle controls (`Auto-Battle`, round limit selector, stop semantics).
7. README keeps persistence schema/storage keys accurate.
8. README reflects grouped History behavior (`session -> turn -> battle cards`) and `New Session` runtime control.
9. README avoids documenting unshipped PRD behavior as implemented.
10. README reflects the guidance-first fresh-load Battle state while keeping true validation/runtime failures as alerts.
11. README documents dirty-guard initial focus and current live-region contracts for validation and status feedback.

## Execution Logging Contract

Required living docs for this stabilization pass:
- `assets/documentation/WAR_TABLE_v3_STABILIZATION_TICKET_LOG.md`
- `assets/documentation/WAR_TABLE_v3_STABILIZATION_CHANGE_LOG.md`
- `assets/documentation/WAR_TABLE_v3_IMPLEMENTATION_DRIFT_LOG.md`

Definition of done per shipped fix:
- behavior updated or explicitly clarified
- regression coverage added where feasible
- change log updated in the same change set
- drift log updated when the fix resolves a local/hosted mismatch or rules-source conflict

## Maintenance Checklist

When behavior changes, update this README in the same change:
1. Current snapshot counts/date.
2. Battle flow and War Report mode contracts.
3. Preview validity/invalidation rules.
4. CSS containment and layout contracts for center card and modal actions.
5. Key IDs and function anchors.
6. Known mismatches/technical debt list.

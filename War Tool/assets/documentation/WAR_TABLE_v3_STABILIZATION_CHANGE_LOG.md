# War Table v3 Stabilization Change Log

## March 8, 2026 — UX stabilization lane A

### Battle onboarding and copy
- Reframed the first-run Battle readiness state from an error-first `Not ready` block into a guidance-first setup message while keeping the existing validation gate and disabled Battle action intact.
- Added `renderBattleReadinessMessage()` so missing-setup issues stay neutral, while true invalid-action and runtime-error paths still escalate to alert treatment.
- Rewrote targeted helper copy in Battle, Settings, the dirty guard, and War Report staging so those surfaces describe the user task more directly and reduce internal-implementation phrasing.
- Preserved the current domain vocabulary (`STR`, doctrines, assist/hinder, compare-style) instead of renaming core game terms during the stabilization slice.

### Accessibility and focus management
- Standardized feedback semantics across key UX surfaces:
  - `#validationMsg` now supports neutral guidance vs assertive alert states through shared helpers.
  - `#armyModalError`, `#factionModalError`, and `#renameFactionError` now expose assertive alert semantics.
  - `#saveArmyToast`, `#weatherSettingsSaved`, and `#importMsg` now expose polite status semantics.
- Updated the shared dirty guard so `openDirtyGuard()` explicitly focuses `#dirtyGuardCancel` (`Stay`) after `showModal()`, with safe fallbacks if the cancel button is unavailable.

### Asset hygiene and regression coverage
- Added an inline favicon in the document head so local/browser test runs no longer generate avoidable `favicon.ico` `404` console noise.
- Added Playwright regression coverage for:
  - fresh-load guidance-first readiness messaging
  - validation and modal live-region semantics
  - dirty-guard initial focus
  - favicon/head asset behavior
- Re-ran the full local Playwright suite after the UX slice (`66 passed`).

## March 8, 2026 — Three-pool calibration scale pass 1

### Scale and validation
- Advanced the visible build label to `2026-03-08-three-pool-scale-p1` in the app and source-of-truth docs.
- Added a shared derived battle-scale helper built from `Total dice = floor(Size / 50) + floor(STR / 10)`.
- Shipped quality tags from `Squalid` through `Mythical`, derived from `Total dice` only.
- Added future-facing Supply warnings for `Very Wealthy+` hosts without changing battle math or Supply mechanics.
- Added pre-battle class ceiling enforcement for Rebels, Bandits, Thieves, and other `Standard` classes while keeping `Special` and `Faction` classes warning-only in this pass.
- Battle start is now blocked with plain-language overflow messaging when a side exceeds its class ceiling.

### UI surfaces
- Added a battle-scale status stack to each battle-side setup panel between Size/STR and commit controls.
- Added derived scale metadata to saved Armies rows: `Total dice`, `Quality`, and either a Supply warning or class-ceiling overflow message.
- Kept the existing compact dice labels (`Dice to roll cap`, `Usable dice`, `Dice to roll`) unchanged in this pass.

### Documentation and parity
- Updated the help wiki with shipped behavior for quality tags, oversized-host warnings, and battle-start ceiling blocks.
- Updated the implemented-behavior dev guide with the new derived helper contract, UI surfaces, and runtime-only constraints.
- Marked the relevant three-pool planning tickets as implemented in the stabilization ticket log.
- Updated the rulebook suggestions log statuses where simulator behavior now exists.

## March 8, 2026 — Planning / Pre-production lane seeded

The following items are planning-only. They are not shipped simulator behavior.

### Three-pool calibration planning package
- Added `Fantasy-War-Sim_Three-Pool-Calibration-PRD.md` at the repo root as the planning-only PRD / dev handoff for the next simulator lane.
- Added `assets/documentation/RULEBOOK_SUGGESTIONS_LOG.md` to record simulator-driven rulebook recommendations without directly editing the master rulebook.
- Added `assets/documentation/FANTASY_WAR_SIM_THREE_POOL_CALIBRATION_ROADMAP.md` as the staged execution order for the next pre-production and implementation lane.

### Planning-log updates
- Added a clearly marked `Planning / Pre-production Entries` section to `assets/documentation/WAR_TABLE_v3_STABILIZATION_TICKET_LOG.md`.
- Seeded planned ticket IDs `WT-131` through `WT-137` for the three-pool calibration, quality-tag, class-ceiling, warning-language, terminology, and regression-planning work.

### Front-door documentation updates
- Updated the root README and Claude handoff so the next lane is discoverable without being mistaken for shipped behavior.

## March 8, 2026

### P2 Fire Cult weather lock and nearby-action audit
- Advanced the visible build label to `2026-03-08-army-logic-p2` in the app and source-of-truth docs.
- Added a narrow Fire Cult weather guard around `runBattleRound()`:
  - pre-battle normalization now forces disallowed Fire Cult weather into the `CLEAR` / `DRY` / `HEAT` lane using `HEAT` as the fallback,
  - post-battle weather auto-advance now clamps Fire Cult drift back into that same lane and clears overridden PHENOMENA / elemental / wild-magic payload fields.
- Added additive Fire Cult round reporting so inline result, War Report, and history all show when pre-battle normalization or post-battle drift clamping occurred.
- Fixed nearby-action role gating so defender-only hinder actions are evaluated against the source side's battle role instead of the affected side's role. This restores legitimate Archer pressure and Mage Arcane Volley defender setups without broad nearby-system changes.
- Audited the remaining nearby-action catalog and confirmed current parity for Archers, Mages, roll-operation support, Builders, Thieves, Mel, Forest Fey restore, Treant hidden surprise, Battlefield Weavers, and Ward-Smiths.
- Added deterministic Playwright coverage for Fire Cult weather lock behavior and the remaining nearby-action families, then re-ran the full local Playwright suite.

### P1 army logic continuation and Shield-Brethren follow-up
- Advanced the visible build label to `2026-03-08-army-logic-p1` in the app and source-of-truth docs.
- Recorded an explicit local-only hosted-parity waiver in the roadmap/drift docs because `WAR_TABLE_HOSTED_URL` is still unavailable in this workspace.
- Extended `applyPostResolutionSpecialRules()` to cover:
  - Undead victory growth against eligible non-special classes.
  - Fiends end-of-battle conversion rolls, including lost-units gating and enemy Fiends resistance/immunity blocks.
- Expanded additive `specialEffects` pool summaries so inline result, War Report, and history now surface matchup, doctrine, phenomena, and nearby-action effect labels in addition to the earlier direct-context / dice-shape / post-battle lines.
- Moved main-battle Shield-Brethren bulwark pressure into the direct-context layer, legacy-disabled the old nearby `shield_bulwark` action, kept `shield_aura` as the nearby allied-defender bonus, and blocked represented Treant surprise bonuses against defending Shield-Brethren.
- Added deterministic Playwright coverage for Undead growth, Fiends conversion success/blocking, expanded reporting visibility, and the represented Shield-Brethren behaviors.

### Army-logic roadmap and build hygiene
- Added `assets/documentation/FANTASY_WAR_SIM_ARMY_LOGIC_STABILIZATION_ROADMAP.md` as the staged execution order for `WT-119` through `WT-128`.
- Refreshed the visible build label to `2026-03-08-army-logic-p0` in the app and source-of-truth docs.
- Updated the root README and dev guide to point at the roadmap, the current P0 lane, the new mixed-dice / bespoke-rider / post-resolution helper layers, and the still-open hosted parity gap.

### Rules and battle engine
- Expanded the direct self / battle-context layer so attacking Bandits gain `+1 die` only when `Hidden / Surprise` is active and enemy intel is not.
- Replaced the one-off mutant die-mix pass with a shared class dice-shape helper used by both Mutants and Gunners.
- Implemented Gunners mixed dice by upgrading eligible `d6` dice to `d10` dice based on current size without introducing persistent war-sequence state.
- Added a narrow bespoke matchup-rider layer for Snow Elves vs Forest Fey / Treants and Fire Cult vs Snow Elves, on top of the existing matchup data.
- Added `applyPostResolutionSpecialRules()` between outcome resolution and persistence to handle post-battle mutations without reordering weather flow.
- Vampire direct-sunlight penalties now persist as post-battle STR loss and update the live army state.
- Hel’s Legion wins now double only the opposing side’s resolved loss and recompute updated size from pre-round snapshots.

### Reporting and transparency
- Added additive `specialEffects` reporting metadata to `state.lastResult`, War Report payloads, auto-session rounds, and history entries.
- Surfaced class-effect summaries in the inline result area, War Report outcome/side columns, and history detail cards.
- Updated battle-context help copy so the UI explicitly calls out Bandits hidden attacks as a direct-context mechanic.

### Test coverage
- Added deterministic Playwright regressions for Bandits hidden logic, Gunners mixed dice thresholds, Vampire sunlight persistence/reporting, Snow Elves / Fire Cult bespoke riders, and Hel’s Legion doubled-loss behavior.
- Re-ran the full local Playwright suite after the P0 army-logic changes.

## March 7, 2026

### UI and state behavior
- Added visible build labels in header, About, and footer using `APP_BUILD`.
- Reworded War Report staging copy and primary CTA text to match staging-first behavior: `Start Battle Roll` and `Run Battle Again`.
- Added a reusable dirty-guard modal and wired army-dirty and settings-dirty flows into destructive actions and settings navigation.
- Guarded battle transitions now discard every dirty side in scope when the user chooses `Discard`, so `Reset` and `New Session` do not stall after clearing only one side.
- Restored true blank-side initialization by adding blank class options and binding battle-side class selects from state instead of inheriting a hidden default class.
- Untouched `creating` drafts now count as empty, so empty/create flows no longer trigger false save prompts during army load.
- Loading a saved army now clears only that side's runtime tactical state before applying the saved army record, preventing stale manual/context/nearby carry-over.
- Reworked History navigation so sessions and turns use stronger toggle affordances, stay collapsed by default, and preserve expand/collapse state across rerenders.
- Removed internal runtime jargon from the History empty state and replaced it with plain-language “Battle history will appear here” copy.
- Gave History its own full-page layout treatment instead of the shared `420px` inner-scroll cap.
- `Reset` now clears only battle setup/result/runtime battle-side state and preserves saved settings, history, weather, and the current runtime session.
- `New Session` now clears both sides, starts a fresh runtime session at battle turn 1, resets runtime weather from saved weather configuration, and preserves saved armies/settings/history.

### History and transparency
- Added a runtime-only empty current-session placeholder in History with visual distinction and help text.
- Kept `battleHistory` flat while moving History grouping into a derived view-model helper.
- Added battle-time army-name snapshots to history entries and rendered history card titles as `Army Name · Class` when names exist.
- Added direct-context summaries to history detail cards.

### Rules and dice engine
- Added a dedicated direct self / battle-context layer for the ticketed mechanics:
  - Rebels + Home Territory while defending
  - Forest Fey + Forest Environment while defending
  - Pikes + Flanked by Two Enemies
- Marked the old nearby-only versions of those three mechanics as legacy-disabled so they are no longer selectable as active nearby effects.
- Split deadly-doctrine handling into the matchup layer contract while keeping the rest of doctrine math in the doctrine layer.
- Added a narrow matchup alias / conditional pass for Vampire-as-Undead lookup and the Aerial Cavalry anti-air suppression case.
- Fixed Mutants so they add a real extra die to the pool and keep one `d10` in the final roll list.
- Fixed Mel's Army embedded immunity data for `Thieves` and `Bandits`.
- Reworked Drow day/night weather math to use the ticketed daylight penalty and night bonus exception.
- Upgraded generic weather preference matching so day/night-sensitive raw weather strings no longer collapse into the same tag-only result.
- Restored the missing `weatherTagDeltaForClass` phenomena-implied weather helper used by PHENOMENA scoring.
- Wrapped battle execution and auto-battle resolution with runtime-error handling so failed rounds stop cleanly instead of freezing the modal in `auto-running`.

### Test coverage
- Added a Playwright regression harness with local static-server support and optional hosted / WebKit project hooks.
- Added targeted tests for staging/history timing, runtime-only history placeholder, reset/new-session behavior, dirty-army guard, ticketed direct-context mechanics, and history name snapshots.
- Added hotfix regression tests for false dirty prompts on blank/untouched creating sides, loader tactical-state clearing, PHENOMENA auto-battle stability, and force-finalize Stop behavior.

## March 7, 2026 — Audit stabilization pass 2 (AUDIT_BATTLE_FLOW_2026-03-06)

### Accessibility
- Added explicit `aria-expanded` attribute to history session and turn `<summary>` elements in `renderHistoryList` template strings, initialized from `sessionExpanded`/`turnExpanded` values. Kept in sync via a `toggle` event listener (`querySelector(":scope > summary").setAttribute("aria-expanded", node.open)`). Resolves FINDING-004.

### UX / Focus management
- `openWarReportModal` now explicitly focuses `#warReportBattleAgainBtn` after `showModal()` in staging and result modes so keyboard users land on the primary action rather than the ✕ close button. In auto-running mode, `#warReportClose` (labeled "Stop") is focused instead. Resolves FINDING-005.

### Documentation drift corrections
- Dev guide primary action labels corrected: `Start Battle Roll` / `Run Battle Again` (was `Start Battle` / `Battle Again`). Resolves FINDING-001.
- Dev guide round-limit selector description updated to reflect `Until stop` default and `X rounds` display labels. Resolves FINDING-002.
- Dev guide fragile area #9 corrected: history groups use native `<details>/<summary>` with `historyToggleBtn` CSS class on `<summary>`, not standalone `<button>` elements with explicit `aria-expanded`. Explicit `aria-expanded` mirroring now added as described. Resolves FINDING-003.

### Test coverage
- Added 9 new Playwright regression tests covering: chooser→creating→loaded DOM transitions, War Report primary button label logic, `warReportPreviousWrap` visibility, weather-change preview persistence, auto-battle round-limit exhaustion, Esc-during-auto-running behavior, History "Older History" grouping, fresh-load empty-state placeholder, and War Report staging modal initial focus (FINDING-005).

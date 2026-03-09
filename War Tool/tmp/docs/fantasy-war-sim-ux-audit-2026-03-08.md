# Fantasy War Sim UX Audit

Prepared March 8, 2026

Source audited: `fantasy-war-sim.html`
Build observed: `2026-03-08-army-logic-p2`

## Implementation Update

Updated March 8, 2026 after the stabilization-safe UX follow-up shipped locally on build `2026-03-08-three-pool-scale-p1`.

Implemented from this audit:

- `F-01` first-run battle landing state: resolved in the shipped slice. Fresh load now shows setup guidance instead of an error-first `Not ready` block while Battle remains disabled until ready.
- `F-05` UX writing and terminology load: partially addressed in the shipped slice. Battle, Settings, dirty-guard, and War Report staging helper copy were rewritten into plainer task language without renaming core domain vocabulary.
- `F-06` validation and status accessibility: resolved for the audited surfaces in the shipped slice. Battle validation, modal errors, save/import feedback, and existing War Report status now follow explicit live-region contracts.
- `F-07` dirty-state modal focus behavior: resolved in the shipped slice. The dirty guard now opens with focus on `Stay`.
- QA note for missing `favicon.ico`: resolved in the shipped slice.

Still open after the shipped slice:

- `F-02` core battle setup simplification
- `F-03` War Report hierarchy / density
- `F-04` Settings information architecture
- `F-08` mobile battle continuity

Verification after implementation:

- Focused UX regressions passed.
- Full local Playwright suite passed: `66 passed`.

## Executive Summary

- Top risks:
  - The first-run battle screen presents missing inputs as an error state before the user has done anything.
  - Core battle setup demands too much rule literacy too early, especially for first-time users.
  - Settings and War Report are both functionally rich, but cognitively dense.
- Strongest UX wins:
  - `Load Example` gets a user to value quickly.
  - War Report and History create strong transparency and continuity once a battle has run.
  - Empty states in Armies and History are action-oriented rather than dead ends.
  - Dirty-state protection on Settings works in the tested flow.
- Overall usability confidence:
  - Moderate for returning or system-literate users.
  - Low-to-moderate for first-time users who have not already learned the rules vocabulary.
- Recommended fix order:
  1. Reframe the first-run battle screen from error-first to guidance-first.
  2. Reduce battle setup cognitive load before touching visual polish.
  3. Simplify settings and War Report copy/hierarchy.
  4. Close accessibility gaps in validation and modal focus behavior.

## Review Context

- Surface in scope: the main app shell in `fantasy-war-sim.html`
- Surfaces out of scope: help wiki and full rulebook, except where linked copy directly affects the main app experience
- Devices/viewports used:
  - Desktop: `1440x1200`
  - Mobile: `390x844`
- Methods used:
  - Static front-end review of markup, state surfaces, and modal flows
  - Live dogfooding at `http://127.0.0.1:4173/fantasy-war-sim.html`
  - Heuristic evaluation using Nielsen-style heuristics with a 1-5 severity/pass scale
  - UX writing audit of labels, helper text, warnings, empty states, and status copy
  - Lightweight QA pass across happy path, empty states, validation, dirty-state, and console
- Evidence vs inference:
  - Findings marked with live behavior were observed directly in-browser.
  - Findings about learnability and cognitive load are informed inferences from the current interaction model, not user-research results.

## Walkthrough Coverage

Scenarios exercised during the audit:

- First-run load with no saved data
- `Load Example` happy path
- War Report staging -> single battle -> result interpretation
- History session/turn expansion after a recorded battle
- Armies empty state -> `+ New Army` modal -> validation failure
- Settings mobile review
- Settings dirty-state guard when attempting to leave the tab
- Console check during the live walkthrough

Observed runtime stability in tested flows:

- No blocking runtime errors were encountered in the audited flows.
- One low-priority console issue was observed: missing `favicon.ico` (`404`).

## Heuristic Scorecard

| Heuristic | Score (1-5) | Notes |
| --- | --- | --- |
| Visibility of system status | 4 | Strong after a battle runs; weak on first load because the screen opens in a warning-like state. |
| Match with real-world language | 3 | Domain vocabulary is expected, but surrounding UI copy often assumes prior rule knowledge. |
| User control and freedom | 4 | Save/discard guards and session controls are present; modal focus defaults are uneven. |
| Consistency and standards | 4 | Major patterns are stable; labels and mode framing are still a bit mixed. |
| Error prevention | 3 | Validation exists, but some states surface after the user has already hit friction. |
| Recognition over recall | 2 | Users must carry too much rules vocabulary and math context in memory. |
| Flexibility and efficiency | 4 | Experienced users get strong transparency and control. |
| Aesthetic and minimalist design | 2 | The interface is information-rich to the point of cognitive strain in key flows. |
| Help users recover from errors | 4 | Copy is generally constructive, but not always announced accessibly. |
| Help and documentation | 3 | Help exists, but the main app still depends on off-screen learning too often. |

## What Is Working Well

- `Load Example` is one of the highest-value controls in the product. It shortens time-to-value and gives users a safe learning path without data entry.
- War Report is unusually transparent for a simulator UI. The app makes battle inputs, roll details, comparisons, losses, and updated sizes inspectable in one place.
- History gives users meaningful continuity. Session and turn grouping make battle outcomes feel persistent instead of ephemeral.
- Empty states are generally actionable:
  - Armies: "Create one from the Battle tab or click New Army."
  - History: "Run battles to build session and turn history."
- Modal entry focus is handled well in at least two important places:
  - New Army modal focuses `Army name`
  - War Report staging focuses `Start Battle Roll`

## Prioritized Findings

### F-01

Area / Flow: First-run battle landing state

Severity: High

Evidence:

- On initial load, the battle screen displayed a large `Not ready` block listing six missing requirements before any user action.
- Source behavior: `fantasy-war-sim.html:7794-7801`
- Validation container markup: `fantasy-war-sim.html:267`

User Impact:

- The product opens in a failure tone instead of a setup tone.
- New users are taught that they are "wrong" before they understand what the app wants from them.
- This raises anxiety and makes the app feel harder than it is.

Recommendation:

- Replace the initial validation block with a neutral setup checklist or onboarding prompt.
- Keep the current error styling for actual invalid actions, not empty defaults.
- Disable `Battle` until ready, but do not frame empty required fields as an error on page load.

Effort Hint: Low to medium

Heuristic Tags: Visibility of system status, Error prevention, Emotional affordance

### F-02

Area / Flow: Core battle setup

Severity: High

Evidence:

- Each side requires name, class, size, STR, optional commit count, and then exposes advanced setup with doctrines, nearby armies, breakdowns, context flags, and manual overrides.
- Source markup:
  - attacker setup `fantasy-war-sim.html:56-247`
  - engagement instructions `fantasy-war-sim.html:261-283`
  - defender setup `fantasy-war-sim.html:350-547`
- Mobile audit at `390x844` showed the battle flow becomes a long scroll before the primary action is reached.

User Impact:

- The app assumes a rule-literate user much earlier than the surface suggests.
- Users must understand both army data and resolution logic before they can feel confident pressing `Battle`.
- Advanced mechanics are technically collapsed, but the base task is still heavy.

Recommendation:

- Separate novice setup from expert setup more clearly.
- Keep the base task to "pick or create two armies and run a battle."
- Move commit count and more of the explanatory math into progressive disclosure that appears after the user has a valid setup.

Effort Hint: Medium to high

Heuristic Tags: Recognition rather than recall, Hick's Law, Miller's Law, Mental white space

### F-03

Area / Flow: War Report staging and result comprehension

Severity: Medium

Evidence:

- War Report contains weather, staging notice, staged commit controls, previous battle summary, headline outcome, outcome metadata, nested details, roll details, comparisons, breakdowns, auto-battle controls, round limits, and two close actions.
- Source markup: `fantasy-war-sim.html:1094-1203`
- Live observation: the desktop experience is rich and transparent, but the modal is visually dense and exposes several simultaneous decision paths.

User Impact:

- Returning users benefit from the detail.
- New or occasional users may struggle to identify the primary next action vs optional deep-dive content.
- The modal risks turning a "review and run" moment into an information sorting task.

Recommendation:

- Preserve the transparency, but tighten hierarchy:
  - primary action first
  - one-line explanation of what staging means
  - optional detail collapsed under clearer labels
- Consider making the auto-battle controls feel more secondary during manual play.

Effort Hint: Medium

Heuristic Tags: Aesthetic and minimalist design, Recognition rather than recall, Cognitive milestones

### F-04

Area / Flow: Settings information architecture

Severity: Medium

Evidence:

- The Settings tab combines help, weather simulation, battle rules, export/import, danger zone, and about metadata in one long page.
- Source markup: `fantasy-war-sim.html:735-936`
- Mobile review showed a long vertical form with limited prioritization between "change battle rules," "read help," and "wipe local data."

User Impact:

- Users must scan too much to find high-frequency settings.
- Low-frequency and destructive actions compete visually with routine configuration.
- The page reads more like a control inventory than a decision-oriented settings surface.

Recommendation:

- Split settings into clearer sections by user job:
  - battle behavior
  - world/weather simulation
  - data management
  - destructive actions
- Reduce explanatory text where the label already carries meaning.
- Promote the most commonly changed settings above the rest.

Effort Hint: Medium

Heuristic Tags: Hick's Law, Aesthetic and minimalist design, Figure/ground

### F-05

Area / Flow: UX writing and terminology load

Severity: Medium

Evidence:

- Copy repeatedly uses system- or documentation-like framing:
  - "Open the in-product field manual..." at `fantasy-war-sim.html:744-746`
  - "Advanced weather configuration..." at `fantasy-war-sim.html:754`
  - "Applies to Compare-style and Quick Total ties..." at `fantasy-war-sim.html:859`
  - "Runtime-only empty session placeholders are not persisted..." at `fantasy-war-sim.html:902`
  - "Staging only. No round has run yet..." at `fantasy-war-sim.html:1101`
- Some domain terms are necessary, but the surrounding text often explains the system rather than the user task.

User Impact:

- Users must parse implementation framing and product vocabulary at the same time.
- The app feels more technical than it needs to.
- Trust is reduced when the UI sounds like internal documentation.

Recommendation:

- Keep intentional game terms such as `STR`, doctrines, and assist/hinder.
- Rewrite surrounding support copy into plain task language.
- Prefer "what this changes" and "what to do next" over system descriptions.

Effort Hint: Low to medium

Heuristic Tags: Match between system and real world, Plain language, Self-guided learning

### F-06

Area / Flow: Validation and status accessibility

Severity: Medium

Evidence:

- Validation and modal error containers are plain `div`s without explicit live-region semantics:
  - battle validation `fantasy-war-sim.html:267`
  - army modal error `fantasy-war-sim.html:996`
  - faction modal error `fantasy-war-sim.html:1021`
  - rename faction error `fantasy-war-sim.html:1039`
- Status copy is announced correctly in at least one place:
  - war report auto status uses `role="status"` and `aria-live="polite"` at `fantasy-war-sim.html:1202`
- The current implementation is inconsistent rather than uniformly inaccessible.

User Impact:

- Screen-reader users may not be reliably notified when validation or save errors appear.
- Sighted users receive feedback; assistive-tech users may have to rediscover it manually.

Recommendation:

- Standardize urgent validation/errors with `role="alert"` where appropriate.
- Use polite status regions for non-blocking confirmations.
- Keep the visual design, but align semantics across battle, modal, and import/export feedback surfaces.

Effort Hint: Low

Heuristic Tags: Accessibility and inclusive interaction, Help users recognize and recover from errors

### F-07

Area / Flow: Dirty-state modal focus behavior

Severity: Medium

Evidence:

- In the tested settings dirty-state flow, the active element after the modal opened was the close icon button `#dirtyGuardClose`.
- Live check result: `activeId = "dirtyGuardClose"`
- Dirty guard markup places the close icon before `Stay`, `Discard`, and `Save`: `fantasy-war-sim.html:1063-1077`
- Dirty guard open logic sets labels and opens the modal, but does not redirect focus: `fantasy-war-sim.html:8649-8668`

User Impact:

- Keyboard users land on the least informative control first.
- The safest and most relevant actions (`Stay`, `Discard`, `Save`) are not prioritized by focus.
- This slightly increases the risk of accidental dismissal or confusion in a high-consequence moment.

Recommendation:

- Set initial focus intentionally when the dirty guard opens.
- Default focus should go to the safest high-intent action for the context, likely `Stay` or the primary decision button rather than the close icon.

Effort Hint: Low

Heuristic Tags: User control and freedom, Accessibility, Error prevention

### F-08

Area / Flow: Mobile task continuity in Battle

Severity: Medium

Evidence:

- On mobile (`390x844`), the top of the battle screen shows navigation and the top of the attacker card, but the primary battle action is well below the first screen once setup is expanded.
- The battle surface stacks attacker setup, engagement, defender setup, conditions, and bottom actions in a long vertical flow.
- Key source regions:
  - battle shell `fantasy-war-sim.html:31-660`
  - bottom actions `fantasy-war-sim.html:648-656`

User Impact:

- Users lose continuity between setup, action, and outcome.
- Cross-side comparison is harder on narrow screens because attacker and defender context are separated by long scroll distance.
- This is especially costly when the task is "change one value, run again, compare."

Recommendation:

- Preserve mobile support, but treat battle as a workflow rather than a simple stacked layout.
- Short-term: improve section signposting and return-to-action visibility.
- Medium-term: consider a mobile-specific battle flow that reduces cross-scroll comparison cost.

Effort Hint: Medium

Heuristic Tags: Continuity, Fitts' Law, Cognitive milestones

## QA And Dogfooding Notes

- Happy-path battle flow worked end to end:
  - `Load Example`
  - open War Report
  - `Start Battle Roll`
  - review result
  - confirm History entry appears
- Settings dirty-state guard worked as expected in the tested flow.
- New Army validation worked and produced a clear visible error message.
- No blocking console/runtime issues surfaced during the tested paths.
- One non-blocking asset issue remains:
  - missing `favicon.ico` (`404`)

## Quick Wins

- Replace the first-run `Not ready` error block with a guidance-first setup state. Implemented March 8, 2026.
- Rewrite settings helper copy that sounds like internal documentation. Implemented March 8, 2026 as a targeted copy pass.
- Add semantic announcement behavior to validation and modal error messages. Implemented March 8, 2026.
- Change dirty guard initial focus away from the close icon. Implemented March 8, 2026.
- Tighten War Report staging copy so the primary action stands out faster. Implemented March 8, 2026 as a scoped copy update.

## Medium-Effort Improvements

- Reorder battle setup so the minimum viable path is clearer before advanced rule controls appear.
- Reorganize Settings by user job instead of by implementation categories.
- Make mobile battle navigation more workflow-oriented, especially for repeated comparison loops.
- Clarify battle terminology in-context instead of relying on a separate help surface to carry the learning burden.

## Structural Redesign Opportunities

- Introduce a novice/expert battle setup split, or a guided battle builder for first-time users.
- Create a clearer simulation-control architecture:
  - battle setup
  - battle execution
  - campaign/world settings
  - data management
- Reframe War Report as two modes:
  - quick summary
  - advanced analysis

## Do Not Change Yet

- Do not remove domain terms like `STR`, doctrines, assist/hinder, or compare-style until the team decides which terms are core product vocabulary.
- Do not simplify War Report by deleting detail depth outright. Advanced transparency is one of the product's strongest qualities and likely matters to experienced users.
- Do not treat the current findings as a substitute for user research. They are strong implementation-facing signals, but still a self-audit, not participant evidence.

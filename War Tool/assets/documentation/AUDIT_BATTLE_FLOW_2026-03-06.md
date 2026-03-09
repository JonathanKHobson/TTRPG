# Core Battle Flow Stabilization Audit
**Date**: 2026-03-06
**Auditor**: Claude (claude-sonnet-4-6)
**Build**: Post-stabilization-pass-1
**Scope**: Battle tab side setup states → War Report staging/auto-battle → History/session output

---

## Audit Methodology

1. Read all canonical docs (CLAUDE_HANDOFF, README_War_Table_v3_Dev_Guide, architecture index, class-matchup guide, dice-modifier guide)
2. Fixed critical test blocker (`playwright.config.mjs` cwd)
3. Ran all 13 baseline Playwright tests — all green
4. Executed a 60-check live walkthrough audit script via Playwright against a running local server
5. Cross-referenced each finding against the dev guide contract

**Walkthrough results**: 38 PASS · 3 FAIL (resolved below) · 21 INFO

---

## Findings

---

### FINDING-001

**Type**: DOCUMENTATION DRIFT
**Severity**: low
**Confidence**: confirmed

**Summary**: War Report primary button labels in dev guide do not match shipped text.

**Dev guide says** (line 307–308, `README_War_Table_v3_Dev_Guide.md`):
- `Start Battle` when no valid last preview
- `Battle Again` when valid last preview exists

**Actual shipped labels** (`fantasy-war-sim.html`):
- `Start Battle Roll` (initial HTML, line 1176; `setWarReportActionState` line 6506)
- `Run Battle Again` (after a valid preview, `setWarReportActionState` line 6500)

**Root cause**: Dev guide was written before the final label copy was settled. The app shipped with longer, more descriptive labels. The existing Playwright tests already use the correct shipped labels (confirming the tests are not affected).

**Recommended fix**: Update dev guide lines 307–308 to reflect the actual labels.

**Definition of done**: Dev guide section "Primary action label" reads `Start Battle Roll` / `Run Battle Again`. No code change needed.

**Needs test?** No — existing tests already cover and verify the correct labels.

---

### FINDING-002

**Type**: DOCUMENTATION DRIFT
**Severity**: low
**Confidence**: confirmed

**Summary**: Round limit selector option format in dev guide does not match shipped HTML.

**Dev guide says** (implied in round limit section, line 347):
> "selected round limit reached" — references bare numeric values (3, 5, 10, 25, 50)

**Actual shipped option text** (`fantasy-war-sim.html` lines 1182–1187):
```html
<option value="">Until stop</option>
<option value="3">3 rounds</option>
<option value="5">5 rounds</option>
<option value="10">10 rounds</option>
<option value="25">25 rounds</option>
<option value="50">50 rounds</option>
```
The option `value` attributes are the bare numbers (or empty for "Until stop"), but the visible text includes "rounds". There is also an "Until stop" default that the dev guide does not mention explicitly.

**Root cause**: Dev guide describes the underlying values, not the display labels, and omits the "Until stop" default sentinel.

**Recommended fix**: Add a note to the dev guide that the round limit selector default option is "Until stop" (empty value), and displayed options include "X rounds" text with numeric values.

**Definition of done**: Dev guide accurately describes the round limit selector values and default.

**Needs test?** No — this is display-only, no behavioral regression risk.

---

### FINDING-003

**Type**: DOCUMENTATION DRIFT
**Severity**: medium
**Confidence**: confirmed

**Summary**: Dev guide fragile area #9 incorrectly describes history toggle elements as "real toggle buttons with `aria-expanded` and `aria-controls`".

**Dev guide says** (`README_War_Table_v3_Dev_Guide.md` line 543):
> "Session/turn groups use real toggle buttons with `aria-expanded` and `aria-controls`."

**Actual implementation** (`fantasy-war-sim.html` lines 7765–7766, 7781–7782):
```html
<details class="historyTurnGroup" ...>
  <summary class="historyToggleBtn historyTurnToggle">...</summary>
</details>

<details class="historySessionGroup ..." ...>
  <summary class="historyToggleBtn historySessionToggle">...</summary>
</details>
```
History groups are native `<details>/<summary>` elements, not `<button>` elements. The `historyToggleBtn` string is a CSS class on `<summary>`, not an element type. There are no explicit `aria-expanded` or `aria-controls` attributes set via JS.

**Implications**:
- Native `<details>/<summary>` provides built-in browser accessibility (summary has implicit `button` role and browsers announce expand/collapse state)
- However, the dev guide's fragile area #9 correctly identifies this as a fragile point — the implicit native ARIA behavior has historically had inconsistent AT support across screen readers and browser combinations
- Toggle-state persistence is managed by `_historyUiState` / `setHistoryToggleExpanded` keying off `data-toggle-key` attributes, then re-rendering with `open` on the `<details>` — which is correct but only re-applies on re-render, not via JS attribute mutation

**Root cause**: Dev guide was written for a planned or previous implementation using real buttons. The shipped implementation uses native details/summary for simpler state management.

**Recommended fix**: Update dev guide fragile area #9 to correctly describe the native `<details>/<summary>` implementation. Consider whether adding explicit `aria-expanded` mirroring to `<summary>` elements would improve AT compatibility (see FINDING-004 for the accessibility angle).

**Definition of done**: Dev guide fragile area #9 accurately describes native `<details>/<summary>` with `historyToggleBtn` class on `<summary>`.

**Needs test?** No code change here — documentation-only fix.

---

### FINDING-004

**Type**: ACCESSIBILITY VIOLATION
**Severity**: low
**Confidence**: probable

**Summary**: History `<summary>` toggle elements lack explicit `aria-expanded` attribute, which may reduce screen reader compatibility in some browsers.

**Location**: `fantasy-war-sim.html` lines 7765–7782 (history session/turn `<summary>` elements)

**Repro steps**:
1. Navigate to History tab
2. Use a screen reader (e.g., NVDA + Firefox, or VoiceOver + Safari)
3. Navigate to session or turn toggle elements
4. Observe whether expand/collapse state is announced correctly

**Expected** (per accessibility contract): Expand/collapse state must be discoverable by AT users navigating the history accordion.

**Actual**: Native `<details>/<summary>` does provide implicit ARIA via `details` element's `open` attribute mirroring to `aria-expanded` on `<summary>` in Chromium. However, this behavior is inconsistently implemented across browsers and screen readers. Firefox + NVDA historically did not announce the open state reliably.

**Root cause**: Native `<details>/<summary>` is used without supplemental ARIA.

**Recommended fix**: Add explicit `aria-expanded` attribute to each `<summary>` element in `renderHistoryList`, synchronized with the `<details>` `open` state. This is low-risk additive ARIA that does not change visual behavior.

```js
// In the details template string, add aria-expanded:
`<details ... ${turnExpanded ? " open" : ""}>
  <summary class="historyToggleBtn historyTurnToggle" aria-expanded="${turnExpanded}">
`
```

Also add a JS `toggle` event listener after `renderHistoryList` re-injection to keep `aria-expanded` in sync as users open/close panels.

**Definition of done**: `<summary>` elements have `aria-expanded` set to `"true"` / `"false"` matching `<details>.open`. Manual AT test with NVDA + Firefox or VoiceOver + Safari passes.

**Needs test?** Yes — test that `<summary>` has correct `aria-expanded` after open/close interaction.

---

### FINDING-005

**Type**: UX DEBT
**Severity**: low
**Confidence**: confirmed

**Summary**: War Report modal initial focus lands on the close (✕) button rather than the primary action button.

**Repro steps**:
1. Set up both sides
2. Click "Battle" to open the War Report staging modal
3. Observe first focusable element (via Tab/dev tools)

**Expected**: First focus should be on the primary action ("Start Battle Roll") to minimize keystrokes for keyboard users — modal's main intent is to trigger the battle, not close.

**Actual**: The modal opens via `d.showModal()` — native `<dialog>` puts focus on the first focusable descendant in DOM order. The first focusable element in the modal HTML is `#warReportClose` (line 1088: `✕ Close` button at the top-right of the header), not `#warReportBattleAgainBtn`.

**Root cause**: The `openWarReportModal` function does not explicitly set focus after `showModal()`. Native dialog focus order follows DOM order, and the close button appears first.

**Recommended fix**: After `d.showModal()` in `openWarReportModal`, explicitly move focus to the primary action button when in `staging` mode:
```js
const primaryBtn = $("warReportBattleAgainBtn");
if (primaryBtn) primaryBtn.focus();
```

In `auto-running` mode, focus the stop button (`#warReportClose` with "Stop" label) since that is the only meaningful action.

**Definition of done**: Keyboard users arriving at the War Report modal in staging mode have focus on "Start Battle Roll". Auto-running mode has focus on "Stop".

**Needs test?** Yes — test that focus is on `#warReportBattleAgainBtn` after `openWarReportModal` in staging mode.

---

### FINDING-006

**Type**: HYPOTHESIS
**Severity**: low
**Confidence**: uncertain

**Summary**: `closeWarReportModal` Esc handling via native `<dialog>` cancel event may call `closeWarReportModal` twice during auto-running.

**Repro steps**:
1. Open War Report, start auto-battle
2. Press Esc
3. Observe whether `requestWarReportAutoStop` is called once or twice

**Hypothesis**: Native `<dialog>` elements handle Esc via a `cancel` event, which triggers `d.close()` automatically (then fires `close` event). If a `cancel` listener calls `closeWarReportModal()`, and `closeWarReportModal()` itself has a guard for `_warReportAutoRunning`, then during auto-running the Esc should short-circuit at the guard and not close the dialog. However, the native dialog may still close the dialog on its own cancel event regardless of the JS listener.

**What audit confirmed** (via Playwright): After Esc during auto-running, the modal remained open and auto-stop was requested correctly. The audit confirmed the visible behavior is correct.

**Remaining uncertainty**: Whether the `cancel` event preventDefault is called to block native dialog closure. Did not find a `cancel` event listener in the source — the dialog may rely on `showModal()` vs `open` attribute behavior differences.

**Recommended action**: Verify whether a `cancel` event listener with `preventDefault()` is present for the war report dialog. If not, the correct behavior may be coincidental based on timing. Add a `cancel` listener if absent.

**Needs test?** Existing test covers the behavior. No new test needed unless the implementation is found to be relying on coincidental behavior.

---

## Summary Table

| ID | Type | Severity | Confidence | Fix Required |
|----|------|----------|------------|-------------|
| FINDING-001 | DOCUMENTATION DRIFT | low | confirmed | Doc update only |
| FINDING-002 | DOCUMENTATION DRIFT | low | confirmed | Doc update only |
| FINDING-003 | DOCUMENTATION DRIFT | medium | confirmed | Doc update only |
| FINDING-004 | ACCESSIBILITY VIOLATION | low | probable | Code + doc + test |
| FINDING-005 | UX DEBT | low | confirmed | Code + test |
| FINDING-006 | HYPOTHESIS | low | uncertain | Investigation only |

---

## Audit Coverage: Confirmed Green (No Findings)

The following behaviors were explicitly verified and match the dev guide contract:

- **Side setup state transitions**: chooser → creating, chooser → loaded, loaded → chooser all work correctly. `syncSideSetupVisibility` correctly shows/hides `attChooserWrap`/`attSetupWrap`. Dirty-army guard fires before destructive transitions.
- **`prefillExample()`**: Both sides go to `creating` mode with correct prefill data.
- **`swapSides()`**: Swaps all side state correctly.
- **`resetAll()`**: Clears battle setup only; does not clear history, settings, or weather config.
- **`handleStartNewSessionFromUi()`**: Clears setup, resets turn to 1, creates new runtime session.
- **War Report staging gate**: Battle button opens staging before any round executes when staging is enabled.
- **`warReportPreviousWrap` visibility**: Hidden before first battle; visible (and toggleable) after at least one battle result.
- **Preview validity logic**: Context key (class/size/STR/commit/doctrines) invalidates preview. Weather change alone does NOT invalidate preview — "Run Battle Again" persists after weather change.
- **Auto-battle stop lifecycle**: `_warReportAutoRunning` set correctly; "Stop" label replaces close labels during running; "Close" label restored after auto-stopped.
- **Auto-battle safety limit**: 500-round hard cap present in source (`rounds < 500`).
- **`warReportAutoStatus` ARIA**: `role="status"`, `aria-live="polite"`, `aria-atomic="true"` confirmed.
- **History grouping**: Sessions collapsed by default; turn groups collapsed within sessions; runtime placeholder expanded by default.
- **History `data-testid="history-runtime-placeholder"`**: Present on runtime-only `<details>` element, not on persisted records.
- **Legacy history grouping**: Records without `sessionId` rendered under "Older History" via `session.legacy` flag.
- **Army name snapshot immutability**: Battle history cards preserve army name at battle time; subsequent renames do not affect existing history cards.
- **Round limit selector reset**: `warReportRoundLimit` disabled during auto-running; re-enabled after stop.

---

## Out-of-Scope (Not Audited)

Per scope definition, the following were not audited in this pass:
- Dice math correctness (`runBattleRound` internal ordering)
- Faction management surfaces
- Settings tab behavior
- Weather/doctrine mechanics
- Import/export surfaces
- Non-history responsive layout issues

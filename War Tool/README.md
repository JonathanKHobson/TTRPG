# War Table v3 - Quick Orientation

War Table v3 is a local-first fantasy battle sandbox ("Fairgard Battle Engine") with transparent dice math, weather effects, doctrines, assist/hinder systems, battle history, and a War Report modal flow.

This README is a fast orientation guide for developers and bots.  
The detailed implementation contract lives in:
- `assets/documentation/README_War_Table_v3_Dev_Guide.md`

## What This Project Contains

- Main app: `War_Table_v3.html`
- Help wiki: `War_Table_Help_Wiki.html`
- Full rules page: `War_Encounter_Rules_2026_v4.html`
- Core app styles: `assets/css/war-table-theme.css`
- Runtime state theme routing: `assets/css/war-table-state-themes.css`
- Help/rulebook layout styles:
  - `assets/css/war-table-help.css`
  - `assets/css/war-table-rulebook.css`
- Long-form docs: `assets/documentation/`

## Quick Start (Local)

1. Open `War_Table_v3.html` in a browser.
2. Open `War_Table_Help_Wiki.html` for quick rules/help.
3. Optional: open `War_Encounter_Rules_2026_v4.html` for full rules text.

No backend or build step is required for normal usage.

## Project Model at a Glance

- Architecture: static HTML + CSS + in-file JavaScript.
- Persistence: browser `localStorage` (`warTableState`, schema v7).
- App areas: Battle, Armies, Factions, History, Settings.
- Battle engine entrypoint: `runBattleRound(options)`.
- War Report flow:
  - Staging-first when `showWarReportModal` is enabled.
  - Single-result and auto-battle modes reuse the same battle engine path.
  - Auto sessions are runtime-only and summarized in modal session blocks.

## Read This First for Changes

If you are editing behavior or UI contracts, start with:
1. `War_Table_v3.html` (all runtime logic and event wiring)
2. `assets/css/war-table-theme.css` (core visual system/layout)
3. `assets/documentation/README_War_Table_v3_Dev_Guide.md` (source-of-truth contract)

## High-Risk Areas (Do Not Change Casually)

- `runBattleRound` order (weather snapshot and post-battle weather advance timing).
- War Report state transitions (`staging`, `single-result`, `auto-running`, `auto-stopped`).
- Auto-battle stop lifecycle (`_warReportAutoRunning`, `_warReportAutoToken`, stop request flag).
- History payload compatibility (renderer must stay null-safe for older entries).
- Center engagement card containment CSS (`.battleGrid`, `.card.center`, `#resultHeadline`).

## Ground Rules for Devs/Bots

- Treat `assets/documentation/README_War_Table_v3_Dev_Guide.md` as canonical.
- Document shipped behavior only; do not record planned behavior as implemented.
- If behavior changes, update docs in the same change.

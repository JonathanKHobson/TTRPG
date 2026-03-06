# Phase 2 Prep - Sessions, Turns, Battles (Implemented; Retained as Design Memo)

Status: Implemented in app runtime as of March 6, 2026. This document is retained as prep/design context.

## Goal

Introduce a human-readable history hierarchy:
- Session
- Turn
- Battle

while keeping storage compatible with the existing flat `battleHistory` model.

## Implementation Shape (Implemented)

Keep `battleHistory` as a flat array and add additive metadata per history entry:
- `sessionId`
- `sessionStartedAt`
- `sessionLabel`
- `turnNumber`
- `battleIndexInTurn`

Do not migrate to a nested persisted shape (`session -> turns -> battles`).

## Runtime Model (Implemented)

Runtime-only fields (not persisted as top-level schema contract changes):
- `runtimeSessionId`
- `runtimeSessionStartedAt`
- `runtimeSessionLabel`
- `runtimeBattleTurn` (starts at `1`)
- `runtimeBattleIndexInTurn`

Turn numbering:
- Start at Turn `1`.
- Only explicit turn advancement increments the turn.
- Battle actions do not auto-create/auto-advance turns.

## Session Lifecycle (Implemented)

- New session created on app runtime start/refresh.
- Existing persisted history remains intact.
- New entries written after refresh belong to the new session.

Implemented UX control:
- `New Session` button in History starts a fresh runtime session and resets battle turn to `1`.

## History Rendering Model (Implemented)

`renderHistoryList()` groups flat entries into:
- Session header
- Turn groups within each session
- Battle cards within each turn

Display ordering:
- Newest session first.
- Current session expanded by default.
- Older sessions collapsed by default.

Legacy fallback:
- Entries without session/turn metadata are grouped under `Older History` (or equivalent fallback bucket).

## Append Contract (Implemented)

`appendHistory(...)` continues writing one entry per battle. Additive fields are appended at write-time:
- session metadata
- turn metadata
- in-turn battle index

No battle math changes.
No weather timing changes.
No War Report state-machine changes.

## Accessibility and UX Notes (Implemented)

For session/turn collapsibles in History:
- use real button controls
- maintain `aria-expanded` and `aria-controls`
- keep keyboard navigation and visible focus states intact

## Acceptance Checklist

1. New runtime session starts on refresh with Turn 1.
2. New history entries include additive session/turn metadata.
3. `renderHistoryList()` groups by session then turn.
4. Legacy entries still render under a safe fallback group.
5. Turn advancement only occurs via explicit turn control.
6. Existing export/import paths remain compatible with null-safe metadata handling.

## Out of Scope for This Memo

- No battle-math changes.
- No weather sequencing changes.
- No persistence schema migration beyond additive per-record metadata.

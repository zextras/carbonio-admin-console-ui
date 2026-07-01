# Lint Findings — admin-ui-domains

## Overview

- **Total errors:** 388 (0 warnings)
- **Files affected:** 48
- **Rule families:**
  - `react-you-might-not-need-an-effect/*` — ~294 errors
  - `react-compiler/react-compiler` — ~70 errors (largely downstream of the above)

## Error Breakdown by Rule

| Rule | Count |
| --- | --- |
| `react-you-might-not-need-an-effect/no-event-handler` | 140 |
| `react-you-might-not-need-an-effect/no-chain-state-updates` | 114 |
| `react-compiler/react-compiler` | 70 |
| `react-you-might-not-need-an-effect/no-derived-state` | 24 |
| `react-you-might-not-need-an-effect/no-adjust-state-on-prop-change` | 23 |
| `react-you-might-not-need-an-effect/no-pass-data-to-parent` | 7 |
| `react-you-might-not-need-an-effect/no-initialize-state` | 6 |
| `react-you-might-not-need-an-effect/no-pass-live-state-to-parent` | 4 |

## Top Error Files

| File | Errors |
| --- | --- |
| `views/domain/manange/resources/resource-edit-detail-view.tsx` | 60 |
| `views/domain/manange/mailing-list/edit-mailing-detail-view.tsx` | 50 |
| `views/domain/details/domain-general-settings.tsx` | 39 |
| `views/domain/details/domain-authentication.tsx` | 29 |
| `views/domain/manange/mailing-list/edit-mailing-detail/members-tab.tsx` | 22 |
| `views/domain/details/domain-gal-settings.tsx` | 19 |
| `views/domain/manange/accounts/edit-account/signature-detail.tsx` | 14 |

## Quick Wins: `useMemo` → `useEffect`

Three files misuse `useMemo` to call `setState`. React Compiler flags this as a **potential infinite loop** — a genuine correctness bug, not just lint noise. Swapping `useMemo` for `useEffect` fixes ~43 errors with three one-word changes.

| File | Line | Errors Fixed | Notes |
| --- | --- | --- | --- |
| `views/domain/details/domain-general-settings.tsx` | 203 | ~40 | 150-line form-state hydration block |
| `views/domain/manange/mailing-list/edit-mailing-detail/send-to-tab.tsx` | 190 | 2 | `grantEmailTableRows` sync |
| `views/domain/manange/restore-delete-account/restore-delete-account.tsx` | 32 | 1 | success-handling side effect |

`domain-general-settings.tsx:203` alone removes ~10% of the total error count.

## Remaining Work

The ~340 remaining errors fall into recurring anti-patterns that need component-level refactoring rather than mechanical fixes:

- **Effects as event handlers** (`no-event-handler`) — syncing `isDirty` / `previousDetail` inside effects instead of in change handlers.
- **Derived state in effects** (`no-derived-state`) — `tableRows`, `pagedRows`, etc. computed in effects; should be computed during render.
- **State adjusted on prop change** (`no-adjust-state-on-prop-change`) — copying props into state; should derive during render or refactor.
- **Chained state updates** (`no-chain-state-updates`) — cascading `setState` calls spread across effects.
- **Data passed to parents in effects** (`no-pass-data-to-parent` / `no-pass-live-state-to-parent`) — children pushing state up via effects; should lift state to the parent.

Addressing these typically means lifting state up, computing derived values during render, and replacing effect-based dirty-tracking with explicit change handlers.

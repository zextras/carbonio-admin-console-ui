# DataTable `createTableHook` Re-architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the DataTable suite on TanStack's `createTableHook` architecture (fine-grained `Subscribe`-based re-render isolation) with a full composable compound-component API, migrate both `admin-ui-domains` views onto it, and fix review findings 1, 3–15.

**Architecture:** `DataTableRoot` creates the table instance via `useDataTable` (pre-bound features + contexts, ported from `tanstack-table-explore`) and a per-instance Zustand "table UI store" for cross-part product state. Every feature is an independently composable part subscribing only to its own state slices (`table.Subscribe` for table state, `useTableUi` for UI state, local `useState` for part-local UI). The old 1,144-line orchestrator is deleted.

**Tech Stack:** React 19, `@tanstack/react-table@^9.2.4` (`createTableHook`/`createTableHookContexts`/`tableFeatures`), zustand 5, react-i18next, Vitest (jsdom + browser mode).

**Spec:** `docs/superpowers/specs/2026-09-08-data-table-create-table-hook-design.md`

**Conventions (AGENTS.md):** SPDX header in every new source file; arrow-function named-export components; no `useMemo`/`useCallback` (React Compiler); `Array<T>` not `T[]`; no `eslint-disable`; no `Container/Row/Padding`; `globalThis` not `window`; no array-index keys; no single-child fragments.

**Base directory for all new files:** `packages/ui-components/src/components/display/data-table/`

---

### Task 1: Table UI store (cross-part product state)

**Files:**
- Create: `table-ui-store.tsx`
- Modify: `types.ts` (remove `DataTableDensity`, `DataTableEditingState`, `DataTableUndoToastState` — they move)
- Test: `table-ui-store.test.tsx`

- [x] **Step 1: Add zustand to ui-components**

```bash
pnpm add zustand --filter @zextras/ui-components
```

- [x] **Step 2: Write failing test**

`table-ui-store.test.tsx`:

```tsx
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { act, render, renderHook } from '@testing-library/react';
import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTableUi, TableUiProvider, createDataTableUiStore } from './table-ui-store';

describe('table UI store', () => {
	it('throws outside provider', () => {
		expect(() => renderHook(() => useTableUi((s) => s.density))).toThrow(
			/useTableUi/,
		);
	});

	it('updates subscribers per slice', () => {
		const densitySpy = vi.fn();
		const peekSpy = vi.fn();
		function DensityProbe() {
			densitySpy();
			return <span>{useTableUi((s) => s.density)}</span>;
		}
		function PeekProbe() {
			peekSpy();
			return <span>{String(useTableUi((s) => s.peekRowId))}</span>;
		}
		const utils = render(
			<TableUiProvider>
				<DensityProbe />
				<PeekProbe />
			</TableUiProvider>,
		);
		const densityBefore = densitySpy.mock.calls.length;
		const peekBefore = peekSpy.mock.calls.length;

		act(() => {
			utils.rerender(
				<TableUiProvider>
					<DensityProbe />
					<PeekProbe />
				</TableUiProvider>,
			);
		});
		// rerender must not re-run subscribers (stable store across renders)
		expect(densitySpy.mock.calls.length).toBe(densityBefore);
		expect(peekSpy.mock.calls.length).toBe(peekBefore);

		const store = createDataTableUiStore();
		expect(store.getState().density).toBe('comfortable');
	});
});
```

- [x] **Step 3: Run test to verify it fails**

Run: `pnpm vitest run packages/ui-components/src/components/display/data-table/table-ui-store.test.tsx`
Expected: FAIL — cannot resolve `./table-ui-store`

- [x] **Step 4: Implement `table-ui-store.tsx`**

```tsx
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createContext, useContext, useRef, type ReactNode } from 'react';
import { createStore, useStore } from 'zustand';

export type DataTableDensity = 'comfortable' | 'compact';
export type DataTableOpenPanel = 'filters' | 'customize' | null;
export type DataTableEditingTarget = { rowId: string; columnId: string } | null;
export type DataTableUndoToastState = {
	id: number;
	message: string;
	onUndo: () => void;
} | null;

export type DataTableScrollEdge = { start: boolean; end: boolean };

export type DataTableUiState = {
	density: DataTableDensity;
	peekRowId: string | null;
	editing: DataTableEditingTarget;
	selectAllMatching: boolean;
	openPanel: DataTableOpenPanel;
	undoToast: DataTableUndoToastState;
	liveMessage: string;
	scrollEdge: DataTableScrollEdge;
	setDensity: (density: DataTableDensity) => void;
	setPeekRowId: (rowId: string | null) => void;
	setEditing: (editing: DataTableEditingTarget) => void;
	setSelectAllMatching: (value: boolean) => void;
	setOpenPanel: (panel: DataTableOpenPanel) => void;
	setUndoToast: (toast: DataTableUndoToastState) => void;
	announce: (message: string) => void;
	setScrollEdge: (edge: DataTableScrollEdge) => void;
};

export type DataTableUiStore = ReturnType<typeof createDataTableUiStore>;

export function createDataTableUiStore(): DataTableUiStore {
	return createStore<DataTableUiState>()((set) => ({
		density: 'comfortable',
		peekRowId: null,
		editing: null,
		selectAllMatching: false,
		openPanel: null,
		undoToast: null,
		liveMessage: '',
		scrollEdge: { start: true, end: true },
		setDensity: (density) => {
			set({ density });
		},
		setPeekRowId: (peekRowId) => {
			set({ peekRowId });
		},
		setEditing: (editing) => {
			set({ editing });
		},
		setSelectAllMatching: (selectAllMatching) => {
			set({ selectAllMatching });
		},
		setOpenPanel: (openPanel) => {
			set({ openPanel });
		},
		setUndoToast: (undoToast) => {
			set({ undoToast });
		},
		announce: (liveMessage) => {
			set({ liveMessage });
		},
		setScrollEdge: (scrollEdge) => {
			set({ scrollEdge });
		},
	}));
}

const TableUiStoreContext = createContext<DataTableUiStore | null>(null);

export const TableUiProvider = ({ children }: { children: ReactNode }) => {
	const storeRef = useRef<DataTableUiStore | null>(null);
	if (!storeRef.current) {
		storeRef.current = createDataTableUiStore();
	}
	return (
		<TableUiStoreContext.Provider value={storeRef.current}>
			{children}
		</TableUiStoreContext.Provider>
	);
};

export function useTableUiStore(): DataTableUiStore {
	const store = useContext(TableUiStoreContext);
	if (!store) {
		throw new Error('useTableUi must be used within DataTableRoot');
	}
	return store;
}

export function useTableUi<T>(selector: (state: DataTableUiState) => T): T {
	return useStore(useTableUiStore(), selector);
}
```

Note: `editing` intentionally holds only `{rowId, columnId}` — the draft value/error live inside the `InlineEdit` component (Task 3) so keystrokes never re-render the body.

- [x] **Step 5: Run test to verify it passes**

Run: `pnpm vitest run packages/ui-components/src/components/display/data-table/table-ui-store.test.tsx`
Expected: PASS

- [x] **Step 6: DEVIATION (per review)** — do NOT modify `types.ts` during Tasks 1–9; old orchestrator types were instead marked `@deprecated` (see commit). Original step text follows:
    Remove moved types from `types.ts`** — delete `DataTableDensity`, `DataTableEditingState`, `DataTableUndoToastState` exports (they now come from `table-ui-store.tsx`); leave the rest untouched until Task 10.

- [x] **Step 7: Commit**

```bash
git add packages/ui-components/src/components/display/data-table/table-ui-store.tsx packages/ui-components/src/components/display/data-table/table-ui-store.test.tsx packages/ui-components/src/components/display/data-table/types.ts packages/ui-components/package.json pnpm-lock.yaml
git commit -m "feat(data-table): add per-instance table UI store for cross-part state"
```

---

### Task 2: Port `createTableHook` foundation from explore

**Files:**
- Create: `create-data-table.ts`, `data-table-contexts.tsx`
- Modify: `data-table-features.ts` (no change expected — already `tableFeatures({...})`; verify it compiles with `createTableHook`)

- [x] **Step 1: Port the two files verbatim from `tanstack-table-explore`**

```bash
git show tanstack-table-explore:packages/ui-components/src/components/display/data-table/create-data-table.tsx > packages/ui-components/src/components/display/data-table/create-data-table.ts
git show tanstack-table-explore:packages/ui-components/src/components/display/data-table/data-table-contexts.tsx > packages/ui-components/src/components/display/data-table/data-table-contexts.tsx
```

Both files are self-contained (verified: `create-data-table.tsx` imports only `@tanstack/react-table` + `./data-table-contexts` + `./features`; the current branch's features file is named `data-table-features.ts`, so fix that one import to `'./data-table-features'` and drop the `DataTableColumnMeta` import if unused). Fix SPDX year to 2026 if stale; fix indentation to tabs if the file arrived with tabs (explore uses tabs — this branch uses tabs too, keep as-is).

- [x] **Step 2: Verify exports**

`create-data-table.ts` must export `useDataTable`, `createDataTableColumnHelper`; `data-table-contexts.tsx` must export `dataTableContexts`, `useDataTableContext`.

- [x] **Step 3: Type-check**

Run: `pnpm type-check -- --filter @zextras/ui-components 2>&1 | tail -5` (or `pnpm -F @zextras/ui-components exec tsc --noEmit`)
Expected: no errors in the data-table directory (old orchestrator still compiles on its own).

- [x] **Step 4: Commit**

```bash
git add packages/ui-components/src/components/display/data-table/create-data-table.ts packages/ui-components/src/components/display/data-table/data-table-contexts.tsx
git commit -m "feat(data-table): port createTableHook binding and contexts from explore branch"
```

---

### Task 3: Row-UI primitives (with keyboard fix #3)

**Files:**
- Create: `row-ui/selection-checkbox.tsx`, `row-ui/copy-cell.tsx`, `row-ui/inline-edit.tsx`, `row-ui/row-actions.tsx`, `row-ui/decorated-cell.tsx`
- Source material: current `selection-checkbox.tsx`, `data-table-copy-cell.tsx`, `data-table-inline-edit.tsx`, `data-table-row-actions.tsx`, `data-table-body-cell.tsx` (carry JSX over; changes below)

- [x] **Step 1: Move + fix `selection-checkbox.tsx` → `row-ui/`**

Carry the component over unchanged except: add keydown stopPropagation so row-level Enter/Space cannot hijack it (fix #3):

```tsx
<span className={styles.wrap}>
	<input
		type="checkbox"
		...
		onClick={(e) => {
			e.stopPropagation();
		}}
		onKeyDown={(e) => {
			e.stopPropagation();
		}}
	/>
</span>
```

- [x] **Step 2: Move + fix `copy-cell.tsx`** — carry `data-table-copy-cell.tsx`; on the trigger button add `onKeyDown={(e) => { e.stopPropagation(); }}` next to the existing `onClick` stopPropagation. Same for `row-actions.tsx` kebab button (its document-level menu keydown handler already exists at `data-table-row-actions.tsx:91-101` — keep it, it is the correct Escape pattern).

- [x] **Step 3: Split `inline-edit.tsx`** — carry `data-table-inline-edit.tsx` but change it to own its draft value locally (the UI store `editing` is only `{rowId, columnId}`):

```tsx
export const InlineEdit = ({
	initialValue,
	requiredMessage,
	saveLabel,
	cancelLabel,
	onSave,
	onCancel,
}: InlineEditProps) => {
	const [value, setValue] = useState(String(initialValue ?? ''));
	const [error, setError] = useState<string | null>(null);
	// input keeps onKeyDown stopPropagation (already present at data-table-inline-edit.tsx:51-52)
	...
};
```

`onSave(value)` validates required-ness locally (reuse `validateEditValue` from `models/row-ui.ts`) and calls up; the parent `decorated-cell` invokes `onCellEditCommit`.

- [x] **Step 4: Move `decorated-cell.tsx`** — carry `data-table-body-cell.tsx` logic: pencil/copy affordances; `editable`/`copyable` come from column meta; when `editing?.rowId === row.id && editing.columnId === column.id` render `InlineEdit`. Props become `(displayValue, columnLabel, rowLabel, editable, copyable, isEditing, onStartEdit, onCommitEdit(value), onCancelEdit, onCopy, labels via i18n, children)`.

- [x] **Step 5: i18n** — replace each hardcoded English string in these five files with `const { t } = useTranslation();` + `t('data_table.<key>', '<english default>')` following explore's `toolbar/pagination.tsx` pattern (keys: `save`, `cancel`, `required`, `copied_to_clipboard`, `edit`, `copy`, `row_actions`, …).

- [x] **Step 6: Lint + type-check**

Run: `pnpm lint -- --filter @zextras/ui-components && pnpm -F @zextras/ui-components exec tsc --noEmit`
Expected: clean

- [x] **Step 7: Commit**

```bash
git add packages/ui-components/src/components/display/data-table/row-ui/
git commit -m "feat(data-table): row-ui primitives with local edit state and keyboard isolation"
```

---

**Tracked follow-ups from review (do in later tasks):**
- Row-actions menu keyboard navigation (roving arrows, focus into menu on open, focus restore) — legacy behavior, not a regression; defer to a dedicated a11y follow-up after Task 13
- Rename `.tdActionsMenuOpen` CSS class to `.rowActionsMenuOpen` on next CSS touch
- Repoint `validateEditValue` import from `../data-table-row-chrome` to `models/row-ui.ts` when Task 5 lands the models


### Task 4: Table parts (header, body, footer, states, live region)

**Files:**
- Create: `table-header.tsx`, `table-body.tsx`, `table-footer.tsx`, `table-states.tsx`, `live-region.tsx`
- Source material: explore's `table-header.tsx`/`table-body.tsx` (Subscribe structure), current `data-table-states.tsx`, current orchestrator JSX at `data-table.tsx:855-1055` (pinned styling, aria-sort, cell UI), `data-table-pagination.tsx` (from/to logic)

- [x] **Step 1: `table-states.tsx`** — move `DataTableSkeletonRows`, `DataTableEmptyState`, `DataTableErrorState` from `data-table-states.tsx`; fix skeleton row keys from index to `skeleton-${n}` (SonarLint S6479); i18n the strings.

- [x] **Step 2: `live-region.tsx`**

```tsx
export const DataTableLiveRegion = () => {
	const message = useTableUi((s) => s.liveMessage);
	return (
		<div className={styles.liveRegion} aria-live="polite">
			{message}
		</div>
	);
};
```

- [x] **Step 3: `table-header.tsx`** — render `<thead>` with pinned/aria-sort/sticky logic carried from `data-table.tsx:857-908`, structured as explore's part:

```tsx
const DataTableTableHeader = <TData extends RowData,>() => {
	const table = useDataTableContext<TData>();
	const scrollEdge = useTableUi((s) => s.scrollEdge);
	return (
		<table.Subscribe selector={(s) => [s.columnOrder, s.columnVisibility, s.sorting] as const}>
			{() => (
				<thead>
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id}>…current th JSX…</tr>
					))}
				</thead>
			)}
		</table.Subscribe>
	);
};
```

The select column header and sortable header cells come from column defs built in Root (Task 6). `SortableHeaderCell` moves from `sortable-header-cell.tsx` unchanged except converting `function SortIcon` to an arrow const (S6478-adjacent convention).

- [x] **Step 4: `table-body.tsx`** — explore's part shape + current row JSX (`data-table.tsx:934-1052`) + fixes:

```tsx
const DataTableTableBody = <TData extends RowData,>({
	status, onRetry, onRowClick, enablePeek, …labels
}: TableBodyProps<TData>) => {
	const table = useDataTableContext<TData>();
	const peekRowId = useTableUi((s) => s.peekRowId);
	const editing = useTableUi((s) => s.editing);
	const selectAllMatching = useTableUi((s) => s.selectAllMatching);
	const setPeekRowId = useTableUi((s) => s.setPeekRowId);
	return (
		<table.Subscribe selector={(s) => s.rowSelection}>
			{() => (
				<tbody>
					{status !== 'idle' ? <DataTableStates … /> : table.getRowModel().rows.map((row) => …)}
				</tbody>
			)}
		</table.Subscribe>
	);
};
```

Row-level keydown (Enter/Space → peek/click) carried from `data-table.tsx:959-971` stays, but now cannot swallow control activation because Task 3 stops propagation at the controls.
Peek arrow-key document listener moves here (guarded by `enablePeek && peekRowId !== null`), with the #12 fix:

```ts
function isEditableTarget(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false;
	return (
		target.tagName === 'INPUT' ||
		target.tagName === 'TEXTAREA' ||
		target.isContentEditable
	);
}
```

Place `isEditableTarget` in `models/row-ui.ts` (shared with undo-toast, Task 7).
Scroll-edge tracking (`updateScrollEdge`, `data-table.tsx:649-662`) moves into `DataTableTable` (Task 6) since it owns the scroll container.

- [x] **Step 5: `table-footer.tsx`** with clamp fix (#10) — extract pure helper into `models/pagination.ts` with unit test:

```ts
export function clampRange(
	rowCount: number,
	pageIndex: number,
	pageSize: number,
): { from: number; to: number } {
	const from = rowCount === 0 ? 0 : pageIndex * pageSize + 1;
	const rawTo = Math.min(pageIndex * pageSize + pageSize, rowCount);
	return { from: Math.min(from, Math.max(rowCount, 0)), to: Math.max(rawTo, 0) };
}
```

`table-footer.tsx` subscribes to `pagination` + reads `rowCount` from table options and renders the `X results` / from–to meta.

- [x] **Step 6: Unit tests for `clampRange`** — `models/pagination.test.ts`: `(60, 2, 25) → {from:51,to:60}`, `(60, 5, 25) → {from:0,to:0}` (out-of-range page), `(0, 0, 25) → {from:0,to:0}`, `(10, 0, 25) → {from:1,to:10}`. TDD: write test first, watch it fail, implement, watch it pass.

- [x] **Step 7: Commit**

```bash
git add packages/ui-components/src/components/display/data-table/table-header.tsx packages/ui-components/src/components/display/data-table/table-body.tsx packages/ui-components/src/components/display/data-table/table-footer.tsx packages/ui-components/src/components/display/data-table/table-states.tsx packages/ui-components/src/components/display/data-table/live-region.tsx packages/ui-components/src/components/display/data-table/models/
git commit -m "feat(data-table): subscribe-based header/body/footer/states parts"
```

---

**Task 4 review outcomes (recorded):**
- CRITICAL fix: body must subscribe to ALL row-model slices via shared `table-selectors.ts` `ROW_MODEL_SLICES`, and `getRowModel()`/`getVisibleCells()` must be read INSIDE the Subscribe callback (never hoisted to component body). Header uses `COLUMN_LAYOUT_SLICES`.
- Task 6 MUST pass `manualFiltering` explicitly to the table (footer's `resolveRowCount` treats undefined as client-side; legacy default was `true` at prop level).
- Task 6 should thread a `getRowLabel`-style resolver (peekTitle/primary-column) for row aria-labels (body currently derives from primary column with row.id fallback).
- `isEditableTarget` landed in `models/event-target.ts` (not models/row-ui.ts).


### Task 5: Models — filter coercion (#9), shared helpers

**Files:**
- Create: `models/filter-model.ts`, `models/customize-model.ts`, `models/row-ui.ts`, `models/pagination.ts`, `models/types.ts`
- Modify: delete old root-level `data-table-filter-model.ts`, `data-table-customize-model.ts`, `data-table-row-ui.ts` after moving

- [x] **Step 1: Move** `data-table-filter-model.ts` → `models/filter-model.ts`, `data-table-customize-model.ts` → `models/customize-model.ts`, `data-table-row-ui.ts` → `models/row-ui.ts`; move shared types (`DataTableFilterChip`, `DataTableFiltersState`, `DataTableBulkAction`, `DataTableRowAction`, `DataTableColumnMeta`, `DataTableStatus`, …) from `types.ts` → `models/types.ts`.

- [x] **Step 2: TDD the filter coercion fix (#9)** — add cases to `models/filter-model.test.ts` (move existing `data-table-filter-model` tests first, keep them green):

```ts
// ISO-string and numeric-string cells must filter like native values
expect(matchesFilter('2026-01-05T10:00:00.000Z', { type: 'dateRange', min: '2026-01-01', max: '2026-01-31' })).toBe(true);
expect(matchesFilter('42', { type: 'numberRange', min: 10, max: 50 })).toBe(true);
expect(matchesFilter(42, { type: 'numberRange', min: 10, max: 50 })).toBe(true);
// max-only range chip renders open-ended
const [chip] = buildFilterChips({ age: { type: 'numberRange', max: 50 } }, defs);
expect(chip.label).not.toMatch(/0/); // no false "0–50" lower bound — "≤ 50" style
```

Implement by coercing in the filter fns: `const n = typeof v === 'number' ? v : Number(v)` (NaN → no match), `const d = v instanceof Date ? v : new Date(String(v))` (Invalid Date → no match). Chip label for single-bound ranges: `t('data_table.filter.max', '≤ {{max}}', {max})` / `min` variant.

- [x] **Step 3: `isEditableTarget`** helper into `models/row-ui.ts` (used by body peek-nav + undo-toast).

- [x] **Step 4: Run model tests** — `pnpm vitest run packages/ui-components/src/components/display/data-table/models/` — all pass.

- [x] **Step 5: Commit** — `git commit -m "fix(data-table): filter coercion for string dates/numbers; open-ended chips"` (add the moved + test files).

---

**Task 5 review outcomes (recorded):**
- Filter fns now coerce + normalize: reversed bounds swap, date-only `to` → end-of-day, NaN never matches, null/''/booleans never match. Chips carry structured `bounds` payload alongside English `label` fallback.
- Task 7 chip component MUST render locale-aware labels from `bounds` (the model does not localize).
- `models/types.ts` is canonical for EditingState/PeekField + filter/bulk/meta types; root `types.ts` re-exports until Task 10.


### Task 6: `DataTableRoot` + `DataTableTable` compound shell

**Files:**
- Create: `data-table-root.tsx`, `table.tsx`
- Modify: `index.ts` (temporary exports alongside old ones until Task 10)

- [x] **Step 1: `data-table-root.tsx`**

```tsx
type DataTableRootProps<TData extends RowData> = {
	data: Array<TData>;
	columns: Array<DataTableColumnDef<TData>>;
	getRowId?: (row: TData, index: number) => string;
	enableSorting?: boolean;
	enableRowSelection?: boolean;
	rowActions?: Array<DataTableRowAction>;
	onRowAction?: (event: { action: DataTableRowAction; row: TData }) => void;
	manualSorting?: boolean;
	manualPagination?: boolean;
	manualFiltering?: boolean;
	rowCount?: number;
	state?: Partial<DataTableState>;
	initialState?: Partial<DataTableState>;
	onSortingChange?: OnChangeFn<SortingState>;
	onPaginationChange?: OnChangeFn<PaginationState>;
	onRowSelectionChange?: OnChangeFn<RowSelectionState>;
	onColumnVisibilityChange?: OnChangeFn<ColumnVisibilityState>;
	onColumnOrderChange?: OnChangeFn<ColumnOrderState>;
	children: ReactNode;
};

export const DataTableRoot = <TData extends RowData,>({
	data, columns, getRowId, enableSorting = true, enableRowSelection = false,
	rowActions, onRowAction, manualSorting = true, manualPagination = true,
	manualFiltering = true, rowCount, state, initialState, onSortingChange,
	onPaginationChange, onRowSelectionChange, onColumnVisibilityChange,
	onColumnOrderChange, children,
}: DataTableRootProps<TData>) => {
	// built-in select + actions columns, primaryColumnId, pinning — carried from
	// data-table.tsx:89-171 + 288-462 (buildSelectColumn / buildActionsColumn /
	// resolvePrimaryColumnId / columnPinning), with menuRowId kept LOCAL inside
	// row-actions (the tdActionsMenuOpen highlight moves into the cell component's
	// own wrapper span + CSS).
	const table = useDataTable<TData>({ /* options as above + state/onXxxChange */ });
	return (
		<TableUiProvider>
			<table.AppTable className={clsx(styles.shell, useDensityClass())}>
				{children}
			</table.AppTable>
		</TableUiProvider>
	);
};
```

Density class: subscribe in a tiny module-level `ShellClass` part (`useTableUi((s) => s.density)`) rather than in Root's render (keeps Root free of UI-store subscriptions):
structure: `<TableUiProvider><table.AppTable><ShellDensityClass />{children}</table.AppTable></TableUiProvider>` — or simpler: Root reads `useTableUi` only for `density` and applies `data-density`; acceptable (one slice).

- [x] **Step 2: `table.tsx`** — the `<table>` + scroll container:

```tsx
export const DataTableTable = <TData extends RowData,>({
	'aria-label': ariaLabel, status, onRetry, onRowClick, enablePeek, emptyTitle, …
}: DataTableTableProps<TData>) => {
	const table = useDataTableContext<TData>();
	const setScrollEdge = useTableUi((s) => s.setScrollEdge);
	const scrollRef = useRef<HTMLDivElement>(null);
	// scroll listener + edge effect carried from data-table.tsx:649-662
	return (
		<div className={styles.scroll} ref={scrollRef} onScroll={updateScrollEdge}>
			<table className={styles.table} aria-label={ariaLabel}>
				<DataTableTableHeader<TData> />
				<DataTableTableBody<TData> … />
			</table>
		</div>
	);
};
```

- [x] **Step 3: Manual smoke render test (jsdom)** — `data-table-root.test.tsx`: render Root + Table with 3 rows/2 columns, assert `table` has aria-label and 3 body rows via `useDataTableContext` wiring. Write test first, watch fail, implement, watch pass.

- [x] **Step 4: Type-check + commit**

```bash
git add packages/ui-components/src/components/display/data-table/data-table-root.tsx packages/ui-components/src/components/display/data-table/table.tsx packages/ui-components/src/components/display/data-table/data-table-root.test.tsx
git commit -m "feat(data-table): DataTableRoot compound shell on createTableHook"
```

---

**Task 6 review outcomes (recorded):**
- Resolved table config (primaryColumnId, enableRowSelection, columns, getRowLabel) is published via `table-config-context.tsx`; DataTableTable's copies are optional overrides (`prop ?? config ?? default`).
- Root uses a CONSTANT selector (`() => null`) — never subscribes to table state; keeps AppTable context value stable so context consumers don't churn.
- columnPinning is Root-owned and RESERVED: consumer-supplied `state.columnPinning` is dropped by `mergeStateOptions`.
- `stripUndefinedKeys` prevents undefined `onXChange` from clobbering feature-installed state updaters (defined→undefined transitions retain stale handlers — documented, unsupported).
- Task 7+ parts must NOT call pinning APIs; they read config via `useTableConfig<TData>()`.


### Task 7: Toolbar parts (search, filters, customize)

**Files:**
- Create: `toolbar/toolbar.tsx`, `toolbar/search.tsx`, `toolbar/filters.tsx`, `toolbar/customize.tsx`, `toolbar/filter-chips.tsx`
- Source material: `data-table-toolbar.tsx`, `data-table-filters-panel.tsx`, `data-table-customize-panel.tsx`, `data-table-filter-chips.tsx`

- [x] **Step 1: `toolbar/toolbar.tsx`** — plain layout `<div className={styles.toolbarWrap}>{children}</div>`.

- [x] **Step 2: `toolbar/search.tsx`** — carries search input; **local input state**, pushing via `onSearchChange` prop on change; hides when `!enableSearch` (render decision belongs to the composing view, so the part itself never takes an `isVisible` flag — the view just doesn't render it). Subscribes to nothing (value comes from prop).

- [x] **Step 3: `toolbar/filters.tsx`** — button + panel:

```tsx
export const DataTableFilters = <TData extends RowData,>({
	filterDefs, filters, onFiltersChange, onApplyResetSelection,
}: DataTableFiltersProps<TData>) => {
	const open = useTableUi((s) => s.openPanel) === 'filters';
	const setOpenPanel = useTableUi((s) => s.setOpenPanel);
	const [draft, setDraft] = useState<DataTableFiltersState>(
		cloneFiltersState(filters ?? {}),
		const panelId = useId(); // fix #11 — instance-scoped ids
	// open(): setDraft(clone(current)); setOpenPanel('filters')
	// apply(): sanitize(draft) → onFiltersChange → setOpenPanel(null) → onApplyResetSelection()
	// outside-click closes via document mousedown checking panelId/trigger refs
	// (fix #11: use refs, never document.getElementById)
};
```

Draft state lives here (part-local). The mutual exclusion with customize comes free from `openPanel`. All labels i18n'd.

- [x] **Step 4: `toolbar/customize.tsx`** — same shape: `openPanel === 'customize'`, `useId()`, carries density + column order/visibility UI; writes go to `table.setColumnVisibility/setColumnOrder` (via `useDataTableContext`) and `setDensity` to the UI store. Reset button uses `models/customize-model.ts` helpers.

- [x] **Step 5: `toolbar/filter-chips.tsx`** — carries `data-table-filter-chips.tsx`; chips from `models/filter-model.ts` `buildFilterChips(filters, filterDefs)`; remove chip / clear all call `onFiltersChange` + `onApplyResetSelection()` (view supplies the reset — this is where #4's contract is enforced; see Task 12).

- [x] **Step 6: Lint + type-check + commit** — `git commit -m "feat(data-table): composable toolbar parts with instance-scoped panel ids"`

---

**Task 7 review outcomes (recorded):**
- Chip numeric bounds format with the APP language (`i18n.resolvedLanguage ?? i18n.language`), not browser locale. Dates fall back to model labels (documented limitation).
- Multi-instance + isolation probe tests lock #11 and the "typing/opening re-renders only the part" contract. Probes increment in `useEffect` and must be named without the substring "render" (lint quirk — relevant for Task 13).
- Task 12 views MUST echo `onSearchChange` into their `value` state for programmatic resets to reach the input (key-remount is the escape hatch).
- Deferred (tracked a11y follow-up): Escape-to-close + focus management on filters/customize dialogs.


### Task 8: Bulk parts (bar, select-all-matching, confirm #7, undo #6/#8, job)

**Files:**
- Create: `bulk/bulk-bar.tsx`, `bulk/select-all-matching.tsx`, `bulk/confirm-dialog.tsx`, `bulk/undo-toast.tsx`, `bulk/bulk-job.tsx`
- Source material: `data-table-bulk-bar.tsx`, `data-table-confirm-dialog.tsx`, `data-table-undo-toast.tsx`, `data-table-bulk-job.tsx` + orchestrator logic at `data-table.tsx:519-647`

- [x] **Step 1: `bulk/bulk-bar.tsx`**

```tsx
export const DataTableBulkBar = <TData extends RowData,>({
	actions, onAction, totalMatchingCount,
}: BulkBarProps<TData>) => {
	const table = useDataTableContext<TData>();
	return (
		<table.Subscribe selector={(s) => s.rowSelection}>
			{() => {
				const selectAllMatching = useTableUi.getState().selectAllMatching; // NO — see below
				…
			}}
		</table.Subscribe>
	);
};
```

Correct wiring (hooks cannot be called inside Subscribe children): subscribe to the UI store first, then to table state:

```tsx
export const DataTableBulkBar = <TData extends RowData,>({ actions, onAction, totalMatchingCount }: BulkBarProps<TData>) => {
	const table = useDataTableContext<TData>();
	const selectAllMatching = useTableUi((s) => s.selectAllMatching);
	const setSelectAllMatching = useTableUi((s) => s.setSelectAllMatching);
	const setUndoToast = useTableUi((s) => s.setUndoToast);
	const announce = useTableUi((s) => s.announce);
	const [pendingConfirm, setPendingConfirm] = useState<DataTableBulkAction | null>(null); // part-local
	return (
		<table.Subscribe selector={(s) => s.rowSelection}>
			{(rowSelection: RowSelectionState) => {
				// bannerCount / showSelectAllMatchingPrompt logic carried from
				// data-table.tsx:514-532; clearSelection uses table.resetRowSelection()
				// + setSelectAllMatching(false) + announce('Selection cleared') (i18n)
				// handleBulkAction/onBulkAction contract carried from data-table.tsx:618-647,
				// document: selectedRowIds only meaningful when !selectAllMatching (#2)
			}}
		</table.Subscribe>
	);
};
```

The confirm dialog + undo toast render inside `bulk-bar.tsx` (they are triggered by it — no cross-part sharing needed, fulfilling the state-tier rule).

- [x] **Step 2: `bulk/confirm-dialog.tsx`** with fix #7:

```tsx
export const DataTableConfirmDialog = ({ title, message, confirmLabel, cancelLabel, onCancel, onConfirm }: ConfirmDialogProps) => {
	const cancelRef = useRef<HTMLButtonElement>(null);
	const previouslyFocused = useRef<Element | null>(null);
	useEffect(() => {
		previouslyFocused.current = document.activeElement;
		cancelRef.current?.focus();
		function handleKeyDown(event: KeyboardEvent): void {
			if (event.key === 'Escape') {
				onCancel();
			}
		}
		document.addEventListener('keydown', handleKeyDown); // document-level — focus-independent
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			(previouslyFocused.current instanceof HTMLElement)
				? previouslyFocused.current.focus()
				: undefined;
		};
	}, [onCancel]);
	// overlay JSX carried from data-table-confirm-dialog.tsx, ids via useId()
};
```

- [x] **Step 3: TDD `bulk/undo-toast.tsx`** with fixes #6/#8 — write `bulk/undo-toast.test.tsx` first:

```tsx
// 1. re-running the same reversible action restarts the timer (#8)
vi.useFakeTimers();
render(<UndoToastController …/>);
act(() => { fireEvent.click(confirmButton); });
act(() => { vi.advanceTimersByTime(4000); });
act(() => { fireEvent.click(confirmButton); }); // second run, same message
act(() => { vi.advanceTimersByTime(4000); });
expect(onExpire).not.toHaveBeenCalled(); // still within *restarted* window
// 2. Cmd+Z inside an input does not trigger undo (#6)
render(<><input aria-label="editor" /><UndoToastController …/></>);
fireEvent.keyDown(screen.getByLabelText('editor'), { key: 'z', metaKey: true });
expect(onUndo).not.toHaveBeenCalled();
// 3. Cmd+Z outside inputs triggers undo
fireEvent.keyDown(document.body, { key: 'z', metaKey: true });
expect(onUndo).toHaveBeenCalled();
```

Implementation: toast keyed by `id` (incrementing counter in bulk-bar when setting `setUndoToast({id, message, onUndo})` — key change remounts the toast so the `setInterval` starts fresh); countdown `clearInterval` at `left === 0` then `onExpire`; document keydown guarded by `isEditableTarget(event.target)`; `globalThis` not `window`.

- [x] **Step 4: `bulk/bulk-job.tsx` + `bulk/select-all-matching.tsx`** — carried from `data-table-bulk-job.tsx` and orchestrator JSX at `data-table.tsx:824-854`; i18n; ids via `useId()` where needed.

- [x] **Step 5: Run tests + commit** — `git commit -m "feat(data-table): bulk parts with confirm focus/Escape and undo timer fixes"`

---

**Task 8 review outcomes (recorded):**
- `modalOpen` UI-store slice: confirm-dialog owns it; ALL document-keydown listeners (peek-nav, row-actions, future parts) must bail when `modalOpen` is true.
- Bulk contract: `selectedRowIds` is `[]` when `selectAllMatching` (views use flag + count); rejection → announce + selection retained; busy guard blocks double-fire.
- i18n interpolation cannot use `{{count}}` for non-number values (i18next pluralization reserve) — use `{{total}}`/`{{rows}}` etc.


### Task 9: Peek panel (#12) + stale banner

**Files:**
- Create: `peek-panel.tsx`, `stale-banner.tsx`
- Source material: `data-table-peek-panel.tsx`, `data-table-stale-banner.tsx`

- [x] **Step 1: `peek-panel.tsx`** — subscribes `useTableUi((s) => s.peekRowId)`; resolves row via `table.getRowModel().rows.find(...)`; key on field id not label (`field.id ?? field.label`, S6479 note from finding 16); close button calls `setPeekRowId(null)`; `onOpenFullDetails` prop. Props: `peekTitle`, `peekStatus`, `peekFields`, `renderPeek`, `onOpenFullDetails` — moved from Root's old prop list.

- [x] **Step 2: `stale-banner.tsx`** — carried unchanged except i18n labels; visibility decided by the composing view (`stale` prop).

- [x] **Step 3: Commit** — `git commit -m "feat(data-table): peek panel and stale banner parts"`

---

**Task 9 review outcomes (recorded):**
- Peek panel subscribes to `PEEK_ROW_SLICES` (pagination/sorting/filters/globalFilter — membership only). Default peek fields are column-id keyed.
- Task 11/12 note: peek props are `title`/`status`/`fields` on the PART (not Root's old `peekTitle`/`peekStatus`/`peekFields`); `status` returns `string`. Views must keep `peekRowId` on-page (no off-page fallback).
- Tracked follow-ups: peek focus management (focus heading on open, restore on close); announce() counter suffix for repeated identical messages.


### Task 10: Public exports + delete the orchestrator

**Files:**
- Modify: `index.ts`, delete `data-table.tsx`, `data-table-toolbar.tsx`, `data-table-bulk-bar.tsx`, `data-table-bulk-job.tsx`, `data-table-confirm-dialog.tsx`, `data-table-copy-cell.tsx`, `data-table-customize-panel.tsx`, `data-table-filter-chips.tsx`, `data-table-filters-panel.tsx`, `data-table-inline-edit.tsx`, `data-table-pagination.tsx`, `data-table-row-actions.tsx`, `data-table-row-ui.ts`, `data-table-stale-banner.tsx`, `data-table-states.tsx`, `data-table-body-cell.tsx`, `selection-checkbox.tsx` (old location), `sortable-header-cell.tsx` (old location)

- [ ] **Step 1: `index.ts` exports** — `DataTableRoot`, `DataTableTable`, `DataTableToolbar`, `DataTableSearch`, `DataTableFilters`, `DataTableFilterChips`, `DataTableCustomize`, `DataTableBulkBar`, `DataTableSelectAllMatching`, `DataTableBulkJob`, `DataTablePagination` (wrapper part subscribing to `table.state.pagination`, from `table-footer.tsx` Task 4 + controls from old `data-table-pagination.tsx`), `DataTablePeekPanel`, `DataTableStaleBanner`, `DataTableConfirmDialog`, `DataTableUndoToast`, `DataTableLiveRegion`, `useDataTable`, `useDataTableContext`, `createDataTableColumnHelper`, `dataTableFeatures`, all model types.

- [ ] **Step 2: `git rm` the old files** (list above) — but keep `data-table.module.css`.

- [ ] **Step 3: Verify package builds** — `pnpm -F @zextras/ui-components exec tsc --noEmit` (old `DataTable` import sites in apps will fail — that's Task 12/13; to keep the tree green per-commit, do this delete **after** the view migrations, i.e. execute Tasks 11→12→13 first if you prefer; the recommended order is: build parts (Tasks 1–9) → migrate views (11–12) → delete orchestrator (10) → tests (13)). Adjust task order accordingly at execution time.

- [ ] **Step 4: Commit** — `git commit -m "refactor(data-table): remove monolithic orchestrator; composable API is public"`

---

### Task 11: Migrate `global-domain-list.tsx`

**Files:**
- Modify: `apps/admin-ui-domains/src/views/global/global-domain-list/global-domain-list.tsx` (+ module css if needed)
- Create: `apps/admin-ui-domains/src/views/global/global-domain-list/use-domain-table-state.ts`

- [x] **Step 1: Extract `use-domain-table-state.ts`** — the reset/clamp effects implementing fixes #4/#5:

```ts
export function useDomainTableState(rowCount: number) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 25 });
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [searchString, setSearchString] = useState('');
	const [filters, setFilters] = useState<DataTableFiltersState>({});

	// #4: manual mode — any query-shape change resets page + selection
	const querySignature = JSON.stringify([searchString, filters, sorting]);
	const previousSignature = useRef(querySignature);
	useEffect(() => {
		if (previousSignature.current !== querySignature) {
			previousSignature.current = querySignature;
			setPagination((prev) => ({ ...prev, pageIndex: 0 }));
			setRowSelection({});
		}
	}, [querySignature]);

	// #5: clamp page index when rowCount shrinks (deletions, domain switch)
	const maxPageIndex = Math.max(0, Math.ceil(rowCount / pagination.pageSize) - 1);
	useEffect(() => {
		setPagination((prev) =>
			prev.pageIndex > maxPageIndex ? { ...prev, pageIndex: maxPageIndex } : prev,
		);
	}, [maxPageIndex]);

	return { sorting, setSorting, pagination, setPagination, rowSelection, setRowSelection, searchString, setSearchString, filters, setFilters };
}
```

- [x] **Step 2: Rewrite the view** — same React Query usage (`useDomainSearch` + SOAP service untouched); replace `<DataTable …100 props…>` with Root + parts composition exactly like the spec's example; move English label props out (parts now i18n themselves); keep the current no-op bulk handler.

- [x] **Step 3: Run domain tests** — `pnpm vitest run apps/admin-ui-domains` — existing unit tests for the view must still pass (update imports only).

- [x] **Step 4: Commit** — `git commit -m "refactor(admin-ui-domains): global domain list on composable DataTable"`

---

**Task 11 review outcomes (recorded):**
- `use-server-table-state.ts` (apps/admin-ui-domains/src/hooks): render-time resets (repo lint forbids set-state-in-effect); `totalRowCount` option + view-side `clampPaginationToRowCount`; `initialSorting` option. Task 12 REUSES this hook with `resetKey={domainId}`.
- BulkBar clears `selectAllMatching` when selection empties (loop-safe, tested + browser regression).
- Clamp residual gap documented: clamped page data NOT refetched until next interaction.
- Barrel exports already added (Task 10 only deletes legacy now). Pagination controls currently = legacy component exported as stopgap — Task 10 owes the context-connected part.
- bulkVariant A/B toolbar-swap = view-side workaround (accepted API decision). Column helper TValue variance vs Root unknown slot — Task 10 polish.


### Task 12: Migrate `manage-accounts.tsx` + dead code (#1, #14) + shared helpers (#15)

**Files:**
- Modify: `apps/admin-ui-domains/src/views/manage/accounts/manage-accounts.tsx`
- Delete: `apps/admin-ui-domains/src/services/use-count-account.ts`, `apps/admin-ui-domains/src/services/count-account-service.ts` (+ its test if present, + `parseAccountCount` and its test — verify zero references via `rg 'count-account|parseAccountCount|useCountAccount' apps/`)
- Create: `packages/ui-shared/src/utils/table-status.ts` (moved `resolveTableStatus` + `enumFilterValues`; re-export from both views' usage)

- [x] **Step 1: Move shared helpers to ui-shared** — `resolveTableStatus` + `enumFilterValues` copy-pasted in both views (finding 15); single export `resolveTableStatus<T>(query)` in `@zextras/ui-shared`; unit test there.

- [x] **Step 2: Rewrite the view** — Root + parts; same `useDomainTableState` pattern (extract to `apps/admin-ui-domains/src/views/manage/accounts/use-accounts-table-state.ts` or promote Task 11's hook to `apps/admin-ui-domains/src/hooks/use-server-table-state.ts` and reuse in both views — **preferred**, one hook, DRY).

- [x] **Step 3: Domain-switch reset (#5)** — the accounts route stays mounted across `domainId` changes; add to the shared hook:

```ts
useEffect(() => {
	setPagination((prev) => ({ ...prev, pageIndex: 0 }));
	setRowSelection({});
	setSearchString('');
	setFilters({});
}, [domainId]);
```

(pass `domainId` as an optional `resetKey` param of the shared hook — domain list passes nothing, accounts view passes `domainId`).

- [x] **Step 4: Delete count dead code (#1, #14)** — remove `Total Accounts` references; both views + services must have zero references (verify with `rg`).

- [x] **Step 5: Commit** — `git commit -m "refactor(admin-ui-domains): manage accounts on composable DataTable; remove count dead code"`

---

**Task 12 review outcomes (recorded):**
- Views duplicate composition blocks (toolbar swap, chips, ~35-line pagination wiring) — do NOT extract a composite yet (rule of three; revisit on third consumer).
- Task 13 must add the selection-reset assertion to the domain-switch browser test (named but unasserted).
- Follow-up tickets (out of scope): resetKey-aware debounce flush (stale-search transient on domain switch); make CreateAccount's setIsAccountCreated/showAccountDetailView props optional.
- ui-shared's TableStatus union is intentionally structural (no package edge to ui-components).


### Task 13: Tests — e2e rewrite + targeted + isolation

**Files:**
- Modify: `packages/ui-components/src/components/display/data-table/tests/data-table.browser.test.tsx` (full rewrite), `apps/admin-ui-domains/…/tests/manage-accounts.browser.test.tsx` (update), `apps/admin-ui-domains/…/tests/global-domain-list.browser.test.tsx` (update if exists)
- Create: `packages/ui-components/src/components/display/data-table/tests/render-isolation.browser.test.tsx`

- [ ] **Step 1: Rewrite the package e2e** — same 23 user-facing scenarios (selection, select-all-matching, sort cycle incl. third click back to unsorted + `aria-sort` assertion, search, filter panel apply/clear/chips, customize density/columns, pagination navigation + clamped from/to, bulk confirm + undo, copy cell announce, inline edit commit/cancel, peek open/arrows/escape, stale banner) against the composable API. Follow `docs/browser-test-conventions.md`: `getByRole`/`getByLabelText`/`getByText` only, never `getByTestId` (except icon fallbacks), `testTimeout: 10_000`.

- [ ] **Step 2: Update view tests** — `manage-accounts.browser.test.tsx`: remove `Total Accounts` + CountAccount interceptor assertions (finding 1); keep all other scenarios; add: new search clears selection (#4), deleting last rows on last page clamps page (#5).

- [ ] **Step 3: `render-isolation.browser.test.tsx`** — the architecture's core promise, locked in:

```tsx
// module-level render counters (S6478-safe: defined outside components)
let bodyRenders = 0;
let toolbarRenders = 0;
function BodyProbe() { bodyRenders += 1; return <DataTableTable … />; } // wraps part
function ToolbarProbe() { toolbarRenders += 1; return <DataTableToolbar>…</DataTableToolbar>; }

it('pagination change does not re-render the toolbar', async () => {
	render(<DataTableRoot …><ToolbarProbe /><BodyProbe /><DataTablePagination … /></DataTableRoot>);
	const before = toolbarRenders;
	await userEvent.click(page.getByRole('button', { name: 'Go to next page' }));
	expect(bodyRenders).toBeGreaterThan(0);
	expect(toolbarRenders).toBe(before);
});
```

Note: counters must live at module level, probes defined at module level (SonarLint S6478); expect small constant overhead renders — assert *delta* equality (toolbar renders unchanged by pagination click).

- [ ] **Step 4: Run everything** — `pnpm test` (full suite). All green.

- [ ] **Step 5: Commit** — `git commit -m "test(data-table): composable e2e suite, targeted fixes coverage, render-isolation lock"`

---

### Task 14: Final verification

- [ ] `pnpm type-check` — clean
- [ ] `pnpm lint` — clean
- [ ] `pnpm test` — all green (note: full browser suite is long; run at least the data-table + domains packages)
- [ ] `pnpm build` — all packages build
- [ ] `rg -n "data-table-customize-panel|data-table-filters-panel|getElementById" packages/ui-components/src/components/display/data-table/` — zero hits (fix #11 verified)
- [ ] `rg -n "useCountAccount|count-account|Total Accounts" apps/` — zero hits (fixes #1/#14 verified)
- [ ] Commit any stragglers; report summary of findings fixed: 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 (2 intentionally deferred per decision).

---

## Execution order note

Tasks 1–9 build the new suite alongside the old one (tree stays green). Recommended execution order: **1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 10, 13, 14** — i.e. migrate the views *before* deleting the orchestrator (Task 10) so every commit compiles, then tests, then final verification.

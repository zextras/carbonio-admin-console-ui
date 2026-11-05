/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Row, RowData } from '@tanstack/react-table';
import { filterFn_arrHas } from '@tanstack/react-table';
import { describe, expect, it } from 'vitest';

import type { DataTableFeatures } from '../data-table-features';
import type { DataTableColumnDef, DataTableFilterDef, DataTableFiltersState } from '../types';
import {
  buildFilterChips,
  cloneFiltersState,
  countActiveFilters,
  dateRangeFilterFn,
  enrichColumnsWithFilterFns,
  getDateDraftValue,
  getEnumDraftSelection,
  getRangeDraftValue,
  matchesDateRange,
  matchesNumberRange,
  numberRangeFilterFn,
  removeFilterChip,
  sanitizeFilters,
  setDateDraftValue,
  setRangeDraftValue,
  toColumnFilters,
  toggleEnumDraftValue,
} from './filter-model';

const enumDef: DataTableFilterDef = {
  id: 'status',
  label: 'Status',
  type: 'enum',
  options: [
    { label: 'Active', value: 'active' },
    { label: 'Paused', value: 'paused' },
  ],
};

const rangeDef: DataTableFilterDef = { id: 'size', label: 'Size', type: 'range' };
const dateDef: DataTableFilterDef = { id: 'created', label: 'Created', type: 'date' };
const defs = [enumDef, rangeDef, dateDef];

describe('cloneFiltersState', () => {
  it('deep-clones enum, range and date values', () => {
    const filters: DataTableFiltersState = {
      status: ['active'],
      size: { min: 1, max: 10 },
      created: { from: '2026-01-01', to: null },
    };
    const clone = cloneFiltersState(filters);
    expect(clone).toEqual(filters);
    expect(clone).not.toBe(filters);
    expect(clone.status).not.toBe(filters.status);
    expect(clone.size).not.toBe(filters.size);
    expect(clone.created).not.toBe(filters.created);
  });
});

describe('sanitizeFilters', () => {
  it('keeps only values matching their filter definition shape', () => {
    const draft: DataTableFiltersState = {
      status: ['active'],
      size: { min: 1, max: null },
      created: { from: '2026-01-01', to: '2026-02-01' },
      unknown: ['x'],
    };
    expect(sanitizeFilters(draft, defs)).toEqual({
      status: ['active'],
      size: { min: 1, max: null },
      created: { from: '2026-01-01', to: '2026-02-01' },
    });
  });

  it('drops empty selections, empty ranges and empty dates', () => {
    const draft: DataTableFiltersState = {
      status: [],
      size: { min: null, max: null },
      created: { from: null, to: null },
    };
    expect(sanitizeFilters(draft, defs)).toEqual({});
  });

  it('drops values whose shape does not match the definition type', () => {
    const draft: DataTableFiltersState = {
      status: { min: 1, max: 2 },
      size: ['a'],
    };
    expect(sanitizeFilters(draft, defs)).toEqual({});
  });
});

describe('countActiveFilters', () => {
  it('counts one active filter per non-empty value', () => {
    const filters: DataTableFiltersState = {
      status: ['active', 'paused'],
      size: { min: null, max: 50 },
      created: { from: null, to: null },
    };
    expect(countActiveFilters(filters)).toBe(2);
  });

  it('counts zero for an empty state', () => {
    expect(countActiveFilters({})).toBe(0);
  });
});

describe('buildFilterChips', () => {
  it('builds one chip per enum value with the option label', () => {
    const chips = buildFilterChips({ status: ['active', 'paused'] }, [enumDef]);
    expect(chips).toEqual([
      { key: 'status:active', filterId: 'status', label: 'Status: Active', enumValue: 'active' },
      { key: 'status:paused', filterId: 'status', label: 'Status: Paused', enumValue: 'paused' },
    ]);
  });

  it('falls back to the raw enum value when no option matches', () => {
    const chips = buildFilterChips({ status: ['ghost'] }, [enumDef]);
    expect(chips[0]?.label).toBe('Status: ghost');
  });

  it('renders open-ended date chips without inventing bounds', () => {
    const chips = buildFilterChips({ created: { from: null, to: '2026-01-31' } }, [dateDef]);
    expect(chips[0]?.label).toBe('Created: …–2026-01-31');
  });

  it('carries the raw bounds on range chips for locale-aware formatting', () => {
    const maxOnly = buildFilterChips({ size: { min: null, max: 50 } }, [rangeDef]);
    expect(maxOnly[0]?.bounds).toEqual({ max: 50 });
    const minOnly = buildFilterChips({ size: { min: 10, max: null } }, [rangeDef]);
    expect(minOnly[0]?.bounds).toEqual({ min: 10 });
    const bounded = buildFilterChips({ size: { min: 10, max: 50 } }, [rangeDef]);
    expect(bounded[0]?.bounds).toEqual({ min: 10, max: 50 });
  });

  it('carries the raw bounds on date chips', () => {
    const chips = buildFilterChips({ created: { from: '2026-01-01', to: '2026-01-31' } }, [
      dateDef,
    ]);
    expect(chips[0]?.bounds).toEqual({ min: '2026-01-01', max: '2026-01-31' });
    const toOnly = buildFilterChips({ created: { from: null, to: '2026-01-31' } }, [dateDef]);
    expect(toOnly[0]?.bounds).toEqual({ max: '2026-01-31' });
  });

  it('renders a max-only range chip without a false 0 lower bound', () => {
    const chips = buildFilterChips({ size: { min: null, max: 50 } }, [rangeDef]);
    expect(chips[0]?.label).toBe('Size: ≤ 50');
  });

  it('renders a min-only range chip as open-ended upwards', () => {
    const chips = buildFilterChips({ size: { min: 10, max: null } }, [rangeDef]);
    expect(chips[0]?.label).toBe('Size: ≥ 10');
  });

  it('renders a bounded range chip with both bounds', () => {
    const chips = buildFilterChips({ size: { min: 10, max: 50 } }, [rangeDef]);
    expect(chips[0]?.label).toBe('Size: 10–50');
  });
});

describe('removeFilterChip', () => {
  it('removes a single enum value from a multi-value selection', () => {
    const next = removeFilterChip(
      { status: ['active', 'paused'] },
      { key: 'status:active', filterId: 'status', label: 'Status: Active', enumValue: 'active' },
    );
    expect(next).toEqual({ status: ['paused'] });
  });

  it('deletes the filter when the last enum value is removed', () => {
    const next = removeFilterChip(
      { status: ['active'] },
      { key: 'status:active', filterId: 'status', label: 'Status: Active', enumValue: 'active' },
    );
    expect(next).toEqual({});
  });

  it('removes the whole filter for non-enum chips', () => {
    const next = removeFilterChip(
      { size: { min: 1, max: 10 } },
      { key: 'size', filterId: 'size', label: 'Size: 1–10' },
    );
    expect(next).toEqual({});
  });
});

describe('toColumnFilters', () => {
  it('maps the state to TanStack column filters with [bound, bound] tuples', () => {
    const columnFilters = toColumnFilters(
      {
        status: ['active'],
        size: { min: 1, max: 10 },
        created: { from: '2026-01-01', to: null },
      },
      defs,
    );
    expect(columnFilters).toEqual([
      { id: 'status', value: ['active'] },
      { id: 'size', value: [1, 10] },
      { id: 'created', value: ['2026-01-01', null] },
    ]);
  });

  it('skips empty values', () => {
    expect(toColumnFilters({ size: { min: null, max: null } }, [rangeDef])).toEqual([]);
  });
});

describe('toggleEnumDraftValue', () => {
  it('adds an unselected option', () => {
    expect(toggleEnumDraftValue({}, 'status', 'active')).toEqual({ status: ['active'] });
  });

  it('removes a selected option and deletes the key when empty', () => {
    expect(toggleEnumDraftValue({ status: ['active'] }, 'status', 'active')).toEqual({});
    expect(toggleEnumDraftValue({ status: ['active', 'paused'] }, 'status', 'active')).toEqual({
      status: ['paused'],
    });
  });
});

describe('setRangeDraftValue', () => {
  it('parses numeric input and keeps the other bound', () => {
    expect(setRangeDraftValue({ size: { min: 1, max: 10 } }, 'size', 'max', '20')).toEqual({
      size: { min: 1, max: 20 },
    });
  });

  it('treats blank and non-numeric input as an unset bound', () => {
    expect(setRangeDraftValue({ size: { min: 1, max: 10 } }, 'size', 'max', '')).toEqual({
      size: { min: 1, max: null },
    });
    expect(setRangeDraftValue({ size: { min: 1, max: 10 } }, 'size', 'min', 'abc')).toEqual({
      size: { min: null, max: 10 },
    });
  });

  it('deletes the draft entry when both bounds are unset', () => {
    expect(setRangeDraftValue({ size: { min: 1, max: null } }, 'size', 'min', '  ')).toEqual({});
  });
});

describe('setDateDraftValue', () => {
  it('sets a bound and trims blank input to null', () => {
    expect(setDateDraftValue({}, 'created', 'from', '2026-01-01')).toEqual({
      created: { from: '2026-01-01', to: null },
    });
    expect(
      setDateDraftValue({ created: { from: '2026-01-01', to: null } }, 'created', 'to', ' '),
    ).toEqual({ created: { from: '2026-01-01', to: null } });
  });

  it('deletes the draft entry when both bounds are unset', () => {
    expect(
      setDateDraftValue({ created: { from: '2026-01-01', to: null } }, 'created', 'from', ''),
    ).toEqual({});
  });
});

describe('draft getters', () => {
  it('return defaults for missing entries', () => {
    expect(getEnumDraftSelection({}, 'status')).toEqual([]);
    expect(getRangeDraftValue({}, 'size')).toEqual({ min: null, max: null });
    expect(getDateDraftValue({}, 'created')).toEqual({ from: null, to: null });
  });
});

type TestRow = Row<DataTableFeatures, RowData>;

function rowWithValue(value: unknown): TestRow {
  return {
    getValue: (columnId: string) => (columnId === 'col' ? value : undefined),
  } as unknown as TestRow;
}

describe('matchesNumberRange', () => {
  it('matches numeric-string cells and native numbers alike', () => {
    expect(matchesNumberRange('42', { min: 10, max: 50 })).toBe(true);
    expect(matchesNumberRange(42, { min: 10, max: 50 })).toBe(true);
  });

  it('rejects non-numeric strings', () => {
    expect(matchesNumberRange('not-a-number', { min: 10, max: 50 })).toBe(false);
  });

  it('rejects nullish and empty cells instead of coercing them to 0', () => {
    expect(matchesNumberRange(null, { min: null, max: 50 })).toBe(false);
    expect(matchesNumberRange(undefined, { min: null, max: 50 })).toBe(false);
    expect(matchesNumberRange('', { min: null, max: 50 })).toBe(false);
  });

  it('treats null bounds as open-ended', () => {
    expect(matchesNumberRange(5, { min: null, max: 50 })).toBe(true);
    expect(matchesNumberRange(100, { min: null, max: 50 })).toBe(false);
    expect(matchesNumberRange(100, { min: 10, max: null })).toBe(true);
    expect(matchesNumberRange(5, { min: 10, max: null })).toBe(false);
  });

  it('matches cells exactly on either bound (inclusive)', () => {
    expect(matchesNumberRange(10, { min: 10, max: 50 })).toBe(true);
    expect(matchesNumberRange(50, { min: 10, max: 50 })).toBe(true);
  });
});

describe('matchesDateRange', () => {
  it('matches ISO-string cells that fall inside the bounds', () => {
    expect(
      matchesDateRange('2026-01-05T10:00:00.000Z', { from: '2026-01-01', to: '2026-01-31' }),
    ).toBe(true);
  });

  it('rejects ISO-string cells outside the bounds', () => {
    expect(matchesDateRange('2026-06-15', { from: '2026-01-01', to: '2026-01-31' })).toBe(false);
  });

  it('matches Date objects and timestamps', () => {
    expect(
      matchesDateRange(new Date('2026-01-05T10:00:00.000Z'), {
        from: '2026-01-01',
        to: '2026-01-31',
      }),
    ).toBe(true);
    expect(
      matchesDateRange(new Date('2026-01-05T10:00:00.000Z').getTime(), {
        from: '2026-01-01',
        to: '2026-01-31',
      }),
    ).toBe(true);
  });

  it('never matches unparseable date cells', () => {
    expect(matchesDateRange('not-a-date', { from: '2026-01-01', to: null })).toBe(false);
    expect(matchesDateRange(null, { from: '2026-01-01', to: null })).toBe(false);
  });

  it('never matches NaN or infinite timestamp cells', () => {
    expect(matchesDateRange(Number.NaN, { from: '2026-01-01', to: null })).toBe(false);
    expect(matchesDateRange(Number.POSITIVE_INFINITY, { from: null, to: '2026-12-31' })).toBe(
      false,
    );
  });

  it('matches cells exactly on either bound (inclusive)', () => {
    expect(
      matchesDateRange('2026-01-01T00:00:00.000Z', { from: '2026-01-01', to: '2026-01-31' }),
    ).toBe(true);
    expect(
      matchesDateRange('2026-01-31T00:00:00.000Z', { from: '2026-01-01', to: '2026-01-31' }),
    ).toBe(true);
  });
  it('treats null bounds as open-ended', () => {
    expect(matchesDateRange('2025-06-15', { from: null, to: '2026-01-31' })).toBe(true);
    expect(matchesDateRange('2026-06-15', { from: '2026-01-01', to: null })).toBe(true);
  });
});

describe('numberRangeFilterFn', () => {
  it('coerces numeric-string row values before comparing', () => {
    expect(numberRangeFilterFn(rowWithValue('42'), 'col', [10, 50])).toBe(true);
    expect(numberRangeFilterFn(rowWithValue(42), 'col', [10, 50])).toBe(true);
    expect(numberRangeFilterFn(rowWithValue('not-a-number'), 'col', [10, 50])).toBe(false);
  });

  it('keeps null endpoints open-ended', () => {
    expect(numberRangeFilterFn(rowWithValue(7), 'col', [null, 50])).toBe(true);
    expect(numberRangeFilterFn(rowWithValue(70), 'col', [null, 50])).toBe(false);
    expect(numberRangeFilterFn(rowWithValue(70), 'col', [10, null])).toBe(true);
  });

  it('swaps reversed bounds so they still match rows in between', () => {
    const resolved = numberRangeFilterFn.resolveFilterValue?.([50, 10]) ?? [50, 10];
    expect(resolved).toEqual([10, 50]);
    expect(numberRangeFilterFn(rowWithValue(25), 'col', resolved)).toBe(true);
  });

  it('keeps a 0 bound when deciding whether to auto-remove the filter', () => {
    expect(numberRangeFilterFn.autoRemove?.(0)).toBe(false);
    expect(numberRangeFilterFn.autoRemove?.([0, 50])).toBe(false);
    expect(numberRangeFilterFn.autoRemove?.([null, null])).toBe(true);
  });
});

describe('dateRangeFilterFn', () => {
  it('coerces ISO-string row values and endpoints before comparing', () => {
    expect(
      dateRangeFilterFn(rowWithValue('2026-01-05T10:00:00.000Z'), 'col', [
        '2026-01-01',
        '2026-01-31',
      ]),
    ).toBe(true);
    expect(dateRangeFilterFn(rowWithValue('2026-06-15'), 'col', ['2026-01-01', '2026-01-31'])).toBe(
      false,
    );
    expect(dateRangeFilterFn(rowWithValue('not-a-date'), 'col', ['2026-01-01', null])).toBe(false);
  });

  it('includes the whole end day for a date-only to bound', () => {
    const resolved = dateRangeFilterFn.resolveFilterValue?.(['2026-01-01', '2026-01-31']) ?? [
      '2026-01-01',
      '2026-01-31',
    ];
    expect(resolved[1]).toBe(new Date('2026-01-31T23:59:59.999Z').getTime());
    expect(dateRangeFilterFn(rowWithValue('2026-01-31T10:00:00.000Z'), 'col', resolved)).toBe(true);
  });

  it('keeps a date-only from bound at the start of that day', () => {
    const resolved = dateRangeFilterFn.resolveFilterValue?.(['2026-01-01', null]) ?? [
      '2026-01-01',
      null,
    ];
    expect(resolved[0]).toBe(new Date('2026-01-01T00:00:00.000Z').getTime());
    expect(dateRangeFilterFn(rowWithValue('2026-01-01T00:00:00.000Z'), 'col', resolved)).toBe(true);
  });

  it('swaps reversed bounds so they still match rows in between', () => {
    const resolved = dateRangeFilterFn.resolveFilterValue?.(['2026-01-31', '2026-01-05']) ?? [
      '2026-01-31',
      '2026-01-05',
    ];
    expect(resolved[0]).toBeLessThan(resolved[1] ?? Number.POSITIVE_INFINITY);
    expect(dateRangeFilterFn(rowWithValue('2026-01-15T12:00:00.000Z'), 'col', resolved)).toBe(true);
  });

  it('swaps reversed bounds before applying the end-of-day extension', () => {
    const resolved = dateRangeFilterFn.resolveFilterValue?.(['2026-01-10', '2026-01-05']) ?? [];
    expect(resolved).toEqual([
      new Date('2026-01-05T00:00:00.000Z').getTime(),
      new Date('2026-01-10T23:59:59.999Z').getTime(),
    ]);
    expect(dateRangeFilterFn(rowWithValue('2026-01-05T12:00:00.000Z'), 'col', resolved)).toBe(true);
    expect(dateRangeFilterFn(rowWithValue('2026-01-10T20:00:00.000Z'), 'col', resolved)).toBe(true);
    expect(dateRangeFilterFn(rowWithValue('2026-01-04T23:00:00.000Z'), 'col', resolved)).toBe(false);
  });

  it('keeps a 0 (epoch) bound when deciding whether to auto-remove the filter', () => {
    expect(dateRangeFilterFn.autoRemove?.(0)).toBe(false);
    expect(dateRangeFilterFn.autoRemove?.([0, null])).toBe(false);
    expect(dateRangeFilterFn.autoRemove?.([null, null])).toBe(true);
  });
});

describe('enrichColumnsWithFilterFns', () => {
  it('assigns the built-in enum filter fn', () => {
    const columns: Array<DataTableColumnDef<RowData>> = [{ id: 'status', header: 'Status' }];
    const enriched = enrichColumnsWithFilterFns(columns, [enumDef]);
    expect(enriched[0]?.filterFn).toBe(filterFn_arrHas);
  });

  it('assigns coercing range and date filter fns', () => {
    const columns: Array<DataTableColumnDef<RowData>> = [
      { id: 'size', header: 'Size' },
      { id: 'created', header: 'Created' },
    ];
    const enriched = enrichColumnsWithFilterFns(columns, [rangeDef, dateDef]);
    const sizeFn = enriched[0]?.filterFn;
    const createdFn = enriched[1]?.filterFn;
    if (typeof sizeFn !== 'function' || typeof createdFn !== 'function') {
      throw new Error('expected range/date columns to carry filter functions');
    }
    expect(sizeFn(rowWithValue('42'), 'col', [10, 50])).toBe(true);
    expect(createdFn(rowWithValue('2026-06-15'), 'col', ['2026-01-01', '2026-01-31'])).toBe(false);
  });

  it('leaves columns without a matching filter definition untouched', () => {
    const columns: Array<DataTableColumnDef<RowData>> = [{ id: 'other', header: 'Other' }];
    const enriched = enrichColumnsWithFilterFns(columns, [rangeDef]);
    expect(enriched[0]?.filterFn).toBeUndefined();
  });
});

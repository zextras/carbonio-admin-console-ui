/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ColumnFiltersState, RowData } from '@tanstack/react-table';
import { constructFilterFn, filterFn_arrHas } from '@tanstack/react-table';

import type { DataTableColumnDef } from '../types';
import { resolveColumnId } from './customize-model';
import type {
  DataTableDateFilterValue,
  DataTableFilterChip,
  DataTableFilterDef,
  DataTableFiltersState,
  DataTableFilterValue,
  DataTableRangeFilterValue,
} from './types';

function isEnumValue(value: DataTableFilterValue): value is Array<string> {
  return Array.isArray(value);
}

function isRangeValue(value: DataTableFilterValue): value is DataTableRangeFilterValue {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    'min' in value &&
    'max' in value
  );
}

function isDateValue(value: DataTableFilterValue): value is DataTableDateFilterValue {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    'from' in value &&
    'to' in value
  );
}

function coerceNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isNaN(value) ? null : value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

function coerceDateTimestamp(value: unknown): number | null {
  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isNaN(time) ? null : time;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const time = new Date(value).getTime();
    return Number.isNaN(time) ? null : time;
  }
  return null;
}

/**
 * Whether a cell value falls inside an inclusive numeric range. Numeric
 * strings (e.g. `'42'`) filter like native numbers; anything non-numeric
 * (including nullish and blank cells, which would coerce to a false `0`)
 * never matches. Null bounds are open-ended.
 */
export function matchesNumberRange(
  value: unknown,
  bounds: { min: number | null; max: number | null },
): boolean {
  const numeric = coerceNumber(value);
  if (numeric === null) {
    return false;
  }
  if (bounds.min !== null && numeric < bounds.min) {
    return false;
  }
  if (bounds.max !== null && numeric > bounds.max) {
    return false;
  }
  return true;
}

/**
 * Whether a cell value falls inside an inclusive date range. Dates may be
 * `Date` objects, timestamps or parseable date strings; unparseable values
 * never match. Null bounds are open-ended, an unparseable bound is ignored.
 */
export function matchesDateRange(
  value: unknown,
  bounds: { from: string | number | null; to: string | number | null },
): boolean {
  const time = coerceDateTimestamp(value);
  if (time === null) {
    return false;
  }
  if (bounds.from !== null) {
    const from = coerceDateTimestamp(bounds.from);
    if (from !== null && time < from) {
      return false;
    }
  }
  if (bounds.to !== null) {
    const to = coerceDateTimestamp(bounds.to);
    if (to !== null && time > to) {
      return false;
    }
  }
  return true;
}

function isRangeFilterAutoRemovable(val: unknown): boolean {
  if (val === undefined || val === null || val === '') {
    return true;
  }
  if (Array.isArray(val)) {
    const [min, max] = val;
    return (
      (min === undefined || min === null || min === '') &&
      (max === undefined || max === null || max === '')
    );
  }
  return false;
}

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function resolveRangeEndpoints(val: unknown): Array<number | null> {
  const [unsafeMin, unsafeMax] = Array.isArray(val) ? val : [undefined, undefined];
  const min = coerceNumber(unsafeMin);
  const max = coerceNumber(unsafeMax);
  if (min !== null && max !== null && min > max) {
    return [max, min];
  }
  return [min, max];
}

function resolveDateEndpoints(val: unknown): Array<number | null> {
  const [unsafeFrom, unsafeTo] = Array.isArray(val) ? val : [undefined, undefined];
  const from = coerceDateTimestamp(unsafeFrom);
  let to = coerceDateTimestamp(unsafeTo);
  if (typeof unsafeTo === 'string' && DATE_ONLY_PATTERN.test(unsafeTo.trim())) {
    // A date-only `to` bound means "through that day": a bare `YYYY-MM-DD`
    // parses to UTC midnight and would otherwise exclude the rest of the day.
    to = new Date(`${unsafeTo.trim()}T23:59:59.999Z`).getTime();
  }
  if (from !== null && to !== null && from > to) {
    return [to, from];
  }
  return [from, to];
}

/** Coercing `inNumberRange` replacement (review finding #9). */
export const numberRangeFilterFn = constructFilterFn({
  filter: (dataValue: unknown, filterValue: Array<number | null>) =>
    matchesNumberRange(dataValue, {
      min: filterValue[0] ?? null,
      max: filterValue[1] ?? null,
    }),
  resolveFilterValue: resolveRangeEndpoints,
  autoRemove: isRangeFilterAutoRemovable,
});

/** Coercing `inDateRange` replacement (review finding #9). */
export const dateRangeFilterFn = constructFilterFn({
  filter: (dataValue: unknown, filterValue: Array<string | number | null>) =>
    matchesDateRange(dataValue, {
      from: filterValue[0] ?? null,
      to: filterValue[1] ?? null,
    }),
  resolveFilterValue: resolveDateEndpoints,
  autoRemove: isRangeFilterAutoRemovable,
});

export function cloneFiltersState(filters: DataTableFiltersState): DataTableFiltersState {
  const next: DataTableFiltersState = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (isEnumValue(value)) {
      next[key] = [...value];
      return;
    }
    if (isRangeValue(value)) {
      next[key] = { min: value.min, max: value.max };
      return;
    }
    if (isDateValue(value)) {
      next[key] = { from: value.from, to: value.to };
    }
  });
  return next;
}

export function sanitizeFilters(
  draft: DataTableFiltersState,
  filterDefs: Array<DataTableFilterDef>,
): DataTableFiltersState {
  const clean: DataTableFiltersState = {};
  filterDefs.forEach((def) => {
    const value = draft[def.id];
    if (value === undefined) {
      return;
    }
    if (def.type === 'enum' && isEnumValue(value) && value.length > 0) {
      clean[def.id] = [...value];
      return;
    }
    if (def.type === 'range' && isRangeValue(value)) {
      if (value.min !== null || value.max !== null) {
        clean[def.id] = { min: value.min, max: value.max };
      }
      return;
    }
    if (def.type === 'date' && isDateValue(value)) {
      if (value.from || value.to) {
        clean[def.id] = { from: value.from, to: value.to };
      }
    }
  });
  return clean;
}

export function countActiveFilters(filters: DataTableFiltersState): number {
  return Object.values(filters).reduce((count, value) => {
    if (isEnumValue(value)) {
      return count + (value.length > 0 ? 1 : 0);
    }
    if (isRangeValue(value)) {
      return count + (value.min !== null || value.max !== null ? 1 : 0);
    }
    if (isDateValue(value)) {
      return count + (value.from || value.to ? 1 : 0);
    }
    return count;
  }, 0);
}

export function buildFilterChips(
  filters: DataTableFiltersState,
  filterDefs: Array<DataTableFilterDef>,
): Array<DataTableFilterChip> {
  const chips: Array<DataTableFilterChip> = [];
  filterDefs.forEach((def) => {
    const value = filters[def.id];
    if (value === undefined) {
      return;
    }
    if (def.type === 'enum' && isEnumValue(value)) {
      value.forEach((enumValue) => {
        const option = def.options.find((item) => item.value === enumValue);
        chips.push({
          key: `${def.id}:${enumValue}`,
          filterId: def.id,
          label: `${def.label}: ${option?.label ?? enumValue}`,
          enumValue,
        });
      });
      return;
    }
    if (def.type === 'range' && isRangeValue(value)) {
      const bounds: DataTableFilterChip['bounds'] = {};
      if (value.min !== null) {
        bounds.min = value.min;
      }
      if (value.max !== null) {
        bounds.max = value.max;
      }
      if (bounds.min === undefined && bounds.max === undefined) {
        return;
      }
      let rangeLabel: string;
      if (bounds.min !== undefined && bounds.max !== undefined) {
        rangeLabel = `${bounds.min}–${bounds.max}`;
      } else if (bounds.max !== undefined) {
        rangeLabel = `≤ ${bounds.max}`;
      } else {
        rangeLabel = `≥ ${bounds.min}`;
      }
      chips.push({
        key: def.id,
        filterId: def.id,
        label: `${def.label}: ${rangeLabel}`,
        bounds,
      });
      return;
    }
    if (def.type === 'date' && isDateValue(value)) {
      const bounds: DataTableFilterChip['bounds'] = {};
      if (value.from) {
        bounds.min = value.from;
      }
      if (value.to) {
        bounds.max = value.to;
      }
      if (bounds.min === undefined && bounds.max === undefined) {
        return;
      }
      const fromLabel = value.from ?? '…';
      const toLabel = value.to ?? '…';
      chips.push({
        key: def.id,
        filterId: def.id,
        label: `${def.label}: ${fromLabel}–${toLabel}`,
        bounds,
      });
    }
  });
  return chips;
}

export function removeFilterChip(
  filters: DataTableFiltersState,
  chip: DataTableFilterChip,
): DataTableFiltersState {
  const next = cloneFiltersState(filters);
  const current = next[chip.filterId];
  if (current === undefined) {
    return next;
  }
  if (chip.enumValue !== undefined && isEnumValue(current)) {
    const remaining = current.filter((item) => item !== chip.enumValue);
    if (remaining.length === 0) {
      delete next[chip.filterId];
    } else {
      next[chip.filterId] = remaining;
    }
    return next;
  }
  delete next[chip.filterId];
  return next;
}

export function toColumnFilters(
  filters: DataTableFiltersState,
  filterDefs: Array<DataTableFilterDef>,
): ColumnFiltersState {
  const columnFilters: ColumnFiltersState = [];
  filterDefs.forEach((def) => {
    const value = filters[def.id];
    if (value === undefined) {
      return;
    }
    if (def.type === 'enum' && isEnumValue(value) && value.length > 0) {
      columnFilters.push({ id: def.id, value });
      return;
    }
    if (def.type === 'range' && isRangeValue(value)) {
      if (value.min !== null || value.max !== null) {
        columnFilters.push({ id: def.id, value: [value.min, value.max] });
      }
      return;
    }
    if (def.type === 'date' && isDateValue(value)) {
      if (value.from || value.to) {
        columnFilters.push({ id: def.id, value: [value.from, value.to] });
      }
    }
  });
  return columnFilters;
}

export function enrichColumnsWithFilterFns<TData extends RowData>(
  columns: Array<DataTableColumnDef<TData>>,
  filterDefs: Array<DataTableFilterDef>,
): Array<DataTableColumnDef<TData>> {
  const byId = new Map(filterDefs.map((def) => [def.id, def]));
  return columns.map((column) => {
    const id = resolveColumnId(column);
    if (!id) {
      return column;
    }
    const def = byId.get(id);
    if (!def) {
      return column;
    }
    if (def.type === 'enum') {
      return { ...column, filterFn: filterFn_arrHas };
    }
    if (def.type === 'range') {
      return { ...column, filterFn: numberRangeFilterFn };
    }
    return { ...column, filterFn: dateRangeFilterFn };
  });
}

export function toggleEnumDraftValue(
  draft: DataTableFiltersState,
  filterId: string,
  optionValue: string,
): DataTableFiltersState {
  const next = cloneFiltersState(draft);
  const current = next[filterId];
  const selected = isEnumValue(current) ? current : [];
  if (selected.includes(optionValue)) {
    const remaining = selected.filter((item) => item !== optionValue);
    if (remaining.length === 0) {
      delete next[filterId];
    } else {
      next[filterId] = remaining;
    }
    return next;
  }
  next[filterId] = [...selected, optionValue];
  return next;
}

export function setRangeDraftValue(
  draft: DataTableFiltersState,
  filterId: string,
  bound: 'min' | 'max',
  raw: string,
): DataTableFiltersState {
  const next = cloneFiltersState(draft);
  const current = next[filterId];
  const range: DataTableRangeFilterValue = isRangeValue(current)
    ? { min: current.min, max: current.max }
    : { min: null, max: null };
  const parsed = raw.trim() === '' ? null : Number(raw);
  range[bound] = parsed !== null && Number.isFinite(parsed) ? parsed : null;
  if (range.min === null && range.max === null) {
    delete next[filterId];
  } else {
    next[filterId] = range;
  }
  return next;
}

export function setDateDraftValue(
  draft: DataTableFiltersState,
  filterId: string,
  bound: 'from' | 'to',
  raw: string,
): DataTableFiltersState {
  const next = cloneFiltersState(draft);
  const current = next[filterId];
  const dateValue: DataTableDateFilterValue = isDateValue(current)
    ? { from: current.from, to: current.to }
    : { from: null, to: null };
  dateValue[bound] = raw.trim() === '' ? null : raw;
  if (!dateValue.from && !dateValue.to) {
    delete next[filterId];
  } else {
    next[filterId] = dateValue;
  }
  return next;
}

export function getEnumDraftSelection(
  draft: DataTableFiltersState,
  filterId: string,
): Array<string> {
  const current = draft[filterId];
  return isEnumValue(current) ? current : [];
}

export function getRangeDraftValue(
  draft: DataTableFiltersState,
  filterId: string,
): DataTableRangeFilterValue {
  const current = draft[filterId];
  return isRangeValue(current) ? current : { min: null, max: null };
}

export function getDateDraftValue(
  draft: DataTableFiltersState,
  filterId: string,
): DataTableDateFilterValue {
  const current = draft[filterId];
  return isDateValue(current) ? current : { from: null, to: null };
}

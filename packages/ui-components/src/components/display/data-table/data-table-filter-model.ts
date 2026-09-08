/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ColumnFiltersState, RowData } from '@tanstack/react-table';

import type {
  DataTableColumnDef,
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
      const minLabel = value.min ?? 0;
      const maxLabel = value.max ?? '∞';
      chips.push({
        key: def.id,
        filterId: def.id,
        label: `${def.label}: ${minLabel}–${maxLabel}`,
      });
      return;
    }
    if (def.type === 'date' && isDateValue(value)) {
      const fromLabel = value.from ?? '…';
      const toLabel = value.to ?? '…';
      chips.push({
        key: def.id,
        filterId: def.id,
        label: `${def.label}: ${fromLabel}–${toLabel}`,
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

function resolveColumnId<TData extends RowData>(column: DataTableColumnDef<TData>): string | undefined {
  if (column.id) {
    return column.id;
  }
  if ('accessorKey' in column && column.accessorKey !== undefined) {
    return String(column.accessorKey);
  }
  return undefined;
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
      return { ...column, filterFn: 'arrHas' };
    }
    if (def.type === 'range') {
      return { ...column, filterFn: 'inNumberRange' };
    }
    return { ...column, filterFn: 'inDateRange' };
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

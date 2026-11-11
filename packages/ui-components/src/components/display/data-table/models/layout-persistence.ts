/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ColumnOrderState, ColumnVisibilityState } from '@tanstack/react-table';

import type { DataTableDensity } from '../table-ui-store';
import { ACTIONS_COLUMN_ID, buildDefaultColumnOrder, SELECT_COLUMN_ID } from './customize-model';

export const LAYOUT_PERSISTENCE_VERSION = 1 as const;

export type PersistedDataTableLayout = {
  v: typeof LAYOUT_PERSISTENCE_VERSION;
  columnVisibility: ColumnVisibilityState;
  columnOrder: ColumnOrderState;
  density: DataTableDensity;
};

export function layoutStorageKey(persistenceKey: string): string {
  return `carbonio.data-table.layout:${persistenceKey}`;
}

function isDataTableDensity(value: unknown): value is DataTableDensity {
  return value === 'comfortable' || value === 'compact';
}

function isInternalColumnId(id: string): boolean {
  return id === SELECT_COLUMN_ID || id === ACTIONS_COLUMN_ID;
}

function parsePersistedLayout(value: unknown): PersistedDataTableLayout | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Record<string, unknown>;
  if (record.v !== LAYOUT_PERSISTENCE_VERSION) {
    return null;
  }
  if (!isDataTableDensity(record.density)) {
    return null;
  }
  if (!record.columnVisibility || typeof record.columnVisibility !== 'object') {
    return null;
  }
  if (!Array.isArray(record.columnOrder)) {
    return null;
  }
  const columnVisibility: ColumnVisibilityState = {};
  Object.entries(record.columnVisibility as Record<string, unknown>).forEach(([id, visible]) => {
    if (typeof visible === 'boolean') {
      columnVisibility[id] = visible;
    }
  });
  const columnOrder = record.columnOrder.filter((id): id is string => typeof id === 'string');
  return {
    v: LAYOUT_PERSISTENCE_VERSION,
    columnVisibility,
    columnOrder,
    density: record.density,
  };
}

/**
 * Reads a previously written layout blob. Returns null when missing, unreadable,
 * or structurally invalid (callers should fall back to defaults via sanitize).
 */
export function readPersistedLayout(persistenceKey: string): PersistedDataTableLayout | null {
  try {
    const raw = globalThis.localStorage.getItem(layoutStorageKey(persistenceKey));
    if (!raw) {
      return null;
    }
    return parsePersistedLayout(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

/** Writes the layout blob. Swallows storage errors (private mode / quota). */
export function writePersistedLayout(
  persistenceKey: string,
  layout: PersistedDataTableLayout,
): void {
  try {
    globalThis.localStorage.setItem(layoutStorageKey(persistenceKey), JSON.stringify(layout));
  } catch {
    // private mode / quota — persistence is best-effort
  }
}

/**
 * Aligns a stored (or missing) layout with the table's current column set:
 * drops unknown ids, appends new columns, restores select/primary/actions
 * ordering rules, and clamps density.
 */
export function sanitizePersistedLayout(
  persisted: PersistedDataTableLayout | null,
  columnIds: Array<string>,
  primaryColumnId: string | undefined,
  includeSelectColumn: boolean,
  includeActionsColumn: boolean,
): PersistedDataTableLayout {
  const defaultOrder = buildDefaultColumnOrder(
    columnIds,
    primaryColumnId,
    includeSelectColumn,
    includeActionsColumn,
  );
  if (!persisted) {
    return {
      v: LAYOUT_PERSISTENCE_VERSION,
      columnVisibility: {},
      columnOrder: defaultOrder,
      density: 'comfortable',
    };
  }

  const knownIds = new Set(columnIds);
  const orderedKnown = persisted.columnOrder.filter(
    (id) => knownIds.has(id) && !isInternalColumnId(id),
  );
  const missingIds = columnIds.filter((id) => !orderedKnown.includes(id));
  const columnOrder = buildDefaultColumnOrder(
    [...orderedKnown, ...missingIds],
    primaryColumnId,
    includeSelectColumn,
    includeActionsColumn,
  );

  const columnVisibility: ColumnVisibilityState = {};
  Object.entries(persisted.columnVisibility).forEach(([id, visible]) => {
    if (knownIds.has(id) && typeof visible === 'boolean') {
      columnVisibility[id] = visible;
    }
  });

  return {
    v: LAYOUT_PERSISTENCE_VERSION,
    columnVisibility,
    columnOrder,
    density: isDataTableDensity(persisted.density) ? persisted.density : 'comfortable',
  };
}

export function loadPersistedLayoutForTable(
  persistenceKey: string,
  columnIds: Array<string>,
  primaryColumnId: string | undefined,
  includeSelectColumn: boolean,
  includeActionsColumn: boolean,
): PersistedDataTableLayout {
  return sanitizePersistedLayout(
    readPersistedLayout(persistenceKey),
    columnIds,
    primaryColumnId,
    includeSelectColumn,
    includeActionsColumn,
  );
}

export function resolveLayoutUpdater<T>(updater: T | ((old: T) => T), previous: T): T {
  if (typeof updater === 'function') {
    return (updater as (old: T) => T)(previous);
  }
  return updater;
}

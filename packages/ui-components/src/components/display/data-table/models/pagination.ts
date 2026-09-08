/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type PaginationRange = { from: number; to: number };

/**
 * Clamp the visible from/to window for the given page. Guarantees
 * `from <= to` even for a stale (out-of-range) page index; an empty table
 * yields `{ from: 0, to: 0 }`.
 */
export function clampRange(rowCount: number, pageIndex: number, pageSize: number): PaginationRange {
  const from = rowCount === 0 ? 0 : Math.min(pageIndex * pageSize + 1, rowCount);
  const to = Math.max(Math.min((pageIndex + 1) * pageSize, rowCount), from);
  return { from, to };
}

/**
 * A page is stale when its start offset is beyond the last row. An empty
 * table is never considered stale. The footer hides the from/to window on
 * stale pages (the view clamps the page index separately).
 */
export function isStalePage(rowCount: number, pageIndex: number, pageSize: number): boolean {
  return rowCount > 0 && pageIndex * pageSize >= rowCount;
}

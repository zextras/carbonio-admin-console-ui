/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  clampPaginationToRowCount,
  useServerTableState,
  type UseServerTableStateOptions,
} from '../use-server-table-state';

const NAME_SORT = [{ id: 'name', desc: false }];

function setup(options?: UseServerTableStateOptions) {
  return renderHook((props: UseServerTableStateOptions | undefined) => useServerTableState(props), {
    initialProps: options,
  });
}

describe('useServerTableState', () => {
  describe('review fix #4 — query-shape changes reset page and selection', () => {
    it('resets pageIndex and selection when the search string changes', () => {
      const { result } = setup();

      act(() => {
        result.current.setPagination((prev) => ({ ...prev, pageIndex: 2 }));
        result.current.setRowSelection({ 'domain-1': true, 'domain-2': true });
      });
      expect(result.current.pagination.pageIndex).toBe(2);

      act(() => {
        result.current.setSearchString('exam');
      });

      expect(result.current.pagination.pageIndex).toBe(0);
      expect(result.current.rowSelection).toEqual({});
      expect(result.current.searchString).toBe('exam');
    });

    it('resets pageIndex and selection when sorting changes', () => {
      const { result } = setup({ initialSorting: NAME_SORT });

      act(() => {
        result.current.setPagination((prev) => ({ ...prev, pageIndex: 3 }));
        result.current.setRowSelection({ 'domain-1': true });
      });

      act(() => {
        result.current.setSorting([{ id: 'name', desc: true }]);
      });

      expect(result.current.pagination.pageIndex).toBe(0);
      expect(result.current.rowSelection).toEqual({});
      expect(result.current.sorting).toEqual([{ id: 'name', desc: true }]);
    });

    it('resets pageIndex and selection when filters change', () => {
      const { result } = setup();

      act(() => {
        result.current.setPagination((prev) => ({ ...prev, pageIndex: 1 }));
        result.current.setRowSelection({ 'domain-1': true });
      });

      act(() => {
        result.current.setFilters({ status: ['active'] });
      });

      expect(result.current.pagination.pageIndex).toBe(0);
      expect(result.current.rowSelection).toEqual({});
    });

    it('does NOT reset when the query shape is unchanged (deep-equal filters object)', () => {
      const { result } = setup();

      act(() => {
        result.current.setFilters({ status: ['active'] });
      });
      act(() => {
        result.current.setPagination((prev) => ({ ...prev, pageIndex: 2 }));
        result.current.setRowSelection({ 'domain-1': true });
      });

      // New object reference, identical serialized shape.
      act(() => {
        result.current.setFilters({ status: ['active'] });
      });

      expect(result.current.pagination.pageIndex).toBe(2);
      expect(result.current.rowSelection).toEqual({ 'domain-1': true });
    });

    it('accepts updater functions (TanStack OnChangeFn form) and resets on change', () => {
      const { result } = setup({ initialSorting: NAME_SORT });

      act(() => {
        result.current.setPagination((prev) => ({ ...prev, pageIndex: 2 }));
        result.current.setRowSelection({ 'domain-1': true });
      });
      act(() => {
        result.current.setSorting((prev) => [...prev, { id: 'status', desc: true }]);
      });

      expect(result.current.sorting).toEqual([
        { id: 'name', desc: false },
        { id: 'status', desc: true },
      ]);
      expect(result.current.pagination.pageIndex).toBe(0);
      expect(result.current.rowSelection).toEqual({});
    });

    it('does not reset on an updater that resolves to the current value', () => {
      const { result } = setup({ initialSorting: NAME_SORT });

      act(() => {
        result.current.setPagination((prev) => ({ ...prev, pageIndex: 2 }));
      });
      act(() => {
        result.current.setSorting((prev) => prev);
      });

      expect(result.current.pagination.pageIndex).toBe(2);
    });

    it('pagination and selection setters never reset other slices', () => {
      const { result } = setup();

      act(() => {
        result.current.setSearchString('exam');
        result.current.setRowSelection({ 'domain-1': true });
      });
      act(() => {
        result.current.setPagination((prev) => ({ ...prev, pageIndex: 4 }));
      });

      expect(result.current.searchString).toBe('exam');
      expect(result.current.rowSelection).toEqual({ 'domain-1': true });
      expect(result.current.pagination.pageIndex).toBe(4);
    });
  });

  describe('review fix #5a — rowCount shrink clamps the page index', () => {
    it('clamps pageIndex when totalRowCount shrinks below the current page', () => {
      const { result, rerender } = setup({ pageSize: 25, totalRowCount: 100 });

      act(() => {
        result.current.setPagination((prev) => ({ ...prev, pageIndex: 3 }));
      });
      expect(result.current.pagination.pageIndex).toBe(3);

      rerender({ pageSize: 25, totalRowCount: 30 });

      expect(result.current.pagination.pageIndex).toBe(1);
    });

    it('keeps a valid pageIndex untouched and skips clamping while the total is undefined', () => {
      const { result, rerender } = setup({ pageSize: 25, totalRowCount: 100 });

      act(() => {
        result.current.setPagination((prev) => ({ ...prev, pageIndex: 2 }));
      });

      rerender({ pageSize: 25, totalRowCount: 90 });

      expect(result.current.pagination.pageIndex).toBe(2);

      rerender({ pageSize: 25 });

      expect(result.current.pagination.pageIndex).toBe(2);
    });
  });

  describe('review fix #5b — resetKey change clears all table state', () => {
    it('resets search, filters, sorting, page and selection', () => {
      const { result, rerender } = setup({ resetKey: 'domain-1', initialSorting: NAME_SORT });

      act(() => {
        result.current.setSearchString('exam');
        result.current.setFilters({ status: ['active'] });
        result.current.setSorting([{ id: 'name', desc: true }]);
        result.current.setPagination((prev) => ({ ...prev, pageIndex: 4 }));
        result.current.setRowSelection({ 'domain-1': true });
      });

      rerender({ resetKey: 'domain-2', initialSorting: NAME_SORT });

      expect(result.current.searchString).toBe('');
      expect(result.current.filters).toEqual({});
      expect(result.current.sorting).toEqual(NAME_SORT);
      expect(result.current.pagination.pageIndex).toBe(0);
      expect(result.current.rowSelection).toEqual({});
    });

    it('does not reset while the resetKey stays the same', () => {
      const { result, rerender } = setup({ resetKey: 'domain-1' });

      act(() => {
        result.current.setSearchString('exam');
      });
      act(() => {
        result.current.setPagination((prev) => ({ ...prev, pageIndex: 2 }));
      });

      rerender({ resetKey: 'domain-1' });

      expect(result.current.searchString).toBe('exam');
      expect(result.current.pagination.pageIndex).toBe(2);
    });
  });
});

describe('clampPaginationToRowCount', () => {
  it('clamps a fresh query total (the path views use for query-derived totals)', () => {
    expect(clampPaginationToRowCount({ pageIndex: 3, pageSize: 25 }, 30).pageIndex).toBe(1);
    expect(clampPaginationToRowCount({ pageIndex: 3, pageSize: 25 }, 100).pageIndex).toBe(3);
    expect(clampPaginationToRowCount({ pageIndex: 3, pageSize: 25 }, undefined).pageIndex).toBe(3);
    expect(clampPaginationToRowCount({ pageIndex: 0, pageSize: 10 }, 0).pageIndex).toBe(0);
  });
});

/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { act, render, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { createDataTableUiStore, TableUiProvider, useTableUi } from './table-ui-store';

describe('table ui store', () => {
  it('throws outside provider', () => {
    expect(() => renderHook(() => useTableUi((s) => s.density))).toThrow(/useTableUi/);
  });

  it('keeps the store stable across provider re-renders', () => {
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
    const content = (
      <>
        <DensityProbe />
        <PeekProbe />
      </>
    );
    const utils = render(<TableUiProvider>{content}</TableUiProvider>);
    const densityBefore = densitySpy.mock.calls.length;
    const peekBefore = peekSpy.mock.calls.length;

    utils.rerender(<TableUiProvider>{content}</TableUiProvider>);
    expect(densitySpy.mock.calls.length).toBe(densityBefore);
    expect(peekSpy.mock.calls.length).toBe(peekBefore);
  });

  it('updates state through slice setters', () => {
    const store = createDataTableUiStore();
    expect(store.getState().density).toBe('comfortable');
    act(() => {
      store.getState().setDensity('compact');
    });
    expect(store.getState().density).toBe('compact');
    act(() => {
      store.getState().setPeekRowId('row-3');
      store.getState().setOpenPanel('filters');
      store.getState().setSelectAllMatching(true);
    });
    expect(store.getState().peekRowId).toBe('row-3');
    expect(store.getState().openPanel).toBe('filters');
    expect(store.getState().selectAllMatching).toBe(true);
  });
});

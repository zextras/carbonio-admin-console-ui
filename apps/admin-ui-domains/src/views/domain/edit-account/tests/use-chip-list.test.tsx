/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { chipsToValue, parseChipList, useChipList } from '../use-chip-list';

describe('parseChipList', () => {
  it('should split a comma-separated value into chip items', () => {
    expect(parseChipList('a@example.com, b@example.com')).toEqual([
      { label: 'a@example.com' },
      { label: 'b@example.com' },
    ]);
  });

  it('should return an empty list for undefined and empty values', () => {
    expect(parseChipList(undefined)).toEqual([]);
    expect(parseChipList('')).toEqual([]);
  });

  it('should keep a single value as a single chip', () => {
    expect(parseChipList('only@example.com')).toEqual([{ label: 'only@example.com' }]);
  });
});

describe('chipsToValue', () => {
  it('should join chip labels back into the server format', () => {
    expect(
      chipsToValue([
        { label: 'a@example.com' },
        { label: 'b@example.com' },
      ]),
    ).toBe('a@example.com, b@example.com');
  });

  it('should round-trip with parseChipList', () => {
    const value = 'a@example.com, b@example.com';
    expect(chipsToValue(parseChipList(value))).toBe(value);
  });
});

describe('useChipList', () => {
  it('should seed the chips from the initial value', () => {
    const { result } = renderHook(() => useChipList('a@example.com, b@example.com'));
    expect(result.current[0]).toEqual([
      { label: 'a@example.com' },
      { label: 'b@example.com' },
    ]);
  });

  it('should support local edits', () => {
    const { result } = renderHook(() => useChipList('a@example.com'));
    act(() => result.current[1]([{ label: 'edited@example.com' }]));
    expect(result.current[0]).toEqual([{ label: 'edited@example.com' }]);
  });

  it('should reseed when the server value changes', () => {
    const { result, rerender } = renderHook(({ value }) => useChipList(value), {
      initialProps: { value: 'a@example.com' },
    });

    act(() => result.current[1]([{ label: 'edited@example.com' }]));
    rerender({ value: 'server@example.com' });

    expect(result.current[0]).toEqual([{ label: 'server@example.com' }]);
  });

  it('should not reseed while the server value is unchanged', () => {
    const { result, rerender } = renderHook(({ value }) => useChipList(value), {
      initialProps: { value: 'a@example.com' },
    });

    act(() => result.current[1]([]));
    rerender({ value: 'a@example.com' });

    expect(result.current[0]).toEqual([]);
  });
});

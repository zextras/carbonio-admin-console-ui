/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { act, renderHook } from '@testing-library/react';

import { useLocalStorage } from '../use-local-storage';

describe('useLocalStorage', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('returns the initial value when the key is not in localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    const [value] = result.current;
    expect(value).toBe('default');
  });

  it('returns the stored value when the key exists in localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('stored'));
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    const [value] = result.current;
    expect(value).toBe('stored');
  });

  it('sets a direct value and persists it to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    const [, setValue] = result.current;

    act(() => {
      setValue('updated');
    });

    const [value] = result.current;
    expect(value).toBe('updated');
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('updated'));
  });

  it('sets a value using an updater function that receives the current state', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 0));
    const [, setValue] = result.current;

    act(() => {
      setValue((prev) => prev + 1);
    });

    const [value] = result.current;
    expect(value).toBe(1);
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify(1));
  });

  it('roundtrips complex objects through JSON serialization', () => {
    const initial = { name: 'test', items: [1, 2, 3] };
    const { result } = renderHook(() => useLocalStorage('test-key', initial));
    const [, setValue] = result.current;

    const updated = { name: 'new', items: [4, 5] };
    act(() => {
      setValue(updated);
    });

    const [value] = result.current;
    expect(value).toEqual(updated);
    expect(JSON.parse(localStorage.getItem('test-key')!)).toEqual(updated);
  });

  it('falls back to initial value when localStorage contains invalid JSON', () => {
    localStorage.setItem('test-key', '{invalid json');
    const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'));
    const [value] = result.current;
    expect(value).toBe('fallback');
  });

  it('works with boolean values', () => {
    const { result } = renderHook(() => useLocalStorage('flag', false));
    expect(result.current[0]).toBe(false);

    act(() => {
      result.current[1](true);
    });

    expect(result.current[0]).toBe(true);
    expect(localStorage.getItem('flag')).toBe('true');
  });

  it('works with array values', () => {
    const { result } = renderHook(() => useLocalStorage<Array<string>>('list', ['a']));
    expect(result.current[0]).toEqual(['a']);

    act(() => {
      result.current[1]((prev) => [...prev, 'b']);
    });

    expect(result.current[0]).toEqual(['a', 'b']);
    expect(JSON.parse(localStorage.getItem('list')!)).toEqual(['a', 'b']);
  });

  it('overwrites a previously stored value', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'first'));
    act(() => {
      result.current[1]('second');
    });
    act(() => {
      result.current[1]('third');
    });

    expect(result.current[0]).toBe('third');
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('third'));
  });

  it('handles null stored in localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify(null));
    const { result } = renderHook(() => useLocalStorage<string | null>('test-key', 'fallback'));
    expect(result.current[0]).toBeNull();
  });

  it('keeps localStorage in sync when setter is called multiple times in sequence', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 0));

    act(() => {
      result.current[1]((c) => c + 1);
    });
    act(() => {
      result.current[1]((c) => c + 1);
    });
    act(() => {
      result.current[1]((c) => c + 1);
    });

    expect(result.current[0]).toBe(3);
    expect(JSON.parse(localStorage.getItem('counter')!)).toBe(3);
  });
});

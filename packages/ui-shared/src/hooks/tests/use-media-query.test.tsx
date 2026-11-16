/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useMediaQuery } from '../use-media-query';

type Listener = () => void;

function mockMatchMedia(initialMatches: boolean) {
  const state = { matches: initialMatches, listeners: new Set<Listener>() };
  const matchMedia = vi.fn((query: string) => ({
    media: query,
    get matches(): boolean {
      return state.matches;
    },
    addEventListener: (_type: string, listener: Listener): void => {
      state.listeners.add(listener);
    },
    removeEventListener: (_type: string, listener: Listener): void => {
      state.listeners.delete(listener);
    },
  }));
  vi.stubGlobal('matchMedia', matchMedia);
  return {
    matchMedia,
    state,
    change(matches: boolean): void {
      state.matches = matches;
      state.listeners.forEach((listener) => listener());
    },
  };
}

describe('useMediaQuery', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the current match and updates on change', () => {
    const media = mockMatchMedia(false);

    const { result } = renderHook(() => useMediaQuery('(min-width: 600px)'));
    expect(result.current).toBe(false);

    act(() => {
      media.change(true);
    });
    expect(result.current).toBe(true);
    expect(media.matchMedia).toHaveBeenCalledWith('(min-width: 600px)');
  });

  it('unsubscribes on unmount', () => {
    const media = mockMatchMedia(true);

    const { unmount } = renderHook(() => useMediaQuery('(min-width: 600px)'));
    expect(media.state.listeners.size).toBe(1);

    unmount();
    expect(media.state.listeners.size).toBe(0);
  });
});

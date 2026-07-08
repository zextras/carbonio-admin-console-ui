/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';

import { useAppStore } from '../../store/app/store';
import { useRelativePathname } from '../hooks';

const STORAGE_ID = 'storage';

function registerRoute(id: string, path: string): void {
  useAppStore.setState((state) => ({
    routes: { ...state.routes, [id]: { id, route: id, path, app: id } },
  }));
}

function createWrapper(initialEntry: string) {
  const Wrapper = ({ children }: { children: ReactNode }): ReactNode => (
    <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
  );
  Wrapper.displayName = 'Wrapper';
  return Wrapper;
}

describe('useRelativePathname', () => {
  beforeEach(() => {
    useAppStore.setState({ routes: {} });
  });

  it('strips the active route prefix and returns the relative path', () => {
    registerRoute(STORAGE_ID, 'manage/storage');

    const { result } = renderHook(() => useRelativePathname(), {
      wrapper: createWrapper('/manage/storage/servers_list'),
    });

    expect(result.current).toBe('/servers_list');
  });

  it('returns "/" when the pathname is exactly the route prefix', () => {
    registerRoute(STORAGE_ID, 'manage/storage');

    const { result } = renderHook(() => useRelativePathname(), {
      wrapper: createWrapper('/manage/storage'),
    });

    expect(result.current).toBe('/');
  });

  it('returns the full pathname when no route matches', () => {
    registerRoute(STORAGE_ID, 'manage/storage');

    const { result } = renderHook(() => useRelativePathname(), {
      wrapper: createWrapper('/some/other/path'),
    });

    expect(result.current).toBe('/some/other/path');
  });

  it('returns the full pathname when no routes are registered', () => {
    const { result } = renderHook(() => useRelativePathname(), {
      wrapper: createWrapper('/manage/storage/servers_list'),
    });

    expect(result.current).toBe('/manage/storage/servers_list');
  });

  it('handles a multi-segment server-scoped path', () => {
    registerRoute(STORAGE_ID, 'manage/storage');

    const { result } = renderHook(() => useRelativePathname(), {
      wrapper: createWrapper('/manage/storage/mail1/data_volumes'),
    });

    expect(result.current).toBe('/mail1/data_volumes');
  });
});

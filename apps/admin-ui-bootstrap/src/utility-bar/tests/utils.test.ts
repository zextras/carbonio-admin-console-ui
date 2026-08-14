/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { renderHook } from '@testing-library/react';
import { type AppRoute, useAppStore, useCurrentRoute,type UtilityView } from '@zextras/ui-shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@zextras/ui-shared', () => ({
  useAppStore: vi.fn(),
  useCurrentRoute: vi.fn(),
}));

import { openLink, useUtilityViews } from '../utils';

const DASHBOARD_ROUTE: AppRoute = {
  id: 'dashboard',
  route: 'dashboard',
  path: 'dashboard',
  app: 'dashboard',
};

function mockStore(views: Array<UtilityView>, route?: AppRoute): void {
  vi.mocked(useAppStore).mockImplementation(((selector: (s: unknown) => unknown) =>
    selector({ views: { utilityBar: views } })) as never);
  vi.mocked(useCurrentRoute).mockReturnValue(route);
}

describe('openLink', () => {
  it('calls window.open with the correct URL and target', () => {
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);

    openLink('https://example.com');

    expect(openSpy).toHaveBeenCalledWith('https://example.com', '_blank');
  });
});

describe('useUtilityViews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns all views when no route restrictions exist', () => {
    const views = [{ id: 'v1' }, { id: 'v2' }] as Array<UtilityView>;
    mockStore(views, DASHBOARD_ROUTE);

    const { result } = renderHook(() => useUtilityViews());

    expect(result.current).toHaveLength(2);
    expect(result.current).toEqual(views);
  });

  it('filters views based on blacklistRoutes', () => {
    const views = [
      { id: 'blocked', blacklistRoutes: ['dashboard'] },
      { id: 'allowed', blacklistRoutes: ['storage'] },
    ] as Array<UtilityView>;
    mockStore(views, DASHBOARD_ROUTE);

    const { result } = renderHook(() => useUtilityViews());

    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe('allowed');
  });

  it('filters views based on whitelistRoutes', () => {
    const views = [
      { id: 'matching', whitelistRoutes: ['dashboard'] },
      { id: 'non-matching', whitelistRoutes: ['storage'] },
    ] as Array<UtilityView>;
    mockStore(views, DASHBOARD_ROUTE);

    const { result } = renderHook(() => useUtilityViews());

    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe('matching');
  });

  it('returns views with no route restrictions regardless of active route', () => {
    const views = [{ id: 'unrestricted' }] as Array<UtilityView>;
    mockStore(views, DASHBOARD_ROUTE);

    const { result } = renderHook(() => useUtilityViews());

    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe('unrestricted');
  });

  it('returns views with no route restrictions even when active route is undefined', () => {
    const views = [{ id: 'unrestricted' }] as Array<UtilityView>;
    mockStore(views, undefined);

    const { result } = renderHook(() => useUtilityViews());

    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe('unrestricted');
  });
});

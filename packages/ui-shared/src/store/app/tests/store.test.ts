/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FC } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { type AppRouteDescriptor, type BadgeInfo } from '../../../../types';
import { useAppStore } from '../store';

const FallbackView: FC = () => null;

const badge: BadgeInfo = { show: false, count: 0, showCount: false, color: 'primary' };

function buildDescriptor(overrides: Partial<AppRouteDescriptor>): AppRouteDescriptor {
  return {
    id: 'storage',
    route: 'storage',
    app: 'carbonio-admin-ui-storage',
    primaryBar: 'CubeOutline',
    badge,
    position: 1,
    visible: true,
    label: 'Storage',
    appView: FallbackView,
    primarybarSection: undefined,
    ...overrides,
  };
}

// Shared store is a module singleton — reset the data keys before AND after each test so a test
// always starts clean and leaves no state behind for other tests/files.
const EMPTY_DATA = {
  routes: {},
  apps: {},
  appContexts: {},
  entryPoints: {},
  views: { primaryBar: [], appView: [], utilityBar: [], primarybarSections: [] },
};

describe('useAppStore setters', () => {
  beforeEach(() => {
    useAppStore.setState(EMPTY_DATA);
  });

  afterEach(() => {
    useAppStore.setState(EMPTY_DATA);
  });

  describe('addRoute path derivation', () => {
    it('prefixes the path with the primarybarSection id when a section is provided', () => {
      useAppStore.getState().setters.addRoute(
        buildDescriptor({
          id: 'storage',
          route: 'storage',
          primarybarSection: { id: 'manage', label: 'Manage', position: 3 },
        }),
      );

      const route = useAppStore.getState().routes.storage;
      expect(route?.route).toBe('storage');
      expect(route?.path).toBe('manage/storage');
    });

    it('uses the raw route as the path when no section is provided', () => {
      useAppStore.getState().setters.addRoute(
        buildDescriptor({ id: 'dashboard', route: 'dashboard', primarybarSection: undefined }),
      );

      const route = useAppStore.getState().routes.dashboard;
      expect(route?.route).toBe('dashboard');
      expect(route?.path).toBe('dashboard');
    });

    it('populates the prefixed path on the appView entry', () => {
      useAppStore.getState().setters.addRoute(
        buildDescriptor({
          primarybarSection: { id: 'manage', label: 'Manage', position: 3 },
        }),
      );

      const appView = useAppStore.getState().views.appView;
      expect(appView).toHaveLength(1);
      expect(appView[0].path).toBe('manage/storage');
      expect(appView[0].route).toBe('storage');
    });

    it('populates the prefixed path on the primaryBar entry', () => {
      useAppStore.getState().setters.addRoute(
        buildDescriptor({
          primarybarSection: { id: 'manage', label: 'Manage', position: 3 },
        }),
      );

      const primaryBar = useAppStore.getState().views.primaryBar;
      expect(primaryBar).toHaveLength(1);
      expect(primaryBar[0].path).toBe('manage/storage');
    });
  });

  describe('removeRoute', () => {
    it('removes the route and its views', () => {
      useAppStore.getState().setters.addRoute(buildDescriptor({ id: 'storage' }));
      expect(useAppStore.getState().routes.storage).toBeDefined();

      useAppStore.getState().setters.removeRoute('storage');

      expect(useAppStore.getState().routes.storage).toBeUndefined();
      expect(useAppStore.getState().views.appView).toHaveLength(0);
      expect(useAppStore.getState().views.primaryBar).toHaveLength(0);
    });
  });
});

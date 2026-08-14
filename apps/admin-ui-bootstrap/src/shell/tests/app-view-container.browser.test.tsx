/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useAppStore } from '@zextras/ui-shared';
import { LocationDisplay, setupBrowserTest } from 'admin-ui-test-utils';
import { FC } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import AppViewContainer from '../app-view-container';

const StubView: FC = () => <div>STUB-APPVIEW</div>;

const EMPTY_DATA = {
  routes: {},
  apps: {},
  appContexts: {},
  entryPoints: {},
  views: { primaryBar: [], appView: [], utilityBar: [], primarybarSections: [] },
};

describe('AppViewContainer', () => {
  beforeEach(() => {
    useAppStore.setState(EMPTY_DATA);
  });
  afterEach(() => {
    useAppStore.setState(EMPTY_DATA);
  });

  it('mounts the registered app view at its prefixed path', async () => {
    useAppStore.getState().setters.addRoute({
      id: 'storage',
      route: 'storage',
      app: 'carbonio-admin-ui-storage',
      primaryBar: 'CubeOutline',
      badge: { show: false, count: 0, showCount: false, color: 'primary' },
      position: 1,
      visible: true,
      label: 'Storage',
      appView: StubView,
      primarybarSection: { id: 'manage', label: 'Manage', position: 3 },
    });

    setupBrowserTest(<AppViewContainer />, { initialRouterEntry: '/manage/storage' });

    await expect.element(page.getByText('STUB-APPVIEW')).toBeVisible();
  });

  it('redirects the root path to the first registered app route', async () => {
    useAppStore.setState({
      apps: {
        'carbonio-admin-ui-storage': {
          name: 'carbonio-admin-ui-storage',
          priority: 1,
          icon: 'Cube',
          description: '',
          display: 'Storage',
          js_entrypoint: '',
          type: 'carbonioAdmin',
        },
      },
    });
    useAppStore.getState().setters.addRoute({
      id: 'storage',
      route: 'storage',
      app: 'carbonio-admin-ui-storage',
      primaryBar: 'CubeOutline',
      badge: { show: false, count: 0, showCount: false, color: 'primary' },
      position: 1,
      visible: true,
      label: 'Storage',
      appView: StubView,
      primarybarSection: { id: 'manage', label: 'Manage', position: 3 },
    });

    setupBrowserTest(
      <>
        <AppViewContainer />
        <LocationDisplay />
      </>,
      { initialRouterEntry: '/' },
    );

    await expect.element(page.getByText('STUB-APPVIEW')).toBeVisible();
    await expect.element(page.getByTestId('location')).toHaveTextContent('/manage/storage');
  });
});

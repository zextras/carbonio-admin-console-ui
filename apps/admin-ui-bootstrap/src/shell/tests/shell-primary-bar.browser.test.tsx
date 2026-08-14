/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useAppStore } from '@zextras/ui-shared';
import { LocationDisplay, setupBrowserTest } from 'admin-ui-test-utils';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { ShellPrimaryBar } from '../shell-primary-bar';

const EMPTY_DATA = {
  routes: {},
  apps: {},
  appContexts: {},
  entryPoints: {},
  views: { primaryBar: [], appView: [], utilityBar: [], primarybarSections: [] },
};

describe('ShellPrimaryBar', { timeout: 20_000 }, () => {
  beforeEach(() => {
    useAppStore.setState(EMPTY_DATA);
  });
  afterEach(() => {
    useAppStore.setState(EMPTY_DATA);
  });

  it('renders a registered primary bar item and navigates to its prefixed path on click', async () => {
    useAppStore.getState().setters.addRoute({
      id: 'storage',
      route: 'storage',
      app: 'carbonio-admin-ui-storage',
      primaryBar: 'CubeOutline',
      badge: { show: false, count: 0, showCount: false, color: 'primary' },
      position: 1,
      visible: true,
      label: 'Storage',
      appView: () => null,
      primarybarSection: { id: 'manage', label: 'Manage', position: 3 },
    });

    await setupBrowserTest(
      <>
        <ShellPrimaryBar activeRoute={undefined} />
        <LocationDisplay />
      </>,
      { initialRouterEntry: '/' },
    );

    // Primary bar item renders (icon button)
    const icon = page.getByTestId('icon: CubeOutline');
    await expect.element(icon).toBeVisible();

    await icon.click({ force: true });

    // Clicking navigates to the prefixed path (manage/storage)
    await expect.element(page.getByTestId('location')).toHaveTextContent('/manage/storage');
  });
});

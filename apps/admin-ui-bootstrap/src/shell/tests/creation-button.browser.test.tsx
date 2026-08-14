/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useAppStore, useIntegrationsStore } from '@zextras/ui-shared';
import { setupBrowserTest } from 'admin-ui-test-utils';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { CreationButton } from '../creation-button';

const EMPTY_DATA = {
  routes: {},
  apps: {},
  appContexts: {},
  entryPoints: {},
  views: { primaryBar: [], appView: [], utilityBar: [], primarybarSections: [] },
};

function registerAction(id: string, group: string, label: string, onClick?: () => void): void {
  useIntegrationsStore.getState().registerActions({
    id,
    type: 'new',
    action: () => ({
      id,
      label,
      onClick: onClick ?? (() => {}),
      group,
      icon: 'Plus',
    }),
  });
}

function setApps(apps: Record<string, { name: string; priority: number }>): void {
  const storeApps: Record<string, any> = {};
  for (const [key, val] of Object.entries(apps)) {
    storeApps[key] = {
      name: val.name,
      priority: val.priority,
      icon: 'Cube',
      description: '',
      display: val.name,
      js_entrypoint: '',
      type: 'carbonioAdmin',
    };
  }
  useAppStore.setState({ apps: storeApps });
}

describe('CreationButton', { timeout: 20_000 }, () => {
  beforeEach(() => {
    useAppStore.setState(EMPTY_DATA);
    useIntegrationsStore.setState({ actions: {} });
  });
  afterEach(() => {
    useAppStore.setState(EMPTY_DATA);
    useIntegrationsStore.setState({ actions: {} });
  });

  it('renders the Create button with a chevron-down icon', async () => {
    await setupBrowserTest(<CreationButton />);

    await expect.element(page.getByRole('button', { name: 'Create' })).toBeVisible();
    await expect.element(page.getByTestId('icon: ChevronDown')).toBeVisible();
  });

  it('maps active route actions to dropdown items', async () => {
    setApps({
      'app-domains': { name: 'app-domains', priority: 1 },
    });
    registerAction('new-domain', 'app-domains', 'New Domain');
    registerAction('new-account', 'app-domains', 'New Account');

    const activeRoute = {
      id: 'domains',
      route: 'domains',
      path: '/manage/domains',
      app: 'app-domains',
    };

    await setupBrowserTest(<CreationButton activeRoute={activeRoute} />);

    await page.getByRole('button', { name: 'Create' }).click();

    await expect.element(page.getByText('New Domain')).toBeVisible();
    await expect.element(page.getByText('New Account')).toBeVisible();
    expect(page.getByTestId('dropdown-item').elements()).toHaveLength(2);
  });

  it('calls the action onClick handler when a dropdown item is clicked', async () => {
    let clicked = false;
    setApps({
      'app-domains': { name: 'app-domains', priority: 1 },
    });
    registerAction('new-domain', 'app-domains', 'New Domain', () => {
      clicked = true;
    });

    const activeRoute = {
      id: 'domains',
      route: 'domains',
      path: '/manage/domains',
      app: 'app-domains',
    };

    await setupBrowserTest(<CreationButton activeRoute={activeRoute} />);

    await page.getByRole('button', { name: 'Create' }).click();
    await page.getByText('New Domain').click();

    await vi.waitFor(() => expect(clicked).toBe(true));
  });

  it('inserts a divider between active and non-active app groups', async () => {
    setApps({
      'app-domains': { name: 'app-domains', priority: 1 },
      'app-mail': { name: 'app-mail', priority: 2 },
    });
    registerAction('new-domain', 'app-domains', 'New Domain');
    registerAction('new-mailbox', 'app-mail', 'New Mailbox');

    const activeRoute = {
      id: 'domains',
      route: 'domains',
      path: '/manage/domains',
      app: 'app-domains',
    };

    await setupBrowserTest(<CreationButton activeRoute={activeRoute} />);

    await page.getByRole('button', { name: 'Create' }).click();

    await expect.element(page.getByText('New Domain')).toBeVisible();
    expect(page.getByTestId('dropdown-item').elements()).toHaveLength(2);
    expect(document.querySelectorAll('ds-divider')).toHaveLength(1);
  });

  it('renders dividers for all app groups when no activeRoute is provided', async () => {
    setApps({
      'app-domains': { name: 'app-domains', priority: 1 },
      'app-mail': { name: 'app-mail', priority: 2 },
    });
    registerAction('new-domain', 'app-domains', 'New Domain');
    registerAction('new-mailbox', 'app-mail', 'New Mailbox');

    await setupBrowserTest(<CreationButton />);

    await page.getByRole('button', { name: 'Create' }).click();

    await expect.element(page.getByText('New Domain')).toBeVisible();
    expect(page.getByTestId('dropdown-item').elements()).toHaveLength(2);
    expect(document.querySelectorAll('ds-divider')).toHaveLength(2);
  });

  it('does not render a divider for apps that have no actions', async () => {
    setApps({
      'app-domains': { name: 'app-domains', priority: 1 },
      'app-mail': { name: 'app-mail', priority: 2 },
    });
    registerAction('new-domain', 'app-domains', 'New Domain');

    await setupBrowserTest(<CreationButton />);

    await page.getByRole('button', { name: 'Create' }).click();

    await expect.element(page.getByText('New Domain')).toBeVisible();
    expect(page.getByTestId('dropdown-item').elements()).toHaveLength(1);
    expect(document.querySelectorAll('ds-divider')).toHaveLength(1);
  });

  it('renders no dropdown items when there are no actions', async () => {
    setApps({
      'app-domains': { name: 'app-domains', priority: 1 },
    });

    await setupBrowserTest(<CreationButton />);

    await page.getByRole('button', { name: 'Create' }).click();

    await vi.waitFor(() => {
      expect(page.getByTestId('dropdown-item').elements()).toHaveLength(0);
    });
  });
});

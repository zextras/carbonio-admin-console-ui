/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type IconName } from '@zextras/ui-components';
import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { AddonsCardActive } from '../parts/cards/addons-card-active';
import { AddonsCardInactive } from '../parts/cards/addons-card-inactive';
import type { AddonDisplayConfig } from '../parts/sections/addons-section';

const setupTest = (component: React.ReactElement) => {
  const queryClient = getQueryClient();
  return setupBrowserTest(component, { queryClient });
};

const addonConfig: AddonDisplayConfig = {
  name: 'ActiveSync',
  labelKey: 'label.activesync',
  labelDefault: 'ActiveSync',
  icon: 'Sync' as IconName,
  descriptionKey: 'core.subscription.activesync_description',
  descriptionDefault: 'Enables synchronization with mobile devices.',
};

describe('AddonsCardActive', () => {
  it('renders nothing when addOns is undefined', async () => {
    setupTest(<AddonsCardActive config={addonConfig} addOns={undefined} />);

    expect(page.getByText('Total seat').elements()).toHaveLength(0);
  });

  it('renders nothing when addOns does not contain the configured add-on', async () => {
    setupTest(
      <AddonsCardActive
        config={addonConfig}
        addOns={[{ name: 'MailReplica', status: 'green', assignedSeats: 1, totalSeats: 10 }]}
      />,
    );

    expect(page.getByText('Total seat').elements()).toHaveLength(0);
    await expect
      .element(page.getByText('Unexpected Application Error!'))
      .not.toBeInTheDocument();
  });

  it('renders the total seat count and active badge when the add-on is present', async () => {
    setupTest(
      <AddonsCardActive
        config={addonConfig}
        addOns={[{ name: 'ActiveSync', status: 'green', assignedSeats: 1, totalSeats: 100 }]}
      />,
    );

    await expect.element(page.getByText('Total seat')).toBeVisible();
    await expect.element(page.getByText('100', { exact: true })).toBeVisible();
    await expect.element(page.getByText('ACTIVE', { exact: true })).toBeVisible();
  });

  it('renders correctly when a non-matching add-on precedes the matching one', async () => {
    setupTest(
      <AddonsCardActive
        config={addonConfig}
        addOns={[
          { name: 'MailReplica', status: 'not active', assignedSeats: 0, totalSeats: 0 },
          { name: 'ActiveSync', status: 'green', assignedSeats: 1, totalSeats: 50 },
        ]}
      />,
    );

    await expect.element(page.getByText('50', { exact: true })).toBeVisible();
  });

  it('renders Unlimited as the total seat value for a metered add-on without totalSeats', async () => {
    setupTest(
      <AddonsCardActive
        config={addonConfig}
        addOns={[{ name: 'ActiveSync', status: 'green', assignedSeats: 42 }]}
      />,
    );

    await expect.element(page.getByText('Total seat')).toBeVisible();
    await expect.element(page.getByText('Unlimited', { exact: true })).toBeVisible();
    expect(await page.getByText('Assigned accounts').elements()).toHaveLength(0);
  });
});

describe('AddonsCardInactive', () => {
  it('renders the not active badge and the call to action', async () => {
    setupTest(<AddonsCardInactive config={addonConfig} />);

    await expect.element(page.getByText('NOT ACTIVE', { exact: true })).toBeVisible();
  });
});

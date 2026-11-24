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

import { BundleCardActive } from '../parts/cards/bundle-card-active';
import { BundleCardInactive } from '../parts/cards/bundle-card-inactive';
import type { BundleDisplayConfig } from '../parts/sections/bundles-section';

const setupTest = (component: React.ReactElement) => {
  const queryClient = getQueryClient();
  return setupBrowserTest(component, { queryClient });
};

const bundleConfig: BundleDisplayConfig = {
  name: 'Files',
  labelKey: 'label.files_docs',
  labelDefault: 'Files & Docs',
  icon: 'FolderOutline' as IconName,
  descriptionKey: 'core.subscription.bundle_files_description',
  descriptionDefault: 'Documents storage and collaboration',
};

describe('BundleCardActive', () => {
  it('renders the bundle title, description and Unlimited total seat', async () => {
    setupTest(<BundleCardActive config={bundleConfig} />);

    await expect.element(page.getByText('Files & Docs')).toBeVisible();
    await expect.element(page.getByText('Documents storage and collaboration')).toBeVisible();
    await expect.element(page.getByText('Total seat')).toBeVisible();
    await expect.element(page.getByText('Unlimited', { exact: true })).toBeVisible();
  });
});

describe('BundleCardInactive', () => {
  it('renders the not active badge and the description', async () => {
    setupTest(<BundleCardInactive config={bundleConfig} />);

    await expect.element(page.getByText('Files & Docs')).toBeVisible();
    await expect.element(page.getByText('NOT ACTIVE', { exact: true })).toBeVisible();
  });
});

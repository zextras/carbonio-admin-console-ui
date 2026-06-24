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
	name: 'activesync_addon',
	labelKey: 'label.activesync',
	labelDefault: 'ActiveSync',
	icon: 'Sync' as IconName,
	descriptionKey: 'core.subscription.activesync_description',
	descriptionDefault: 'Enables synchronization with mobile devices.',
};

describe('AddonsCardActive', () => {
	it('renders nothing when editions is undefined', async () => {
		setupTest(<AddonsCardActive config={addonConfig} editions={undefined} />);

		expect(page.getByText('Total seat').elements()).toHaveLength(0);
	});

	it('renders the total seat count and active badge when the edition is present', async () => {
		setupTest(
			<AddonsCardActive
				config={addonConfig}
				editions={[{ name: 'activesync_addon', quantity: '100' }]}
			/>,
		);

		await expect.element(page.getByText('Total seat')).toBeVisible();
		await expect.element(page.getByText('100', { exact: true })).toBeVisible();
		await expect.element(page.getByText('ACTIVE', { exact: true })).toBeVisible();
	});

	it('renders correctly when a non-matching edition precedes the matching one', async () => {
		setupTest(
			<AddonsCardActive
				config={addonConfig}
				editions={[
					{ name: 'replica_addon', quantity: '0' },
					{ name: 'activesync_addon', quantity: '50' },
				]}
			/>,
		);

		await expect.element(page.getByText('50', { exact: true })).toBeVisible();
	});
});

describe('AddonsCardInactive', () => {
	it('renders nothing when editions is undefined', async () => {
		setupTest(<AddonsCardInactive config={addonConfig} editions={undefined} />);

		expect(page.getByText('Contact your provider to activate').elements()).toHaveLength(0);
	});

	it('renders the not active badge and the call to action when editions is defined', async () => {
		setupTest(<AddonsCardInactive config={addonConfig} editions={[]} />);

		await expect.element(page.getByText('NOT ACTIVE', { exact: true })).toBeVisible();
		await expect
			.element(page.getByText('Contact your provider to activate'))
			.toBeVisible();
	});
});

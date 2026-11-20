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

import { EditionCardActive } from '../parts/cards/edition-card-active';
import { EditionCardInactive } from '../parts/cards/edition-card-inactive';
import type { EditionDisplayConfig } from '../parts/sections/active-edition-section';

const setupTest = (component: React.ReactElement) => {
	const queryClient = getQueryClient();
	return setupBrowserTest(component, { queryClient });
};

const editionConfig: EditionDisplayConfig = {
	name: 'Email',
	labelKey: 'label.email',
	labelDefault: 'Email',
	icon: 'EmailOutline' as IconName,
};

describe('EditionCardActive', () => {
	it('renders the total seat count and active badge for the matching edition', async () => {
		setupTest(
			<EditionCardActive
				config={editionConfig}
				editions={[{ name: 'Email', status: 'green', assignedSeats: 5, totalSeats: 500 }]}
			/>,
		);

		await expect.element(page.getByText('Total seat')).toBeVisible();
		await expect.element(page.getByText('500', { exact: true })).toBeVisible();
		await expect.element(page.getByText('ACTIVE', { exact: true })).toBeVisible();
	});

	it('renders correctly when a non-matching edition precedes the matching one', async () => {
		setupTest(
			<EditionCardActive
				config={editionConfig}
				editions={[
					{ name: 'Workspace', status: 'not active', assignedSeats: 0, totalSeats: 0 },
					{ name: 'Email', status: 'green', assignedSeats: 3, totalSeats: 300 },
				]}
			/>,
		);

		await expect.element(page.getByText('300', { exact: true })).toBeVisible();
	});
});

describe('EditionCardInactive', () => {
	it('renders the not active badge and the upgrade description', async () => {
		setupTest(<EditionCardInactive config={editionConfig} />);

		await expect.element(page.getByText('NOT ACTIVE', { exact: true })).toBeVisible();
		await expect
			.element(page.getByText(/Upgrade your subscription to unlock/))
			.toBeVisible();
	});
});

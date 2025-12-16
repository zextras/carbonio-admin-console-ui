/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	createBrowserSoapAPIInterceptor,
	grantUserConfigRights,
	setupBrowserTest
} from 'admin-ui-test-utils';
import { Route, Switch } from 'react-router-dom';
import { afterEach,beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { useCosStore } from '../../src/store/cos/store';
import { CosDetailPanel } from '../../src/views/cos/cos-detail-panel';

const mockApiResponse = {
	cos: [
		{
			name: 'firstCOS',
			id: 'e00428a1-0c00-11d9-836a-000d93afea2a',
			isDefaultCos: true,
			a: [
				{ n: 'cn', _content: 'firstCOS' },
				{ n: 'zimbraId', _content: 'e00428a1-0c00-11d9-836a-000d93afea2a' },
				{ n: 'objectClass', _content: 'zimbraCos' }
			]
		},
		{
			name: 'secondCOS',
			id: 'f27456a8-0c00-11d9-280a-286d93afea2g',
			isDefaultCos: true,
			a: [
				{ n: 'cn', _content: 'secondCOS' },
				{ n: 'zimbraId', _content: 'f27456a8-0c00-11d9-280a-286d93afea2g' },
				{ n: 'objectClass', _content: 'zimbraCos' }
			]
		}
	],
	searchTotal: 2,
	more: false
};

describe('CosDetailPanel', () => {
	beforeEach(async () => {
		grantUserConfigRights();
	});

	afterEach(() => {
		useCosStore.getState().reset();
	});

	it('should render the COS detail panel with basic structure', async () => {
		createBrowserSoapAPIInterceptor('SearchDirectory', {});

		setupBrowserTest(
			<Switch>
				<Route path="/cos">
					<CosDetailPanel />
				</Route>
			</Switch>,
			{ initialRouterEntry: '/cos/cos_list' }
		);

		await expect.element(page.getByText('COS List')).toBeVisible();
	});
	it('should show the list of COS elements', async () => {
		createBrowserSoapAPIInterceptor('SearchDirectory', mockApiResponse);

		setupBrowserTest(
			<Switch>
				<Route path="/cos">
					<CosDetailPanel />
				</Route>
			</Switch>,
			{ initialRouterEntry: '/cos/cos_list' }
		);

		await expect.element(page.getByText('firstCOS')).toBeVisible();
		await expect.element(page.getByText('secondCOS')).toBeVisible();
	});
	it('should change the number of visible COS', async () => {
		createBrowserSoapAPIInterceptor('SearchDirectory', mockApiResponse);

		setupBrowserTest(
			<Switch>
				<Route path="/cos">
					<CosDetailPanel />
				</Route>
			</Switch>,
			{ initialRouterEntry: '/cos/cos_list' }
		);
		await expect.element(page.getByText('Showing')).toBeVisible();
		await expect.element(page.getByText('items per page')).toBeVisible();
		await page.getByText('10').click();
		await expect.element(page.getByText('15')).toBeVisible();
		await expect.element(page.getByText('25')).toBeVisible();
		await expect.element(page.getByText('50')).toBeVisible();
		await expect.element(page.getByText('100')).toBeVisible();

		const listOfElements = page.getByText('10').elements();
		expect(listOfElements[1]).toHaveStyle({ fontWeight: 'bold' });

		await page.getByText('15').click();
		expect(page.getByText('10').elements()).toHaveLength(0);
		expect(page.getByText('15').elements()).toHaveLength(1);
	});
});

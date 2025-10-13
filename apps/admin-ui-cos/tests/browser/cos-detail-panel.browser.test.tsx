/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { page } from '@vitest/browser/context';
import { createSoapAPIInterceptor, setupBrowserTest } from 'admin-ui-test-utils';
import React from 'react';
import { Route } from 'react-router-dom';
import { it, expect, describe } from 'vitest';

import { CosDetailPanel } from '../../src/views/cos/cos-detail-panel';

const mockApiResponse = {
	cos: [
		{
			name: 'firstCOS',
			id: 'e00428a1-0c00-11d9-836a-000d93afea2a',
			isDefaultCos: true
		},
		{
			name: 'secondCOS',
			id: 'f27456a8-0c00-11d9-280a-286d93afea2g',
			isDefaultCos: true
		}
	],
	searchTotal: 2,
	more: false
};
describe('', () => {
	it('should render all parts of the component', async () => {
		createSoapAPIInterceptor('SearchDirectory', {});
		setupBrowserTest(
			<Route path="/cos">
				<CosDetailPanel />
			</Route>,
			{ initialRouterEntry: '/cos/cos_list' }
		);

		await expect.element(page.getByText('COS List')).toBeVisible();
	});
	it('should show the list of COS elements', async () => {
		createSoapAPIInterceptor('SearchDirectory', mockApiResponse);
		setupBrowserTest(
			<Route path="/cos">
				<CosDetailPanel />
			</Route>,
			{ initialRouterEntry: '/cos/cos_list' }
		);
		await expect.element(page.getByText('firstCOS')).toBeVisible();
		await expect.element(page.getByText('secondCOS')).toBeVisible();
	});
	it.skip('should change the number of visible COS', async () => {
		createSoapAPIInterceptor('SearchDirectory', mockApiResponse);
		setupBrowserTest(
			<Route path="/cos">
				<CosDetailPanel />
			</Route>,
			{ initialRouterEntry: '/cos/cos_list' }
		);
		expect(page.getByText("5")).toBeVisible();
	})
});

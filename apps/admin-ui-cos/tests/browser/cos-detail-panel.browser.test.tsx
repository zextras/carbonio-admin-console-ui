/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCurrentUserRights, useRights, useUserAccounts } from '@zextras/admin-ui-bootstrap';
import { createSoapAPIInterceptor, resetMockWorker, setupBrowserTest } from 'admin-ui-test-utils';
import React from 'react';
import { Route } from 'react-router-dom';
import { it, expect, describe, beforeEach, afterEach, vi, Mock } from 'vitest';
import { page } from 'vitest/browser';

import { useCosStore } from '../../src/store/cos/store';
import { CosDetailPanel } from '../../src/views/cos/cos-detail-panel';

vi.mock('@zextras/admin-ui-bootstrap');

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

const mockRightsData = [
	{
		type: 'cos',
		all: [
			{
				right: [
					{ n: 'assignCos' },
					{ n: 'deleteCos' },
					{ n: 'listCos' },
					{ n: 'manageZimlet' },
					{ n: 'renameCos' }
				],
				setAttrs: [{ all: true }],
				getAttrs: [{ all: true }]
			}
		]
	}
];

const mockRights = [
	{
		type: 'config',
		all: [
			{
				setAttrs: [{ all: true }]
			}
		]
	}
];

describe('', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		useCosStore.getState().reset();

		(useUserAccounts as Mock).mockReturnValue([{ name: 'testuser@example.com' }]);
		(useCurrentUserRights as Mock).mockReturnValue({
			data: mockRightsData,
			isLoading: false,
			isSuccess: true,
			isError: false
		});
		(useRights as Mock).mockReturnValue({
			data: mockRights,
			isLoading: false,
			isSuccess: true,
			isError: false
		});
	});

	afterEach(() => {
		resetMockWorker();
		useCosStore.getState().reset();
	});

	it('should render the COS detail panel with basic structure', async () => {
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
	it('should change the number of visible COS', async () => {
		createSoapAPIInterceptor('SearchDirectory', mockApiResponse);
		setupBrowserTest(
			<Route path="/cos">
				<CosDetailPanel />
			</Route>,
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
		// here we check that 15 is now selected and the dropdown is closed
		expect(page.getByText('15').elements()).toHaveLength(1);
	});
});

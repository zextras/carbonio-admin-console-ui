/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useAccountStore } from '@zextras/admin-ui-bootstrap/src/store/account/store';
import {
	createBrowserSoapAPIInterceptor,
	resetMockWorker,
	setupBrowserTest
} from 'admin-ui-test-utils';
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { it, expect, describe, beforeEach, afterEach, vi } from 'vitest';
import { page } from 'vitest/browser';

import { useCosStore } from '../../src/store/cos/store';
import { useGlobalConfigStore } from '../../src/store/global-config/store';
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

describe('CosDetailPanel', () => {
	beforeEach(async () => {
		vi.resetAllMocks();

		useAccountStore.setState({
			account: {
				id: 'test-user-id',
				name: 'test@example.com',
				displayName: '',
				signatures: {
					signature: []
				},
				identities: undefined,
				rights: { targets: [] }
			},
			settings: {
				prefs: {},
				attrs: {},
				props: []
			},
			usedQuota: 0
		});

		useGlobalConfigStore.setState({
			globalConfig: {},
			globalConfigList: [],
			globalConfigView: 'general',
			globalCarbonioSendAnalytics: false
		});

		const localStorageMock = {
			getItem: vi.fn(),
			setItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn()
		};
		Object.defineProperty(window, 'localStorage', {
			value: localStorageMock
		});
	});

	afterEach(() => {
		resetMockWorker();
		useCosStore.getState().reset();
	});

	it('should render the COS detail panel with basic structure', async () => {
		createBrowserSoapAPIInterceptor('GetAllEffectiveRights', {
			target: mockRightsData
		});
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
		createBrowserSoapAPIInterceptor('GetAllEffectiveRights', {
			target: mockRightsData
		});
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
		createBrowserSoapAPIInterceptor('GetAllEffectiveRights', {
			target: mockRightsData
		});
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

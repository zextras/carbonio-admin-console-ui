/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

vi.mock('@zextras/ui-shared', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@zextras/ui-shared')>();
	return { ...actual, replaceHistory: vi.fn() };
});

import { replaceHistory } from '@zextras/ui-shared';
import { registerAppRoute, setupBrowserTest } from 'admin-ui-test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { DONE_ROUTE_ID, LOG_AND_QUEUES, OPERATIONS_ROUTE_ID, QUEUED_ROUTE_ID } from '../../../constants';
import { OperationsListPanel } from '../operations-list-panel';

const mockedReplaceHistory = vi.mocked(replaceHistory);

describe('OperationsListPanel', () => {
	beforeEach(() => {
		registerAppRoute(OPERATIONS_ROUTE_ID, LOG_AND_QUEUES);
	});

	afterEach(() => {
		mockedReplaceHistory.mockClear();
	});

	it('renders the three operation tabs', async () => {
		setupBrowserTest(<OperationsListPanel />, {
			initialRouterEntry: `/${LOG_AND_QUEUES}/${OPERATIONS_ROUTE_ID}/${QUEUED_ROUTE_ID}`,
		});

		await expect.element(page.getByText('Running')).toBeVisible();
		await expect.element(page.getByText('Queued')).toBeVisible();
		await expect.element(page.getByText('Done')).toBeVisible();
	});

	it('navigates to the selected tab via replaceHistory', async () => {
		setupBrowserTest(<OperationsListPanel />, {
			initialRouterEntry: `/${LOG_AND_QUEUES}/${OPERATIONS_ROUTE_ID}/${QUEUED_ROUTE_ID}`,
		});

		await page.getByText('Done').click();

		expect(mockedReplaceHistory).toHaveBeenCalledWith(`/${DONE_ROUTE_ID}`);
	});
});

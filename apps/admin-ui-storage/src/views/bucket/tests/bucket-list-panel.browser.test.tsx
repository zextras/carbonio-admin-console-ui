/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	advancedSupportedApiForBrowser,
	createBrowserSoapAPIInterceptor,
	setupBrowserTest,
} from 'admin-ui-test-utils';
import { beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import BucketListPanel from '../bucket-list-panel';

const SERVERS = [
	{
		id: 'server-1',
		name: 'mailstore1.test.com',
		a: [
			{ n: 'zimbraServiceHostname', _content: 'mailstore1.test.com' },
			{ n: 'description', _content: 'Primary mailstore' },
		],
	},
	{
		id: 'server-2',
		name: 'mailstore2.test.com',
		a: [
			{ n: 'zimbraServiceHostname', _content: 'mailstore2.test.com' },
			{ n: 'description', _content: 'Secondary mailstore' },
		],
	},
];

function setupGetAllServersInterceptor(
	servers: Array<typeof SERVERS[number]> = SERVERS,
): Promise<unknown> {
	return createBrowserSoapAPIInterceptor('GetAllServers', {
		server: servers,
	});
}

function setupAllConfigInterceptor(): Promise<unknown> {
	return createBrowserSoapAPIInterceptor('GetAllConfig', {
		a: [{ n: 'carbonioSendAnalytics', _content: 'FALSE' }],
	});
}

describe('BucketListPanel (browser)', () => {
	describe('CE mode', () => {
		beforeEach(async () => {
			await advancedSupportedApiForBrowser.withAdvancedNotSupported();
		});

		describe('Rendering', () => {
			it('should render the Global Servers section', async () => {
				setupGetAllServersInterceptor();
				setupAllConfigInterceptor();
				await setupBrowserTest(<BucketListPanel />);
				await expect
					.element(page.getByText('Global Servers', { exact: true }))
					.toBeVisible();
			});

			it('should render the Server Details section', async () => {
				setupGetAllServersInterceptor();
				setupAllConfigInterceptor();
				await setupBrowserTest(<BucketListPanel />);
				await expect
					.element(page.getByText('Server Details', { exact: true }))
					.toBeVisible();
			});

			it('should render the Servers List item', async () => {
				setupGetAllServersInterceptor();
				setupAllConfigInterceptor();
				await setupBrowserTest(<BucketListPanel />);
				await expect
					.element(page.getByText('Servers List', { exact: true }))
					.toBeVisible();
			});

			it('should render the Select a Server dropdown', async () => {
				setupGetAllServersInterceptor();
				setupAllConfigInterceptor();
				await setupBrowserTest(<BucketListPanel />);
				await expect
					.element(page.getByLabelText('Select a Server'))
					.toBeInTheDocument();
			});

			it('should render the Data Volumes item', async () => {
				setupGetAllServersInterceptor();
				setupAllConfigInterceptor();
				await setupBrowserTest(<BucketListPanel />);
				await expect
					.element(page.getByText('Data Volumes', { exact: true }))
					.toBeInTheDocument();
			});

			it('should not render the Bucket List item in CE mode', async () => {
				setupGetAllServersInterceptor();
				setupAllConfigInterceptor();
				await setupBrowserTest(<BucketListPanel />);
				await expect
					.element(page.getByText('Global Servers', { exact: true }))
					.toBeVisible();
				expect(
					page.getByText('Bucket List', { exact: true }).elements(),
				).toHaveLength(0);
			});

			it('should not render the HSM Settings item in CE mode', async () => {
				setupGetAllServersInterceptor();
				setupAllConfigInterceptor();
				await setupBrowserTest(<BucketListPanel />);
				await expect
					.element(page.getByText('Server Details', { exact: true }))
					.toBeVisible();
				expect(
					page.getByText('HSM Settings', { exact: true }).elements(),
				).toHaveLength(0);
			});
		});
	});

	describe('Advanced mode', () => {
		beforeEach(async () => {
			await advancedSupportedApiForBrowser.withAdvancedSupported();
		});

		describe('Rendering', () => {
			it('should render the Bucket List item in advanced mode', async () => {
				setupGetAllServersInterceptor();
				setupAllConfigInterceptor();
				await setupBrowserTest(<BucketListPanel />);
				await expect
					.element(page.getByText('Bucket List', { exact: true }))
					.toBeVisible();
			});

			it('should render the HSM Settings item in advanced mode', async () => {
				setupGetAllServersInterceptor();
				setupAllConfigInterceptor();
				await setupBrowserTest(<BucketListPanel />);
				await expect
					.element(page.getByText('HSM Settings', { exact: true }))
					.toBeInTheDocument();
			});

			it('should render both Global Servers and Server Details sections', async () => {
				setupGetAllServersInterceptor();
				setupAllConfigInterceptor();
				await setupBrowserTest(<BucketListPanel />);
				await expect
					.element(page.getByText('Global Servers', { exact: true }))
					.toBeVisible();
				await expect
					.element(page.getByText('Server Details', { exact: true }))
					.toBeVisible();
			});

			it('should render all navigation items in advanced mode', async () => {
				setupGetAllServersInterceptor();
				setupAllConfigInterceptor();
				await setupBrowserTest(<BucketListPanel />);
				await expect
					.element(page.getByText('Servers List', { exact: true }))
					.toBeVisible();
				await expect
					.element(page.getByText('Bucket List', { exact: true }))
					.toBeVisible();
				await expect
					.element(page.getByText('Data Volumes', { exact: true }))
					.toBeInTheDocument();
				await expect
					.element(page.getByText('HSM Settings', { exact: true }))
					.toBeInTheDocument();
			});
		});
	});
});

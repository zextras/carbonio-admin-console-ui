/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	createBrowserAPIInterceptor,
	createBrowserSoapAPIInterceptor,
	getQueryClient,
	grantUserConfigRights,
	resetMockWorker,
	setupBrowserTest,
} from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { useBackupStore } from '../../store/backup/store';
import AppView from '../app-view';

function buildLicenseData(
	features: Array<{ name: string; quantity: string; enabled: boolean }>,
) {
	return {
		ok: true,
		response: {
			type: 'REGULAR',
			subType: 'PERPETUAL',
			maintenanceStatus: 'active',
			features,
		},
	};
}

function mockDumpGlobalConfigWithData() {
	return createBrowserAPIInterceptor(
		'post',
		'/service/admin/soap/zextras',
		() =>
			HttpResponse.json({
				Body: {
					response: {
						content: JSON.stringify({
							response: {
								privateKeyAlgorithm: 'RSA',
								encryptionKeyAlgorithm: 'AES256',
							},
						}),
					},
				},
			}),
	);
}

function mockDumpGlobalConfigEmpty() {
	return createBrowserAPIInterceptor(
		'post',
		'/service/admin/soap/zextras',
		() => HttpResponse.json({ Body: {} }),
	);
}

function grantServerRights(queryClient: ReturnType<typeof getQueryClient>) {
	queryClient.setQueryData(['effective-rights', 'test@example.com'], [
		{
			type: 'config',
			all: [{ setAttrs: [{ all: true }], getAttrs: [{ all: true }] }],
		},
		{
			type: 'server',
			all: [{ right: [{ n: 'listServer' }] }],
		},
	]);
}

describe('AppView', () => {
	let queryClient: ReturnType<typeof getQueryClient>;

	beforeEach(async () => {
		queryClient = getQueryClient();
		await grantUserConfigRights(queryClient);
		queryClient.setQueryData(
			['all-config'],
			[{ n: 'carbonioSendAnalytics', _content: 'FALSE' }],
		);
		queryClient.setQueryData(
			['subscription', 'license'],
			buildLicenseData([{ name: 'backup_basic', quantity: '1', enabled: true }]),
		);
		useBackupStore.setState({ globalConfig: {}, selectedServer: '' });
	});

	afterEach(() => {
		resetMockWorker();
		useBackupStore.setState({ globalConfig: {}, selectedServer: '' });
	});

	describe('Layout', () => {
		it('should render the Global Server Settings section', async () => {
			createBrowserSoapAPIInterceptor('GetAllServers', { server: [] });
			mockDumpGlobalConfigEmpty();

			await setupBrowserTest(<AppView />, {
				queryClient,
				initialRouterEntry: '/servers_list',
			});

			await expect
				.element(page.getByText('Global Server Settings'))
				.toBeVisible();
		});

		it('should render Server Config and Advanced options', async () => {
			createBrowserSoapAPIInterceptor('GetAllServers', { server: [] });
			mockDumpGlobalConfigEmpty();

			await setupBrowserTest(<AppView />, {
				queryClient,
				initialRouterEntry: '/servers_list',
			});

			await expect
				.element(page.getByText('Server Config'))
				.toBeVisible();
			await expect
				.element(page.getByText('Advanced', { exact: true }))
				.toBeVisible();
		});
	});

	describe('BackupDetailPanel', () => {
		it('should show insufficient rights message when global config is not available', async () => {
			createBrowserSoapAPIInterceptor('GetAllServers', { server: [] });
			mockDumpGlobalConfigEmpty();

			await setupBrowserTest(<AppView />, {
				queryClient,
				initialRouterEntry: '/server_config',
			});

			await expect
				.element(
					page.getByText(
						/You have no sufficient administration rights to see this section/,
					),
				)
				.toBeVisible();
		});

		it('should not show insufficient rights message when global config is loaded', async () => {
			createBrowserSoapAPIInterceptor('GetAllServers', { server: [] });
			await mockDumpGlobalConfigWithData();

			useBackupStore.setState({
				globalConfig: { privateKeyAlgorithm: 'RSA' },
			});

			await setupBrowserTest(<AppView />, {
				queryClient,
				initialRouterEntry: '/server_config',
			});

			expect(
				page
					.getByText(
						/You have no sufficient administration rights to see this section/,
					)
					.elements(),
			).toHaveLength(0);
		});
	});

	describe('Server rights', () => {
		it('should show Servers List option when user has list server rights', async () => {
			createBrowserSoapAPIInterceptor('GetAllServers', { server: [] });
			mockDumpGlobalConfigEmpty();
			grantServerRights(queryClient);

			await setupBrowserTest(<AppView />, {
				queryClient,
				initialRouterEntry: '/servers_list',
			});

			await expect
				.element(page.getByText('Servers List'))
				.toBeVisible();
		});

		it('should show Server Specifics section when user has list server rights', async () => {
			createBrowserSoapAPIInterceptor('GetAllServers', { server: [] });
			mockDumpGlobalConfigEmpty();
			grantServerRights(queryClient);

			await setupBrowserTest(<AppView />, {
				queryClient,
				initialRouterEntry: '/servers_list',
			});

			await expect
				.element(page.getByText('Server Specifics'))
				.toBeVisible();
		});

		it('should not show Servers List option when user lacks server rights', async () => {
			createBrowserSoapAPIInterceptor('GetAllServers', { server: [] });
			mockDumpGlobalConfigEmpty();

			await setupBrowserTest(<AppView />, {
				queryClient,
				initialRouterEntry: '/servers_list',
			});

			expect(page.getByText('Servers List').elements()).toHaveLength(0);
		});

		it('should not show Server Specifics section when user lacks server rights', async () => {
			createBrowserSoapAPIInterceptor('GetAllServers', { server: [] });
			mockDumpGlobalConfigEmpty();

			await setupBrowserTest(<AppView />, {
				queryClient,
				initialRouterEntry: '/servers_list',
			});

			expect(page.getByText('Server Specifics').elements()).toHaveLength(0);
		});
	});

	describe('License gating', () => {
		it('should disable list options when backup module is not licensed', async () => {
			createBrowserSoapAPIInterceptor('GetAllServers', { server: [] });
			mockDumpGlobalConfigEmpty();
			queryClient.setQueryData(
				['subscription', 'license'],
				buildLicenseData([]),
			);

			await setupBrowserTest(<AppView />, {
				queryClient,
				initialRouterEntry: '/servers_list',
			});

			await expect
				.element(page.getByText('Global Server Settings'))
				.toBeVisible();

			const serverConfigText = page.getByText('Server Config');
			await expect.element(serverConfigText).toBeVisible();
			await expect.element(serverConfigText).toHaveStyle({ opacity: '0.5' });

			const advancedText = page.getByText('Advanced', { exact: true });
			await expect.element(advancedText).toBeVisible();
			await expect.element(advancedText).toHaveStyle({ opacity: '0.5' });
		});
	});

	describe('Collapsible sections', () => {
		it('should hide Global Server Settings options when section is collapsed', async () => {
			createBrowserSoapAPIInterceptor('GetAllServers', { server: [] });
			mockDumpGlobalConfigEmpty();

			await setupBrowserTest(<AppView />, {
				queryClient,
				initialRouterEntry: '/servers_list',
			});

			await expect
				.element(page.getByText('Server Config'))
				.toBeVisible();

			await page.getByText('Global Server Settings').click();

			expect(page.getByText('Server Config').elements()).toHaveLength(0);
		});

		it('should show Global Server Settings options when section is expanded again', async () => {
			createBrowserSoapAPIInterceptor('GetAllServers', { server: [] });
			mockDumpGlobalConfigEmpty();

			await setupBrowserTest(<AppView />, {
				queryClient,
				initialRouterEntry: '/servers_list',
			});

			await page.getByText('Global Server Settings').click();
			expect(page.getByText('Server Config').elements()).toHaveLength(0);

			await page.getByText('Global Server Settings').click();
			await expect
				.element(page.getByText('Server Config'))
				.toBeVisible();
		});
	});
});

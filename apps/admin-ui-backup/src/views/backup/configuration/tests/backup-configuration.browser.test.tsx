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
import { Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import BackupConfiguration from '../backup-configuration';

const BackupConfigurationWithRoute = () => (
	<Routes>
		<Route path=":server/:operation" element={<BackupConfiguration />} />
	</Routes>
);

const SERVER_NAME = 'mail.example.com';
const SERVER_ID = 'server-id-1';

function buildServerConfigResponse(overrides?: Record<string, unknown>) {
	return {
		attributes: {
			ZxBackup_ModuleEnabledAtStartup: { value: false },
			ZxBackup_RealTimeScanner: { value: false },
			ZxBackup_DoSmartScanOnStartup: { value: false },
			ZxBackup_SpaceThreshold: { value: 512 },
			ZxBackup_DestPath: { value: '/opt/zextras/backup' },
			ZxBackup_DataRetentionDays: { value: 30 },
			backupAccountsRetentionDays: { value: 15 },
			backupSmartScanScheduler: {
				value: { 'cron-enabled': false, 'cron-pattern': '0 0 * * *' },
			},
			backupPurgeScheduler: {
				value: { 'cron-enabled': false, 'cron-pattern': '0 2 * * *' },
			},
			backupArchivingStore: { value: {} },
			...overrides,
		},
		services: { module: { running: false } },
		properties: { backup_initialized: false },
	};
}

function buildRunningServerConfig() {
	return buildServerConfigResponse({
		...buildServerConfigResponse().attributes,
		ZxBackup_ModuleEnabledAtStartup: { value: true },
	});
}

function mockGetServerConfig(response?: Record<string, unknown>) {
	return createBrowserAPIInterceptor(
		'get',
		`/service/extension/zextras_admin/core/getServer/${SERVER_ID}`,
		() => HttpResponse.json(response ?? buildServerConfigResponse()),
	);
}

function mockGetAllServers() {
	return createBrowserSoapAPIInterceptor('GetAllServers', {
		server: [
			{
				name: SERVER_NAME,
				id: SERVER_ID,
				a: [
					{ n: 'zimbraServiceHostname', _content: SERVER_NAME },
					{ n: 'zimbraId', _content: SERVER_ID },
				],
			},
		],
	});
}

function mockZextrasListBuckets() {
	return createBrowserAPIInterceptor(
		'post',
		'/service/admin/soap/zextras',
		() =>
			HttpResponse.json({
				Body: {
					response: {
						content: JSON.stringify({
							ok: true,
							response: { values: [] },
						}),
					},
				},
			}),
	);
}

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

describe('BackupConfiguration', () => {
	let queryClient: ReturnType<typeof getQueryClient>;

	beforeEach(async () => {
		queryClient = getQueryClient();
		await grantUserConfigRights(queryClient);
		queryClient.setQueryData(
			['subscription', 'license'],
			buildLicenseData([
				{ name: 'backup_basic', quantity: '1', enabled: true },
			]),
		);
		queryClient.setQueryData(['all-servers'], [
			{ name: SERVER_NAME, id: SERVER_ID },
		]);
	});

	afterEach(() => {
		resetMockWorker();
	});

	describe('Rendering', () => {
		it('should render the backup configuration title with server name', async () => {
			mockGetAllServers();
			mockGetServerConfig();
			mockZextrasListBuckets();

			await setupBrowserTest(<BackupConfigurationWithRoute />, {
				queryClient,
				initialRouterEntry: `/${SERVER_NAME}/configuration_lbl`,
			});

			await expect
				.element(page.getByText(`${SERVER_NAME} backup configuration`))
				.toBeVisible();
		});

		it('should render General section', async () => {
			mockGetAllServers();
			mockGetServerConfig();
			mockZextrasListBuckets();

			await setupBrowserTest(<BackupConfigurationWithRoute />, {
				queryClient,
				initialRouterEntry: `/${SERVER_NAME}/configuration_lbl`,
			});

			await expect
				.element(page.getByText('General', { exact: true }))
				.toBeVisible();
		});

		it('should render SmartScan Configuration section', async () => {
			mockGetAllServers();
			mockGetServerConfig();
			mockZextrasListBuckets();

			await setupBrowserTest(<BackupConfigurationWithRoute />, {
				queryClient,
				initialRouterEntry: `/${SERVER_NAME}/configuration_lbl`,
			});

			await expect
				.element(page.getByText('SmartScan Configuration'))
				.toBeVisible();
		});

		it('should render Data Retention Policies section', async () => {
			mockGetAllServers();
			mockGetServerConfig();
			mockZextrasListBuckets();

			await setupBrowserTest(<BackupConfigurationWithRoute />, {
				queryClient,
				initialRouterEntry: `/${SERVER_NAME}/configuration_lbl`,
			});

			await expect
				.element(page.getByText('Data Retention Policies'))
				.toBeVisible();
		});
	});

	describe('Service status', () => {
		it('should show "stopped" when backup service is not running', async () => {
			mockGetAllServers();
			mockGetServerConfig();
			mockZextrasListBuckets();

			await setupBrowserTest(<BackupConfigurationWithRoute />, {
				queryClient,
				initialRouterEntry: `/${SERVER_NAME}/configuration_lbl`,
			});

			await expect
				.element(page.getByText('The service is'))
				.toBeVisible();
			await expect
				.element(page.getByText('stopped'))
				.toBeVisible();
		});

		it('should show "running" when backup service is active', async () => {
			mockGetAllServers();
			mockGetServerConfig({
				...buildServerConfigResponse(),
				services: { module: { running: true } },
				properties: { backup_initialized: true },
			});
			mockZextrasListBuckets();

			await setupBrowserTest(<BackupConfigurationWithRoute />, {
				queryClient,
				initialRouterEntry: `/${SERVER_NAME}/configuration_lbl`,
			});

			await expect
				.element(page.getByText('running'))
				.toBeVisible();
		});

		it('should show "Start service" button when service is stopped', async () => {
			mockGetAllServers();
			mockGetServerConfig();
			mockZextrasListBuckets();

			await setupBrowserTest(<BackupConfigurationWithRoute />, {
				queryClient,
				initialRouterEntry: `/${SERVER_NAME}/configuration_lbl`,
			});

			await expect
				.element(page.getByRole('button', { name: 'Start service' }))
				.toBeVisible();
		});

		it('should show "Stop service" button when service is running', async () => {
			mockGetAllServers();
			mockGetServerConfig({
				...buildServerConfigResponse(),
				services: { module: { running: true } },
				properties: { backup_initialized: true },
			});
			mockZextrasListBuckets();

			await setupBrowserTest(<BackupConfigurationWithRoute />, {
				queryClient,
				initialRouterEntry: `/${SERVER_NAME}/configuration_lbl`,
			});

			await expect
				.element(page.getByRole('button', { name: 'Stop service' }))
				.toBeVisible();
		});
	});

	describe('Switches', () => {
		it('should render the "Backup is enabled at startup" switch', async () => {
			mockGetAllServers();
			mockGetServerConfig();
			mockZextrasListBuckets();

			await setupBrowserTest(<BackupConfigurationWithRoute />, {
				queryClient,
				initialRouterEntry: `/${SERVER_NAME}/configuration_lbl`,
			});

			await expect
				.element(page.getByText('Backup is enabled at startup'))
				.toBeVisible();
		});

		it('should render the "Run the Smartscan at startup" switch', async () => {
			mockGetAllServers();
			mockGetServerConfig();
			mockZextrasListBuckets();

			await setupBrowserTest(<BackupConfigurationWithRoute />, {
				queryClient,
				initialRouterEntry: `/${SERVER_NAME}/configuration_lbl`,
			});

			await expect
				.element(page.getByText('Run the Smartscan at startup'))
				.toBeVisible();
		});

		it('should render "Enable RealTime Scanner" when realtime feature is licensed', async () => {
			mockGetAllServers();
			mockGetServerConfig();
			mockZextrasListBuckets();

			queryClient.setQueryData(
				['subscription', 'license'],
				buildLicenseData([
					{ name: 'backup_basic', quantity: '1', enabled: true },
					{ name: 'backup_realtime', quantity: '1', enabled: true },
				]),
			);

			await setupBrowserTest(<BackupConfigurationWithRoute />, {
				queryClient,
				initialRouterEntry: `/${SERVER_NAME}/configuration_lbl`,
			});

			await expect
				.element(page.getByText('Enable RealTime Scanner'))
				.toBeVisible();
		});

		it('should not render "Enable RealTime Scanner" when realtime feature is not licensed', async () => {
			mockGetAllServers();
			mockGetServerConfig();
			mockZextrasListBuckets();

			await setupBrowserTest(<BackupConfigurationWithRoute />, {
				queryClient,
				initialRouterEntry: `/${SERVER_NAME}/configuration_lbl`,
			});

			expect(
				page.getByText('Enable RealTime Scanner').elements(),
			).toHaveLength(0);
		});
	});

	describe('Initialize Backup', () => {
		it('should render the "Initialize Backup" button', async () => {
			mockGetAllServers();
			mockGetServerConfig();
			mockZextrasListBuckets();

			await setupBrowserTest(<BackupConfigurationWithRoute />, {
				queryClient,
				initialRouterEntry: `/${SERVER_NAME}/configuration_lbl`,
			});

			await expect
				.element(page.getByRole('button', { name: 'Initialize Backup' }))
				.toBeVisible();
		});

		it('should disable "Initialize Backup" button when backup is already initialized', async () => {
			mockGetAllServers();
			mockGetServerConfig({
				...buildServerConfigResponse(),
				properties: { backup_initialized: true },
			});
			mockZextrasListBuckets();

			await setupBrowserTest(<BackupConfigurationWithRoute />, {
				queryClient,
				initialRouterEntry: `/${SERVER_NAME}/configuration_lbl`,
			});

			await expect
				.element(page.getByRole('button', { name: 'Initialize Backup' }))
				.toBeDisabled();
		});
	});

	describe('SmartScan', () => {
		it('should render "Schedule Smartscan" switch', async () => {
			mockGetAllServers();
			mockGetServerConfig();
			mockZextrasListBuckets();

			await setupBrowserTest(<BackupConfigurationWithRoute />, {
				queryClient,
				initialRouterEntry: `/${SERVER_NAME}/configuration_lbl`,
			});

			await expect
				.element(page.getByText('Schedule Smartscan'))
				.toBeVisible();
		});

		it('should render "Force start smartscan now" button', async () => {
			mockGetAllServers();
			mockGetServerConfig();
			mockZextrasListBuckets();

			await setupBrowserTest(<BackupConfigurationWithRoute />, {
				queryClient,
				initialRouterEntry: `/${SERVER_NAME}/configuration_lbl`,
			});

			await expect
				.element(
					page.getByRole('button', { name: 'Force start smartscan now' }),
				)
				.toBeVisible();
		});

		it('should disable "Force start smartscan now" when backup is not initialized', async () => {
			mockGetAllServers();
			mockGetServerConfig();
			mockZextrasListBuckets();

			await setupBrowserTest(<BackupConfigurationWithRoute />, {
				queryClient,
				initialRouterEntry: `/${SERVER_NAME}/configuration_lbl`,
			});

			await expect
				.element(
					page.getByRole('button', { name: 'Force start smartscan now' }),
				)
				.toBeDisabled();
		});
	});

	describe('Data Retention', () => {
		it('should render "Schedule automatic retention policies" switch', async () => {
			mockGetAllServers();
			mockGetServerConfig();
			mockZextrasListBuckets();

			await setupBrowserTest(<BackupConfigurationWithRoute />, {
				queryClient,
				initialRouterEntry: `/${SERVER_NAME}/configuration_lbl`,
			});

			await expect
				.element(page.getByText('Schedule automatic retention policies'))
				.toBeVisible();
		});

		it('should render "Force backup purge now" button', async () => {
			mockGetAllServers();
			mockGetServerConfig();
			mockZextrasListBuckets();

			await setupBrowserTest(<BackupConfigurationWithRoute />, {
				queryClient,
				initialRouterEntry: `/${SERVER_NAME}/configuration_lbl`,
			});

			await expect
				.element(
					page.getByRole('button', { name: 'Force backup purge now' }),
				)
				.toBeVisible();
		});

		it('should disable "Force backup purge now" when backup is not initialized', async () => {
			mockGetAllServers();
			mockGetServerConfig();
			mockZextrasListBuckets();

			await setupBrowserTest(<BackupConfigurationWithRoute />, {
				queryClient,
				initialRouterEntry: `/${SERVER_NAME}/configuration_lbl`,
			});

			await expect
				.element(
					page.getByRole('button', { name: 'Force backup purge now' }),
				)
				.toBeDisabled();
		});
	});

	describe('External Volume', () => {
		it('should render "Set external volume" button when no archiving store exists', async () => {
			mockGetAllServers();
			mockGetServerConfig();
			mockZextrasListBuckets();

			await setupBrowserTest(<BackupConfigurationWithRoute />, {
				queryClient,
				initialRouterEntry: `/${SERVER_NAME}/configuration_lbl`,
			});

			await expect
				.element(
					page.getByRole('button', { name: 'Set external volume' }),
				)
				.toBeVisible();
		});

		it('should disable "Set external volume" when backup is not initialized', async () => {
			mockGetAllServers();
			mockGetServerConfig();
			mockZextrasListBuckets();

			await setupBrowserTest(<BackupConfigurationWithRoute />, {
				queryClient,
				initialRouterEntry: `/${SERVER_NAME}/configuration_lbl`,
			});

			await expect
				.element(
					page.getByRole('button', { name: 'Set external volume' }),
				)
				.toBeDisabled();
		});

		it('should render "Manage external volume" when archiving store exists', async () => {
			mockGetAllServers();
			mockGetServerConfig({
				...buildServerConfigResponse(),
				attributes: {
					...buildServerConfigResponse().attributes,
					backupArchivingStore: {
						value: {
							type: 'S3',
							bucketConfigurationId: 'bucket-1',
						},
					},
				},
				properties: { backup_initialized: true },
			});
			mockZextrasListBuckets();

			await setupBrowserTest(<BackupConfigurationWithRoute />, {
				queryClient,
				initialRouterEntry: `/${SERVER_NAME}/configuration_lbl`,
			});

			await expect
				.element(
					page.getByRole('button', { name: 'Manage external volume' }),
				)
				.toBeVisible();
		});
	});

	describe('Dirty state', () => {
		it('should not show Save and Cancel buttons initially', async () => {
			mockGetAllServers();
			mockGetServerConfig();
			mockZextrasListBuckets();

			await setupBrowserTest(<BackupConfigurationWithRoute />, {
				queryClient,
				initialRouterEntry: `/${SERVER_NAME}/configuration_lbl`,
			});

			await expect
				.element(page.getByText('General', { exact: true }))
				.toBeVisible();

			expect(page.getByRole('button', { name: 'Save' }).elements()).toHaveLength(0);
			expect(page.getByRole('button', { name: 'Cancel' }).elements()).toHaveLength(0);
		});

		it('should show Save and Cancel buttons when a switch is toggled', async () => {
			mockGetAllServers();
			mockGetServerConfig(
				buildRunningServerConfig(),
			);
			mockZextrasListBuckets();

			await setupBrowserTest(<BackupConfigurationWithRoute />, {
				queryClient,
				initialRouterEntry: `/${SERVER_NAME}/configuration_lbl`,
			});

			await expect
				.element(page.getByText('Backup is enabled at startup'))
				.toBeVisible();

			await page.getByText('Backup is enabled at startup').click();

			await expect
				.element(page.getByRole('button', { name: 'Save' }))
				.toBeVisible();
			await expect
				.element(page.getByRole('button', { name: 'Cancel' }))
				.toBeVisible();
		});
	});
});

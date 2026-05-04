/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	advancedSupportedApiForBrowser,
	createBrowserSoapAPIInterceptor,
	setupBrowserTest,
	worker,
} from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { useBucketVolumeStore } from '../../../../../store/bucket-volume/store';
import { VolumeContext } from '../create-volume/volume-context';
import VolumesDetailPanel from '../volumes-list';

const SERVER_NAME = 'mailstore1.test.com';
const SERVER_ID = 'server-1';

const PRIMARIES = [
	{
		id: 1,
		name: 'message1',
		rootpath: '/opt/zextras/store',
		path: '/opt/zextras/store',
		type: 1,
		isCurrent: true,
		compressed: true,
		compressionThreshold: 4096,
		storeType: 'LOCAL',
	},
];

const SECONDARIES = [
	{
		id: 3,
		name: 'secondary-vol',
		rootpath: '/opt/zextras/secondary',
		path: '/opt/zextras/secondary',
		type: 2,
		isCurrent: false,
		compressed: false,
		compressionThreshold: 4096,
		storeType: 'LOCAL',
	},
];

const INDEXES = [
	{
		id: 2,
		name: 'index1',
		rootpath: '/opt/zextras/index',
		path: '/opt/zextras/index',
		type: 10,
		isCurrent: true,
		compressed: false,
		storeType: 'LOCAL',
	},
];

function setupAllServersInterceptor(): Promise<unknown> {
	return createBrowserSoapAPIInterceptor('GetAllServers', {
		server: [
			{
				id: SERVER_ID,
				name: SERVER_NAME,
				a: [{ n: 'zimbraServiceHostname', _content: SERVER_NAME }],
			},
		],
	});
}

function setupGetAllVolumesCE(): void {
	createBrowserSoapAPIInterceptor('GetAllVolumes', {
		volume: [...PRIMARIES, ...INDEXES],
		_jsns: 'urn:zimbraAdmin',
	});
}

function setupGetAllVolumesAdvanced(
	primaries = PRIMARIES,
	secondaries = SECONDARIES,
	indexes = INDEXES,
): void {
	worker.use(
		http.post('/service/admin/soap/zextras', async ({ request }) => {
			const body = (await request.json()) as any;
			const zextrasBody = body?.Body?.zextras;

			if (zextrasBody?.action === 'getAllVolumes') {
				const responseObj: Record<string, any> = {};
				responseObj[SERVER_NAME] = {
					ok: true,
					response: { primaries, secondaries, indexes },
				};
				return HttpResponse.json({
					Body: {
						response: {
							content: JSON.stringify({
								ok: true,
								response: responseObj,
							}),
						},
					},
				});
			}
			return HttpResponse.json({ Body: {} });
		}),
	);
}

function setupEmptyVolumesCE(): void {
	createBrowserSoapAPIInterceptor('GetAllVolumes', {
		volume: [],
		_jsns: 'urn:zimbraAdmin',
	});
}

function setupEmptyVolumesAdvanced(): void {
	worker.use(
		http.post('/service/admin/soap/zextras', async ({ request }) => {
			const body = (await request.json()) as any;
			const zextrasBody = body?.Body?.zextras;

			if (zextrasBody?.action === 'getAllVolumes') {
				const responseObj: Record<string, any> = {};
				responseObj[SERVER_NAME] = {
					ok: true,
					response: { primaries: [], secondaries: [], indexes: [] },
				};
				return HttpResponse.json({
					Body: {
						response: {
							content: JSON.stringify({
								ok: true,
								response: responseObj,
							}),
						},
					},
				});
			}
			return HttpResponse.json({ Body: {} });
		}),
	);
}

function renderWithContext(): React.ReactElement {
	const volumeContext = {
		volumeDetail: {
			id: '',
			volumeName: '',
			volumeMain: 1,
			path: '',
			isCurrent: false,
			isCompression: false,
			compressionThreshold: 0,
			volumeAllocation: 0,
		},
		setVolumeDetail: (): void => { },
	};

	return (
		<VolumeContext.Provider value={volumeContext}>
			<VolumesDetailPanel />
		</VolumeContext.Provider>
	);
}

describe('VolumesDetailPanel (browser)', () => {
	beforeEach(() => {
		useBucketVolumeStore.setState({
			selectedServerName: SERVER_NAME,
			isVolumeAllDetail: [],
		});
	});

	afterEach(() => {
		useBucketVolumeStore.setState({
			selectedServerName: '',
			isVolumeAllDetail: [],
		});
	});

	describe('CE mode', () => {
		beforeEach(async () => {
			await advancedSupportedApiForBrowser.withAdvancedNotSupported();
		});

		describe('Rendering', () => {
			it('should render the server name in the title', async () => {
				setupAllServersInterceptor();
				setupGetAllVolumesCE();
				await setupBrowserTest(renderWithContext(), {
					initialRouterEntry: `/${SERVER_NAME}/data_volumes`,
				});
				await expect
					.element(page.getByText(`${SERVER_NAME} Volumes`, { exact: true }))
					.toBeVisible();
			});

			it('should render the NEW VOLUME button', async () => {
				setupAllServersInterceptor();
				setupGetAllVolumesCE();
				await setupBrowserTest(renderWithContext(), {
					initialRouterEntry: `/${SERVER_NAME}/data_volumes`,
				});
				await expect
					.element(page.getByRole('button', { name: /new volume/i }))
					.toBeVisible();
			});

			it('should render the Primary section label', async () => {
				setupAllServersInterceptor();
				setupGetAllVolumesCE();
				await setupBrowserTest(renderWithContext(), {
					initialRouterEntry: `/${SERVER_NAME}/data_volumes`,
				});
				await expect
					.element(page.getByText('Primary', { exact: true }).first())
					.toBeVisible();
			});

			it('should render the Indexer section label', async () => {
				setupAllServersInterceptor();
				setupGetAllVolumesCE();
				await setupBrowserTest(renderWithContext(), {
					initialRouterEntry: `/${SERVER_NAME}/data_volumes`,
				});
				await expect
					.element(page.getByText('Indexer', { exact: true }).first())
					.toBeVisible();
			});

			it('should not render the Secondary section in CE mode', async () => {
				setupAllServersInterceptor();
				setupGetAllVolumesCE();
				await setupBrowserTest(renderWithContext(), {
					initialRouterEntry: `/${SERVER_NAME}/data_volumes`,
				});
				await expect
					.element(page.getByText('Primary', { exact: true }).first())
					.toBeVisible();
				expect(
					page.getByText('Secondary', { exact: true }).elements(),
				).toHaveLength(0);
			});
		});

		describe('Table headers', () => {
			it('should render volume table headers without Storage Type', async () => {
				setupAllServersInterceptor();
				setupGetAllVolumesCE();
				await setupBrowserTest(renderWithContext(), {
					initialRouterEntry: `/${SERVER_NAME}/data_volumes`,
				});
				await expect
					.element(page.getByText('ID', { exact: true }).first())
					.toBeInTheDocument();
				await expect
					.element(page.getByText('Name', { exact: true }).first())
					.toBeInTheDocument();
				await expect
					.element(page.getByText('Path', { exact: true }).first())
					.toBeInTheDocument();
				await expect
					.element(page.getByText('Current', { exact: true }).first())
					.toBeInTheDocument();
				await expect
					.element(page.getByText('Compression', { exact: true }).first())
					.toBeInTheDocument();
				expect(
					page.getByText('Storage Type', { exact: true }).elements(),
				).toHaveLength(0);
			});
		});

		describe('Empty state', () => {
			it('should show Empty Table message when no volumes exist', async () => {
				setupAllServersInterceptor();
				setupEmptyVolumesCE();
				await setupBrowserTest(renderWithContext(), {
					initialRouterEntry: `/${SERVER_NAME}/data_volumes`,
				});
				const emptyMessages = page.getByText('Empty Table');
				await expect.element(emptyMessages.first()).toBeInTheDocument();
			});
		});
	});

	describe('Advanced mode', () => {
		beforeEach(async () => {
			await advancedSupportedApiForBrowser.withAdvancedSupported();
		});

		describe('Rendering', () => {
			it('should render the Secondary section in advanced mode', async () => {
				setupAllServersInterceptor();
				setupGetAllVolumesAdvanced();
				await setupBrowserTest(renderWithContext(), {
					initialRouterEntry: `/${SERVER_NAME}/data_volumes`,
				});
				await expect
					.element(page.getByText('Secondary', { exact: true }).first())
					.toBeVisible();
			});

			it('should render all three sections: Primary, Secondary, Indexer', async () => {
				setupAllServersInterceptor();
				setupGetAllVolumesAdvanced();
				await setupBrowserTest(renderWithContext(), {
					initialRouterEntry: `/${SERVER_NAME}/data_volumes`,
				});
				await expect
					.element(page.getByText('Primary', { exact: true }).first())
					.toBeVisible();
				await expect
					.element(page.getByText('Secondary', { exact: true }).first())
					.toBeVisible();
				await expect
					.element(page.getByText('Indexer', { exact: true }).first())
					.toBeVisible();
			});
		});

		describe('Table headers', () => {
			it('should render Storage Type column in advanced mode', async () => {
				setupAllServersInterceptor();
				setupGetAllVolumesAdvanced();
				await setupBrowserTest(renderWithContext(), {
					initialRouterEntry: `/${SERVER_NAME}/data_volumes`,
				});
				await expect
					.element(page.getByText('Storage Type', { exact: true }).first())
					.toBeInTheDocument();
			});
		});

		describe('Empty state', () => {
			it('should show Empty Table when no volumes exist in advanced mode', async () => {
				setupAllServersInterceptor();
				setupEmptyVolumesAdvanced();
				await setupBrowserTest(renderWithContext(), {
					initialRouterEntry: `/${SERVER_NAME}/data_volumes`,
				});
				const emptyMessages = page.getByText('Empty Table');
				await expect.element(emptyMessages.first()).toBeInTheDocument();
			});
		});
	});
});

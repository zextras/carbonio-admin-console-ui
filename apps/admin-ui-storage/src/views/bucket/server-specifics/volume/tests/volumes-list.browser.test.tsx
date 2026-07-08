/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	advancedSupportedApiForBrowser,
	createBrowserSoapAPIInterceptor,
	createBrowserZextrasActionInterceptor,
	getQueryClient,
	setupBrowserTest,
	worker,
} from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import React from 'react';
import { Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { DATA_VOLUMES } from '../../../../../constants';
import { VolumeContext } from '../create-volume/volume-context';
import VolumesDetailPanel from '../volumes-list';

const SERVER_NAME = 'mailstore1.test.com';
const SERVER_ID = 'server-1';

const PRIMARIES = [
	{
		id: 1,
		name: 'message1',
		path: '/opt/zextras/store',
		compressed: true,
		threshold: 4096,
		totalSpace: 36846,
		availableSpace: 19308,
		storeType: 'LOCAL',
		isCurrent: true,
		type: 1,
		volumeType: 'primary',
	},
];

const SECONDARIES = [
	{
		id: 3,
		name: 'secondary-vol',
		path: '/opt/zextras/secondary',
		compressed: false,
		threshold: 4096,
		totalSpace: 36846,
		availableSpace: 19308,
		storeType: 'LOCAL',
		isCurrent: false,
		type: 2,
		volumeType: 'secondary',
	},
];

const INDEXES = [
	{
		id: 2,
		name: 'index1',
		path: '/opt/zextras/index',
		compressed: false,
		threshold: 4096,
		totalSpace: 36846,
		availableSpace: 19308,
		storeType: 'LOCAL',
		isCurrent: true,
		type: 10,
		volumeType: 'index',
	},
];

function buildAdvancedVolumesSoapContent(
	primaries: Array<Record<string, unknown>> = PRIMARIES,
	secondaries: Array<Record<string, unknown>> = SECONDARIES,
	indexes: Array<Record<string, unknown>> = INDEXES,
): string {
	return JSON.stringify({
		ok: true,
		response: {
			[SERVER_NAME]: {
				ok: true,
				response: { primaries, secondaries, indexes },
			},
		},
	});
}

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
	primaries: Array<Record<string, unknown>> = PRIMARIES,
	secondaries: Array<Record<string, unknown>> = SECONDARIES,
	indexes: Array<Record<string, unknown>> = INDEXES,
): void {
	worker.use(
		http.post('/service/admin/soap/zextras', async ({ request }) => {
			const body = (await request.json()) as any;
			const zextrasBody = body?.Body?.zextras;

			if (zextrasBody?.action === 'getAllVolumes') {
				return HttpResponse.json({
					Body: {
						response: {
							content: buildAdvancedVolumesSoapContent(primaries, secondaries, indexes),
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
				return HttpResponse.json({
					Body: {
						response: {
							content: buildAdvancedVolumesSoapContent([], [], []),
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
		<Routes>
			<Route
				path={`/:server/${DATA_VOLUMES}`}
				element={
					<VolumeContext.Provider value={volumeContext}>
						<VolumesDetailPanel />
					</VolumeContext.Provider>
				}
			/>
		</Routes>
	);
}

describe('VolumesDetailPanel (browser)', () => {
	beforeEach(() => {
		createBrowserZextrasActionInterceptor('listS3Connector', () =>
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

		describe('mapAdvancedVolume field mapping', () => {
			function createPreSeededQueryClient() {
				const qc = getQueryClient();
				qc.setQueryData(['all-servers'], [
					{
						id: SERVER_ID,
						name: SERVER_NAME,
						a: [{ n: 'zimbraServiceHostname', _content: SERVER_NAME }],
					},
				]);
				return qc;
			}

			it('should map volumeType "primary" to type 1 and display volume data', async () => {
				setupGetAllVolumesAdvanced([
					{
						id: 5,
						name: 'primary-s3',
						path: '/opt/zextras/primary-store',
						compressed: true,
						threshold: 2048,
						storeType: 'LOCAL',
						isCurrent: true,
						volumeType: 'primary',
					},
				]);
				await setupBrowserTest(renderWithContext(), {
					initialRouterEntry: `/${SERVER_NAME}/data_volumes`,
					queryClient: createPreSeededQueryClient(),
				});
				await expect
					.element(page.getByText('primary-s3', { exact: true }))
					.toBeVisible();
				await expect
					.element(page.getByText('/opt/zextras/primary-store', { exact: true }))
					.toBeVisible();
			});

			it('should map volumeType "secondary" to type 2 and display in secondary table', async () => {
				setupGetAllVolumesAdvanced(
					[],
					[
						{
							id: 6,
							name: 'sec-vol-mapped',
							path: '/opt/zextras/sec-path',
							compressed: false,
							threshold: 4096,
							storeType: 'LOCAL',
							isCurrent: false,
							volumeType: 'secondary',
						},
					],
				);
				await setupBrowserTest(renderWithContext(), {
					initialRouterEntry: `/${SERVER_NAME}/data_volumes`,
					queryClient: createPreSeededQueryClient(),
				});
				await expect
					.element(page.getByText('sec-vol-mapped', { exact: true }))
					.toBeVisible();
				await expect
					.element(page.getByText('/opt/zextras/sec-path', { exact: true }))
					.toBeVisible();
			});

			it('should map volumeType "index" to type 10 and display in indexer table', async () => {
				setupGetAllVolumesAdvanced(
					[],
					[],
					[
						{
							id: 7,
							name: 'idx-vol-mapped',
							path: '/opt/zextras/idx-path',
							compressed: false,
							threshold: 4096,
							storeType: 'LOCAL',
							isCurrent: true,
							volumeType: 'index',
						},
					],
				);
				await setupBrowserTest(renderWithContext(), {
					initialRouterEntry: `/${SERVER_NAME}/data_volumes`,
					queryClient: createPreSeededQueryClient(),
				});
				await expect
					.element(page.getByText('idx-vol-mapped', { exact: true }))
					.toBeVisible();
				await expect
					.element(page.getByText('/opt/zextras/idx-path', { exact: true }))
					.toBeVisible();
			});

			it('should map S3 volume with uuid to bucketConfigurationId', async () => {
				setupGetAllVolumesAdvanced([
					{
						id: 8,
						name: 'minio-vol',
						compressed: true,
						uuid: '2c371853-3dd4-4826-a071-592963977172',
						useInfrequentAccess: false,
						infrequentAccessThreshold: 65536,
						useIntelligentTiering: false,
						volumePrefix: '',
						centralized: false,
						storeType: 'S3',
						isDrivePrimary: true,
						isCurrent: true,
						volumeType: 'primary',
					},
				]);
				await setupBrowserTest(renderWithContext(), {
					initialRouterEntry: `/${SERVER_NAME}/data_volumes`,
					queryClient: createPreSeededQueryClient(),
				});
				await expect
					.element(page.getByText('minio-vol', { exact: true }))
					.toBeVisible();
			});

			it('should display isCurrent as Yes when volume is current', async () => {
				setupGetAllVolumesAdvanced([
					{
						id: 1,
						name: 'current-vol',
						path: '/opt/store',
						compressed: true,
						threshold: 4096,
						storeType: 'LOCAL',
						isCurrent: true,
						volumeType: 'primary',
					},
				]);
				await setupBrowserTest(renderWithContext(), {
					initialRouterEntry: `/${SERVER_NAME}/data_volumes`,
					queryClient: createPreSeededQueryClient(),
				});
				await expect
				.element(page.getByText('YES', { exact: true }).first())
					.toBeVisible();
			});

			it('should display isCurrent as No when volume is not current', async () => {
				setupGetAllVolumesAdvanced([
					{
						id: 1,
						name: 'not-current-vol',
						path: '/opt/store',
						compressed: false,
						threshold: 4096,
						storeType: 'LOCAL',
						isCurrent: false,
						volumeType: 'primary',
					},
				]);
				await setupBrowserTest(renderWithContext(), {
					initialRouterEntry: `/${SERVER_NAME}/data_volumes`,
					queryClient: createPreSeededQueryClient(),
				});
				await expect
					.element(page.getByText('No', { exact: true }).first())
					.toBeVisible();
			});

			it('should display Local Block Device for LOCAL storeType', async () => {
				setupGetAllVolumesAdvanced([
					{
						id: 1,
						name: 'local-vol',
						path: '/opt/store',
						compressed: false,
						threshold: 4096,
						storeType: 'LOCAL',
						isCurrent: true,
						volumeType: 'primary',
					},
				]);
				await setupBrowserTest(renderWithContext(), {
					initialRouterEntry: `/${SERVER_NAME}/data_volumes`,
					queryClient: createPreSeededQueryClient(),
				});
				await expect
					.element(page.getByText('Local Block Device', { exact: true }).first())
					.toBeVisible();
			});

			it('should display Object Storage for S3 storeType', async () => {
				setupGetAllVolumesAdvanced([
					{
						id: 1,
						name: 's3-vol',
						compressed: true,
						uuid: 'some-uuid',
						storeType: 'S3',
						isCurrent: true,
						volumeType: 'primary',
					},
				]);
				await setupBrowserTest(renderWithContext(), {
					initialRouterEntry: `/${SERVER_NAME}/data_volumes`,
					queryClient: createPreSeededQueryClient(),
				});
				await expect
					.element(page.getByText('Object Storage', { exact: true }).first())
					.toBeVisible();
			});
		});
	});
});

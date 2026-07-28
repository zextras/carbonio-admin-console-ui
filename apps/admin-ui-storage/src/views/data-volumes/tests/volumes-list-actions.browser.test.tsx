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
import React, { useEffect, useRef } from 'react';
import { Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { DATA_VOLUMES } from '../../../constants';
import { VolumesDetailPanel } from '../volumes-list';

vi.mock('../../s3-connectors/parts/verify/verify-progress', () => ({
	VerifyProgress: ({
		isPending,
		onComplete,
	}: {
		isPending: boolean;
		onComplete?: () => void;
	}) => {
		const wasPending = useRef(isPending);

		useEffect(() => {
			if (wasPending.current && !isPending) {
				onComplete?.();
			}
			wasPending.current = isPending;
		}, [isPending, onComplete]);

		return <div>{isPending ? 'verify-pending' : 'verify-idle'}</div>;
	},
}));

vi.mock('../create-volume/new-volume', () => ({
	NewVolume: ({
		CreateVolumeRequest,
		setToggleWizardLocal,
	}: {
		CreateVolumeRequest: (attr: Record<string, unknown>) => void;
		setToggleWizardLocal: (open: boolean) => void;
	}) => (
		<div>
			<span>new-volume-wizard</span>
			<button
				type="button"
				onClick={(): void => {
					CreateVolumeRequest({
						id: 1,
						name: 'created-vol',
						rootpath: '/opt/zextras/created',
						type: 1,
						compressBlobs: 0,
						compressionThreshold: 0,
						isCurrent: 0,
					});
				}}
			>
				trigger-ce-create-success
			</button>
			<button
				type="button"
				onClick={(): void => {
					CreateVolumeRequest({
						id: 1,
						name: 'fail-vol',
						rootpath: '/opt/zextras/fail',
						type: 1,
						compressBlobs: 0,
						compressionThreshold: 0,
						isCurrent: 0,
					});
				}}
			>
				trigger-ce-create-error
			</button>
			<button type="button" onClick={(): void => setToggleWizardLocal(false)}>
				close-new-volume
			</button>
		</div>
	),
}));

vi.mock('../create-volume/advanced-create-volume/create-mailstores-volume', () => ({
	CreateMailstoresVolume: ({
		CreateAdvancedRequest,
		CreateVolumeRequest,
		setToggleWizardExternal,
	}: {
		CreateAdvancedRequest: (attr: Record<string, unknown>) => void;
		CreateVolumeRequest: (attr: Record<string, unknown>) => void;
		setToggleWizardExternal: (open: boolean) => void;
	}) => (
		<div>
			<span>advanced-volume-wizard</span>
			<button
				type="button"
				onClick={(): void => {
					CreateAdvancedRequest({
						volumeName: 'adv-created',
						volumeType: 'primary',
						storeType: 'LOCAL',
						isCurrent: 0,
						bucketConfigurationId: '',
					});
				}}
			>
				trigger-advanced-create-success
			</button>
			<button
				type="button"
				onClick={(): void => {
					CreateAdvancedRequest({
						volumeName: 'adv-fail',
						volumeType: 'primary',
						storeType: 'LOCAL',
						isCurrent: 0,
						bucketConfigurationId: '',
					});
				}}
			>
				trigger-advanced-create-error
			</button>
			<button
				type="button"
				onClick={(): void => {
					CreateVolumeRequest({
						name: 'adv-local-created',
						rootpath: '/opt/zextras/adv-local',
						type: 1,
						compressBlobs: false,
						compressionThreshold: 4096,
						isCurrent: 0,
					});
				}}
			>
				trigger-advanced-local-create-success
			</button>
			<button type="button" onClick={(): void => setToggleWizardExternal(false)}>
				close-advanced-wizard
			</button>
		</div>
	),
}));

const SERVER_NAME = 'mailstore1.test.com';
const SERVER_ID = 'server-1';

const CURRENT_PRIMARY = {
	id: 1,
	name: 'message1',
	path: '/opt/zextras/store',
	rootpath: '/opt/zextras/store',
	compressed: true,
	compressBlobs: true,
	threshold: 4096,
	compressionThreshold: 4096,
	totalSpace: 36846,
	availableSpace: 19308,
	storeType: 'LOCAL',
	isCurrent: true,
	type: 1,
	volumeType: 'primary',
};

const DELETABLE_PRIMARY = {
	id: 99,
	name: 'deletable-vol',
	path: '/opt/zextras/deletable',
	rootpath: '/opt/zextras/deletable',
	compressed: false,
	compressBlobs: false,
	threshold: 4096,
	compressionThreshold: 4096,
	totalSpace: 36846,
	availableSpace: 19308,
	storeType: 'LOCAL',
	isCurrent: false,
	type: 1,
	volumeType: 'primary',
};

const SECONDARY = {
	id: 3,
	name: 'secondary-vol',
	path: '/opt/zextras/secondary',
	rootpath: '/opt/zextras/secondary',
	compressed: false,
	compressBlobs: false,
	threshold: 4096,
	compressionThreshold: 4096,
	totalSpace: 36846,
	availableSpace: 19308,
	storeType: 'LOCAL',
	isCurrent: false,
	type: 2,
	volumeType: 'secondary',
};

const INDEX = {
	id: 2,
	name: 'index1',
	path: '/opt/zextras/index',
	rootpath: '/opt/zextras/index',
	compressed: false,
	compressBlobs: false,
	threshold: 4096,
	compressionThreshold: 4096,
	totalSpace: 36846,
	availableSpace: 19308,
	storeType: 'LOCAL',
	isCurrent: true,
	type: 10,
	volumeType: 'index',
};

function buildAdvancedVolumesSoapContent(
	primaries: Array<Record<string, unknown>> = [CURRENT_PRIMARY, DELETABLE_PRIMARY],
	secondaries: Array<Record<string, unknown>> = [SECONDARY],
	indexes: Array<Record<string, unknown>> = [INDEX],
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

function setupGetAllVolumesCE(
	volumes: Array<Record<string, unknown>> = [CURRENT_PRIMARY, DELETABLE_PRIMARY, INDEX],
): void {
	createBrowserSoapAPIInterceptor('GetAllVolumes', {
		volume: volumes,
		_jsns: 'urn:zimbraAdmin',
	});
}

function setupGetAllVolumesFaultCE(): void {
	worker.use(
		http.post('/service/admin/soap/GetAllVolumesRequest', () =>
			HttpResponse.json({
				Body: {
					Fault: {
						Reason: { Text: 'Service unavailable' },
					},
				},
			}),
		),
	);
}

function setupGetAllVolumesAdvanced(
	primaries: Array<Record<string, unknown>> = [CURRENT_PRIMARY, DELETABLE_PRIMARY],
	secondaries: Array<Record<string, unknown>> = [SECONDARY],
	indexes: Array<Record<string, unknown>> = [INDEX],
	actionHandlers: Partial<Record<string, () => HttpResponse>> = {},
): void {
	worker.use(
		http.post('/service/admin/soap/zextras', async ({ request }) => {
			const body = (await request.json()) as {
				Body?: { zextras?: { action?: string } };
			};
			const action = body?.Body?.zextras?.action ?? '';

			const customHandler = actionHandlers[action];
			if (customHandler) {
				return customHandler();
			}

			if (action === 'getAllVolumes') {
				return HttpResponse.json({
					Body: {
						response: {
							content: buildAdvancedVolumesSoapContent(primaries, secondaries, indexes),
						},
					},
				});
			}
			if (action === 'listS3Connector') {
				return HttpResponse.json({
					Body: {
						response: {
							content: JSON.stringify({
								ok: true,
								response: { values: [] },
							}),
						},
					},
				});
			}
			if (action === 'getVolume') {
				return HttpResponse.json({
					Body: {
						response: {
							content: JSON.stringify({
								ok: true,
								response: {
									[SERVER_NAME]: {
										ok: true,
										response: DELETABLE_PRIMARY,
									},
								},
							}),
						},
					},
				});
			}
			if (action === 'doCreateVolume') {
				return HttpResponse.json({
					Body: {
						response: {
							content: JSON.stringify({
								ok: true,
								response: {
									[SERVER_NAME]: { ok: true },
								},
							}),
						},
					},
				});
			}
			return HttpResponse.json({ Body: {} });
		}),
	);
}

async function confirmDeleteInModal(): Promise<void> {
	await expect
		.element(page.getByText(/Delete .+ \?/, { exact: false }).first())
		.toBeVisible();
	await page.getByRole('button', { name: 'DELETE', exact: true }).click();
}

function createPreSeededQueryClient() {
	const qc = getQueryClient();
	qc.setQueryData(
		['all-servers'],
		[
			{
				id: SERVER_ID,
				name: SERVER_NAME,
				a: [{ n: 'zimbraServiceHostname', _content: SERVER_NAME }],
			},
		],
	);
	return qc;
}

function renderWithContext(): React.ReactElement {
	return (
		<Routes>
			<Route path={`/:server/${DATA_VOLUMES}`} element={<VolumesDetailPanel />} />
		</Routes>
	);
}

describe('VolumesDetailPanel actions (browser)', () => {
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
			setupAllServersInterceptor();
			setupGetAllVolumesCE();
		});

		it('should open the local new-volume wizard when clicking NEW VOLUME', async () => {
			await setupBrowserTest(renderWithContext(), {
				initialRouterEntry: `/${SERVER_NAME}/data_volumes`,
			});

			await page.getByRole('button', { name: /new volume/i }).click();

			await expect.element(page.getByText('new-volume-wizard', { exact: true })).toBeVisible();
		});

		it('should open ModifyVolume when clicking a primary volume row', async () => {
			createBrowserSoapAPIInterceptor('GetVolume', {
				volume: [DELETABLE_PRIMARY],
				_jsns: 'urn:zimbraAdmin',
			});

			await setupBrowserTest(renderWithContext(), {
				initialRouterEntry: `/${SERVER_NAME}/data_volumes`,
			});

			await page.getByText('deletable-vol', { exact: true }).click();

			await expect.element(page.getByText('Volume details', { exact: true })).toBeVisible();
		});

		it('should delete a non-current volume and show success snackbar', async () => {
			createBrowserSoapAPIInterceptor('GetVolume', {
				volume: [DELETABLE_PRIMARY],
				_jsns: 'urn:zimbraAdmin',
			});
			createBrowserSoapAPIInterceptor('DeleteVolume', {
				_jsns: 'urn:zimbraAdmin',
			});

			await setupBrowserTest(renderWithContext(), {
				initialRouterEntry: `/${SERVER_NAME}/data_volumes`,
			});

			await page.getByText('deletable-vol', { exact: true }).click();
			await expect.element(page.getByText('Volume details', { exact: true })).toBeVisible();

			await page.getByRole('button', { name: /^delete$/i }).click();
			await confirmDeleteInModal();

			await expect
				.element(page.getByText('Volume deleted successfully', { exact: true }))
				.toBeVisible();
		});

		it('should show an error snackbar when DeleteVolume fails', async () => {
			createBrowserSoapAPIInterceptor('GetVolume', {
				volume: [DELETABLE_PRIMARY],
				_jsns: 'urn:zimbraAdmin',
			});
			worker.use(
				http.post('/service/admin/soap/DeleteVolumeRequest', () =>
					HttpResponse.json({
						Body: {
							Fault: {
								Reason: { Text: 'Delete failed' },
							},
						},
					}),
				),
			);

			await setupBrowserTest(renderWithContext(), {
				initialRouterEntry: `/${SERVER_NAME}/data_volumes`,
			});

			await page.getByText('deletable-vol', { exact: true }).click();
			await page.getByRole('button', { name: /^delete$/i }).click();
			await confirmDeleteInModal();

			await expect
				.element(page.getByText('Something went wrong, please try again').first())
				.toBeVisible();
		});

		it('should create a volume successfully and show success snackbar', async () => {
			createBrowserSoapAPIInterceptor('CreateVolume', {
				volume: [{ id: 10, name: 'created-vol', type: 1 }],
				_jsns: 'urn:zimbraAdmin',
			});

			await setupBrowserTest(renderWithContext(), {
				initialRouterEntry: `/${SERVER_NAME}/data_volumes`,
			});

			await page.getByRole('button', { name: /new volume/i }).click();
			await page.getByRole('button', { name: 'trigger-ce-create-success' }).click();

			await expect
				.element(page.getByText('The volume has been created successfully', { exact: true }))
				.toBeVisible();
		});

		it('should open error details modal from create failure snackbar Details action', async () => {
			worker.use(
				http.post('/service/admin/soap/CreateVolumeRequest', () =>
					HttpResponse.json({
						Body: {
							Fault: {
								Reason: { Text: 'path already exists' },
							},
						},
					}),
				),
			);

			await setupBrowserTest(renderWithContext(), {
				initialRouterEntry: `/${SERVER_NAME}/data_volumes`,
			});

			await page.getByRole('button', { name: /new volume/i }).click();
			await page.getByRole('button', { name: 'trigger-ce-create-error' }).click();

			await expect
				.element(page.getByText('Something went wrong, please try again').first())
				.toBeVisible();

			await page.getByRole('button', { name: 'Details' }).click();

			await expect
				.element(page.getByText('Something went wrong details', { exact: true }))
				.toBeVisible();
		});
	});

	describe('Advanced mode', () => {
		beforeEach(async () => {
			await advancedSupportedApiForBrowser.withAdvancedSupported();
			setupAllServersInterceptor();
			setupGetAllVolumesFaultCE();
			setupGetAllVolumesAdvanced();
		});

		it('should open the advanced create wizard when clicking NEW VOLUME', async () => {
			await setupBrowserTest(renderWithContext(), {
				initialRouterEntry: `/${SERVER_NAME}/data_volumes`,
				queryClient: createPreSeededQueryClient(),
			});

			await page.getByRole('button', { name: /new volume/i }).click();

			await expect
				.element(page.getByText('advanced-volume-wizard', { exact: true }))
				.toBeVisible();
		});

		it('should delete a volume via doDeleteVolume and show success snackbar', async () => {
			setupGetAllVolumesAdvanced(undefined, undefined, undefined, {
				doDeleteVolume: () =>
					HttpResponse.json({
						Body: {
							response: {
								content: JSON.stringify({
									ok: true,
									response: {
										[SERVER_NAME]: { ok: true },
									},
								}),
							},
						},
					}),
			});

			await setupBrowserTest(renderWithContext(), {
				initialRouterEntry: `/${SERVER_NAME}/data_volumes`,
				queryClient: createPreSeededQueryClient(),
			});

			await expect.element(page.getByText('deletable-vol', { exact: true })).toBeVisible();
			await page.getByText('deletable-vol', { exact: true }).click();
			await expect.element(page.getByText('Volume details', { exact: true })).toBeVisible();

			await page.getByRole('button', { name: /^delete$/i }).click();
			await confirmDeleteInModal();

			await expect
				.element(page.getByText('Volume deleted successfully', { exact: true }))
				.toBeVisible();
		});

		it('should show an error snackbar when doDeleteVolume returns not ok', async () => {
			setupGetAllVolumesAdvanced(undefined, undefined, undefined, {
				doDeleteVolume: () =>
					HttpResponse.json({
						Body: {
							response: {
								content: JSON.stringify({
									ok: true,
									response: {
										[SERVER_NAME]: { ok: false },
									},
								}),
							},
						},
					}),
			});

			await setupBrowserTest(renderWithContext(), {
				initialRouterEntry: `/${SERVER_NAME}/data_volumes`,
				queryClient: createPreSeededQueryClient(),
			});

			await expect.element(page.getByText('deletable-vol', { exact: true })).toBeVisible();
			await page.getByText('deletable-vol', { exact: true }).click();
			await page.getByRole('button', { name: /^delete$/i }).click();
			await confirmDeleteInModal();

			await expect
				.element(page.getByText('Something went wrong, please try again').first())
				.toBeVisible();
		});

		it('should create an advanced volume successfully via CreateAdvancedRequest', async () => {
			await setupBrowserTest(renderWithContext(), {
				initialRouterEntry: `/${SERVER_NAME}/data_volumes`,
				queryClient: createPreSeededQueryClient(),
			});

			await page.getByRole('button', { name: /new volume/i }).click();
			await page.getByRole('button', { name: 'trigger-advanced-create-success' }).click();

			await expect
				.element(page.getByText('The volume has been created successfully', { exact: true }))
				.toBeVisible();
		});

		it('should show create error snackbar when CreateAdvancedRequest fails', async () => {
			setupGetAllVolumesAdvanced(undefined, undefined, undefined, {
				doCreateVolume: () =>
					HttpResponse.json({
						Body: {
							response: {
								content: JSON.stringify({
									ok: true,
									response: {
										[SERVER_NAME]: {
											ok: false,
											error: { message: 'bucket missing' },
										},
									},
								}),
							},
						},
					}),
			});

			await setupBrowserTest(renderWithContext(), {
				initialRouterEntry: `/${SERVER_NAME}/data_volumes`,
				queryClient: createPreSeededQueryClient(),
			});

			await page.getByRole('button', { name: /new volume/i }).click();
			await page.getByRole('button', { name: 'trigger-advanced-create-error' }).click();

			await expect
				.element(page.getByText('Something went wrong, please try again').first())
				.toBeVisible();

			await page.getByRole('button', { name: 'Details' }).click();

			await expect
				.element(page.getByText('Something went wrong details', { exact: true }))
				.toBeVisible();
			await expect.element(page.getByText('bucket missing', { exact: true })).toBeVisible();
		});

		it('should create an advanced local volume via CreateVolumeRequest', async () => {
			await setupBrowserTest(renderWithContext(), {
				initialRouterEntry: `/${SERVER_NAME}/data_volumes`,
				queryClient: createPreSeededQueryClient(),
			});

			await page.getByRole('button', { name: /new volume/i }).click();
			await page.getByRole('button', { name: 'trigger-advanced-local-create-success' }).click();

			await expect
				.element(page.getByText('The volume has been created successfully', { exact: true }))
				.toBeVisible();
		});
	});
});

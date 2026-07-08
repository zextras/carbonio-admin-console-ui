/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	advancedSupportedApiForBrowser,
	createBrowserZextrasActionInterceptor,
	setupBrowserTest,
} from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import { Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { Volume } from '../../../../../../../types';
import { DATA_VOLUMES } from '../../../../../../constants';
import ModifyVolume from '../modify-volume';

const SERVER_NAME = 'mailstore1.test.com';
const SERVER_ID = 'server-1';
const VOLUME_ROUTE_ENTRY = `/${SERVER_NAME}/${DATA_VOLUMES}`;

type S3ConnectorEntry = {
	uuid: string;
	label: string;
	bucketName: string;
	storeType: string;
	tieringSupported?: boolean;
	'usage in external backup'?: string;
};

function setupListS3ConnectorInterceptor(connectors: Array<S3ConnectorEntry>) {
	return createBrowserZextrasActionInterceptor('listS3Connector', () =>
		HttpResponse.json({
			Body: {
				response: {
					content: JSON.stringify({
						ok: true,
						response: {
							values: connectors.map((connector) => ({
								...connector,
								id: connector.uuid,
							})),
						},
					}),
				},
			},
		}),
	);
}

const PRIMARY_VOLUME: Volume = {
	id: 5,
	name: 'primary-local',
	path: '/opt/zextras/store',
	type: 1,
	compressBlobs: 'true',
	compressionThreshold: '4096',
	isCurrent: true,
};

const SECONDARY_VOLUME: Volume = {
	id: 6,
	name: 'secondary-local',
	path: '/opt/zextras/secondary',
	type: 2,
	compressBlobs: 'false',
	compressionThreshold: '4096',
	isCurrent: false,
};

const INDEX_VOLUME: Volume = {
	id: 7,
	name: 'index-local',
	path: '/opt/zextras/index',
	type: 10,
	compressBlobs: 'false',
	compressionThreshold: '4096',
	isCurrent: true,
};

const VOLUME_LIST = {
	primaries: [PRIMARY_VOLUME],
	secondaries: [SECONDARY_VOLUME],
	indexes: [INDEX_VOLUME],
};

function renderModifyVolume(
	volumeId: number,
	volumeList = VOLUME_LIST,
	overrides?: Partial<{
		setmodifyVolumeToggle: (v: boolean) => void;
		getAllVolumesRequest: () => void;
		setOpen: (v: boolean) => void;
	}>,
) {
	const setmodifyVolumeToggle = overrides?.setmodifyVolumeToggle ?? vi.fn();
	const getAllVolumesRequest = overrides?.getAllVolumesRequest ?? vi.fn();
	const setOpen = overrides?.setOpen ?? vi.fn();

	return (
		<Routes>
			<Route
				path={`/:server/${DATA_VOLUMES}`}
				element={
					<ModifyVolume
						volumeId={volumeId}
						setmodifyVolumeToggle={setmodifyVolumeToggle}
						getAllVolumesRequest={getAllVolumesRequest}
						selectedServerId={SERVER_ID}
						volumeList={volumeList}
						setOpen={setOpen}
					/>
				}
			/>
		</Routes>
	);
}

describe('ModifyVolume - getVolumeDetailData (advanced mode)', () => {
	describe('advanced mode: loads volume data from volumeList without API call', () => {
		beforeEach(async () => {
			await advancedSupportedApiForBrowser.withAdvancedSupported();
		});

		it('should display primary volume name when volumeId matches a primary volume', async () => {
			await setupBrowserTest(renderModifyVolume(PRIMARY_VOLUME.id as number), {
				initialRouterEntry: VOLUME_ROUTE_ENTRY,
			});
			await expect
				.element(page.getByText(`${PRIMARY_VOLUME.name} Details`, { exact: true }))
				.toBeVisible();
		});

		it('should display secondary volume name when volumeId matches a secondary volume', async () => {
			await setupBrowserTest(renderModifyVolume(SECONDARY_VOLUME.id as number), {
				initialRouterEntry: VOLUME_ROUTE_ENTRY,
			});
			await expect
				.element(page.getByText(`${SECONDARY_VOLUME.name} Details`, { exact: true }))
				.toBeVisible();
		});

		it('should display index volume name when volumeId matches an index volume', async () => {
			await setupBrowserTest(renderModifyVolume(INDEX_VOLUME.id as number), {
				initialRouterEntry: VOLUME_ROUTE_ENTRY,
			});
			await expect
				.element(page.getByText(`${INDEX_VOLUME.name} Details`, { exact: true }))
				.toBeVisible();
		});

		it('should display the volume path for a matched primary volume', async () => {
			await setupBrowserTest(renderModifyVolume(PRIMARY_VOLUME.id as number), {
				initialRouterEntry: VOLUME_ROUTE_ENTRY,
			});
			await expect
				.element(page.getByRole('textbox', { name: /path/i }))
				.toHaveValue(PRIMARY_VOLUME.path as string);
		});

		it('should not call setmodifyVolumeToggle when volumeId does not match any volume', async () => {
			const setmodifyVolumeToggle = vi.fn();
			await setupBrowserTest(
				renderModifyVolume(9999, VOLUME_LIST, { setmodifyVolumeToggle }),
				{ initialRouterEntry: VOLUME_ROUTE_ENTRY },
			);
			// No match: toggle should not have been called with true
			expect(setmodifyVolumeToggle).not.toHaveBeenCalledWith(true);
		});

		it('should render the Volume Name input with the correct value for secondary volume', async () => {
			await setupBrowserTest(renderModifyVolume(SECONDARY_VOLUME.id as number), {
				initialRouterEntry: VOLUME_ROUTE_ENTRY,
			});
			await expect
				.element(page.getByRole('textbox', { name: /volume name/i }))
				.toHaveValue(SECONDARY_VOLUME.name as string);
		});

		it('should render the Volume Name input with the correct value for index volume', async () => {
			await setupBrowserTest(renderModifyVolume(INDEX_VOLUME.id as number), {
				initialRouterEntry: VOLUME_ROUTE_ENTRY,
			});
			await expect
				.element(page.getByRole('textbox', { name: /volume name/i }))
				.toHaveValue(INDEX_VOLUME.name as string);
		});
	});

	describe('external S3 volume tiering', () => {
		const EXTERNAL_S3_VOLUME: Volume = {
			id: 9,
			name: 's3primary',
			compressed: true,
			uuid: '0d2224db-66c2-4995-8a91-de04f06d7ac1',
			tieringSupported: true,
			useInfrequentAccess: false,
			infrequentAccessThreshold: 65536,
			useIntelligentTiering: false,
			volumePrefix: '',
			centralized: false,
			storeType: 'S3',
			isCurrent: false,
			volumeType: 'primary',
		};

		const EXTERNAL_VOLUME_LIST = {
			primaries: [EXTERNAL_S3_VOLUME],
			secondaries: [SECONDARY_VOLUME],
			indexes: [INDEX_VOLUME],
		};

		let listS3ConnectorInterceptor: ReturnType<typeof setupListS3ConnectorInterceptor>;

		beforeEach(async () => {
			await advancedSupportedApiForBrowser.withAdvancedSupported();
			listS3ConnectorInterceptor = setupListS3ConnectorInterceptor([
				{
					uuid: '0d2224db-66c2-4995-8a91-de04f06d7ac1',
					label: 'Tiering S3 connector',
					bucketName: 'tiering-bucket',
					storeType: 'S3',
					tieringSupported: true,
					'usage in external backup': 'UNUSED',
				},
			]);
		});

		it('should display tiering controls for external S3 volume with tiering support', async () => {
			await setupBrowserTest(
				renderModifyVolume(EXTERNAL_S3_VOLUME.id as number, EXTERNAL_VOLUME_LIST),
				{ initialRouterEntry: VOLUME_ROUTE_ENTRY },
			);
			await vi.waitFor(() => {
				expect(listS3ConnectorInterceptor.getCalledTimes()).toBeGreaterThanOrEqual(1);
			});
			await expect
				.element(page.getByText('Use infrequent access', { exact: true }))
				.toBeVisible();
			await expect
				.element(page.getByText('Use intelligent tiering', { exact: true }))
				.toBeVisible();
		});
	});
});

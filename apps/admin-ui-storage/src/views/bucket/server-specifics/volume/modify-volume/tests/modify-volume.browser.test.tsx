/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	advancedSupportedApiForBrowser,
	setupBrowserTest,
} from 'admin-ui-test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { Volume } from '../../../../../../../types';
import { useBucketVolumeStore } from '../../../../../../store/bucket-volume/store';
import ModifyVolume from '../modify-volume';

const SERVER_NAME = 'mailstore1.test.com';
const SERVER_ID = 'server-1';

const PRIMARY_VOLUME: Volume = {
	id: 5,
	name: 'primary-local',
	rootpath: '/opt/zextras/store',
	type: 1,
	compressBlobs: 'true',
	compressionThreshold: '4096',
	isCurrent: true,
};

const SECONDARY_VOLUME: Volume = {
	id: 6,
	name: 'secondary-local',
	rootpath: '/opt/zextras/secondary',
	type: 2,
	compressBlobs: 'false',
	compressionThreshold: '4096',
	isCurrent: false,
};

const INDEX_VOLUME: Volume = {
	id: 7,
	name: 'index-local',
	rootpath: '/opt/zextras/index',
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
		<ModifyVolume
			volumeId={volumeId}
			setmodifyVolumeToggle={setmodifyVolumeToggle}
			getAllVolumesRequest={getAllVolumesRequest}
			selectedServerId={SERVER_ID}
			volumeList={volumeList}
			setOpen={setOpen}
		/>
	);
}

describe('ModifyVolume - getVolumeDetailData (advanced mode)', () => {
	beforeEach(() => {
		useBucketVolumeStore.setState({
			selectedServerName: SERVER_NAME,
			isVolumeAllDetail: [],
		});
	});

	describe('advanced mode: loads volume data from volumeList without API call', () => {
		beforeEach(async () => {
			await advancedSupportedApiForBrowser.withAdvancedSupported();
		});

		it('should display primary volume name when volumeId matches a primary volume', async () => {
			await setupBrowserTest(renderModifyVolume(PRIMARY_VOLUME.id as number));
			await expect
				.element(page.getByText(`${PRIMARY_VOLUME.name} Details`, { exact: true }))
				.toBeVisible();
		});

		it('should display secondary volume name when volumeId matches a secondary volume', async () => {
			await setupBrowserTest(renderModifyVolume(SECONDARY_VOLUME.id as number));
			await expect
				.element(page.getByText(`${SECONDARY_VOLUME.name} Details`, { exact: true }))
				.toBeVisible();
		});

		it('should display index volume name when volumeId matches an index volume', async () => {
			await setupBrowserTest(renderModifyVolume(INDEX_VOLUME.id as number));
			await expect
				.element(page.getByText(`${INDEX_VOLUME.name} Details`, { exact: true }))
				.toBeVisible();
		});

		it('should display the volume path for a matched primary volume', async () => {
			await setupBrowserTest(renderModifyVolume(PRIMARY_VOLUME.id as number));
			await expect
				.element(page.getByRole('textbox', { name: /path/i }))
				.toHaveValue(PRIMARY_VOLUME.rootpath as string);
		});

		it('should not call setmodifyVolumeToggle when volumeId does not match any volume', async () => {
			const setmodifyVolumeToggle = vi.fn();
			await setupBrowserTest(
				renderModifyVolume(9999, VOLUME_LIST, { setmodifyVolumeToggle }),
			);
			// No match: toggle should not have been called with true
			expect(setmodifyVolumeToggle).not.toHaveBeenCalledWith(true);
		});

		it('should render the Volume Name input with the correct value for secondary volume', async () => {
			await setupBrowserTest(renderModifyVolume(SECONDARY_VOLUME.id as number));
			await expect
				.element(page.getByRole('textbox', { name: /volume name/i }))
				.toHaveValue(SECONDARY_VOLUME.name as string);
		});

		it('should render the Volume Name input with the correct value for index volume', async () => {
			await setupBrowserTest(renderModifyVolume(INDEX_VOLUME.id as number));
			await expect
				.element(page.getByRole('textbox', { name: /volume name/i }))
				.toHaveValue(INDEX_VOLUME.name as string);
		});
	});
});

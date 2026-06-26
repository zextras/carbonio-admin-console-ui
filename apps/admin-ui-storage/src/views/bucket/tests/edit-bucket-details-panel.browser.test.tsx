/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest } from 'admin-ui-test-utils';
import { useEffect, useRef } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import type { BucketConnectorRow } from '../../../../types';
import EditBucketDetailPanel from '../edit-bucket-details-panel';

const mockSnackbar = vi.hoisted(() => vi.fn());
const mockListS3Regions = vi.hoisted(() => vi.fn());
const mockUpdateS3Connector = vi.hoisted(() => vi.fn());
const mockTestS3Connector = vi.hoisted(() => vi.fn());

vi.mock('@zextras/ui-components', async (importOriginal) => {
	const actual = (await importOriginal()) as Record<string, unknown>;
	return {
		...actual,
		useSnackbar: () => mockSnackbar,
	};
});

vi.mock('../../../services/bucket-service', () => ({
	listS3Regions: mockListS3Regions,
	updateS3Connector: mockUpdateS3Connector,
	testS3Connector: mockTestS3Connector,
}));

vi.mock('../verify-changes-modal', () => ({
	VerifyChangesModal: ({
		open,
		changedFields,
		applyHandler,
	}: {
		open: boolean;
		changedFields: Array<{ label: string; value: string }>;
		applyHandler: () => Promise<void>;
	}) =>
		open ? (
			<div>
				<ds-text>{`changed-fields:${changedFields.length}`}</ds-text>
				<button type="button" aria-label="apply changes" onClick={(): void => void applyHandler()}>
					Apply Changes
				</button>
			</div>
		) : null,
}));

vi.mock('../parts/verify/verify-progress', () => ({
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

vi.mock('../parts/verify/verify-success', () => ({
	VerifySuccess: ({ isSuccess }: { isSuccess: boolean }) =>
		isSuccess ? <div>verify-success</div> : null,
}));

vi.mock('../parts/verify/verify-error', () => ({
	VerifyError: ({
		isError,
	}: {
		isError: boolean;
	}) => (isError ? <div>verify-error</div> : null),
}));

type BucketDetail = {
	uuid: string;
	label: string;
	bucketName: string;
	accessKey: string;
	secret: string;
	url: string;
	prefix: string;
	region: string;
	insecureHttps: string;
	usage?: string;
	'usage in powerstore volumes'?: string | Array<Record<string, string>>;
	'usage in external backup'?: string | Array<Record<string, string>>;
};

function createBucketDetail(overrides: Partial<BucketDetail> = {}): BucketDetail {
	return {
		uuid: 'bucket-uuid-1',
		label: 'Main bucket',
		bucketName: 'main-bucket',
		accessKey: 'AKIA_TEST',
		secret: 'secret-key',
		url: 'https://s3.example.test',
		prefix: 'tenants/root',
		region: 'us-east-1',
		insecureHttps: 'true',
		usage: 'unused',
		...overrides,
	};
}

type RenderOverrides = {
	bucketDetail?: BucketDetail;
	toggleForGetAPICall?: boolean;
};

function renderEditBucketPanel(overrides: RenderOverrides = {}) {
	const setShowEditDetailView = vi.fn();
	const setBucketDeleteName = vi.fn();
	const setOpen = vi.fn();
	const getBucketListType = vi.fn();
	const setSelectedRow = vi.fn();
	const setToggleForGetAPICall = vi.fn();
	const bucketDetail = overrides.bucketDetail ?? createBucketDetail();
	const toggleForGetAPICall = overrides.toggleForGetAPICall ?? false;

	const view = (
		<EditBucketDetailPanel
			setShowEditDetailView={setShowEditDetailView}
			title="Edit S3 connector"
			setBucketDeleteName={setBucketDeleteName}
			bucketDetail={bucketDetail as unknown as BucketConnectorRow}
			setOpen={setOpen}
			getBucketListType={getBucketListType}
			setSelectedRow={setSelectedRow}
			setToggleForGetAPICall={setToggleForGetAPICall}
			toggleForGetAPICall={toggleForGetAPICall}
		/>
	);

	return {
		view,
		setBucketDeleteName,
		setOpen,
		getBucketListType,
		setSelectedRow,
		setToggleForGetAPICall,
		bucketDetail,
	};
}

describe('EditBucketDetailPanel (browser)', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockListS3Regions.mockResolvedValue([
			{
				id: 'us-east-1',
				description: 'US East 1',
			},
		]);
		mockUpdateS3Connector.mockResolvedValue({ ok: true });
		mockTestS3Connector.mockResolvedValue({ ok: true });
	});

	it('should show delete connector action for an unused bucket and open delete modal', async () => {
		const { view, setBucketDeleteName, setOpen, setSelectedRow, bucketDetail } =
			renderEditBucketPanel();

		await setupBrowserTest(view);

		await expect
			.element(page.getByRole('button', { name: /delete connector/i }))
			.toBeInTheDocument();
		await page.getByRole('button', { name: /delete connector/i }).click();

		expect(setBucketDeleteName).toHaveBeenCalledWith(bucketDetail);
		expect(setOpen).toHaveBeenCalledWith(true);
		expect(setSelectedRow).toHaveBeenCalledWith(bucketDetail);
	});

	it('should disable delete connector action when bucket is used', async () => {
		const { view } = renderEditBucketPanel({
			bucketDetail: createBucketDetail({
				usage: 'used',
				'usage in powerstore volumes': '2',
			}),
		});

		await setupBrowserTest(view);

		await expect
			.element(page.getByRole('button', { name: /delete connector/i }))
			.toHaveAttribute('disabled');
	});

	it('should disable verify button when no field has changed', async () => {
		const { view } = renderEditBucketPanel();

		await setupBrowserTest(view);

		await expect
			.element(page.getByRole('button', { name: /verify & save changes/i }))
			.toHaveAttribute('disabled');
	});

	it('should save modified details after apply changes confirmation', async () => {
		const {
			view,
			getBucketListType,
			setToggleForGetAPICall,
			bucketDetail,
		} = renderEditBucketPanel({ toggleForGetAPICall: false });

		await setupBrowserTest(view);
		await page.getByLabelText('Descriptive name*').fill('Updated bucket name');
		await page.getByRole('button', { name: /verify & save changes/i }).click();

		await expect.element(page.getByText('changed-fields:1')).toBeInTheDocument();
		await page.getByRole('button', { name: /apply changes/i }).click();

		await vi.waitFor(() => {
			expect(mockUpdateS3Connector).toHaveBeenCalledTimes(1);
		});
		expect(mockUpdateS3Connector).toHaveBeenCalledWith(
			expect.objectContaining({
				action: 'updateS3Connector',
				uuid: bucketDetail.uuid,
				label: 'Updated bucket name',
				insecureHttps: true,
			}),
		);
		expect(getBucketListType).toHaveBeenCalledTimes(1);
		expect(setToggleForGetAPICall).toHaveBeenCalledWith(true);
		await expect.element(page.getByText('verify-success')).toBeInTheDocument();
	});

	it('should show update error when save request fails', async () => {
		mockUpdateS3Connector.mockResolvedValue({ ok: false, error: 'Connector update failed' });
		const { view } = renderEditBucketPanel();

		await setupBrowserTest(view);
		await page.getByLabelText('Descriptive name*').fill('Updated bucket name');
		await page.getByRole('button', { name: /verify & save changes/i }).click();
		await page.getByRole('button', { name: /apply changes/i }).click();

		await expect
			.element(page.getByText('verify-error'))
			.toBeInTheDocument();
	});

	it('should call testS3Connector with all current form values on test connection', async () => {
		const { view, bucketDetail } = renderEditBucketPanel();

		await setupBrowserTest(view);
		await page.getByRole('button', { name: /test connection/i }).click();

		await vi.waitFor(() => {
			expect(mockTestS3Connector).toHaveBeenCalledTimes(1);
		});
		expect(mockTestS3Connector).toHaveBeenCalledWith(
			expect.objectContaining({
				action: 'testS3Connector',
				uuid: bucketDetail.uuid,
				label: bucketDetail.label,
				bucketName: bucketDetail.bucketName,
				accessKey: bucketDetail.accessKey,
				secret: bucketDetail.secret,
				url: bucketDetail.url,
				region: bucketDetail.region,
				insecureHttps: true,
			}),
		);
		expect(mockTestS3Connector.mock.calls[0]?.[0]).not.toHaveProperty('iAmSure');
		await expect.element(page.getByText('verify-success')).toBeInTheDocument();
	});

	it('should send unsaved form values when testing connection', async () => {
		const { view } = renderEditBucketPanel();

		await setupBrowserTest(view);
		await page.getByLabelText('Descriptive name*').fill('Updated bucket name');
		await page.getByRole('button', { name: /test connection/i }).click();

		await vi.waitFor(() => {
			expect(mockTestS3Connector).toHaveBeenCalledTimes(1);
		});
		expect(mockTestS3Connector).toHaveBeenCalledWith(
			expect.objectContaining({
				action: 'testS3Connector',
				label: 'Updated bucket name',
			}),
		);
	});

	it('should show verify error when test connection fails', async () => {
		mockTestS3Connector.mockResolvedValue({ ok: false, error: 'Connection failed' });
		const { view } = renderEditBucketPanel();

		await setupBrowserTest(view);
		await page.getByRole('button', { name: /test connection/i }).click();

		await expect.element(page.getByText('verify-error')).toBeInTheDocument();
	});

	it('should render general, volumes, and backup tabs', async () => {
		const { view } = renderEditBucketPanel();

		await setupBrowserTest(view);

		await expect.element(page.getByText('GENERAL')).toBeInTheDocument();
		await expect.element(page.getByText('VOLUMES')).toBeInTheDocument();
		await expect.element(page.getByText('BACKUP')).toBeInTheDocument();
	});

	it('should show volume usage rows in the volumes tab', async () => {
		const { view } = renderEditBucketPanel({
			bucketDetail: createBucketDetail({
				'usage in powerstore volumes': [
					{ server: 'kc-dev3-mbox.demo.zextras.io', volume: 'kcdev3secondary' },
					{ server: 'kc-dev3-mbox.demo.zextras.io', volume: 'othervolume' },
				],
			}),
		});

		await setupBrowserTest(view);
		await page.getByText('VOLUMES').click();

		await expect.element(page.getByText('kcdev3secondary')).toBeInTheDocument();
		await expect.element(page.getByText('othervolume')).toBeInTheDocument();
	});

	it('should show backup usage rows in the backup tab', async () => {
		const { view } = renderEditBucketPanel({
			bucketDetail: createBucketDetail({
				'usage in external backup': [
					{ server: 'kc-dev3-mbox.demo.zextras.io' },
					{ server: 'kc-dev3-mbox2.demo.zextras.io' },
				],
			}),
		});

		await setupBrowserTest(view);
		await page.getByText('BACKUP').click();

		await expect.element(page.getByText('kc-dev3-mbox.demo.zextras.io')).toBeInTheDocument();
		await expect.element(page.getByText('kc-dev3-mbox2.demo.zextras.io')).toBeInTheDocument();
	});

	it('should filter volume usage rows with search input', async () => {
		const { view } = renderEditBucketPanel({
			bucketDetail: createBucketDetail({
				'usage in powerstore volumes': [
					{ server: 'alpha-server.demo.zextras.io', volume: 'alpha-volume' },
					{ server: 'beta-server.demo.zextras.io', volume: 'beta-volume' },
				],
			}),
		});

		await setupBrowserTest(view);
		await page.getByText('VOLUMES').click();
		await page.getByLabelText('Filter volumes list').fill('beta-volume');

		await expect.element(page.getByText('beta-volume')).toBeInTheDocument();
		expect(page.getByText('alpha-volume').elements()).toHaveLength(0);
	});

	it('should show pagination when volume usage has more than 10 rows', async () => {
		const volumeRows = Array.from({ length: 11 }, (_, index) => ({
			server: `server-${index}.demo.zextras.io`,
			volume: `volume-${index}`,
		}));

		const { view } = renderEditBucketPanel({
			bucketDetail: createBucketDetail({
				'usage in powerstore volumes': volumeRows,
			}),
		});

		await setupBrowserTest(view);
		await page.getByText('VOLUMES').click();

		await expect.element(page.getByTestId('next-page')).toBeInTheDocument();
	});

	it('should show empty state when usage is unused', async () => {
		const { view } = renderEditBucketPanel({
			bucketDetail: createBucketDetail({
				'usage in powerstore volumes': 'unused',
				'usage in external backup': 'unused',
			}),
		});

		await setupBrowserTest(view);
		await page.getByText('VOLUMES').click();

		await expect.element(page.getByText('This list is empty.')).toBeInTheDocument();
	});
});

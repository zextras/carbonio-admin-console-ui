/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest } from 'admin-ui-test-utils';
import { useEffect, useRef } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import type { S3ConnectorRow } from '../../../../types';
import { EditS3ConnectorDetailPanel } from '../edit-s3-connector-details-panel';

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

vi.mock('../../../services/s3-connector-service', () => ({
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
	VerifySuccess: () => <div>verify-success</div>,
}));

vi.mock('../parts/verify/verify-error', () => ({
	VerifyError: () => <div>verify-error</div>,
}));

type S3ConnectorDetail = {
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

function createS3ConnectorDetail(overrides: Partial<S3ConnectorDetail> = {}): S3ConnectorDetail {
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
	connectorDetail?: S3ConnectorDetail;
};

function renderEditS3ConnectorPanel(overrides: RenderOverrides = {}) {
	const setShowEditDetailView = vi.fn();
	const setConnectorDeleteName = vi.fn();
	const setOpen = vi.fn();
	const getConnectorListType = vi.fn();
	const connectorDetail = overrides.connectorDetail ?? createS3ConnectorDetail();

	const view = (
		<EditS3ConnectorDetailPanel
			setShowEditDetailView={setShowEditDetailView}
			title="Edit S3 connector"
			setConnectorDeleteName={setConnectorDeleteName}
			connectorDetail={connectorDetail as unknown as S3ConnectorRow}
			setOpen={setOpen}
			getConnectorListType={getConnectorListType}
		/>
	);

	return {
		view,
		setConnectorDeleteName,
		setOpen,
		getConnectorListType,
		connectorDetail,
	};
}

describe('EditS3ConnectorDetailPanel (browser)', () => {
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
		const { view, setConnectorDeleteName, setOpen, connectorDetail } =
			renderEditS3ConnectorPanel();

		await setupBrowserTest(view);

		await expect
			.element(page.getByRole('button', { name: /delete connector/i }))
			.toBeInTheDocument();
		await page.getByRole('button', { name: /delete connector/i }).click();

		expect(setConnectorDeleteName).toHaveBeenCalledWith(connectorDetail);
		expect(setOpen).toHaveBeenCalledWith(true);
	});

	it('should disable delete connector action when bucket is used', async () => {
		const { view } = renderEditS3ConnectorPanel({
			connectorDetail: createS3ConnectorDetail({
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
		const { view } = renderEditS3ConnectorPanel();

		await setupBrowserTest(view);

		await expect
			.element(page.getByRole('button', { name: /verify & save changes/i }))
			.toHaveAttribute('disabled');
	});

	it('should save modified details after apply changes confirmation', async () => {
		const {
			view,
			getConnectorListType,
			connectorDetail,
		} = renderEditS3ConnectorPanel();

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
				uuid: connectorDetail.uuid,
				label: 'Updated bucket name',
				insecureHttps: true,
			}),
		);
		expect(getConnectorListType).toHaveBeenCalledTimes(1);
		await expect.element(page.getByText('verify-success')).toBeInTheDocument();
	});

	it('should show update error when save request fails', async () => {
		mockUpdateS3Connector.mockResolvedValue({ ok: false, error: 'Connector update failed' });
		const { view } = renderEditS3ConnectorPanel();

		await setupBrowserTest(view);
		await page.getByLabelText('Descriptive name*').fill('Updated bucket name');
		await page.getByRole('button', { name: /verify & save changes/i }).click();
		await page.getByRole('button', { name: /apply changes/i }).click();

		await expect
			.element(page.getByText('verify-error'))
			.toBeInTheDocument();
	});

	it('should call testS3Connector with all current form values on test connection', async () => {
		const { view, connectorDetail } = renderEditS3ConnectorPanel();

		await setupBrowserTest(view);
		await page.getByRole('button', { name: /test connection/i }).click();

		await vi.waitFor(() => {
			expect(mockTestS3Connector).toHaveBeenCalledTimes(1);
		});
		expect(mockTestS3Connector).toHaveBeenCalledWith(
			expect.objectContaining({
				action: 'testS3Connector',
				uuid: connectorDetail.uuid,
				label: connectorDetail.label,
				bucketName: connectorDetail.bucketName,
				accessKey: connectorDetail.accessKey,
				url: connectorDetail.url,
				region: connectorDetail.region,
				insecureHttps: true,
			}),
		);
		expect(mockTestS3Connector.mock.calls[0]?.[0]).not.toHaveProperty('secret');
		expect(mockTestS3Connector.mock.calls[0]?.[0]).not.toHaveProperty('iAmSure');
		await expect.element(page.getByText('verify-success')).toBeInTheDocument();
	});

	it('should show saved secret state by default and reveal secret input only after CHANGE click', async () => {
		const { view } = renderEditS3ConnectorPanel();

		await setupBrowserTest(view);

		await expect.element(page.getByText('Saved on this server')).toBeInTheDocument();
		await expect
			.element(
				page.getByText(
					"TEST CONNECTION uses the saved key - you don't need to re-enter it. For security it can't be displayed.",
				),
			)
			.toBeInTheDocument();
		await expect
			.element(page.getByRole('button', { name: 'CHANGE', exact: true }))
			.toBeInTheDocument();
		expect(page.getByLabelText('Secret Access Key*').elements()).toHaveLength(0);

		await page.getByRole('button', { name: 'CHANGE', exact: true }).click();

		await expect.element(page.getByLabelText('Secret Access Key*')).toBeInTheDocument();
		await expect
			.element(
				page.getByText('The new key will replace the saved one when you verify and save changes.'),
			)
			.toBeInTheDocument();
	});

	it('should discard secret draft and return to default state when close icon is clicked', async () => {
		const { view } = renderEditS3ConnectorPanel();

		await setupBrowserTest(view);
		await page.getByRole('button', { name: 'CHANGE', exact: true }).click();
		await page.getByLabelText('Secret Access Key*').fill('NEW_SECRET_VALUE');

		await page.getByTestId('icon: CloseOutline').nth(1).click();

		await expect.element(page.getByText('Saved on this server')).toBeInTheDocument();
		expect(page.getByLabelText('Secret Access Key*').elements()).toHaveLength(0);

		await page.getByRole('button', { name: /test connection/i }).click();

		await vi.waitFor(() => {
			expect(mockTestS3Connector).toHaveBeenCalledTimes(1);
		});
		expect(mockTestS3Connector.mock.calls[0]?.[0]).not.toHaveProperty('secret');
	});

	it('should send new secret for test connection and update when change mode is active', async () => {
		const { view } = renderEditS3ConnectorPanel();

		await setupBrowserTest(view);
		await page.getByRole('button', { name: 'CHANGE', exact: true }).click();
		await page.getByLabelText('Secret Access Key*').fill('REPLACED_SECRET');

		await page.getByRole('button', { name: /test connection/i }).click();

		await vi.waitFor(() => {
			expect(mockTestS3Connector).toHaveBeenCalledTimes(1);
		});
		expect(mockTestS3Connector).toHaveBeenCalledWith(
			expect.objectContaining({
				secret: 'REPLACED_SECRET',
			}),
		);

		await page.getByRole('button', { name: /verify & save changes/i }).click();
		await page.getByRole('button', { name: /apply changes/i }).click();

		await vi.waitFor(() => {
			expect(mockUpdateS3Connector).toHaveBeenCalledTimes(1);
		});
		expect(mockUpdateS3Connector).toHaveBeenCalledWith(
			expect.objectContaining({
				secret: 'REPLACED_SECRET',
			}),
		);
	});

	it('should send unsaved form values when testing connection', async () => {
		const { view } = renderEditS3ConnectorPanel();

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
		const { view } = renderEditS3ConnectorPanel();

		await setupBrowserTest(view);
		await page.getByRole('button', { name: /test connection/i }).click();

		await expect.element(page.getByText('verify-error')).toBeInTheDocument();
	});

	it('should render general, volumes, and backup tabs', async () => {
		const { view } = renderEditS3ConnectorPanel();

		await setupBrowserTest(view);

		await expect.element(page.getByText('GENERAL')).toBeInTheDocument();
		await expect.element(page.getByText('VOLUMES')).toBeInTheDocument();
		await expect.element(page.getByText('BACKUP')).toBeInTheDocument();
	});

	it('should show volume usage rows in the volumes tab', async () => {
		const { view } = renderEditS3ConnectorPanel({
			connectorDetail: createS3ConnectorDetail({
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
		const { view } = renderEditS3ConnectorPanel({
			connectorDetail: createS3ConnectorDetail({
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
		const { view } = renderEditS3ConnectorPanel({
			connectorDetail: createS3ConnectorDetail({
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

		const { view } = renderEditS3ConnectorPanel({
			connectorDetail: createS3ConnectorDetail({
				'usage in powerstore volumes': volumeRows,
			}),
		});

		await setupBrowserTest(view);
		await page.getByText('VOLUMES').click();

		await expect.element(page.getByTestId('next-page')).toBeInTheDocument();
	});

	it('should show empty state when usage is unused', async () => {
		const { view } = renderEditS3ConnectorPanel({
			connectorDetail: createS3ConnectorDetail({
				'usage in powerstore volumes': 'unused',
				'usage in external backup': 'unused',
			}),
		});

		await setupBrowserTest(view);
		await page.getByText('VOLUMES').click();

		await expect.element(page.getByText('This list is empty.')).toBeInTheDocument();
	});
});

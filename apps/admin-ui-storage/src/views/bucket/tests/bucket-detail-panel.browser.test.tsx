/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest, worker } from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import BucketDetailPanel from '../bucket-detail-panel';

type BucketEntry = {
	label: string;
	bucketName: string;
	storeType: string;
	uuid: string;
	notes: string;
	accessKey?: string;
	secret?: string;
	region?: string;
	url?: string;
	prefix?: string;
};

function buildBucket(overrides: Partial<BucketEntry> = {}): BucketEntry {
	return {
		label: 'My S3 Bucket',
		bucketName: 'my-s3-bucket',
		storeType: 'S3',
		uuid: 'bucket-uuid-1',
		notes: 'Test bucket notes',
		accessKey: 'TESTACCESSKEY',
		secret: 'TESTSECRETKEY',
		region: 'US_EAST_1',
		...overrides,
	};
}

const BUCKETS: Array<BucketEntry> = [
	buildBucket({
		label: 'Production S3',
		bucketName: 'prod-bucket',
		storeType: 'S3',
		uuid: 'bucket-1',
		notes: 'Production bucket',
	}),
	buildBucket({
		label: 'Backup Ceph',
		bucketName: 'backup-ceph-bucket',
		storeType: 'CEPH',
		uuid: 'bucket-2',
		notes: 'Backup storage',
	}),
	buildBucket({
		label: 'Archive Custom',
		bucketName: 'archive-custom',
		storeType: 'Custom_S3',
		uuid: 'bucket-3',
		notes: 'Archive bucket',
	}),
];

function setupListBucketsInterceptor(buckets: Array<BucketEntry> = BUCKETS): void {
	worker.use(
		http.post('/service/admin/soap/zextras', async ({ request }) => {
			const body = (await request.json()) as any;
			const zextrasBody = body?.Body?.zextras;

			if (zextrasBody?.action === 'listBuckets') {
				return HttpResponse.json({
					Body: {
						response: {
							content: JSON.stringify({
								ok: true,
								response: { values: buckets },
							}),
						},
					},
				});
			}

			return HttpResponse.json({ Body: {} });
		}),
	);
}

describe('BucketDetailPanel (browser)', () => {
	describe('Rendering', () => {
		it('should render the Buckets List title', async () => {
			setupListBucketsInterceptor();
			await setupBrowserTest(<BucketDetailPanel />);
			await expect
				.element(page.getByText('Buckets List', { exact: true }))
				.toBeVisible();
		});

		it('should render the CREATE button', async () => {
			setupListBucketsInterceptor();
			await setupBrowserTest(<BucketDetailPanel />);
			await expect
				.element(page.getByRole('button', { name: /create/i }))
				.toBeVisible();
		});

		it('should render the filter input', async () => {
			setupListBucketsInterceptor();
			await setupBrowserTest(<BucketDetailPanel />);
			await expect
				.element(page.getByLabelText('Filter Buckets List'))
				.toBeInTheDocument();
		});
	});

	describe('Table headers', () => {
		it('should render the Label column header', async () => {
			setupListBucketsInterceptor();
			await setupBrowserTest(<BucketDetailPanel />);
			await expect
				.element(page.getByText('Label', { exact: true }))
				.toBeInTheDocument();
		});

		it('should render the Name column header', async () => {
			setupListBucketsInterceptor();
			await setupBrowserTest(<BucketDetailPanel />);
			await expect
				.element(page.getByText('Name', { exact: true }))
				.toBeInTheDocument();
		});

		it('should render the Type column header', async () => {
			setupListBucketsInterceptor();
			await setupBrowserTest(<BucketDetailPanel />);
			await expect
				.element(page.getByText('Type', { exact: true }))
				.toBeInTheDocument();
		});
	});

	describe('Bucket list with data', () => {
		it('should display bucket labels', async () => {
			setupListBucketsInterceptor();
			await setupBrowserTest(<BucketDetailPanel />);
			await expect
				.element(page.getByText('Production S3'))
				.toBeInTheDocument();
			await expect
				.element(page.getByText('Backup Ceph'))
				.toBeInTheDocument();
			await expect
				.element(page.getByText('Archive Custom'))
				.toBeInTheDocument();
		});

		it('should display bucket names', async () => {
			setupListBucketsInterceptor();
			await setupBrowserTest(<BucketDetailPanel />);
			await expect
				.element(page.getByText('prod-bucket'))
				.toBeInTheDocument();
			await expect
				.element(page.getByText('backup-ceph-bucket'))
				.toBeInTheDocument();
			await expect
				.element(page.getByText('archive-custom'))
				.toBeInTheDocument();
		});

		it('should display bucket store types', async () => {
			setupListBucketsInterceptor();
			await setupBrowserTest(<BucketDetailPanel />);
			await expect
				.element(page.getByText('S3', { exact: true }))
				.toBeInTheDocument();
			await expect
				.element(page.getByText('CEPH', { exact: true }))
				.toBeInTheDocument();
			await expect
				.element(page.getByText('Custom_S3', { exact: true }))
				.toBeInTheDocument();
		});
	});

	describe('Empty state', () => {
		it('should show empty state message when no buckets exist', async () => {
			setupListBucketsInterceptor([]);
			await setupBrowserTest(<BucketDetailPanel />);
			await expect
				.element(page.getByText(/haven't setup a bucket type/i))
				.toBeInTheDocument();
		});

		it('should show the CREATE instruction in empty state', async () => {
			setupListBucketsInterceptor([]);
			await setupBrowserTest(<BucketDetailPanel />);
			await expect
				.element(page.getByText(/CREATE \+/i))
				.toBeInTheDocument();
		});

		it('should disable filter input when bucket list is empty', async () => {
			setupListBucketsInterceptor([]);
			await setupBrowserTest(<BucketDetailPanel />);
			await expect
				.element(page.getByText(/haven't setup a bucket type/i))
				.toBeInTheDocument();
			const filterInput = page.getByLabelText('Filter Buckets List');
			await expect.element(filterInput).toHaveAttribute('disabled');
		});
	});
});

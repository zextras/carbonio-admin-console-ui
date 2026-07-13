/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest, worker } from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import type { BucketConnectorRow } from '../../../../types';
import { BucketDetailPanel, resolveSelectedBucketConnector } from '../bucket-detail-panel';

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

function setupListS3ConnectorInterceptor(buckets: Array<BucketEntry> = BUCKETS): void {
  worker.use(
    http.post('/service/admin/soap/zextras', async ({ request }) => {
      const body = (await request.json()) as any;
      const zextrasBody = body?.Body?.zextras;

      if (zextrasBody?.action === 'listS3Connector') {
        const values = buckets.map((bucket) => ({
          ...bucket,
          id: bucket.uuid,
        }));
        return HttpResponse.json({
          Body: {
            response: {
              content: JSON.stringify({
                ok: true,
                response: { values },
              }),
            },
          },
        });
      }

      return HttpResponse.json({ Body: {} });
    }),
  );
}

function setupDeleteFlowInterceptors(options?: {
  buckets?: Array<BucketEntry>;
  deleteResponse?: Record<string, unknown>;
}): {
  getListCalls: () => number;
  getDeleteCalls: () => number;
} {
  let listCalls = 0;
  let deleteCalls = 0;

  worker.use(
    http.post('/service/admin/soap/zextras', async ({ request }) => {
      const body = (await request.json()) as any;
      const zextrasBody = body?.Body?.zextras;

      if (zextrasBody?.action === 'listS3Connector') {
        listCalls += 1;
        const values = (options?.buckets ?? BUCKETS).map((bucket) => ({
          ...bucket,
          id: bucket.uuid,
        }));
        return HttpResponse.json({
          Body: {
            response: {
              content: JSON.stringify({
                ok: true,
                response: { values },
              }),
            },
          },
        });
      }

      if (zextrasBody?.action === 'deleteS3Connector') {
        deleteCalls += 1;
        return HttpResponse.json({
          Body: {
            response: {
              content: JSON.stringify(options?.deleteResponse ?? { ok: true, response: {} }),
            },
          },
        });
      }

      if (zextrasBody?.action === 'listS3Regions') {
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

      return HttpResponse.json({ Body: {} });
    }),
  );

  return {
    getListCalls: () => listCalls,
    getDeleteCalls: () => deleteCalls,
  };
}

function setupListErrorInterceptor(): void {
  worker.use(
    http.post('/service/admin/soap/zextras', async ({ request }) => {
      const body = (await request.json()) as any;
      const zextrasBody = body?.Body?.zextras;

      if (zextrasBody?.action === 'listS3Connector') {
        return HttpResponse.json({
          Body: {
            response: {
              content: JSON.stringify({
                ok: false,
                error: 'Failed to list S3 connectors',
              }),
            },
          },
        });
      }

      if (zextrasBody?.action === 'listS3Regions') {
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

      return HttpResponse.json({ Body: {} });
    }),
  );
}

describe('BucketDetailPanel (browser)', () => {
  describe('Rendering', () => {
    it('should render the S3 connectors title', async () => {
      setupListS3ConnectorInterceptor();
      await setupBrowserTest(<BucketDetailPanel />);
      await expect.element(page.getByText('S3 connectors', { exact: true })).toBeVisible();
    });

    it('should render the CREATE A NEW S3 button', async () => {
      setupListS3ConnectorInterceptor();
      await setupBrowserTest(<BucketDetailPanel />);
      await expect.element(page.getByRole('button', { name: /create a new s3/i })).toBeVisible();
    });

    it('should render the filter input', async () => {
      setupListS3ConnectorInterceptor();
      await setupBrowserTest(<BucketDetailPanel />);
      await expect.element(page.getByLabelText('Filter S3 List')).toBeInTheDocument();
    });
  });

  describe('Table headers', () => {
    it('should render the ID column header', async () => {
      setupListS3ConnectorInterceptor();
      await setupBrowserTest(<BucketDetailPanel />);
      await expect.element(page.getByText('ID', { exact: true })).toBeInTheDocument();
    });

    it('should render the Descriptive Name column header', async () => {
      setupListS3ConnectorInterceptor();
      await setupBrowserTest(<BucketDetailPanel />);
      await expect.element(page.getByText('Descriptive Name', { exact: true })).toBeInTheDocument();
    });

    it('should render the Bucket name column header', async () => {
      setupListS3ConnectorInterceptor();
      await setupBrowserTest(<BucketDetailPanel />);
      await expect.element(page.getByText('Bucket name', { exact: true })).toBeInTheDocument();
    });
  });

  describe('Bucket list with data', () => {
    it('should display bucket labels', async () => {
      setupListS3ConnectorInterceptor();
      await setupBrowserTest(<BucketDetailPanel />);
      await expect.element(page.getByText('Production S3')).toBeInTheDocument();
      await expect.element(page.getByText('Backup Ceph')).toBeInTheDocument();
      await expect.element(page.getByText('Archive Custom')).toBeInTheDocument();
    });

    it('should display bucket names', async () => {
      setupListS3ConnectorInterceptor();
      await setupBrowserTest(<BucketDetailPanel />);
      await expect.element(page.getByText('prod-bucket')).toBeInTheDocument();
      await expect.element(page.getByText('backup-ceph-bucket')).toBeInTheDocument();
      await expect.element(page.getByText('archive-custom')).toBeInTheDocument();
    });

    it('should open the edit panel when a bucket row is clicked', async () => {
      setupListS3ConnectorInterceptor();
      await setupBrowserTest(<BucketDetailPanel />);

      await page.getByText('Production S3', { exact: true }).click();

      await expect.element(page.getByText('S3 details', { exact: true })).toBeVisible();
    });

    it('should display bucket IDs', async () => {
      setupListS3ConnectorInterceptor();
      await setupBrowserTest(<BucketDetailPanel />);
      await expect.element(page.getByText('bucket-1', { exact: true })).toBeInTheDocument();
      await expect.element(page.getByText('bucket-2', { exact: true })).toBeInTheDocument();
      await expect.element(page.getByText('bucket-3', { exact: true })).toBeInTheDocument();
    });

    it('should filter the bucket list and restore it when the filter is cleared', async () => {
      setupListS3ConnectorInterceptor();
      await setupBrowserTest(<BucketDetailPanel />);

      const filterInput = page.getByLabelText('Filter S3 List');

      await filterInput.fill('prod');

      await expect.element(page.getByText('Production S3', { exact: true })).toBeVisible();
      expect(page.getByText('Backup Ceph', { exact: true }).elements()).toHaveLength(0);
      expect(page.getByText('Archive Custom', { exact: true }).elements()).toHaveLength(0);

      await filterInput.fill('');

      await expect.element(page.getByText('Backup Ceph', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Archive Custom', { exact: true })).toBeVisible();
    });
  });

  describe('Empty state', () => {
    it('should show empty state message when no buckets exist', async () => {
      setupListS3ConnectorInterceptor([]);
      await setupBrowserTest(<BucketDetailPanel />);
      await expect.element(page.getByText(/haven't setup a bucket type/i)).toBeInTheDocument();
    });

    it('should show the CREATE instruction in empty state', async () => {
      setupListS3ConnectorInterceptor([]);
      await setupBrowserTest(<BucketDetailPanel />);
      await expect.element(page.getByText(/CREATE \+/i)).toBeInTheDocument();
    });

    it('should disable filter input when bucket list is empty', async () => {
      setupListS3ConnectorInterceptor([]);
      await setupBrowserTest(<BucketDetailPanel />);
      await expect.element(page.getByText(/haven't setup a bucket type/i)).toBeInTheDocument();
      const filterInput = page.getByLabelText('Filter S3 List');
      await expect.element(filterInput).toHaveAttribute('disabled');
    });
  });
});

describe('resolveSelectedBucketConnector', () => {
  const bucketList: Array<BucketConnectorRow> = [
    {
      uuid: 'uuid-1',
      id: 'uuid-1',
      label: 'Main connector',
      bucketName: 'main-bucket',
    } as BucketConnectorRow,
    {
      uuid: 'uuid-2',
      id: 'uuid-2',
      label: 'Backup connector',
      bucketName: 'backup-bucket',
    } as BucketConnectorRow,
  ];

  it('should resolve the selected connector by uuid/id', () => {
    const result = resolveSelectedBucketConnector(bucketList, 'uuid-2');
    expect(result?.uuid).toBe('uuid-2');
  });

  it('should return undefined when the id does not match any connector', () => {
    const result = resolveSelectedBucketConnector(bucketList, 'missing');
    expect(result).toBeUndefined();
  });

  it('should return undefined when selectedValue is undefined', () => {
    const result = resolveSelectedBucketConnector(bucketList, undefined);
    expect(result).toBeUndefined();
  });

  it('should resolve by numeric index when the value is a valid index', () => {
    const result = resolveSelectedBucketConnector(bucketList, '0');
    expect(result?.uuid).toBe('uuid-1');
  });
});

describe('Delete connector flow (browser)', () => {
  it('should delete connector successfully and show success snackbar', async () => {
    const interceptors = setupDeleteFlowInterceptors();
    await setupBrowserTest(<BucketDetailPanel />);

    await page.getByText('Production S3', { exact: true }).click();
    await expect.element(page.getByText('S3 details', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: /delete connector/i }).click();

    await page
      .getByRole('checkbox', { name: /i am sure i want to delete this connector/i })
      .click();

    await page.getByRole('button', { name: /proceed with deletion/i }).click();

    await expect.element(page.getByText('The prod-bucket has been removed')).toBeVisible();

    await vi.waitFor(
      () => {
        expect(interceptors.getListCalls()).toBeGreaterThanOrEqual(2);
      },
      { timeout: 5000 },
    );
  });

  it('should show error snackbar when delete returns failure', async () => {
    setupDeleteFlowInterceptors({
      deleteResponse: { ok: false, error: { message: 'Delete denied' } },
    });
    await setupBrowserTest(<BucketDetailPanel />);

    await page.getByText('Production S3', { exact: true }).click();
    await expect.element(page.getByText('S3 details', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: /delete connector/i }).click();

    await page
      .getByRole('checkbox', { name: /i am sure i want to delete this connector/i })
      .click();

    await page.getByRole('button', { name: /proceed with deletion/i }).click();

    await expect.element(page.getByText('Delete denied')).toBeVisible();
  });
});

describe('Error state (browser)', () => {
  it('should show empty state and disable filter when list call fails', async () => {
    setupListErrorInterceptor();
    await setupBrowserTest(<BucketDetailPanel />);

    await expect.element(page.getByText(/haven't setup a bucket type/i)).toBeInTheDocument();

    const filterInput = page.getByLabelText('Filter S3 List');
    await expect.element(filterInput).toHaveAttribute('disabled');
  });
});

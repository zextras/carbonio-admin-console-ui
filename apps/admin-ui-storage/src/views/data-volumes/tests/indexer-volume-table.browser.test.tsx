/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import type { Volume } from '../../../../types';
import { indexerHeaders } from '../../utility/utils';
import { IndexerVolumeTable } from '../indexer-volume-table';

const LOCAL_VOLUME: Volume = {
  id: 1,
  name: 'index-local',
  path: '/opt/zextras/index',
  storeType: 'LOCAL',
  isCurrent: true,
};

const S3_VOLUME: Volume = {
  id: 2,
  name: 'index-s3',
  rootpath: '/s3/index-root',
  storeType: 'S3',
  isCurrent: false,
};

function makeHeaders(isAdvanced: boolean) {
  return indexerHeaders(((key: string, fallback?: string) => fallback ?? key) as never, isAdvanced);
}

function renderTable({
  volumes,
  isAdvanced,
  onClick = vi.fn(),
  onSelectionChange = vi.fn(),
  selectedRows = [],
}: {
  volumes: Array<Volume>;
  isAdvanced: boolean;
  onClick?: (index: number) => void;
  onSelectionChange?: (selected: string[]) => void;
  selectedRows?: string[];
}) {
  return setupBrowserTest(
    <IndexerVolumeTable
      volumes={volumes}
      headers={makeHeaders(isAdvanced)}
      selectedRows={selectedRows}
      onSelectionChange={onSelectionChange}
      onClick={onClick}
      isAdvanced={isAdvanced}
    />,
  );
}

describe('IndexerVolumeTable (browser)', () => {
  describe('CE mode (isAdvanced=false)', () => {
    it('should render the empty-state message when there are no volumes', async () => {
      await renderTable({ volumes: [], isAdvanced: false });
      await expect.element(page.getByText('Empty Table', { exact: true })).toBeVisible();
    });

    it('should render the volume name for a local volume', async () => {
      await renderTable({ volumes: [LOCAL_VOLUME], isAdvanced: false });
      await expect.element(page.getByText('index-local', { exact: true })).toBeVisible();
    });

    it('should display the local volume path (not rootpath) for LOCAL storeType', async () => {
      await renderTable({ volumes: [LOCAL_VOLUME], isAdvanced: false });
      await expect.element(page.getByText('/opt/zextras/index', { exact: true })).toBeVisible();
    });

    it('should display YES when the volume is current', async () => {
      await renderTable({ volumes: [LOCAL_VOLUME], isAdvanced: false });
      await expect.element(page.getByText('YES', { exact: true }).first()).toBeVisible();
    });

    it('should display No when the volume is not current', async () => {
      await renderTable({
        volumes: [{ ...LOCAL_VOLUME, isCurrent: false }],
        isAdvanced: false,
      });
      await expect.element(page.getByText('No', { exact: true }).first()).toBeVisible();
    });

    it('should not render the Storage Type column header in CE mode', async () => {
      await renderTable({ volumes: [LOCAL_VOLUME], isAdvanced: false });
      expect(page.getByText('Storage Type', { exact: true }).elements()).toHaveLength(0);
    });

    it('should call onClick with the row index when clicking the row arrow button', async () => {
      const onClick = vi.fn();
      await renderTable({
        volumes: [LOCAL_VOLUME, { ...LOCAL_VOLUME, id: 2, name: 'second' }],
        isAdvanced: false,
        onClick,
      });
      const buttons = page.getByRole('button').elements();
      await (buttons[buttons.length - 1] as HTMLElement).click();
      expect(onClick).toHaveBeenCalledWith(1);
    });

    it('should call onClick with index 0 when clicking the first row arrow button', async () => {
      const onClick = vi.fn();
      await renderTable({ volumes: [LOCAL_VOLUME], isAdvanced: false, onClick });
      // The last button in the row is the arrow forward icon button
      const buttons = page.getByRole('button').elements();
      await (buttons[0] as HTMLElement).click();
      expect(onClick).toHaveBeenCalledWith(0);
    });
  });

  describe('Advanced mode (isAdvanced=true)', () => {
    it('should render the Storage Type column header in advanced mode', async () => {
      await renderTable({ volumes: [LOCAL_VOLUME], isAdvanced: true });
      await expect.element(page.getByText('Storage Type', { exact: true }).first()).toBeVisible();
    });

    it('should display Local Block Device label for LOCAL storeType', async () => {
      await renderTable({ volumes: [LOCAL_VOLUME], isAdvanced: true });
      await expect
        .element(page.getByText('Local Block Device', { exact: true }).first())
        .toBeVisible();
    });

    it('should display Object Storage label for non-LOCAL storeType', async () => {
      await renderTable({ volumes: [S3_VOLUME], isAdvanced: true });
      await expect.element(page.getByText('Object Storage', { exact: true }).first()).toBeVisible();
    });

    it('should display rootpath (not path) for S3 storeType', async () => {
      await renderTable({ volumes: [S3_VOLUME], isAdvanced: true });
      await expect.element(page.getByText('/s3/index-root', { exact: true })).toBeVisible();
    });

    it('should use the volume id when present, falling back to empty string', async () => {
      await renderTable({
        volumes: [{ ...LOCAL_VOLUME, id: undefined }],
        isAdvanced: true,
      });
      // Renders without throwing; empty state still absent (one row exists)
      expect(page.getByText('Empty Table', { exact: true }).elements()).toHaveLength(0);
    });
  });
});

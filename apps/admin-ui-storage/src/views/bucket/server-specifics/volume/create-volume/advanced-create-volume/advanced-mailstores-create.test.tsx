/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { render, screen, waitFor } from '@testing-library/react';
import React, { SetStateAction, useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AdvancedVolumeWizardDetail } from '../../../../../../../types';
import { INDEX_TYPE_VALUE, PRIMARY_TYPE_VALUE, S3 } from '../../../../../../constants';
import AdvancedMailstoresCreate from './advanced-mailstores-create';
import { AdvancedVolumeContext } from './create-advanced-volume-context';

const mockT = vi.hoisted(() => (key: string, fallback?: string) => fallback ?? key);

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
}));

vi.mock('../../../../../utility/utils', () => ({
  volumeTypeList: () => [
    { label: 'Primary', value: PRIMARY_TYPE_VALUE },
    { label: 'Index', value: INDEX_TYPE_VALUE },
  ],
}));

vi.mock('@zextras/ui-components', () => ({
  Container: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  ListRow: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Row: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));

function applyUpdate<T>(
  update: SetStateAction<T>,
  setState: React.Dispatch<SetStateAction<T>>,
): void {
  setState((prevState) =>
    typeof update === 'function' ? (update as (prev: T) => T)(prevState) : update,
  );
}

function TestHarness({
  setCompleteLoading,
  initialAdvancedVolumeDetail,
}: {
  setCompleteLoading: ReturnType<typeof vi.fn>;
  initialAdvancedVolumeDetail?: AdvancedVolumeWizardDetail;
}): React.JSX.Element {
  const [advancedVolumeDetail, setAdvancedVolumeDetailState] = useState<AdvancedVolumeWizardDetail>(
    initialAdvancedVolumeDetail ?? {},
  );

  function setAdvancedVolumeDetail(update: SetStateAction<AdvancedVolumeWizardDetail>): void {
    applyUpdate(update, setAdvancedVolumeDetailState);
  }

  return (
    <AdvancedVolumeContext.Provider value={{ advancedVolumeDetail, setAdvancedVolumeDetail }}>
      <AdvancedMailstoresCreate
        externalData="mailstore1.example.com"
        setCompleteLoading={setCompleteLoading}
      />
    </AdvancedVolumeContext.Provider>
  );
}

describe('AdvancedMailstoresCreate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render local primary review and enable completion when fields are complete', async () => {
    const setCompleteLoading = vi.fn();

    render(
      <TestHarness
        setCompleteLoading={setCompleteLoading}
        initialAdvancedVolumeDetail={{
          volumeAllocation: 'Local Block Device',
          volumeName: 'local-primary',
          volumeMain: PRIMARY_TYPE_VALUE,
          path: '/opt/zimbra/store',
          isCompression: true,
          compressionThreshold: '4096',
          isCurrent: true,
        }}
      />,
    );

    expect(screen.getByText('Review your selections')).toBeTruthy();
    expect(screen.getByText('DEFINITION')).toBeTruthy();
    expect(screen.getByText('CONFIGURATION')).toBeTruthy();
    expect(screen.getByText('mailstore1.example.com')).toBeTruthy();
    expect(screen.getByText('local-primary')).toBeTruthy();
    expect(screen.getByText('Local Block Device')).toBeTruthy();
    expect(screen.getByText('Primary')).toBeTruthy();
    expect(screen.getByText('/opt/zimbra/store')).toBeTruthy();
    expect(screen.getAllByText('YES').length).toBeGreaterThan(0);
    expect(screen.getByText('4096')).toBeTruthy();
    expect(screen.queryByText('BUCKET')).toBeNull();

    await waitFor(() => {
      expect(setCompleteLoading).toHaveBeenCalledWith(true);
    });
  });

  it('should hide compression for local index volumes and still complete', async () => {
    const setCompleteLoading = vi.fn();

    render(
      <TestHarness
        setCompleteLoading={setCompleteLoading}
        initialAdvancedVolumeDetail={{
          volumeAllocation: 'Local Block Device',
          volumeName: 'local-index',
          volumeMain: INDEX_TYPE_VALUE,
          path: '/opt/zimbra/index',
          isCompression: false,
          isCurrent: false,
        }}
      />,
    );

    expect(screen.getByText('Index')).toBeTruthy();
    expect(screen.getByText('/opt/zimbra/index')).toBeTruthy();
    expect(screen.queryByText('Enable Compression')).toBeNull();
    expect(screen.getByText('No')).toBeTruthy();

    await waitFor(() => {
      expect(setCompleteLoading).toHaveBeenCalledWith(true);
    });
  });

  it('should show DISABLED compression threshold when compression is off for local primary', async () => {
    const setCompleteLoading = vi.fn();

    render(
      <TestHarness
        setCompleteLoading={setCompleteLoading}
        initialAdvancedVolumeDetail={{
          volumeAllocation: 'Local Block Device',
          volumeName: 'local-primary',
          volumeMain: PRIMARY_TYPE_VALUE,
          path: '/opt/zimbra/store',
          isCompression: false,
        }}
      />,
    );

    expect(screen.getByText('Enable Compression')).toBeTruthy();
    expect(screen.getByText('disabled')).toBeTruthy();

    await waitFor(() => {
      expect(setCompleteLoading).toHaveBeenCalledWith(true);
    });
  });

  it('should disable completion for incomplete local volumes', async () => {
    const setCompleteLoading = vi.fn();

    render(
      <TestHarness
        setCompleteLoading={setCompleteLoading}
        initialAdvancedVolumeDetail={{
          volumeAllocation: 'Local Block Device',
          volumeName: 'local-primary',
          volumeMain: PRIMARY_TYPE_VALUE,
          path: '',
          isCompression: true,
          compressionThreshold: '',
        }}
      />,
    );

    await waitFor(() => {
      expect(setCompleteLoading).toHaveBeenCalledWith(false);
    });
  });

  it('should render object storage review with bucket and tiering settings', async () => {
    const setCompleteLoading = vi.fn();

    render(
      <TestHarness
        setCompleteLoading={setCompleteLoading}
        initialAdvancedVolumeDetail={{
          volumeAllocation: 'Object Storage',
          volumeName: 's3-volume',
          volumeMain: PRIMARY_TYPE_VALUE,
          unusedBucketType: S3,
          tieringSupported: true,
          bucketName: 'my-bucket',
          bucketId: 'bucket-1',
          prefix: 'mail/',
          isCurrent: true,
          centralized: true,
          useInfrequentAccess: true,
          useIntelligentTiering: false,
        }}
      />,
    );

    expect(screen.getByText('BUCKET')).toBeTruthy();
    expect(screen.getByText('my-bucket')).toBeTruthy();
    expect(screen.getByText(S3)).toBeTruthy();
    expect(screen.getByText('bucket-1')).toBeTruthy();
    expect(screen.getByText('mail/')).toBeTruthy();
    expect(screen.getByText('enabled')).toBeTruthy();
    expect(screen.getByText('disabled')).toBeTruthy();
    expect(screen.getAllByText('YES').length).toBeGreaterThan(0);

    await waitFor(() => {
      expect(setCompleteLoading).toHaveBeenCalledWith(true);
    });
  });

  it('should hide tiering settings when bucket type does not support tiering', () => {
    const setCompleteLoading = vi.fn();

    render(
      <TestHarness
        setCompleteLoading={setCompleteLoading}
        initialAdvancedVolumeDetail={{
          volumeAllocation: 'Object Storage',
          volumeName: 's3-volume',
          volumeMain: PRIMARY_TYPE_VALUE,
          unusedBucketType: S3,
          tieringSupported: false,
          bucketName: 'my-bucket',
          bucketId: 'bucket-1',
          prefix: 'mail/',
        }}
      />,
    );

    expect(screen.queryByText('Infrequent access')).toBeNull();
    expect(screen.queryByText('Use Intelligent Tiering')).toBeNull();
  });

  it('should disable completion for incomplete object storage volumes', async () => {
    const setCompleteLoading = vi.fn();

    render(
      <TestHarness
        setCompleteLoading={setCompleteLoading}
        initialAdvancedVolumeDetail={{
          volumeAllocation: 'Object Storage',
          volumeName: '',
          volumeMain: PRIMARY_TYPE_VALUE,
          unusedBucketType: '',
        }}
      />,
    );

    expect(screen.queryByText('BUCKET')).toBeNull();

    await waitFor(() => {
      expect(setCompleteLoading).toHaveBeenCalledWith(false);
    });
  });
});

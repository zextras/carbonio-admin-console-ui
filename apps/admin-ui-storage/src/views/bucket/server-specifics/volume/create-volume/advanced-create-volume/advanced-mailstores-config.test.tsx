/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React, { SetStateAction, useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AdvancedVolumeWizardDetail } from '../../../../../../../types';
import {
  INDEX_TYPE_VALUE,
  PRIMARY_TYPE_VALUE,
  S3,
  SECONDARY_TYPE_VALUE,
} from '../../../../../../constants';
import AdvancedMailstoresConfig from './advanced-mailstores-config';
import { AdvancedVolumeContext } from './create-advanced-volume-context';

const mockStore = vi.hoisted(() => ({
  setIsAllocationToggle: vi.fn(),
}));

const mockT = vi.hoisted(() => (key: string, fallback?: string) => fallback ?? key);

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
  Trans: ({ defaults }: { defaults?: string }) => <span>{defaults}</span>,
}));

vi.mock('../../../../../../store/bucket-volume/store', () => ({
  useBucketVolumeStore: (
    selector: (state: { setIsAllocationToggle: (value: boolean) => void }) => unknown,
  ) => selector({ setIsAllocationToggle: mockStore.setIsAllocationToggle }),
}));

vi.mock('@zextras/ui-components', () => ({
  Container: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  ListRow: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Row: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Padding: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Link: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
    <a href={href}>{children}</a>
  ),
  Input: ({
    label,
    value,
    onChange,
    disabled,
    inputName,
  }: {
    label: string;
    value?: string | number;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    inputName?: string;
  }) => (
    <label>
      {label}
      <input
        aria-label={label}
        name={inputName}
        value={value ?? ''}
        onChange={onChange}
        disabled={disabled}
      />
    </label>
  ),
  Radio: ({ label, onClick }: { label: string; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
      {label}
    </button>
  ),
  Switch: ({ label, onClick }: { label: string; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
      {label}
    </button>
  ),
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
  onSelection,
  setCompleteLoading,
  initialAdvancedVolumeDetail,
}: {
  onSelection: ReturnType<typeof vi.fn>;
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
      <AdvancedMailstoresConfig
        onSelection={onSelection}
        externalData="mailstore1.example.com"
        setCompleteLoading={setCompleteLoading}
      />
      <div data-testid="advanced-state">{JSON.stringify(advancedVolumeDetail)}</div>
    </AdvancedVolumeContext.Provider>
  );
}

describe('AdvancedMailstoresConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show index radio for local block device and complete when path and type are set', async () => {
    const onSelection = vi.fn();
    const setCompleteLoading = vi.fn();

    render(
      <TestHarness
        onSelection={onSelection}
        setCompleteLoading={setCompleteLoading}
        initialAdvancedVolumeDetail={{
          volumeAllocation: 'Local Block Device',
          volumeName: 'local-volume',
          volumeMain: 0,
          path: '',
        }}
      />,
    );

    expect(screen.getByText('mailstore1.example.com')).toBeTruthy();
    expect(screen.getByText('Local Block Device')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Index Volume' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Primary Volume' }));
    fireEvent.change(screen.getByLabelText('Volume path'), {
      target: { value: '/opt/zimbra/store' },
    });

    await waitFor(() => {
      expect(onSelection).toHaveBeenCalledWith({ volumeMain: PRIMARY_TYPE_VALUE }, true);
      expect(onSelection).toHaveBeenCalledWith({ path: '/opt/zimbra/store' }, true);
      expect(setCompleteLoading).toHaveBeenCalledWith(true);
      expect(mockStore.setIsAllocationToggle).toHaveBeenCalledWith(false);
    });
  });

  it('should update volumeMain for secondary and index selections', async () => {
    const onSelection = vi.fn();
    const setCompleteLoading = vi.fn();

    render(
      <TestHarness
        onSelection={onSelection}
        setCompleteLoading={setCompleteLoading}
        initialAdvancedVolumeDetail={{
          volumeAllocation: 'Local Block Device',
          volumeName: 'local-volume',
          volumeMain: PRIMARY_TYPE_VALUE,
          path: '/opt/zimbra/store',
        }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Secondary Volume' }));

    await waitFor(() => {
      expect(onSelection).toHaveBeenCalledWith({ volumeMain: SECONDARY_TYPE_VALUE }, true);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Index Volume' }));

    await waitFor(() => {
      expect(onSelection).toHaveBeenCalledWith({ volumeMain: INDEX_TYPE_VALUE }, true);
      expect(screen.queryByText('Enable Compression')).toBeNull();
    });
  });

  it('should toggle compression and accept only numeric thresholds', async () => {
    const onSelection = vi.fn();
    const setCompleteLoading = vi.fn();

    render(
      <TestHarness
        onSelection={onSelection}
        setCompleteLoading={setCompleteLoading}
        initialAdvancedVolumeDetail={{
          volumeAllocation: 'Local Block Device',
          volumeName: 'local-volume',
          volumeMain: PRIMARY_TYPE_VALUE,
          path: '/opt/zimbra/store',
          isCompression: false,
          compressionThreshold: '',
        }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Enable Compression' }));

    await waitFor(() => {
      expect(onSelection).toHaveBeenCalledWith({ isCompression: true }, true);
    });

    fireEvent.change(screen.getByLabelText('Compression Threshold'), {
      target: { value: 'abc' },
    });
    expect(screen.getByTestId('advanced-state').textContent).not.toContain('"compressionThreshold":"abc"');

    fireEvent.change(screen.getByLabelText('Compression Threshold'), {
      target: { value: '4096' },
    });

    await waitFor(() => {
      expect(onSelection).toHaveBeenCalledWith({ compressionThreshold: '4096' }, true);
      expect(setCompleteLoading).toHaveBeenCalledWith(true);
    });
  });

  it('should show bucket meta and tiering switches for S3 object storage', async () => {
    const onSelection = vi.fn();
    const setCompleteLoading = vi.fn();

    render(
      <TestHarness
        onSelection={onSelection}
        setCompleteLoading={setCompleteLoading}
        initialAdvancedVolumeDetail={{
          volumeAllocation: 'Object Storage',
          volumeName: 's3-volume',
          volumeMain: PRIMARY_TYPE_VALUE,
          unusedBucketType: S3,
          tieringSupported: true,
          bucketName: 'my-bucket',
          bucketId: 'bucket-1',
          prefix: '',
          useInfrequentAccess: false,
          useIntelligentTiering: false,
        }}
      />,
    );

    expect(screen.getByText('my-bucket')).toBeTruthy();
    expect(screen.getByText(S3)).toBeTruthy();
    expect(screen.getByText('bucket-1')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Index Volume' })).toBeNull();

    fireEvent.change(
      screen.getByLabelText('Prefix - all objects will have this prefix in their name'),
      { target: { value: 'mail/', name: 'prefix' } },
    );

    fireEvent.click(screen.getByRole('button', { name: 'Use infrequent access' }));

    await waitFor(() => {
      expect(onSelection).toHaveBeenCalledWith({ useInfrequentAccess: true }, true);
      expect(onSelection).toHaveBeenCalledWith({ useIntelligentTiering: false }, true);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Use intelligent tiering' }));

    await waitFor(() => {
      expect(onSelection).toHaveBeenCalledWith({ useIntelligentTiering: true }, true);
      expect(onSelection).toHaveBeenCalledWith({ useInfrequentAccess: false }, true);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Set as Current' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'I want this Storage to be centralized' }),
    );

    await waitFor(() => {
      expect(onSelection).toHaveBeenCalledWith({ isCurrent: true }, true);
      expect(onSelection).toHaveBeenCalledWith({ centralized: true }, true);
      expect(setCompleteLoading).toHaveBeenCalledWith(true);
    });
  });

  it('should clear tiering flags when tiering is not supported', async () => {
    const onSelection = vi.fn();
    const setCompleteLoading = vi.fn();

    render(
      <TestHarness
        onSelection={onSelection}
        setCompleteLoading={setCompleteLoading}
        initialAdvancedVolumeDetail={{
          volumeAllocation: 'Object Storage',
          volumeName: 's3-volume',
          volumeMain: PRIMARY_TYPE_VALUE,
          unusedBucketType: S3,
          tieringSupported: false,
          bucketName: 'my-bucket',
          useInfrequentAccess: true,
          useIntelligentTiering: true,
        }}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Use infrequent access' })).toBeNull();

    await waitFor(() => {
      expect(onSelection).toHaveBeenCalledWith({ useInfrequentAccess: false }, true);
      expect(onSelection).toHaveBeenCalledWith({ useIntelligentTiering: false }, true);
    });
  });

  it('should disable completion for object storage without volume type', async () => {
    const onSelection = vi.fn();
    const setCompleteLoading = vi.fn();

    render(
      <TestHarness
        onSelection={onSelection}
        setCompleteLoading={setCompleteLoading}
        initialAdvancedVolumeDetail={{
          volumeAllocation: 'Object Storage',
          volumeName: 's3-volume',
          volumeMain: 0,
          unusedBucketType: S3,
          bucketName: 'my-bucket',
        }}
      />,
    );

    await waitFor(() => {
      expect(setCompleteLoading).toHaveBeenCalledWith(false);
      expect(mockStore.setIsAllocationToggle).toHaveBeenCalledWith(true);
    });
  });
});

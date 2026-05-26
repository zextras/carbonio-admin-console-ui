/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Volume } from '../../../../../../../types';
import ModifyVolume from '../modify-volume';

const mockSoapFetch = vi.hoisted(() => vi.fn());
const mockCreateSnackbar = vi.hoisted(() => vi.fn());
const mockListS3Connector = vi.hoisted(() => vi.fn());
const mockSetIsVolumeAllDetail = vi.hoisted(() => vi.fn());
const mockAdvancedMode = vi.hoisted(() => ({ value: false }));
const mockT = vi.hoisted(
  () => (_key: string, fallback?: string, options?: { message?: string }) =>
    options?.message ?? fallback ?? _key,
);

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
  }),
  Trans: ({ defaults }: { defaults?: string }) => <span>{defaults}</span>,
}));

vi.mock('@zextras/ui-shared', () => ({
  useIsAdvanced: () => mockAdvancedMode.value,
  soapFetch: mockSoapFetch,
  useStickyBarStore: () => ({
    isSticky: false,
    setIsSticky: vi.fn(),
  }),
}));

vi.mock('@zextras/ui-components', () => ({
  Button: ({ label, onClick }: { label?: string; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
      {label ?? 'button'}
    </button>
  ),
  Container: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Displayer: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Input: ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value?: string | number;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <label>
      {label}
      <input aria-label={label} value={value ?? ''} onChange={onChange} />
    </label>
  ),
  LabeledValue: ({ label, value }: { label: string; value?: string | number }) => (
    <div>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  ),
  Link: ({ children }: { children?: React.ReactNode }) => <a>{children}</a>,
  ListRow: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Modal: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Padding: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Radio: ({ label }: { label: string }) => <div>{label}</div>,
  Row: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Select: ({ label }: { label: string }) => <div>{label}</div>,
  Switch: ({ label }: { label: string }) => <div>{label}</div>,
  Tooltip: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  useSnackbar: () => mockCreateSnackbar,
}));

vi.mock('../../../../../../services/bucket-service', () => ({
  listS3Connector: mockListS3Connector,
  fetchSoap: vi.fn(),
}));

vi.mock('../../../../../../store/bucket-volume/store', () => ({
  useBucketVolumeStore: (
    selector: (state: {
      selectedServerName: string;
      isVolumeAllDetail: Array<unknown>;
      setIsVolumeAllDetail: (items: Array<unknown>) => void;
    }) => unknown,
  ) =>
    selector({
      selectedServerName: 'mailstore1.example.com',
      isVolumeAllDetail: [],
      setIsVolumeAllDetail: mockSetIsVolumeAllDetail,
    }),
}));

describe('ModifyVolume', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdvancedMode.value = false;
  });

  it('should show error snackbar and refresh volume list when GetVolume fails in non-advanced mode', async () => {
    mockSoapFetch.mockRejectedValue(new Error('network down'));

    const setmodifyVolumeToggle = vi.fn();
    const getAllVolumesRequest = vi.fn();
    const setOpen = vi.fn();

    const volumeList: { primaries: Volume[]; secondaries: Volume[]; indexes: Volume[] } = {
      primaries: [],
      secondaries: [],
      indexes: [],
    };

    render(
      <ModifyVolume
        volumeId={42}
        setmodifyVolumeToggle={setmodifyVolumeToggle}
        getAllVolumesRequest={getAllVolumesRequest}
        selectedServerId="server-1"
        volumeList={volumeList}
        setOpen={setOpen}
      />,
    );

    await waitFor(() => {
      expect(mockSoapFetch).toHaveBeenCalledWith(
        'GetVolume',
        expect.objectContaining({
          _jsns: 'urn:zimbraAdmin',
          module: 'ZxPowerstore',
          id: '42',
        }),
        expect.objectContaining({ targetServer: 'server-1' }),
      );
    });

    await waitFor(() => {
      expect(mockCreateSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'error',
          label: 'Something went wrong, please try again',
        }),
      );
      expect(getAllVolumesRequest).toHaveBeenCalled();
    });

    expect(setmodifyVolumeToggle).not.toHaveBeenCalledWith(true);
  });

  it('should set unused bucket data when external advanced volume loads connectors', async () => {
    mockAdvancedMode.value = true;
    mockListS3Connector.mockResolvedValue([
      {
        uuid: 'bucket-1',
        label: 'Primary connector',
        bucketName: 'primary-bucket',
        storeType: 'S3',
      },
      {
        uuid: 'bucket-2',
        label: 'Secondary connector',
        bucketName: 'secondary-bucket',
        storeType: 'Ceph',
      },
    ]);

    const setmodifyVolumeToggle = vi.fn();

    const volumeList: { primaries: Volume[]; secondaries: Volume[]; indexes: Volume[] } = {
      primaries: [
        {
          id: 100,
          name: 'external-primary-volume',
          type: 1,
          rootpath: '/opt/store',
          compressBlobs: 'false',
          compressionThreshold: '4096',
          isCurrent: false,
          bucketConfigurationId: 'bucket-1',
          volumePrefix: 'mail',
          storeType: 'S3',
        },
      ],
      secondaries: [],
      indexes: [],
    };

    render(
      <ModifyVolume
        volumeId={100}
        setmodifyVolumeToggle={setmodifyVolumeToggle}
        getAllVolumesRequest={vi.fn()}
        selectedServerId="server-1"
        volumeList={volumeList}
        setOpen={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(mockListS3Connector).toHaveBeenCalled();
      expect(mockSetIsVolumeAllDetail).toHaveBeenCalledWith([
        expect.objectContaining({ uuid: 'bucket-1', label: 'Primary connector' }),
        expect.objectContaining({ uuid: 'bucket-2', label: 'Secondary connector' }),
      ]);
    });

    await waitFor(() => {
      expect(
        screen.getByText('Available Buckets List (that are not in use in the backup)'),
      ).toBeTruthy();
    });

    expect(setmodifyVolumeToggle).toHaveBeenCalledWith(true);
  });
});

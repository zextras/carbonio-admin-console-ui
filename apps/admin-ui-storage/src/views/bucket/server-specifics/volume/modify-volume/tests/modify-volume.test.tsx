/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Volume } from '../../../../../../../types';
import ModifyVolume from '../modify-volume';

const mockSoapFetch = vi.hoisted(() => vi.fn());
const mockFetchSoap = vi.hoisted(() => vi.fn());
const mockCreateSnackbar = vi.hoisted(() => vi.fn());
const mockListS3Connector = vi.hoisted(() => vi.fn());
const mockS3ConnectorsData = vi.hoisted(() => ({ current: [] as Array<Record<string, unknown>> }));
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
  // eslint-disable-next-line jsx-a11y/anchor-is-valid
  Link: ({ children }: { children?: React.ReactNode }) => <a>{children}</a>,
  ListRow: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Modal: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Padding: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Radio: ({
    label,
    disabled,
    onClick,
  }: {
    label: string;
    disabled?: boolean;
    onClick?: () => void;
  }) => (
    <button type="button" disabled={disabled} onClick={onClick}>
      {label}
    </button>
  ),
  Row: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Select: ({
    label,
    items,
    onChange,
    selection,
  }: {
    label: string;
    items?: Array<{ label: string; value: string }>;
    onChange?: (value: string) => void;
    selection?: { label: string; value: string };
  }) => (
    <label>
      {label}
      <select
        aria-label={label}
        value={selection?.value ?? ''}
        onChange={(event) => onChange?.(event.target.value)}
      >
        {items?.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  ),
  Switch: ({ label, onClick }: { label: string; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
      {label}
    </button>
  ),
  Tooltip: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  useSnackbar: () => mockCreateSnackbar,
}));

vi.mock('../../../../../../services/bucket-service', () => ({
  listS3Connector: mockListS3Connector,
  fetchSoap: mockFetchSoap,
}));

vi.mock('../../../../../../services/use-list-s3-connectors', () => ({
  useListS3Connectors: () => ({ data: mockS3ConnectorsData.current, isLoading: false }),
}));

vi.mock('react-router', () => ({
  useParams: () => ({ server: 'mailstore1.example.com' }),
}));

describe('ModifyVolume', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdvancedMode.value = false;
    mockS3ConnectorsData.current = [];
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
    mockS3ConnectorsData.current = [
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
    ];

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
      expect(
        screen.getByText('Available Buckets List (that are not in use in the backup)'),
      ).toBeTruthy();
    });

    expect(setmodifyVolumeToggle).toHaveBeenCalledWith(true);
  });

  const externalS3Connectors = [
    {
      uuid: 'bucket-1',
      label: 'Primary connector',
      bucketName: 'primary-bucket',
      storeType: 'S3',
      tieringSupported: true,
      'usage in external backup': 'UNUSED',
    },
    {
      uuid: 'bucket-2',
      label: 'Secondary connector',
      bucketName: 'secondary-bucket',
      storeType: 'Ceph',
      tieringSupported: false,
      'usage in external backup': 'UNUSED',
    },
  ];

  const externalS3VolumeList = {
    primaries: [
      {
        id: 100,
        name: 'external-primary-volume',
        type: 1,
        rootpath: '/opt/store',
        compressBlobs: 'false',
        compressionThreshold: '4096',
        isCurrent: false,
        uuid: 'bucket-1',
        tieringSupported: true,
        volumePrefix: 'mail',
        storeType: 'S3',
        useInfrequentAccess: true,
        useIntelligentTiering: false,
        infrequentAccessThreshold: 1024,
      },
    ],
    secondaries: [],
    indexes: [],
  } satisfies { primaries: Volume[]; secondaries: Volume[]; indexes: Volume[] };

  function renderExternalS3Volume(): ReturnType<typeof render> {
    mockAdvancedMode.value = true;
    mockS3ConnectorsData.current = externalS3Connectors;

    return render(
      <ModifyVolume
        volumeId={100}
        setmodifyVolumeToggle={vi.fn()}
        getAllVolumesRequest={vi.fn()}
        selectedServerId="server-1"
        volumeList={externalS3VolumeList}
        setOpen={vi.fn()}
      />,
    );
  }

  it('should disable primary and secondary volume type radios for external volumes', async () => {
    renderExternalS3Volume();

    await waitFor(() => {
      expect(
        screen.getByText('Available Buckets List (that are not in use in the backup)'),
      ).toBeTruthy();
    });

    expect(screen.getByRole('button', { name: 'This is a Primary Volume' }).hasAttribute('disabled')).toBe(
      true,
    );
    expect(
      screen.getByRole('button', { name: 'This is a Secondary Volume' }).hasAttribute('disabled'),
    ).toBe(true);
  });

  it('should render tiering switches for external S3 volume when connector supports tiering', async () => {
    renderExternalS3Volume();

    await waitFor(() => {
      expect(screen.getByText('Use infrequent access')).toBeTruthy();
      expect(screen.getByText('Use intelligent tiering')).toBeTruthy();
    });
  });

  it('should render tiering switches when volume uses uuid from getAllVolumes API shape', async () => {
    mockAdvancedMode.value = true;
    mockS3ConnectorsData.current = [
      {
        uuid: '0d2224db-66c2-4995-8a91-de04f06d7ac1',
        label: 'S3 connector',
        bucketName: 's3-bucket',
        storeType: 'S3',
        tieringSupported: true,
        'usage in external backup': 'UNUSED',
      },
    ];

    const apiShapedVolumeList = {
      primaries: [
        {
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
        },
      ],
      secondaries: [],
      indexes: [],
    } satisfies { primaries: Volume[]; secondaries: Volume[]; indexes: Volume[] };

    render(
      <ModifyVolume
        volumeId={9}
        setmodifyVolumeToggle={vi.fn()}
        getAllVolumesRequest={vi.fn()}
        selectedServerId="server-1"
        volumeList={apiShapedVolumeList}
        setOpen={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Use infrequent access')).toBeTruthy();
      expect(screen.getByText('Use intelligent tiering')).toBeTruthy();
    });
  });

  it('should not render tiering switches when volume tieringSupported is false', async () => {
    mockAdvancedMode.value = true;
    mockS3ConnectorsData.current = [
      {
        uuid: '09dd7b71-23f0-47f2-b580-5593f3aaabe8',
        label: 'Ceph connector',
        bucketName: 'ceph-bucket',
        storeType: 'S3',
        tieringSupported: false,
        'usage in external backup': 'UNUSED',
      },
    ];

    render(
      <ModifyVolume
        volumeId={6}
        setmodifyVolumeToggle={vi.fn()}
        getAllVolumesRequest={vi.fn()}
        selectedServerId="server-1"
        volumeList={{
          primaries: [
            {
              id: 6,
              name: 'cephprimary',
              compressed: true,
              uuid: '09dd7b71-23f0-47f2-b580-5593f3aaabe8',
              tieringSupported: false,
              useInfrequentAccess: false,
              infrequentAccessThreshold: 65536,
              useIntelligentTiering: false,
              volumePrefix: '',
              storeType: 'S3',
              isCurrent: false,
              volumeType: 'primary',
            },
          ],
          secondaries: [],
          indexes: [],
        }}
        setOpen={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText('Available Buckets List (that are not in use in the backup)'),
      ).toBeTruthy();
    });

    expect(screen.queryByText('Use infrequent access')).toBeNull();
    expect(screen.queryByText('Use intelligent tiering')).toBeNull();
  });

  it('should not render tiering switches when connector does not support tiering', async () => {
    mockAdvancedMode.value = true;
    mockS3ConnectorsData.current = [
      {
        uuid: 'bucket-1',
        label: 'Primary connector',
        bucketName: 'primary-bucket',
        storeType: 'S3',
        tieringSupported: false,
        'usage in external backup': 'UNUSED',
      },
    ];

    render(
      <ModifyVolume
        volumeId={100}
        setmodifyVolumeToggle={vi.fn()}
        getAllVolumesRequest={vi.fn()}
        selectedServerId="server-1"
        volumeList={externalS3VolumeList}
        setOpen={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText('Available Buckets List (that are not in use in the backup)'),
      ).toBeTruthy();
    });

    expect(screen.queryByText('Use infrequent access')).toBeNull();
    expect(screen.queryByText('Use intelligent tiering')).toBeNull();
  });

  it('should hide tiering switches and reset flags when bucket changes to non-tiering connector', async () => {
    renderExternalS3Volume();

    await waitFor(() => {
      expect(screen.getByText('Use infrequent access')).toBeTruthy();
    });

    fireEvent.change(
      screen.getByLabelText('Available Buckets List (that are not in use in the backup)'),
      { target: { value: 'bucket-2' } },
    );

    await waitFor(() => {
      expect(screen.queryByText('Use infrequent access')).toBeNull();
      expect(screen.queryByText('Use intelligent tiering')).toBeNull();
    });
  });

  const advancedLocalVolumeList = {
    primaries: [
      {
        id: 5,
        name: 'primary-local',
        path: '/opt/zextras/store',
        compressBlobs: 'true',
        compressionThreshold: '4096',
        isCurrent: true,
        volumeType: 'primary',
      },
    ],
    secondaries: [],
    indexes: [],
  } satisfies { primaries: Volume[]; secondaries: Volume[]; indexes: Volume[] };

  function createAdvancedUpdateSuccessResponse(serverName = 'mailstore1.example.com'): {
    Body: { response: { content: string } };
  } {
    return {
      Body: {
        response: {
          content: JSON.stringify({
            response: {
              [serverName]: { ok: true },
            },
          }),
        },
      },
    };
  }

  function createAdvancedUpdateErrorResponse(serverName = 'mailstore1.example.com'): {
    Body: { response: { content: string } };
  } {
    return {
      Body: {
        response: {
          content: JSON.stringify({
            response: {
              [serverName]: { ok: false },
            },
          }),
        },
      },
    };
  }

  function renderAdvancedLocalVolume(): {
    setmodifyVolumeToggle: ReturnType<typeof vi.fn>;
    getAllVolumesRequest: ReturnType<typeof vi.fn>;
  } {
    mockAdvancedMode.value = true;

    const setmodifyVolumeToggle = vi.fn();
    const getAllVolumesRequest = vi.fn();

    render(
      <ModifyVolume
        volumeId={5}
        setmodifyVolumeToggle={setmodifyVolumeToggle}
        getAllVolumesRequest={getAllVolumesRequest}
        selectedServerId="server-1"
        volumeList={advancedLocalVolumeList}
        setOpen={vi.fn()}
      />,
    );

    return { setmodifyVolumeToggle, getAllVolumesRequest };
  }

  async function makeLocalVolumeDirtyAndSave(): Promise<void> {
    await waitFor(() => {
      expect((screen.getByLabelText('Volume Name') as HTMLInputElement).value).toBe('primary-local');
    });

    fireEvent.change(screen.getByLabelText('Volume Name'), {
      target: { value: 'primary-local-updated' },
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  }

  describe('advanced save', () => {
    it('should call fetchSoap with advanced update payload when saving a local volume', async () => {
      mockFetchSoap.mockResolvedValue(createAdvancedUpdateSuccessResponse());

      const { setmodifyVolumeToggle, getAllVolumesRequest } = renderAdvancedLocalVolume();

      await makeLocalVolumeDirtyAndSave();

      await waitFor(() => {
        expect(mockFetchSoap).toHaveBeenCalledWith(
          'zextras',
          expect.objectContaining({
            action: 'doUpdateVolume',
            targetServers: 'mailstore1.example.com',
            currentVolumeName: 'primary-local',
            volumeName: 'primary-local-updated',
            volumeType: 'primary',
            volumeId: '5',
            volumePath: '/opt/zextras/store',
            volumeCompressed: true,
            volumeThreshold: '4096',
          }),
        );
      });

      expect(mockCreateSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'success',
          label: 'All changes have been saved successfully',
        }),
      );
      expect(getAllVolumesRequest).toHaveBeenCalled();
      expect(setmodifyVolumeToggle).toHaveBeenCalledWith(false);
    });

    it('should show error snackbar when advanced update response is not ok', async () => {
      mockFetchSoap.mockResolvedValue(createAdvancedUpdateErrorResponse());

      const { setmodifyVolumeToggle } = renderAdvancedLocalVolume();

      await makeLocalVolumeDirtyAndSave();

      await waitFor(() => {
        expect(mockCreateSnackbar).toHaveBeenCalledWith(
          expect.objectContaining({
            severity: 'error',
            label: 'Something went wrong, please try again',
          }),
        );
      });

      expect(setmodifyVolumeToggle).toHaveBeenCalledWith(false);
    });

    it('should show error snackbar when fetchSoap throws during advanced save', async () => {
      mockFetchSoap.mockRejectedValue(new Error('network down'));

      const { setmodifyVolumeToggle } = renderAdvancedLocalVolume();

      await makeLocalVolumeDirtyAndSave();

      await waitFor(() => {
        expect(mockCreateSnackbar).toHaveBeenCalledWith(
          expect.objectContaining({
            severity: 'error',
            label: 'Something went wrong, please try again',
          }),
        );
      });

      expect(setmodifyVolumeToggle).toHaveBeenCalledWith(false);
    });
  });
});

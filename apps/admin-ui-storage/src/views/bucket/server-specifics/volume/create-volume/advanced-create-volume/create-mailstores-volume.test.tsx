/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PRIMARY_TYPE_VALUE } from '../../../../../../constants';

const mockInitialDetail = vi.hoisted(() => ({
  current: {
    volumeAllocation: 'Local Block Device',
    volumeName: 'local-volume',
    volumeMain: 1,
    path: '/opt/zimbra/store',
    isCompression: false,
    compressionThreshold: '',
    isCurrent: true,
    id: 'vol-1',
  } as Record<string, unknown>,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}));

vi.mock('../../../../../../store/bucket-volume/store', () => ({
  useBucketVolumeStore: (
    selector: (state: { isAllocationToggle: boolean }) => unknown,
  ) => selector({ isAllocationToggle: false }),
}));

vi.mock('../../../../../utility/utils', () => ({
  volumeTypeList: () => [
    { label: 'Primary', value: 1 },
    { label: 'Index', value: 10 },
  ],
}));

vi.mock('./advanced-mailstores-definition', async () => {
  const React = await import('react');
  const { AdvancedVolumeContext } = await import('./create-advanced-volume-context');

  return {
    default: function MockDefinition(): React.JSX.Element | null {
      const { advancedVolumeDetail, setAdvancedVolumeDetail } =
        React.useContext(AdvancedVolumeContext);
      React.useEffect(() => {
        setAdvancedVolumeDetail(mockInitialDetail.current as never);
      }, [setAdvancedVolumeDetail]);

      if (!advancedVolumeDetail?.volumeName) {
        return null;
      }

      return <div data-testid="seeded-volume-detail" />;
    },
  };
});

vi.mock('./advanced-mailstores-config', () => ({
  default: (): null => null,
}));

vi.mock('./advanced-mailstores-create', () => ({
  default: (): null => null,
}));

vi.mock('@zextras/ui-components', () => ({
  Button: ({
    label,
    onClick,
    disable,
  }: {
    label?: string;
    onClick?: () => void;
    disable?: boolean;
  }) => (
    <button type="button" onClick={onClick} disabled={disable}>
      {label}
    </button>
  ),
  Section: ({
    children,
    title,
    onClose,
    footer,
  }: {
    children?: React.ReactNode;
    title?: string;
    onClose?: () => void;
    footer?: React.ReactNode;
  }) => (
    <div>
      <h1>{title}</h1>
      <button type="button" onClick={onClose}>
        close-section
      </button>
      {footer}
      {children}
    </div>
  ),
  HorizontalWizard: ({
    onComplete,
    steps,
    Wrapper,
    setToggleWizardSection,
    externalData,
  }: {
    onComplete: () => void;
    steps: Array<{
      view: React.ComponentType;
      CancelButton: React.ComponentType<Record<string, unknown>>;
    }>;
    Wrapper: React.ComponentType<{
      wizard: React.ReactNode;
      wizardFooter: React.ReactNode;
      setToggleWizardSection: (value: boolean) => void;
      externalData: string;
    }>;
    setToggleWizardSection: (value: boolean) => void;
    externalData: string;
  }) => {
    const CancelButton = steps[0].CancelButton;
    const StepView = steps[0].view;
    return (
      <Wrapper
        wizard={
          <div>
            <StepView />
            <button type="button" onClick={onComplete}>
              complete-wizard
            </button>
            <CancelButton />
          </div>
        }
        wizardFooter={<div>footer</div>}
        setToggleWizardSection={setToggleWizardSection}
        externalData={externalData}
      />
    );
  },
}));

import CreateMailstoresVolume from './create-mailstores-volume';

describe('CreateMailstoresVolume', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInitialDetail.current = {
      volumeAllocation: 'Local Block Device',
      volumeName: 'local-volume',
      volumeMain: PRIMARY_TYPE_VALUE,
      path: '/opt/zimbra/store',
      isCompression: false,
      compressionThreshold: '',
      isCurrent: true,
      id: 'vol-1',
    };
  });

  it('should call CreateVolumeRequest for local block device on complete', async () => {
    const setToggleWizardExternal = vi.fn();
    const CreateAdvancedRequest = vi.fn();
    const CreateVolumeRequest = vi.fn();

    render(
      <CreateMailstoresVolume
        setToggleWizardExternal={setToggleWizardExternal}
        volName="mailstore1.example.com"
        CreateAdvancedRequest={CreateAdvancedRequest}
        CreateVolumeRequest={CreateVolumeRequest}
      />,
    );

    expect(
      screen.getByText('mailstore1.example.com | Create Storage Volume'),
    ).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByTestId('seeded-volume-detail')).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: 'complete-wizard' }));

    await waitFor(() => {
      expect(CreateVolumeRequest).toHaveBeenCalledWith({
        id: 'vol-1',
        name: 'local-volume',
        rootpath: '/opt/zimbra/store',
        type: PRIMARY_TYPE_VALUE,
        compressBlobs: 0,
        compressionThreshold: 0,
        isCurrent: 1,
      });
      expect(CreateAdvancedRequest).not.toHaveBeenCalled();
    });
  });

  it('should call CreateVolumeRequest with compression threshold when compression is enabled', async () => {
    mockInitialDetail.current = {
      ...mockInitialDetail.current,
      isCompression: true,
      compressionThreshold: '4096',
      isCurrent: false,
    };

    const CreateAdvancedRequest = vi.fn();
    const CreateVolumeRequest = vi.fn();

    render(
      <CreateMailstoresVolume
        setToggleWizardExternal={vi.fn()}
        volName="mailstore1.example.com"
        CreateAdvancedRequest={CreateAdvancedRequest}
        CreateVolumeRequest={CreateVolumeRequest}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('seeded-volume-detail')).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: 'complete-wizard' }));

    await waitFor(() => {
      expect(CreateVolumeRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          compressBlobs: 1,
          compressionThreshold: '4096',
          isCurrent: 0,
        }),
      );
    });
  });

  it('should call CreateAdvancedRequest for object storage on complete', async () => {
    mockInitialDetail.current = {
      volumeAllocation: 'Object Storage',
      volumeName: 's3-volume',
      volumeMain: PRIMARY_TYPE_VALUE,
      unusedBucketType: 'S3',
      bucketId: 'bucket-1',
      prefix: 'mail/',
      centralized: true,
      isCurrent: true,
      useInfrequentAccess: true,
      useIntelligentTiering: false,
      infrequentAccessThreshold: '1024',
    };

    const CreateAdvancedRequest = vi.fn();
    const CreateVolumeRequest = vi.fn();

    render(
      <CreateMailstoresVolume
        setToggleWizardExternal={vi.fn()}
        volName="mailstore1.example.com"
        CreateAdvancedRequest={CreateAdvancedRequest}
        CreateVolumeRequest={CreateVolumeRequest}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('seeded-volume-detail')).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: 'complete-wizard' }));

    await waitFor(() => {
      expect(CreateAdvancedRequest).toHaveBeenCalledWith({
        volumeName: 's3-volume',
        volumeType: 'primary',
        storeType: 'S3',
        bucketConfigurationId: 'bucket-1',
        volumePrefix: 'mail/',
        centralized: true,
        isCurrent: 1,
        useInfrequentAccess: true,
        useIntelligentTiering: false,
        infrequentAccessThreshold: '1024',
      });
      expect(CreateVolumeRequest).not.toHaveBeenCalled();
    });
  });

  it('should close wizard when cancel is clicked', async () => {
    const setToggleWizardExternal = vi.fn();

    render(
      <CreateMailstoresVolume
        setToggleWizardExternal={setToggleWizardExternal}
        volName="mailstore1.example.com"
        CreateAdvancedRequest={vi.fn()}
        CreateVolumeRequest={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'CANCEL' })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: 'CANCEL' }));
    expect(setToggleWizardExternal).toHaveBeenCalledWith(false);
  });

  it('should close wizard when section close is clicked', async () => {
    const setToggleWizardExternal = vi.fn();

    render(
      <CreateMailstoresVolume
        setToggleWizardExternal={setToggleWizardExternal}
        volName="mailstore1.example.com"
        CreateAdvancedRequest={vi.fn()}
        CreateVolumeRequest={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'close-section' }));
    expect(setToggleWizardExternal).toHaveBeenCalledWith(false);
  });
});

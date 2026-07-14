/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm } from '@tanstack/react-form';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NewVolume } from '../new-volume';
import { volumeCreateSchema } from '../schema';
import { VolumeContext } from '../volume-context';

const mockAdvancedMode = vi.hoisted(() => ({ value: false }));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string, options?: { serverName?: string }) =>
      fallback?.replace('{{serverName}}', options?.serverName ?? '') ?? _key,
  }),
}));

vi.mock('@zextras/ui-shared', () => ({
  useIsAdvanced: () => mockAdvancedMode.value,
}));

vi.mock('../mailstores-create', () => ({
  MailstoresCreate: () => <div>mailstores-create-view</div>,
}));

vi.mock('@zextras/ui-components', () => ({
  Button: ({ label, onClick }: { label?: string; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
      {label ?? 'button'}
    </button>
  ),
  HorizontalWizard: ({
    steps,
    Wrapper,
    onComplete,
    setToggleWizardSection,
    externalData,
  }: {
    steps: Array<{
      view: React.ComponentType;
      CancelButton: React.ComponentType<{ completeLoading?: boolean }>;
      PrevButton: React.ComponentType<{ completeLoading?: boolean }>;
      NextButton: React.ComponentType<{ completeLoading?: boolean }>;
    }>;
    Wrapper: React.ComponentType<{
      wizard: React.ReactNode;
      wizardFooter: React.ReactNode;
      setToggleWizardSection: (value: boolean) => void;
      externalData: string;
    }>;
    onComplete: () => void;
    setToggleWizardSection: (value: boolean) => void;
    externalData: string;
  }) => {
    const step = steps[0];
    const StepView = step.view;
    const CancelButton = step.CancelButton;
    const PrevButton = step.PrevButton;
    const NextButton = step.NextButton;

    return (
      <Wrapper
        wizard={<StepView />}
        wizardFooter={
          <div>
            <CancelButton completeLoading={false} />
            <PrevButton completeLoading={false} />
            <NextButton completeLoading={false} />
            <button type="button" onClick={onComplete}>
              Complete wizard
            </button>
          </div>
        }
        setToggleWizardSection={setToggleWizardSection}
        externalData={externalData}
      />
    );
  },
  Section: ({
    title,
    children,
    footer,
    onClose,
  }: {
    title: string;
    children?: React.ReactNode;
    footer?: React.ReactNode;
    onClose?: () => void;
  }) => (
    <div>
      <h1>{title}</h1>
      <button type="button" onClick={onClose}>
        Close section
      </button>
      <div>{children}</div>
      <div>{footer}</div>
    </div>
  ),
}));

type VolumeDetailValue = {
  id?: number | string;
  volumeName?: string;
  path?: string;
  volumeMain?: number;
  isCompression?: boolean;
  compressionThreshold?: number | string;
  isCurrent?: boolean;
};

function VolumeProvider({
  children,
  initialFormValues,
}: {
  children: React.ReactNode;
  initialFormValues: Record<string, unknown>;
}): React.JSX.Element {
  const form = useForm({
    defaultValues: {
      id: '',
      volumeName: '',
      volumeMain: 1,
      path: '',
      isCurrent: false,
      isCompression: false,
      compressionThreshold: '',
      volumeAllocation: 0,
      ...initialFormValues,
    },
    validators: { onChange: volumeCreateSchema },
    onSubmit: async () => {},
  });

  return <VolumeContext.Provider value={{ form }}>{children}</VolumeContext.Provider>;
}

function renderComponent(options?: {
  isAdvanced?: boolean;
  isLoading?: boolean;
  volumeDetail?: VolumeDetailValue;
}) {
  mockAdvancedMode.value = options?.isAdvanced ?? false;

  const setToggleWizardLocal = vi.fn();
  const setToggleWizardExternal = vi.fn();
  const CreateVolumeRequest = vi.fn();

  render(
    <VolumeProvider
      initialFormValues={{
        id: 7,
        volumeName: 'primary-volume',
        path: '/opt/zextras/store',
        volumeMain: 1,
        isCompression: true,
        compressionThreshold: 4096,
        isCurrent: true,
        ...options?.volumeDetail,
      }}
    >
      <NewVolume
        setToggleWizardLocal={setToggleWizardLocal}
        setToggleWizardExternal={setToggleWizardExternal}
        volName="mailstore1.example.com"
        CreateVolumeRequest={CreateVolumeRequest}
        isLoading={options?.isLoading ?? false}
      />
    </VolumeProvider>,
  );

  return {
    setToggleWizardLocal,
    setToggleWizardExternal,
    CreateVolumeRequest,
  };
}

describe('NewVolume', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdvancedMode.value = false;
  });

  it('should call CreateVolumeRequest with mapped wizard values on completion', () => {
    const { CreateVolumeRequest } = renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'Complete wizard' }));

    expect(CreateVolumeRequest).toHaveBeenCalledWith({
      id: 7,
      name: 'primary-volume',
      rootpath: '/opt/zextras/store',
      type: 1,
      compressBlobs: 1,
      compressionThreshold: 4096,
      isCurrent: 1,
    });
  });

  it('should render loading spinner and close local wizard from section close', () => {
    const { setToggleWizardLocal } = renderComponent({ isLoading: true });

    expect(document.querySelector('ds-spinner')).toBeTruthy();
    expect(screen.getByText('mailstore1.example.com | Create Mailstores Volume')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Close section' }));

    expect(setToggleWizardLocal).toHaveBeenCalledWith(false);
  });

  it('should close local wizard when cancel is clicked in non-advanced mode', () => {
    const { setToggleWizardLocal } = renderComponent({ isAdvanced: false });

    fireEvent.click(screen.getByRole('button', { name: 'CANCEL' }));

    expect(setToggleWizardLocal).toHaveBeenCalledWith(false);
    expect(screen.queryByRole('button', { name: 'BACK' })).toBeNull();
  });

  it('should go back to external selection in advanced mode', () => {
    const { setToggleWizardLocal, setToggleWizardExternal } = renderComponent({ isAdvanced: true });

    fireEvent.click(screen.getByRole('button', { name: 'BACK' }));

    expect(setToggleWizardLocal).toHaveBeenCalledWith(false);
    expect(setToggleWizardExternal).toHaveBeenCalledWith(true);
  });

  it('should map disabled compression and current flags to zero on completion', () => {
    const { CreateVolumeRequest } = renderComponent({
      volumeDetail: {
        isCompression: false,
        compressionThreshold: 8192,
        isCurrent: false,
      },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Complete wizard' }));

    expect(CreateVolumeRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        compressBlobs: 0,
        compressionThreshold: 0,
        isCurrent: 0,
      }),
    );
  });
});

/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NewVolume } from '../new-volume';

const mockAdvancedMode = vi.hoisted(() => ({ value: false }));

const mockIsValid = vi.hoisted(() => ({ value: true }));

const wizardProps = vi.hoisted(() => ({
  steps: [] as Array<{ isComplete?: boolean }>,
}));

const mockFormValues = vi.hoisted(() => ({
  value: {
    id: 7,
    volumeName: 'primary-volume',
    volumeMain: 1,
    path: '/opt/zextras/store',
    isCurrent: true,
    isCompression: true,
    compressionThreshold: 4096,
    volumeAllocation: 0,
  } as Record<string, unknown>,
}));

vi.mock('@tanstack/react-form', () => ({
  useForm: () => ({
    state: { values: mockFormValues.value },
    reset: vi.fn(),
    setFieldValue: vi.fn(),
    store: {},
  }),
}));

vi.mock('@tanstack/react-store', () => ({
  useSelector: (_store: unknown, selector: (s: unknown) => unknown) =>
    selector({ isValid: mockIsValid.value, values: mockFormValues.value, submissionAttempts: 0 }),
}));

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
  HorizontalWizardV2: ({
    steps,
    Wrapper,
    onComplete,
    setToggleWizardSection,
    externalData,
  }: {
    steps: Array<{
      view: React.ComponentType;
      isComplete?: boolean;
      CancelButton: React.ComponentType<Record<string, unknown>>;
      PrevButton: React.ComponentType<Record<string, unknown>>;
      NextButton: React.ComponentType<Record<string, unknown>>;
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
    wizardProps.steps = steps;
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
            <CancelButton />
            <PrevButton />
            <NextButton />
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

function renderComponent(options?: {
  isAdvanced?: boolean;
  isLoading?: boolean;
  volumeDetail?: Record<string, unknown>;
}) {
  mockAdvancedMode.value = options?.isAdvanced ?? false;

  if (options?.volumeDetail) {
    mockFormValues.value = { ...mockFormValues.value, ...options.volumeDetail };
  } else {
    mockFormValues.value = {
      id: 7,
      volumeName: 'primary-volume',
      volumeMain: 1,
      path: '/opt/zextras/store',
      isCurrent: true,
      isCompression: true,
      compressionThreshold: 4096,
      volumeAllocation: 0,
    };
  }

  const setToggleWizardLocal = vi.fn();
  const setToggleWizardExternal = vi.fn();
  const CreateVolumeRequest = vi.fn();

  render(
    <NewVolume
      setToggleWizardLocal={setToggleWizardLocal}
      setToggleWizardExternal={setToggleWizardExternal}
      volName="mailstore1.example.com"
      CreateVolumeRequest={CreateVolumeRequest}
      isLoading={options?.isLoading ?? false}
    />,
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
    mockFormValues.value = {
      id: 7,
      volumeName: 'primary-volume',
      volumeMain: 1,
      path: '/opt/zextras/store',
      isCurrent: true,
      isCompression: true,
      compressionThreshold: 4096,
      volumeAllocation: 0,
    };
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

  it('should set isComplete=false when required fields are empty even if isValid is true', () => {
    mockIsValid.value = true;
    renderComponent({
      volumeDetail: {
        id: '',
        volumeName: '',
        path: '',
        isCurrent: false,
        isCompression: false,
        compressionThreshold: '',
      },
    });

    expect(wizardProps.steps[0]?.isComplete).toBe(false);
  });
});

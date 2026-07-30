/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateMailstoresVolume, WizardActionsContext } from './create-mailstores-volume';

const wizardProps = vi.hoisted(() => ({
  steps: [] as Array<{
    name: string;
    label: string;
    view: React.ComponentType<unknown>;
    canGoNext: () => boolean;
    isComplete?: boolean;
    CancelButton: React.ComponentType<{ onCancel: () => void }>;
    PrevButton: React.ComponentType<unknown>;
    NextButton: React.ComponentType<{ onClick?: () => void; disabled?: boolean }>;
  }>,
  onComplete: null as (() => void) | null,
}));

const mockCreateAdvancedRequest = vi.hoisted(() => vi.fn());
const mockCreateVolumeRequest = vi.hoisted(() => vi.fn());
const setToggleWizardExternal = vi.hoisted(() => vi.fn());
const mockFormSeed = vi.hoisted(() => ({
  advanced: {} as Record<string, unknown>,
  volume: {} as Record<string, unknown>,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}));

vi.mock('@zextras/ui-components', () => ({
  HorizontalWizardV2: ({
    steps,
    onComplete,
    Wrapper,
    setToggleWizardSection,
    externalData,
  }: {
    steps: typeof wizardProps.steps;
    onComplete: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Wrapper: React.ComponentType<any>;
    setToggleWizardSection: (value: boolean) => void;
    externalData: string;
  }) => {
    wizardProps.steps = steps;
    wizardProps.onComplete = onComplete;
    const step0 = steps[0];
    const NextButton = step0.NextButton;
    const wizardContent = (
      <div data-testid="wizard">
        {steps.map((s, i) => {
          const View = s.view;
          return (
            <div key={s.name} data-testid={`step-${i}`}>
              <View />
            </div>
          );
        })}
        <NextButton disabled={!step0.isComplete} onClick={() => {}} />
      </div>
    );
    return (
      <Wrapper
        wizard={wizardContent}
        wizardFooter={<div>footer</div>}
        setToggleWizardSection={setToggleWizardSection}
        externalData={externalData}
      />
    );
  },
  Button: ({
    children,
    onClick,
    label,
    type,
    disabled,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    label?: string;
    type?: 'button' | 'reset' | 'submit';
    disabled?: boolean;
  }) => (
    <button
      type={type ?? 'button'}
      onClick={onClick}
      disabled={disabled}
      data-testid={`btn-${label}`}
    >
      {children ?? label}
    </button>
  ),
  Section: ({
    children,
    title,
    onClose,
  }: {
    children?: React.ReactNode;
    title?: string;
    onClose?: () => void;
  }) => (
    <div>
      {title && <h1>{title}</h1>}
      {onClose && (
        <button type="button" onClick={onClose}>
          close-section
        </button>
      )}
      {children}
    </div>
  ),
}));

vi.mock('./advanced-mailstores-definition', async () => {
  const React = await import('react');
  const { useAdvancedVolumeContext } = await import('./create-advanced-volume-context');
  const { VolumeContext } = await import('../volume-context');

  return {
    AdvancedMailstoresDefinition: function MockDefinition() {
      const { form } = useAdvancedVolumeContext();
      const volumeCtx = React.useContext(VolumeContext);

      React.useEffect(() => {
        Object.entries(mockFormSeed.advanced).forEach(([key, value]) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (form.setFieldValue as any)(key, value);
        });
        if (volumeCtx?.form) {
          Object.entries(mockFormSeed.volume).forEach(([key, value]) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (volumeCtx.form.setFieldValue as any)(key, value);
          });
        }
      }, [form, volumeCtx]);

      return <div data-testid="step-definition" />;
    },
  };
});
vi.mock('./advanced-mailstores-config', () => ({
  AdvancedMailstoresConfig: () => <div data-testid="step-config" />,
}));
vi.mock('./advanced-mailstores-create', () => ({
  AdvancedMailstoresCreate: () => <div data-testid="step-create" />,
}));

vi.mock('../../../../../utility/utils', () => ({
  volumeTypeList: () => [
    { label: 'Primary', value: 1 },
    { label: 'Index', value: 10 },
  ],
}));

type CreateMailstoresVolumeProps = React.ComponentProps<typeof CreateMailstoresVolume>;

function renderComponent(
  overrides?: Partial<CreateMailstoresVolumeProps>,
): ReturnType<typeof render> {
  const props: CreateMailstoresVolumeProps = {
    setToggleWizardExternal,
    volName: 'server-a',
    CreateAdvancedRequest: mockCreateAdvancedRequest,
    CreateVolumeRequest: mockCreateVolumeRequest,
    ...overrides,
  };
  return render(<CreateMailstoresVolume {...props} />);
}

function flushPromises(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

describe('CreateMailstoresVolume', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    wizardProps.steps = [];
    wizardProps.onComplete = null;
    mockFormSeed.advanced = {};
    mockFormSeed.volume = {};
  });

  it('renders the wizard with 3 steps', () => {
    renderComponent();
    expect(wizardProps.steps).toHaveLength(3);
    expect(screen.getByTestId('wizard')).toBeTruthy();
  });

  it('each step renders its child view component', () => {
    renderComponent();
    expect(screen.getByTestId('step-definition')).toBeTruthy();
    expect(screen.getByTestId('step-config')).toBeTruthy();
    expect(screen.getByTestId('step-create')).toBeTruthy();
  });

  it('onComplete submits the form and calls CreateAdvancedRequest with the correct payload (including infrequentAccessThreshold regression fix)', async () => {
    renderComponent();

    expect(wizardProps.onComplete).not.toBeNull();
    wizardProps.onComplete?.();
    await flushPromises();

    expect(mockCreateAdvancedRequest).toHaveBeenCalledTimes(1);
    expect(mockCreateAdvancedRequest).toHaveBeenCalledWith({
      volumeName: '',
      volumeType: undefined,
      storeType: '',
      bucketConfigurationId: '',
      volumePrefix: '',
      centralized: false,
      isCurrent: 0,
      useInfrequentAccess: false,
      infrequentAccessThreshold: '',
      useIntelligentTiering: false,
    });
  });

  it('cancel button (step 0) calls setToggleWizardExternal(false)', () => {
    renderComponent();
    const CancelButton = wizardProps.steps[0].CancelButton;
    const { container } = render(
      <WizardActionsContext.Provider
        value={{ onCancel: () => setToggleWizardExternal(false) }}
      >
        <CancelButton onCancel={() => {}} />
      </WizardActionsContext.Provider>,
    );
    fireEvent.click(container.querySelector('button')!);
    expect(setToggleWizardExternal).toHaveBeenCalledWith(false);
  });

  it('step 0 NextButton calls the wizard-injected onClick', () => {
    renderComponent();
    const injectedOnClick = vi.fn();
    const NextButton = wizardProps.steps[0].NextButton;
    const { container } = render(<NextButton onClick={injectedOnClick} />);
    fireEvent.click(container.querySelector('button')!);
    expect(injectedOnClick).toHaveBeenCalled();
  });

  it('should disable NEXT STEP button when step 1 fields are empty', () => {
    renderComponent();
    const btn = screen.getByTestId('btn-NEXT STEP') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('should call CreateVolumeRequest for local block device on complete', async () => {
    mockFormSeed.volume = { volumeAllocation: 1 };
    mockFormSeed.advanced = {
      volumeName: 'local-volume',
      volumeMain: 1,
      path: '/opt/zextras/store',
      isCompression: false,
      compressionThreshold: '',
      isCurrent: true,
    };

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('step-definition')).toBeTruthy();
    });

    expect(wizardProps.onComplete).not.toBeNull();
    wizardProps.onComplete?.();
    await flushPromises();

    expect(mockCreateVolumeRequest).toHaveBeenCalledTimes(1);
    expect(mockCreateVolumeRequest).toHaveBeenCalledWith({
      name: 'local-volume',
      rootpath: '/opt/zextras/store',
      type: 1,
      compressBlobs: '0',
      compressionThreshold: '',
      isCurrent: 1,
    });
    expect(mockCreateAdvancedRequest).not.toHaveBeenCalled();
  });

  it('should call CreateVolumeRequest with compression threshold when compression is enabled', async () => {
    mockFormSeed.volume = { volumeAllocation: 1 };
    mockFormSeed.advanced = {
      volumeName: 'compressed-vol',
      volumeMain: 1,
      path: '/opt/zextras/store',
      isCompression: true,
      compressionThreshold: '4096',
      isCurrent: false,
    };

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('step-definition')).toBeTruthy();
    });

    wizardProps.onComplete?.();
    await flushPromises();

    expect(mockCreateVolumeRequest).toHaveBeenCalledWith({
      name: 'compressed-vol',
      rootpath: '/opt/zextras/store',
      type: 1,
      compressBlobs: '1',
      compressionThreshold: '4096',
      isCurrent: 0,
    });
  });

  it('should close wizard when section close is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByText('close-section'));
    expect(setToggleWizardExternal).toHaveBeenCalledWith(false);
  });

  it('should mark config step incomplete for object storage without volume type', () => {
    renderComponent();
    expect(wizardProps.steps[1].isComplete).toBe(false);
  });

  it('should mark config step complete for local block device when path and type are set', async () => {
    mockFormSeed.volume = { volumeAllocation: 1 };
    mockFormSeed.advanced = {
      volumeMain: 1,
      path: '/opt/zextras/store',
      volumeAllocation: 'Local Block Device',
    };

    renderComponent();

    await waitFor(() => {
      expect(wizardProps.steps[1].isComplete).toBe(true);
    });
  });

  it('should mark create step incomplete for local block device without path', async () => {
    mockFormSeed.volume = { volumeAllocation: 1 };
    mockFormSeed.advanced = {
      volumeMain: 1,
      volumeAllocation: 'Local Block Device',
      volumeName: 'local-vol',
    };

    renderComponent();

    await waitFor(() => {
      expect(wizardProps.steps[2].isComplete).toBe(false);
    });
  });

  it('should mark create step complete for local block device when all fields set', async () => {
    mockFormSeed.volume = { volumeAllocation: 1 };
    mockFormSeed.advanced = {
      volumeMain: 1,
      volumeAllocation: 'Local Block Device',
      volumeName: 'local-vol',
      path: '/opt/zextras/store',
    };

    renderComponent();

    await waitFor(() => {
      expect(wizardProps.steps[2].isComplete).toBe(true);
    });
  });
});

/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateMailstoresVolume } from './create-mailstores-volume';

const wizardProps = vi.hoisted(() => ({
  steps: [] as Array<{
    name: string;
    label: string;
    view: React.FC<unknown>;
    canGoNext: () => boolean;
    CancelButton: React.FC<{ onCancel: () => void }>;
    PrevButton: React.FC<unknown>;
    NextButton: React.FC<{ toggleNextBtn?: boolean; onClick?: () => void }>;
  }>,
  onComplete: null as (() => void) | null,
}));

const mockCreateAdvancedRequest = vi.hoisted(() => vi.fn());
const setToggleWizardExternal = vi.hoisted(() => vi.fn());
const setToggleWizardLocal = vi.hoisted(() => vi.fn());

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}));

vi.mock('@zextras/ui-components', () => ({
  HorizontalWizard: ({
    steps,
    onComplete,
  }: {
    steps: typeof wizardProps.steps;
    onComplete: () => void;
  }) => {
    wizardProps.steps = steps;
    wizardProps.onComplete = onComplete;
    return (
      <div data-testid="wizard">
        {steps.map((s, i) => {
          const View = s.view;
          return (
            <div key={s.name} data-testid={`step-${i}`}>
              <View />
            </div>
          );
        })}
      </div>
    );
  },
  Button: ({
    children,
    onClick,
    label,
    type,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    label?: string;
    type?: 'button' | 'reset' | 'submit';
  }) => (
    <button type={type ?? 'button'} onClick={onClick} data-testid={`btn-${label}`}>
      {children ?? label}
    </button>
  ),
  Section: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('./advanced-mailstores-definition', () => ({
  default: () => <div data-testid="step-definition" />,
}));
vi.mock('./advanced-mailstores-config', () => ({
  AdvancedMailstoresConfig: () => <div data-testid="step-config" />,
}));
vi.mock('./advanced-mailstores-create', () => ({
  default: () => <div data-testid="step-create" />,
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
    setToggleWizardLocal,
    volName: 'server-a',
    CreateAdvancedRequest: mockCreateAdvancedRequest,
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
    const { container } = render(<CancelButton onCancel={() => setToggleWizardExternal(false)} />);
    fireEvent.click(container.querySelector('button')!);
    expect(setToggleWizardExternal).toHaveBeenCalledWith(false);
  });

  it('step 0 NextButton with toggleNextBtn=true triggers setToggleWizardLocal', () => {
    renderComponent();
    const NextButton = wizardProps.steps[0].NextButton;
    const { container } = render(<NextButton toggleNextBtn={true} onClick={() => {}} />);
    fireEvent.click(container.querySelector('button')!);
    expect(setToggleWizardLocal).toHaveBeenCalledWith(true);
  });

  it('step 0 NextButton without toggleNextBtn falls through to the wizard-injected onClick', () => {
    renderComponent();
    const injectedOnClick = vi.fn();
    const NextButton = wizardProps.steps[0].NextButton;
    const { container } = render(<NextButton toggleNextBtn={false} onClick={injectedOnClick} />);
    fireEvent.click(container.querySelector('button')!);
    expect(setToggleWizardLocal).not.toHaveBeenCalled();
    expect(injectedOnClick).toHaveBeenCalled();
  });
});

/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { type ComponentProps, type ComponentType, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { HorizontalWizardLayout } from '../horizontal-wizard-layout';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}));

type ButtonMockProps = { label: string; onClick: () => void; disabled?: boolean };

vi.mock('../../basic/button/button', () => ({
  Button: ({ label, onClick, disabled }: ButtonMockProps) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {label}
    </button>
  ),
}));

type Step = {
  name: string;
  label: string;
  icon: string;
  view?: ComponentType<Record<string, unknown>>;
  clickDisabled?: boolean;
  NextButton?: ComponentType<ButtonMockProps>;
  PrevButton?: ComponentType<ButtonMockProps>;
  CancelButton?: ComponentType<ButtonMockProps>;
};

type LayoutProps = ComponentProps<typeof HorizontalWizardLayout>;

function createView(testId: string): ComponentType<Record<string, unknown>> {
  return function View() {
    return <div data-testid={testId}>Content</div>;
  };
}

function createSteps(count = 3, overrides: Array<Partial<Step>> = []): Array<Step> {
  return Array.from({ length: count }, (_, index) => ({
    name: `step${index + 1}`,
    label: `Step ${index + 1}`,
    icon: `Icon${index + 1}`,
    view: createView(`view-step${index + 1}`),
    ...overrides[index],
  }));
}

function setupLayout(overrides: Partial<LayoutProps> = {}) {
  const props = {
    steps: createSteps(),
    onSelection: vi.fn(),
    currentStep: 'step1',
    currentStepIndex: 0,
    goNext: vi.fn(),
    goBack: vi.fn(),
    goToStep: vi.fn(),
    getData: vi.fn(() => ({})),
    completeLoading: true,
    resetWizard: vi.fn(),
    canGoToStep: vi.fn(() => true),
    canGoNext: vi.fn(() => true),
    isFirstStep: true,
    nextI18nLabel: undefined,
    backI18nLabel: undefined,
    cancelI18nLabel: undefined,
    title: 'Test Wizard',
    onComplete: vi.fn(),
    setCompleteLoading: vi.fn(),
    setToggleWizardSection: vi.fn(),
    externalData: {},
    toggleNextBtn: false,
    setToggleNextBtn: vi.fn(),
    sectionRef: { current: null },
    activeRef: { current: null },
    ...overrides,
  } as LayoutProps;
  render(<HorizontalWizardLayout {...props} />);
  return props;
}

describe('HorizontalWizardLayout', () => {
  describe('step labels', () => {
    it('shows the first three labels on the first step', () => {
      setupLayout({ steps: createSteps(5) });
      expect(screen.getByText('Step 1')).toBeTruthy();
      expect(screen.getByText('Step 2')).toBeTruthy();
      expect(screen.getByText('Step 3')).toBeTruthy();
      expect(screen.queryByText('Step 4')).toBeNull();
    });

    it('shows only the adjacent labels on a middle step', () => {
      setupLayout({ steps: createSteps(5), currentStep: 'step3', currentStepIndex: 2 });
      expect(screen.queryByText('Step 1')).toBeNull();
      expect(screen.getByText('Step 2')).toBeTruthy();
      expect(screen.getByText('Step 4')).toBeTruthy();
      expect(screen.queryByText('Step 5')).toBeNull();
    });

    it('shows the last three labels on the last step', () => {
      setupLayout({ steps: createSteps(5), currentStep: 'step5', currentStepIndex: 4 });
      expect(screen.queryByText('Step 2')).toBeNull();
      expect(screen.getByText('Step 3')).toBeTruthy();
      expect(screen.getByText('Step 5')).toBeTruthy();
    });
  });

  describe('step click handling', () => {
    it('goes back to a done step', () => {
      const props = setupLayout({ currentStep: 'step2', currentStepIndex: 1 });
      fireEvent.click(screen.getByText('Step 1'));
      expect(props.goToStep).toHaveBeenCalledWith('step1');
    });

    it('does nothing when the active step is clicked', () => {
      const props = setupLayout();
      fireEvent.click(screen.getByText('Step 1'));
      expect(props.goToStep).not.toHaveBeenCalled();
      expect(props.goNext).not.toHaveBeenCalled();
    });

    it('does nothing when the step has clickDisabled', () => {
      const props = setupLayout({ steps: createSteps(3, [{}, { clickDisabled: true }]) });
      fireEvent.click(screen.getByText('Step 2'));
      expect(props.goToStep).not.toHaveBeenCalled();
      expect(props.goNext).not.toHaveBeenCalled();
    });

    it('calls goNext on a pending step when the current step allows it', () => {
      const goNext = vi.fn(() => true);
      const props = setupLayout({ goNext });
      fireEvent.click(screen.getByText('Step 2'));
      expect(goNext).toHaveBeenCalled();
      expect(props.goToStep).not.toHaveBeenCalled();
    });

    it('falls back to goToStep on a pending step when the current step cannot go next', () => {
      const props = setupLayout({ canGoNext: vi.fn(() => false) });
      fireEvent.click(screen.getByText('Step 2'));
      expect(props.goNext).not.toHaveBeenCalled();
      expect(props.goToStep).toHaveBeenCalledWith('step2');
    });
  });

  describe('views', () => {
    it('renders only the active step view', () => {
      setupLayout({ currentStep: 'step2', currentStepIndex: 1 });
      expect(screen.getByTestId('view-step2')).toBeTruthy();
      expect(screen.queryByTestId('view-step1')).toBeNull();
      expect(screen.queryByTestId('view-step3')).toBeNull();
    });
  });

  describe('footer', () => {
    it('wires cancel, previous and next buttons', () => {
      const props = setupLayout();
      fireEvent.click(screen.getByRole('button', { name: 'CANCEL' }));
      fireEvent.click(screen.getByRole('button', { name: 'PREVIOUS' }));
      fireEvent.click(screen.getByRole('button', { name: 'NEXT' }));
      expect(props.setToggleWizardSection).toHaveBeenCalledWith(false);
      expect(props.goBack).toHaveBeenCalled();
      expect(props.goNext).toHaveBeenCalled();
    });

    it('disables next when the current step cannot go next', () => {
      setupLayout({ canGoNext: vi.fn(() => false) });
      expect(screen.getByRole<HTMLButtonElement>('button', { name: 'NEXT' }).disabled).toBe(true);
    });

    it('disables next while completion is loading', () => {
      setupLayout({ completeLoading: false });
      expect(screen.getByRole<HTMLButtonElement>('button', { name: 'NEXT' }).disabled).toBe(true);
    });

    it('uses the custom buttons of the current step', () => {
      function NextButton({ onClick }: ButtonMockProps): ReactNode {
        return (
          <button type="button" onClick={onClick}>
            custom next
          </button>
        );
      }
      function PrevButton({ onClick }: ButtonMockProps): ReactNode {
        return (
          <button type="button" onClick={onClick}>
            custom prev
          </button>
        );
      }
      function CancelButton({ onClick }: ButtonMockProps): ReactNode {
        return (
          <button type="button" onClick={onClick}>
            custom cancel
          </button>
        );
      }
      const props = setupLayout({
        steps: createSteps(3, [{ NextButton, PrevButton, CancelButton }]),
      });
      fireEvent.click(screen.getByRole('button', { name: 'custom next' }));
      fireEvent.click(screen.getByRole('button', { name: 'custom prev' }));
      fireEvent.click(screen.getByRole('button', { name: 'custom cancel' }));
      expect(props.goNext).toHaveBeenCalled();
      expect(props.goBack).toHaveBeenCalled();
      expect(props.setToggleWizardSection).toHaveBeenCalledWith(false);
    });
  });

  describe('wrapper', () => {
    it('passes wizard and footer to a custom Wrapper', () => {
      function Wrapper({
        title,
        wizard,
        wizardFooter,
      }: {
        title: string;
        wizard: ReactNode;
        wizardFooter: ReactNode;
      }): ReactNode {
        return (
          <section aria-label={title}>
            {wizard}
            {wizardFooter}
          </section>
        );
      }
      setupLayout({ Wrapper });
      expect(screen.getByRole('region', { name: 'Test Wizard' })).toBeTruthy();
      expect(screen.getByTestId('view-step1')).toBeTruthy();
    });
  });
});

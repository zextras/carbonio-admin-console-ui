/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { type ComponentType } from 'react';
import { vi } from 'vitest';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string, fallback?: string) => fallback ?? key,
	}),
}));

vi.mock('../../basic/button/Button', () => ({
	Button: ({ label, onClick, disabled }: any) => (
		<button type="button" onClick={onClick} disabled={disabled}>
			{label}
		</button>
	),
}));

import type { WizardStepV2 } from '../../../hooks/use-wizard-v2';
import { HorizontalWizardLayoutV2 } from '../horizontal-wizard-layout-v2';

function createView(testId: string): ComponentType<Record<string, unknown>> {
	return function View() {
		return <div data-testid={testId}>Content</div>;
	};
}

function createSteps(count = 3, overrides?: Array<Partial<WizardStepV2>>): Array<WizardStepV2> {
	return Array.from({ length: count }, (_, i) => ({
		name: `step${i + 1}`,
		label: `Step ${i + 1}`,
		icon: `Icon${i + 1}`,
		view: createView(`view-step${i + 1}`),
		...(overrides?.[i] ?? {}),
	}));
}

const DefaultWrapper = ({ wizard, wizardFooter }: any) => (
	<>
		{wizard}
		{wizardFooter}
	</>
);

type LayoutProps = React.ComponentProps<typeof HorizontalWizardLayoutV2>;

function renderLayout(overrides: Partial<LayoutProps> & { steps?: Array<WizardStepV2> } = {}) {
	const steps = overrides.steps ?? createSteps();
	const props = {
		steps,
		onSelection: vi.fn(),
		currentStep: 'step1',
		currentStepIndex: 0,
		goNext: vi.fn().mockResolvedValue(undefined),
		goBack: vi.fn(),
		goToStep: vi.fn(),
		getData: vi.fn(() => ({})),
		isComplete: true,
		isSubmitting: false,
		canGoToStep: vi.fn(() => true),
		canGoNext: vi.fn(() => true),
		Wrapper: DefaultWrapper,
		title: 'Test Wizard',
		onComplete: vi.fn(),
		setToggleWizardSection: vi.fn(),
		externalData: {},
		toggleNextBtn: false,
		activeRef: { current: null },
		...overrides,
	} as LayoutProps;
	return render(<HorizontalWizardLayoutV2 {...props} />);
}

describe('HorizontalWizardLayoutV2', () => {
	describe('Step rendering', () => {
		it('renders all step icons', () => {
			const { container } = renderLayout();
			const icons = container.querySelectorAll('ds-icon');
			expect(icons.length).toBeGreaterThanOrEqual(3);
		});

		it('shows labels for first three steps when on first step', () => {
			renderLayout();
			expect(screen.getByText('Step 1')).not.toBeNull();
			expect(screen.getByText('Step 2')).not.toBeNull();
			expect(screen.getByText('Step 3')).not.toBeNull();
		});

		it('hides labels for non-adjacent steps in the middle', () => {
			const steps = createSteps(5);
			renderLayout({
				steps,
				currentStep: 'step3',
				currentStepIndex: 2,
			});
			expect(screen.queryByText('Step 1')).toBeNull();
			expect(screen.getByText('Step 2')).not.toBeNull();
			expect(screen.getByText('Step 3')).not.toBeNull();
			expect(screen.getByText('Step 4')).not.toBeNull();
			expect(screen.queryByText('Step 5')).toBeNull();
		});

		it('shows labels for last three steps when on last step', () => {
			const steps = createSteps(5);
			renderLayout({
				steps,
				currentStep: 'step5',
				currentStepIndex: 4,
			});
			expect(screen.queryByText('Step 1')).toBeNull();
			expect(screen.queryByText('Step 2')).toBeNull();
			expect(screen.getByText('Step 3')).not.toBeNull();
			expect(screen.getByText('Step 4')).not.toBeNull();
			expect(screen.getByText('Step 5')).not.toBeNull();
		});
	});

	describe('StepNavigator colors', () => {
		it('assigns primary color to active, secondary to done, gray1 to pending', () => {
			const { container } = renderLayout({
				currentStep: 'step2',
				currentStepIndex: 1,
			});
			const activeIcon = container.querySelector('ds-icon[icon="Icon2"]');
			const doneIcon = container.querySelector('ds-icon[icon="Icon1"]');
			const pendingIcon = container.querySelector('ds-icon[icon="Icon3"]');
			expect(activeIcon?.getAttribute('color')).toBe('primary');
			expect(doneIcon?.getAttribute('color')).toBe('secondary');
			expect(pendingIcon?.getAttribute('color')).toBe('gray1');
		});
	});

	describe('ChevronRight', () => {
		it('hides chevron on the last step', () => {
			const { container } = renderLayout({
				currentStep: 'step3',
				currentStepIndex: 2,
			});
			const chevrons = container.querySelectorAll('ds-icon[icon="ChevronRight"]');
			expect(chevrons.length).toBe(2);
		});

		it('shows chevron on non-last steps', () => {
			const { container } = renderLayout({
				currentStep: 'step1',
				currentStepIndex: 0,
			});
			const chevrons = container.querySelectorAll('ds-icon[icon="ChevronRight"]');
			expect(chevrons.length).toBe(2);
		});
	});

	describe('Step click handling', () => {
		it('calls goToStep when clicking a done step', () => {
			const goToStep = vi.fn();
			const { container } = renderLayout({
				currentStep: 'step2',
				currentStepIndex: 1,
				goToStep,
			});
			fireEvent.click(container.querySelector('ds-icon[icon="Icon1"]')!);
			expect(goToStep).toHaveBeenCalledWith('step1');
		});

		it('does nothing when clicking the active step', () => {
			const goToStep = vi.fn();
			const goNext = vi.fn().mockResolvedValue(undefined);
			const { container } = renderLayout({
				currentStep: 'step1',
				currentStepIndex: 0,
				goToStep,
				goNext,
			});
			fireEvent.click(container.querySelector('ds-icon[icon="Icon1"]')!);
			expect(goToStep).not.toHaveBeenCalled();
			expect(goNext).not.toHaveBeenCalled();
		});

		it('does nothing when clicking a step with clickDisabled', () => {
			const goToStep = vi.fn();
			const { container } = renderLayout({
				steps: createSteps(3, [{ clickDisabled: true }]),
				goToStep,
			});
			fireEvent.click(container.querySelector('ds-icon[icon="Icon1"]')!);
			expect(goToStep).not.toHaveBeenCalled();
		});

		it('calls goNext when clicking a non-done step and canGoNext is true', () => {
			const goNext = vi.fn().mockResolvedValue(undefined);
			const { container } = renderLayout({
				currentStep: 'step1',
				currentStepIndex: 0,
				goNext,
			});
			fireEvent.click(container.querySelector('ds-icon[icon="Icon3"]')!);
			expect(goNext).toHaveBeenCalled();
		});

		it('calls goToStep when clicking a non-done step and canGoNext is false', () => {
			const goToStep = vi.fn();
			const goNext = vi.fn();
			const { container } = renderLayout({
				currentStep: 'step1',
				currentStepIndex: 0,
				goToStep,
				goNext,
				canGoNext: vi.fn(() => false),
			});
			fireEvent.click(container.querySelector('ds-icon[icon="Icon3"]')!);
			expect(goNext).not.toHaveBeenCalled();
			expect(goToStep).toHaveBeenCalledWith('step3');
		});
	});

	describe('View rendering', () => {
		it('renders the active step View', () => {
			renderLayout({
				currentStep: 'step1',
				currentStepIndex: 0,
			});
			expect(screen.getByTestId('view-step1')).not.toBeNull();
		});

		it('does not render inactive step Views', () => {
			renderLayout({
				currentStep: 'step1',
				currentStepIndex: 0,
			});
			expect(screen.queryByTestId('view-step2')).toBeNull();
			expect(screen.queryByTestId('view-step3')).toBeNull();
		});
	});

	describe('Footer buttons', () => {
		it('renders Cancel, Previous, and Next buttons', () => {
			renderLayout();
			expect(screen.getByText('CANCEL')).not.toBeNull();
			expect(screen.getByText('PREVIOUS')).not.toBeNull();
			expect(screen.getByText('NEXT')).not.toBeNull();
		});

		it('calls setToggleWizardSection(false) when Cancel is clicked', () => {
			const setToggleWizardSection = vi.fn();
			renderLayout({ setToggleWizardSection });
			fireEvent.click(screen.getByText('CANCEL'));
			expect(setToggleWizardSection).toHaveBeenCalledWith(false);
		});

		it('calls goBack when Previous is clicked', () => {
			const goBack = vi.fn();
			renderLayout({ goBack });
			fireEvent.click(screen.getByText('PREVIOUS'));
			expect(goBack).toHaveBeenCalled();
		});

		it('calls goNext when Next is clicked', () => {
			const goNext = vi.fn().mockResolvedValue(undefined);
			renderLayout({ goNext });
			fireEvent.click(screen.getByText('NEXT'));
			expect(goNext).toHaveBeenCalled();
		});

		it('disables Next button when canGoNext returns false', () => {
			renderLayout({ canGoNext: vi.fn(() => false) });
			expect((screen.getByText('NEXT') as HTMLButtonElement).disabled).toBe(true);
		});

		it('disables Next button when isComplete is false', () => {
			renderLayout({ isComplete: false });
			expect((screen.getByText('NEXT') as HTMLButtonElement).disabled).toBe(true);
		});

		it('disables Next button when isSubmitting is true', () => {
			renderLayout({ isSubmitting: true });
			expect((screen.getByText('NEXT') as HTMLButtonElement).disabled).toBe(true);
		});

		it('enables Next button when canGoNext, isComplete, and !isSubmitting', () => {
			renderLayout({
				canGoNext: vi.fn(() => true),
				isComplete: true,
				isSubmitting: false,
			});
			expect((screen.getByText('NEXT') as HTMLButtonElement).disabled).toBe(false);
		});
	});

	describe('Custom buttons', () => {
		it('uses custom NextButton, PrevButton, and CancelButton from step config', () => {
			const CustomNext = (props: any) => (
				<button type="button" data-testid="custom-next" {...props}>
					Custom Next
				</button>
			);
			const CustomPrev = (props: any) => (
				<button type="button" data-testid="custom-prev" {...props}>
					Custom Prev
				</button>
			);
			const CustomCancel = (props: any) => (
				<button type="button" data-testid="custom-cancel" {...props}>
					Custom Cancel
				</button>
			);
			renderLayout({
				steps: createSteps(3, [
					{ NextButton: CustomNext, PrevButton: CustomPrev, CancelButton: CustomCancel },
				]),
			});
			expect(screen.getByTestId('custom-next')).not.toBeNull();
			expect(screen.getByTestId('custom-prev')).not.toBeNull();
			expect(screen.getByTestId('custom-cancel')).not.toBeNull();
		});
	});

	describe('Wrapper', () => {
		it('uses custom Wrapper when provided', () => {
			const CustomWrapper = ({ wizard, wizardFooter }: any) => (
				<div data-testid="custom-wrapper">
					<div data-testid="cw-wizard">{wizard}</div>
					<div data-testid="cw-footer">{wizardFooter}</div>
				</div>
			);
			renderLayout({ Wrapper: CustomWrapper as any });
			expect(screen.getByTestId('custom-wrapper')).not.toBeNull();
			expect(screen.getByTestId('cw-wizard')).not.toBeNull();
			expect(screen.getByTestId('cw-footer')).not.toBeNull();
		});

		it('uses default Wrapper when not provided', () => {
			const { container } = renderLayout({ Wrapper: undefined as any });
			expect(container.textContent).toContain('Step 1');
			expect(container.textContent).toContain('CANCEL');
		});
	});
});

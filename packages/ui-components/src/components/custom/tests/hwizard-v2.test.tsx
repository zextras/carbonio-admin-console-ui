/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { act, fireEvent, render, screen } from '@testing-library/react';
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

import { type WizardStepV2 } from '../../../hooks/use-wizard-v2';
import { HorizontalWizardV2 } from '../hwizard-v2';

const TestWrapper = ({ wizard, wizardFooter }: any) => (
	<div>
		<div data-testid="wizard-content">{wizard}</div>
		<div data-testid="wizard-footer">{wizardFooter}</div>
	</div>
);

function createSteps(): Array<WizardStepV2> {
	const View1: ComponentType<Record<string, unknown>> = () => (
		<div data-testid="view-step1">Content 1</div>
	);
	const View2: ComponentType<Record<string, unknown>> = () => (
		<div data-testid="view-step2">Content 2</div>
	);
	const View3: ComponentType<Record<string, unknown>> = () => (
		<div data-testid="view-step3">Content 3</div>
	);
	return [
		{ name: 'step1', label: 'Step 1', icon: 'Icon1', view: View1 },
		{ name: 'step2', label: 'Step 2', icon: 'Icon2', view: View2 },
		{ name: 'step3', label: 'Step 3', icon: 'Icon3', view: View3 },
	];
}

type WizardProps = React.ComponentProps<typeof HorizontalWizardV2>;

function renderWizard(overrides: Partial<WizardProps> = {}) {
	const props = {
		steps: createSteps(),
		onComplete: vi.fn().mockResolvedValue(undefined),
		Wrapper: TestWrapper,
		title: 'Test Wizard',
		setToggleWizardSection: vi.fn(),
		externalData: {},
		...overrides,
	} as WizardProps;
	return render(<HorizontalWizardV2 {...props} />);
}

describe('HorizontalWizardV2', () => {
	describe('Rendering', () => {
		it('renders the wizard with step labels', () => {
			renderWizard();
			expect(screen.getByText('Step 1')).not.toBeNull();
			expect(screen.getByText('Step 2')).not.toBeNull();
			expect(screen.getByText('Step 3')).not.toBeNull();
		});

		it('renders the active step view', () => {
			renderWizard();
			expect(screen.getByTestId('view-step1')).not.toBeNull();
		});

		it('renders footer buttons', () => {
			renderWizard();
			expect(screen.getByText('CANCEL')).not.toBeNull();
			expect(screen.getByText('PREVIOUS')).not.toBeNull();
			expect(screen.getByText('NEXT')).not.toBeNull();
		});
	});

	describe('Navigation', () => {
		it('advances to the next step when NEXT is clicked', async () => {
			renderWizard();
			fireEvent.click(screen.getByText('NEXT'));
			expect(screen.getByTestId('view-step2')).not.toBeNull();
		});

		it('goes back to the previous step when PREVIOUS is clicked', async () => {
			renderWizard();
			fireEvent.click(screen.getByText('NEXT'));
			expect(screen.getByTestId('view-step2')).not.toBeNull();
			fireEvent.click(screen.getByText('PREVIOUS'));
			expect(screen.getByTestId('view-step1')).not.toBeNull();
		});

		it('calls onComplete when NEXT is clicked on the last step', async () => {
			const onComplete = vi.fn().mockResolvedValue(undefined);
			renderWizard({ onComplete });
			await act(async () => {
				fireEvent.click(screen.getByText('NEXT'));
			});
			await act(async () => {
				fireEvent.click(screen.getByText('NEXT'));
			});
			await act(async () => {
				fireEvent.click(screen.getByText('NEXT'));
			});
			expect(onComplete).toHaveBeenCalled();
		});

		it('calls setToggleWizardSection(false) when CANCEL is clicked', () => {
			const setToggleWizardSection = vi.fn();
			renderWizard({ setToggleWizardSection });
			fireEvent.click(screen.getByText('CANCEL'));
			expect(setToggleWizardSection).toHaveBeenCalledWith(false);
		});
	});

	describe('Controlled mode', () => {
		it('reflects external data changes', () => {
			const { rerender } = renderWizard({
				data: { currentStep: 'step1', steps: {} },
			});
			expect(screen.getByTestId('view-step1')).not.toBeNull();

			rerender(
				<HorizontalWizardV2
					{...({
						steps: createSteps(),
						onComplete: vi.fn().mockResolvedValue(undefined),
						Wrapper: TestWrapper,
						title: 'Test Wizard',
						setToggleWizardSection: vi.fn(),
						externalData: {},
						data: { currentStep: 'step3', steps: {} },
					} as WizardProps)}
				/>,
			);
			expect(screen.getByTestId('view-step3')).not.toBeNull();
		});
	});
});

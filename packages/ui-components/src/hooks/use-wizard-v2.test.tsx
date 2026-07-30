/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { act, renderHook } from '@testing-library/react';
import { type ComponentType } from 'react';
import { vi } from 'vitest';

import { useWizardV2,type WizardStepV2 } from './use-wizard-v2';

type MutableRefObj<T> = { current: T };

function createView(): ComponentType<Record<string, unknown>> {
	return function View() {
		return null;
	};
}

function createSteps(overrides?: Array<Partial<WizardStepV2>>): Array<WizardStepV2> {
	const defaults: Array<WizardStepV2> = [
		{ name: 'step1', label: 'Step 1', icon: 'Icon1', view: createView() },
		{ name: 'step2', label: 'Step 2', icon: 'Icon2', view: createView() },
		{ name: 'step3', label: 'Step 3', icon: 'Icon3', view: createView() },
	];
	if (!overrides) return defaults;
	return defaults.map((s, i) => ({ ...s, ...overrides[i] }));
}

function createRefs(
	sectionRect?: { top: number; bottom: number },
	activeRect?: { top: number; bottom: number },
) {
	const sectionRef: MutableRefObj<any> = {
		current: sectionRect
			? {
					getBoundingClientRect: () => sectionRect,
					scrollBy: vi.fn(),
					scrollTo: vi.fn(),
					scrollHeight: 500,
				}
			: null,
	};
	const activeRef: MutableRefObj<any> = {
		current: activeRect
			? {
					getBoundingClientRect: () => activeRect,
				}
			: null,
	};
	return { sectionRef, activeRef };
}

type HookProps = Parameters<typeof useWizardV2>[0];

function renderWizard(overrides: Partial<HookProps> & { sectionRef?: any; activeRef?: any } = {}) {
	const refs = createRefs();
	const steps = overrides.steps ?? createSteps();
	const props: HookProps = {
		data: undefined,
		defaultData: undefined,
		steps,
		onChange: undefined,
		onComplete: vi.fn(),
		sectionRef: overrides.sectionRef ?? refs.sectionRef,
		activeRef: overrides.activeRef ?? refs.activeRef,
		title: 'Test Wizard',
		activeStep: undefined,
		...overrides,
	};
	const result = renderHook((p: HookProps) => useWizardV2(p), { initialProps: props });
	return {
		...result,
		sectionRef: props.sectionRef,
		activeRef: props.activeRef,
		steps: props.steps,
	};
}

describe('useWizardV2', () => {
	describe('Initialization', () => {
		it('initializes with built-in default when no data and no defaultData', () => {
			const { result } = renderWizard();
			expect(result.current.data).toEqual({ currentStep: 'step1', steps: {} });
			expect(result.current.currentStep).toBe('step1');
			expect(result.current.currentStepIndex).toBe(0);
			expect(result.current.isFirstStep).toBe(true);
		});

		it('initializes with defaultData when no data provided', () => {
			const defaultData = { currentStep: 'step2', steps: { foo: 'bar' } };
			const { result } = renderWizard({ defaultData });
			expect(result.current.data).toEqual(defaultData);
			expect(result.current.currentStep).toBe('step2');
		});

		it('initializes with provided data in controlled mode', () => {
			const data = { currentStep: 'step3', steps: { existing: true } };
			const { result } = renderWizard({ data });
			expect(result.current.data).toEqual(data);
			expect(result.current.currentStep).toBe('step3');
		});
	});

	describe('onSelection', () => {
		it('replaces step data by default (replace=true)', () => {
			const { result } = renderWizard();
			act(() => {
				result.current.onSelection({ key: 'value' });
			});
			expect(result.current.data.steps.step1).toEqual({ key: 'value' });
		});

		it('merges step data when replace is false', () => {
			const { result } = renderWizard();
			act(() => {
				result.current.onSelection({ a: 1 });
			});
			act(() => {
				result.current.onSelection({ b: 2 }, false);
			});
			expect(result.current.data.steps.step1).toEqual({ a: 1, b: 2 });
		});

		it('calls onChange with the new state', () => {
			const onChange = vi.fn();
			const { result } = renderWizard({ onChange });
			act(() => {
				result.current.onSelection({ key: 'value' });
			});
			expect(onChange).toHaveBeenCalledWith(
				expect.objectContaining({
					currentStep: 'step1',
					steps: { step1: { key: 'value' } },
				}),
			);
		});

		it('does not update inner data in controlled mode', () => {
			const data = { currentStep: 'step1', steps: {} };
			const { result } = renderWizard({ data });
			const initialData = result.current.data;
			act(() => {
				result.current.onSelection({ key: 'value' });
			});
			expect(result.current.data).toBe(initialData);
		});
	});

	describe('resetWizard', () => {
		it('resets to first step in uncontrolled mode', () => {
			const { result } = renderWizard();
			act(() => {
				result.current.goToStep('step2');
			});
			expect(result.current.currentStep).toBe('step2');
			act(() => {
				result.current.resetWizard();
			});
			expect(result.current.currentStep).toBe('step1');
			expect(result.current.data.steps).toEqual({});
		});

		it('calls onChange with reset flag', () => {
			const onChange = vi.fn();
			const { result } = renderWizard({ onChange });
			act(() => {
				result.current.resetWizard();
			});
			expect(onChange).toHaveBeenCalledWith(
				expect.objectContaining({ reset: true, currentStep: 'step1' }),
			);
		});
	});

	describe('goToStep', () => {
		it('navigates to the specified step', () => {
			const { result } = renderWizard();
			act(() => {
				result.current.goToStep('step2');
			});
			expect(result.current.currentStep).toBe('step2');
			expect(result.current.currentStepIndex).toBe(1);
		});

		it('keeps only steps up to the target step', () => {
			const { result } = renderWizard();
			act(() => {
				result.current.onSelection({ a: 1 });
			});
			act(() => {
				result.current.goToStep('step2');
			});
			act(() => {
				result.current.onSelection({ b: 2 });
			});
			act(() => {
				result.current.goToStep('step1');
			});
			expect(result.current.data.steps).toHaveProperty('step1');
			expect(result.current.data.steps).not.toHaveProperty('step2');
		});

		it('calls onChange when navigating', () => {
			const onChange = vi.fn();
			const { result } = renderWizard({ onChange });
			act(() => {
				result.current.goToStep('step2');
			});
			expect(onChange).toHaveBeenCalledWith(
				expect.objectContaining({ currentStep: 'step2' }),
			);
		});
	});

	describe('goNext', () => {
		it('navigates to next step when not on last step', async () => {
			const { result } = renderWizard();
			await act(async () => {
				await result.current.goNext();
			});
			expect(result.current.currentStep).toBe('step2');
		});

		it('calls onComplete when on last step', async () => {
			const onComplete = vi.fn().mockResolvedValue(undefined);
			const { result } = renderWizard({ onComplete });
			act(() => {
				result.current.goToStep('step3');
			});
			await act(async () => {
				await result.current.goNext();
			});
			expect(onComplete).toHaveBeenCalled();
		});

		it('toggles isSubmitting during onComplete and resets after', async () => {
			let resolveFn: () => void;
			const onComplete = vi.fn().mockImplementation(
				() =>
					new Promise<void>((resolve) => {
						resolveFn = resolve;
					}),
			);
			const { result } = renderWizard({ onComplete });
			act(() => {
				result.current.goToStep('step3');
			});

			let goNextPromise!: Promise<void>;
			act(() => {
				goNextPromise = result.current.goNext();
			});
			expect(result.current.isSubmitting).toBe(true);

			await act(async () => {
				resolveFn!();
				await goNextPromise;
			});
			expect(result.current.isSubmitting).toBe(false);
		});
	});

	describe('goBack', () => {
		it('navigates to previous step', () => {
			const { result } = renderWizard();
			act(() => {
				result.current.goToStep('step2');
			});
			act(() => {
				result.current.goBack();
			});
			expect(result.current.currentStep).toBe('step1');
		});

		it('does nothing on first step', () => {
			const { result } = renderWizard();
			act(() => {
				result.current.goBack();
			});
			expect(result.current.currentStep).toBe('step1');
		});
	});

	describe('canGoToStep / canGoNext', () => {
		it('returns true when step has no canGoNext function', () => {
			const { result } = renderWizard();
			expect(result.current.canGoToStep('step1')).toBe(true);
		});

		it('returns step.canGoNext() result when defined', () => {
			const canGoNextFn = vi.fn().mockReturnValue(false);
			const { result } = renderWizard({
				steps: createSteps([{ canGoNext: canGoNextFn }]),
			});
			expect(result.current.canGoToStep('step1')).toBe(false);
			expect(canGoNextFn).toHaveBeenCalled();
		});

		it('canGoNext reflects current step canGoNext', () => {
			const canGoNextFn = vi.fn().mockReturnValue(false);
			const { result } = renderWizard({
				steps: createSteps([{ canGoNext: canGoNextFn }]),
			});
			expect(result.current.canGoNext()).toBe(false);
		});

		it('canGoNext returns true when step has no canGoNext', () => {
			const { result } = renderWizard();
			expect(result.current.canGoNext()).toBe(true);
		});
	});

	describe('isComplete', () => {
		it('defaults to true when not set on step config', () => {
			const { result } = renderWizard();
			expect(result.current.isComplete).toBe(true);
		});

		it('returns step config value when set to false', () => {
			const { result } = renderWizard({
				steps: createSteps([{ isComplete: false }]),
			});
			expect(result.current.isComplete).toBe(false);
		});
	});

	describe('toggleNextBtn', () => {
		it('defaults to false', () => {
			const { result } = renderWizard();
			expect(result.current.toggleNextBtn).toBe(false);
		});

		it('returns step config value when set to true', () => {
			const { result } = renderWizard({
				steps: createSteps([{ toggleNextBtn: true }]),
			});
			expect(result.current.toggleNextBtn).toBe(true);
		});
	});

	describe('getData', () => {
		it('returns the current data from ref after onSelection', () => {
			const { result } = renderWizard();
			act(() => {
				result.current.onSelection({ key: 'value' });
			});
			const data = result.current.getData();
			expect(data).toEqual(
				expect.objectContaining({
					currentStep: 'step1',
					steps: { step1: { key: 'value' } },
				}),
			);
		});
	});

	describe('isFirstStep', () => {
		it('returns true on first step', () => {
			const { result } = renderWizard();
			expect(result.current.isFirstStep).toBe(true);
		});

		it('returns false on non-first step', () => {
			const { result } = renderWizard();
			act(() => {
				result.current.goToStep('step2');
			});
			expect(result.current.isFirstStep).toBe(false);
		});
	});

	describe('activeStep', () => {
		it('navigates to activeStep on mount', () => {
			const { result } = renderWizard({ activeStep: 'step2' });
			expect(result.current.currentStep).toBe('step2');
		});

		it('does not navigate when activeStep is not provided', () => {
			const { result } = renderWizard();
			expect(result.current.currentStep).toBe('step1');
		});
	});

	describe('Controlled mode data sync', () => {
		it('updates currentStep when data.currentStep changes', () => {
			const steps = createSteps();
			const sectionRef = { current: null };
			const activeRef = { current: null };

			const { result, rerender } = renderHook((p: HookProps) => useWizardV2(p), {
				initialProps: {
					data: { currentStep: 'step1', steps: {} },
					defaultData: undefined,
					steps,
					onChange: undefined,
					onComplete: vi.fn(),
					sectionRef,
					activeRef,
					title: 'Test',
					activeStep: undefined,
				},
			});
			expect(result.current.currentStep).toBe('step1');

			rerender({
				data: { currentStep: 'step2', steps: {} },
				defaultData: undefined,
				steps,
				onChange: undefined,
				onComplete: vi.fn(),
				sectionRef,
				activeRef,
				title: 'Test',
				activeStep: undefined,
			});
			expect(result.current.currentStep).toBe('step2');
		});
	});

	describe('Scroll effect', () => {
		it('calls scrollBy when active element is above section bounds', () => {
			const { sectionRef, activeRef } = createRefs(
				{ top: 100, bottom: 500 },
				{ top: 50, bottom: 80 },
			);
			renderWizard({ sectionRef, activeRef });
			expect(sectionRef.current.scrollBy).toHaveBeenCalledWith(
				expect.objectContaining({ behavior: 'smooth' }),
			);
		});

		it('calls scrollBy when active element is below section bounds', () => {
			const { sectionRef, activeRef } = createRefs(
				{ top: 0, bottom: 200 },
				{ top: 250, bottom: 300 },
			);
			renderWizard({ sectionRef, activeRef });
			expect(sectionRef.current.scrollBy).toHaveBeenCalledWith(
				expect.objectContaining({ behavior: 'smooth' }),
			);
		});

		it('does not scroll when active element is within section bounds', () => {
			const { sectionRef, activeRef } = createRefs(
				{ top: 0, bottom: 500 },
				{ top: 100, bottom: 200 },
			);
			renderWizard({ sectionRef, activeRef });
			expect(sectionRef.current.scrollBy).not.toHaveBeenCalled();
			expect(sectionRef.current.scrollTo).not.toHaveBeenCalled();
		});
	});

	describe('getStepIndex', () => {
		it('returns the index of the given step name', () => {
			const { result } = renderWizard();
			expect(result.current.getStepIndex('step2')).toBe(1);
			expect(result.current.getStepIndex('step3')).toBe(2);
			expect(result.current.getStepIndex('unknown')).toBe(-1);
		});
	});
});

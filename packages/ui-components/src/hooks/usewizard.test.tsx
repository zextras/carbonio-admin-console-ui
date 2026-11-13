/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useWizard } from './usewizard';

type Step = {
  name: string;
  label: string;
  canGoNext?: (stepData: unknown, data: unknown) => boolean;
};

type HookProps = Parameters<typeof useWizard>[0];

type Rect = { top: number; bottom: number };

function createSteps(overrides: Array<Partial<Step>> = []): Array<Step> {
  return ['step1', 'step2', 'step3'].map((name, index) => ({
    name,
    label: `Step ${index + 1}`,
    ...overrides[index],
  }));
}

function createRefs(sectionRect?: Rect, activeRect?: Rect) {
  const scrollBy = vi.fn();
  const sectionRef = {
    current: sectionRect ? { getBoundingClientRect: () => sectionRect, scrollBy } : null,
  };
  const activeRef = {
    current: activeRect ? { getBoundingClientRect: () => activeRect } : null,
  };
  return { sectionRef, activeRef, scrollBy };
}

function buildProps(overrides: Partial<HookProps> = {}): HookProps {
  const { sectionRef, activeRef } = createRefs();
  return {
    data: undefined,
    defaultData: undefined,
    steps: createSteps(),
    onChange: undefined,
    onComplete: vi.fn(),
    sectionRef,
    activeRef,
    title: 'Test Wizard',
    activeStep: undefined,
    ...overrides,
  };
}

function renderWizard(overrides: Partial<HookProps> = {}) {
  const props = buildProps(overrides);
  const { result, rerender } = renderHook((p: HookProps) => useWizard(p), {
    initialProps: props,
  });
  return { result, rerender, props };
}

describe('useWizard', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0);
      return 0;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('starts on the first step with empty data when nothing is provided', () => {
      const { result } = renderWizard();
      expect(result.current.currentStep).toBe('step1');
      expect(result.current.currentStepIndex).toBe(0);
      expect(result.current.isFirstStep).toBe(true);
      expect(result.current.data).toEqual({ currentStep: 'step1', steps: {} });
      expect(result.current.completeLoading).toBe(true);
      expect(result.current.title).toBe('Test Wizard');
    });

    it('starts from defaultData in uncontrolled mode', () => {
      const defaultData = { currentStep: 'step2', steps: { step1: { a: 1 } } };
      const { result } = renderWizard({ defaultData });
      expect(result.current.currentStep).toBe('step2');
      expect(result.current.isFirstStep).toBe(false);
      expect(result.current.data).toEqual(defaultData);
    });

    it('uses the provided data in controlled mode', () => {
      const data = { currentStep: 'step3', steps: { step1: { a: 1 } } };
      const { result } = renderWizard({ data });
      expect(result.current.currentStep).toBe('step3');
      expect(result.current.currentStepIndex).toBe(2);
      expect(result.current.getData()).toEqual(data);
    });

    it('starts on activeStep when provided', () => {
      const { result } = renderWizard({ activeStep: 'step2' });
      expect(result.current.currentStep).toBe('step2');
    });
  });

  describe('activeStep changes', () => {
    it('moves to the new activeStep when the prop changes', () => {
      const { result, rerender, props } = renderWizard();
      rerender({ ...props, activeStep: 'step3' });
      expect(result.current.currentStep).toBe('step3');
    });

    it('keeps the current step when activeStep is cleared', () => {
      const { result, rerender, props } = renderWizard({ activeStep: 'step2' });
      rerender({ ...props, activeStep: undefined });
      expect(result.current.currentStep).toBe('step2');
    });
  });

  describe('onSelection', () => {
    it('replaces the current step data and notifies onChange', () => {
      const onChange = vi.fn();
      const { result } = renderWizard({ onChange });
      act(() => {
        result.current.onSelection({ a: 1 });
      });
      act(() => {
        result.current.onSelection({ b: 2 });
      });
      const expected = { currentStep: 'step1', steps: { step1: { b: 2 } } };
      expect(result.current.data).toEqual(expected);
      expect(onChange).toHaveBeenLastCalledWith(expected);
    });

    it('merges with the current step data when replace is false', () => {
      const { result } = renderWizard();
      act(() => {
        result.current.onSelection({ a: 1 });
      });
      act(() => {
        result.current.onSelection({ b: 2 }, false);
      });
      expect(result.current.getData().steps.step1).toEqual({ a: 1, b: 2 });
    });

    it('does not change the controlled data but notifies onChange', () => {
      const onChange = vi.fn();
      const data = { currentStep: 'step1', steps: {} };
      const { result } = renderWizard({ data, onChange });
      act(() => {
        result.current.onSelection({ a: 1 });
      });
      expect(result.current.data).toBe(data);
      expect(onChange).toHaveBeenCalledWith({ currentStep: 'step1', steps: { step1: { a: 1 } } });
    });
  });

  describe('navigation', () => {
    it('goNext moves to the next step', () => {
      const onChange = vi.fn();
      const { result } = renderWizard({ onChange });
      act(() => {
        result.current.goNext();
      });
      expect(result.current.currentStep).toBe('step2');
      expect(onChange).toHaveBeenCalledWith({ currentStep: 'step2', steps: {} });
    });

    it('goBack moves to the previous step', () => {
      const { result } = renderWizard({ activeStep: 'step3' });
      act(() => {
        result.current.goBack();
      });
      expect(result.current.currentStep).toBe('step2');
    });

    it('goBack does nothing on the first step', () => {
      const onChange = vi.fn();
      const { result } = renderWizard({ onChange });
      act(() => {
        result.current.goBack();
      });
      expect(result.current.currentStep).toBe('step1');
      expect(onChange).not.toHaveBeenCalled();
    });

    it('goToStep drops the data of the steps after the target step', () => {
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
      expect(result.current.getData()).toEqual({
        currentStep: 'step1',
        steps: { step1: { a: 1 } },
      });
    });

    it('goToStep only notifies onChange in controlled mode', () => {
      const onChange = vi.fn();
      const data = { currentStep: 'step1', steps: { step1: { a: 1 } } };
      const { result } = renderWizard({ data, onChange });
      act(() => {
        result.current.goToStep('step2');
      });
      expect(result.current.currentStep).toBe('step1');
      expect(onChange).toHaveBeenCalledWith({ currentStep: 'step2', steps: { step1: { a: 1 } } });
    });

    it('goToStep scrolls the active element into view on the next frame', () => {
      const { sectionRef, activeRef, scrollBy } = createRefs(
        { top: 0, bottom: 100 },
        { top: 150, bottom: 200 },
      );
      const { result } = renderWizard({ sectionRef, activeRef });
      scrollBy.mockClear();
      act(() => {
        result.current.goToStep('step2');
      });
      expect(scrollBy).toHaveBeenCalledWith({ top: 134, behavior: 'smooth' });
    });
  });

  describe('completion', () => {
    it('calls onComplete on the last step and exposes the loading state', () => {
      const onComplete = vi.fn();
      const { result } = renderWizard({ onComplete, activeStep: 'step3' });
      act(() => {
        result.current.onSelection({ done: true });
      });
      act(() => {
        result.current.goNext();
      });
      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({ steps: { step3: { done: true } } }),
        expect.any(Function),
        expect.any(Function),
      );
      expect(result.current.completeLoading).toBe(false);
      expect(result.current.currentStep).toBe('step3');
    });

    it('lets onComplete restore the loading state', () => {
      const onComplete = vi.fn((_data, setCompleteLoading: (value: boolean) => void) =>
        setCompleteLoading(true),
      );
      const { result } = renderWizard({ onComplete, activeStep: 'step3' });
      act(() => {
        result.current.goNext();
      });
      expect(result.current.completeLoading).toBe(true);
    });

    it('resetWizard returns to the first step with empty data', () => {
      const onChange = vi.fn();
      const { result } = renderWizard({ onChange });
      act(() => {
        result.current.onSelection({ a: 1 });
      });
      act(() => {
        result.current.goNext();
      });
      act(() => {
        result.current.resetWizard();
      });
      const expected = { currentStep: 'step1', steps: {}, reset: true };
      expect(result.current.currentStep).toBe('step1');
      expect(result.current.data).toEqual(expected);
      expect(result.current.completeLoading).toBe(true);
      expect(onChange).toHaveBeenLastCalledWith(expected);
    });

    it('resetWizard only notifies onChange in controlled mode', () => {
      const onChange = vi.fn();
      const data = { currentStep: 'step2', steps: { step1: { a: 1 } } };
      const { result } = renderWizard({ data, onChange });
      act(() => {
        result.current.resetWizard();
      });
      expect(result.current.currentStep).toBe('step2');
      expect(onChange).toHaveBeenCalledWith({ currentStep: 'step1', steps: {}, reset: true });
    });
  });

  describe('canGoToStep / canGoNext', () => {
    it('returns true when the step has no canGoNext', () => {
      const { result } = renderWizard();
      expect(result.current.canGoToStep('step2')).toBe(true);
      expect(result.current.canGoNext()).toBe(true);
    });

    it('delegates to the step canGoNext with the step data and the whole data', () => {
      const canGoNext = vi.fn((stepData: unknown) => !!stepData);
      const { result } = renderWizard({ steps: createSteps([{ canGoNext }]) });
      expect(result.current.canGoNext()).toBe(false);
      act(() => {
        result.current.onSelection({ a: 1 });
      });
      expect(result.current.canGoNext()).toBe(true);
      expect(canGoNext).toHaveBeenLastCalledWith(
        { a: 1 },
        { currentStep: 'step1', steps: { step1: { a: 1 } } },
      );
    });
  });

  describe('controlled data sync', () => {
    it('follows data.currentStep and exposes the latest data through getData', () => {
      const { result, rerender, props } = renderWizard({
        data: { currentStep: 'step1', steps: {} },
      });
      const nextData = { currentStep: 'step2', steps: { step1: { a: 1 } } };
      rerender({ ...props, data: nextData });
      expect(result.current.currentStep).toBe('step2');
      expect(result.current.getData()).toBe(nextData);
    });
  });

  describe('scroll on mount', () => {
    it('scrolls when the active element is above the section', () => {
      const { sectionRef, activeRef, scrollBy } = createRefs(
        { top: 100, bottom: 500 },
        { top: 50, bottom: 80 },
      );
      renderWizard({ sectionRef, activeRef });
      expect(scrollBy).toHaveBeenCalledWith({ top: -66, behavior: 'smooth' });
    });

    it('does not scroll when the active element is visible', () => {
      const { sectionRef, activeRef, scrollBy } = createRefs(
        { top: 0, bottom: 500 },
        { top: 100, bottom: 200 },
      );
      renderWizard({ sectionRef, activeRef });
      expect(scrollBy).not.toHaveBeenCalled();
    });
  });

  describe('toggleNextBtn', () => {
    it('can be toggled through setToggleNextBtn', () => {
      const { result } = renderWizard();
      expect(result.current.toggleNextBtn).toBe(false);
      act(() => {
        result.current.setToggleNextBtn(true);
      });
      expect(result.current.toggleNextBtn).toBe(true);
    });
  });
});

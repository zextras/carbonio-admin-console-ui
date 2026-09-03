/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../ds-stepper';

import { LitElement } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import type { DsStepper, DsStepperStep } from '../ds-stepper';

let element: DsStepper;

const SAMPLE_STEPS: Array<DsStepperStep> = [
  { label: 'General information', description: 'Give this Class of Service a recognizable name.' },
  { label: 'Features', description: 'Choose features available for this COS.' },
  { label: 'Review' },
];

async function createDsStepper(
  props: Partial<Pick<DsStepper, 'steps' | 'current'>> = {},
): Promise<DsStepper> {
  element = document.createElement('ds-stepper');
  if (props.steps !== undefined) element.steps = props.steps;
  if (props.current !== undefined) element.current = props.current;
  document.body.appendChild(element);
  await element.updateComplete;
  return element;
}

function getStepItems(el: DsStepper): Array<HTMLLIElement> {
  return Array.from(el.shadowRoot!.querySelectorAll<HTMLLIElement>('li.step'));
}

afterEach(() => {
  element?.remove();
});

describe('ds-stepper', () => {
  describe('component registration', () => {
    it('should be registered as a custom element', () => {
      expect(customElements.get('ds-stepper')).toBeDefined();
    });

    it('should be an instance of LitElement', async () => {
      const el = await createDsStepper({ steps: SAMPLE_STEPS });
      expect(el).toBeInstanceOf(LitElement);
    });
  });

  describe('default properties', () => {
    it('should default current to 0', async () => {
      const el = await createDsStepper();
      expect(el.current).toBe(0);
    });

    it('should reflect current as an attribute', async () => {
      const el = await createDsStepper({ steps: SAMPLE_STEPS, current: 1 });
      expect(el.getAttribute('current')).toBe('1');
    });

    it('should render nothing for an empty steps array', async () => {
      const el = await createDsStepper({ steps: [] });
      expect(getStepItems(el)).toHaveLength(0);
    });
  });

  describe('rendering', () => {
    it('should render one <li> per step', async () => {
      const el = await createDsStepper({ steps: SAMPLE_STEPS });
      expect(getStepItems(el)).toHaveLength(SAMPLE_STEPS.length);
    });

    it('should project step labels and descriptions into ds-text children', async () => {
      await createDsStepper({ steps: SAMPLE_STEPS });
      await expect.element(page.getByText('General information', { exact: true })).toBeVisible();
      await expect
        .element(page.getByText('Give this Class of Service a recognizable name.', { exact: true }))
        .toBeVisible();
      await expect.element(page.getByText('Features', { exact: true })).toBeVisible();
    });

    it('should omit the description ds-text when description is absent', async () => {
      const el = await createDsStepper({ steps: SAMPLE_STEPS, current: 2 });
      const lastStep = getStepItems(el)[2];
      const descriptions = lastStep.querySelectorAll('ds-text[as="p"]');
      expect(descriptions).toHaveLength(0);
    });
  });

  describe('per-step data-state', () => {
    it('should mark prior steps completed, the current one active, and later steps upcoming', async () => {
      const el = await createDsStepper({ steps: SAMPLE_STEPS, current: 1 });
      const items = getStepItems(el);
      expect(items[0].dataset.state).toBe('completed');
      expect(items[1].dataset.state).toBe('active');
      expect(items[2].dataset.state).toBe('upcoming');
    });

    it('should set aria-current="step" on the active step only', async () => {
      const el = await createDsStepper({ steps: SAMPLE_STEPS, current: 1 });
      const items = getStepItems(el);
      expect(items[0].getAttribute('aria-current')).toBeNull();
      expect(items[1].getAttribute('aria-current')).toBe('step');
      expect(items[2].getAttribute('aria-current')).toBeNull();
    });

    it('should render a Checkmark icon inside completed circles', async () => {
      const el = await createDsStepper({ steps: SAMPLE_STEPS, current: 2 });
      const items = getStepItems(el);
      expect(items[0].querySelector('ds-icon[icon="Checkmark"]')).not.toBeNull();
      expect(items[1].querySelector('ds-icon[icon="Checkmark"]')).not.toBeNull();
      expect(items[2].querySelector('ds-icon[icon="Checkmark"]')).toBeNull();
    });

    it('should render the 1-based numeric index in non-completed circles', async () => {
      const el = await createDsStepper({ steps: SAMPLE_STEPS, current: 0 });
      const items = getStepItems(el);
      expect(items[0].querySelector('.circle span')?.textContent).toBe('1');
      expect(items[1].querySelector('.circle span')?.textContent).toBe('2');
      expect(items[2].querySelector('.circle span')?.textContent).toBe('3');
    });
  });

  describe('connector', () => {
    it('should render a connector between adjacent steps but not after the last one', async () => {
      const el = await createDsStepper({ steps: SAMPLE_STEPS });
      const items = getStepItems(el);
      expect(items[0].querySelector('.connector')).not.toBeNull();
      expect(items[1].querySelector('.connector')).not.toBeNull();
      expect(items[2].querySelector('.connector')).toBeNull();
    });
  });

  describe('reactivity', () => {
    it('should re-render data-state when current changes', async () => {
      const el = await createDsStepper({ steps: SAMPLE_STEPS, current: 0 });
      let items = getStepItems(el);
      expect(items[0].dataset.state).toBe('active');
      expect(items[1].dataset.state).toBe('upcoming');

      el.current = 1;
      await el.updateComplete;

      items = getStepItems(el);
      expect(items[0].dataset.state).toBe('completed');
      expect(items[1].dataset.state).toBe('active');
      expect(items[2].dataset.state).toBe('upcoming');
    });

    it('should re-render when steps property is reassigned', async () => {
      const el = await createDsStepper({ steps: SAMPLE_STEPS.slice(0, 2), current: 0 });
      expect(getStepItems(el)).toHaveLength(2);

      el.steps = SAMPLE_STEPS;
      await el.updateComplete;
      expect(getStepItems(el)).toHaveLength(3);
    });
  });
});

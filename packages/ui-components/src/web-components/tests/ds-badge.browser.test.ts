/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../ds-badge';

import { LitElement } from 'lit';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

// eslint-disable-next-line no-duplicate-imports
import type { DsBadge } from '../ds-badge';

let element: DsBadge;

async function createDsBadge(
  attrs: Record<string, string> = {},
  textContent = '',
): Promise<DsBadge> {
  element = document.createElement('ds-badge');
  for (const [key, value] of Object.entries(attrs)) {
    element.setAttribute(key, value);
  }
  if (textContent) {
    element.textContent = textContent;
  }
  document.body.appendChild(element);
  await element.updateComplete;
  return element;
}

afterEach(() => {
  element?.remove();
});

describe('ds-badge', () => {
  describe('component registration', () => {
    it('should be registered as a custom element', () => {
      expect(customElements.get('ds-badge')).toBeDefined();
    });

    it('should be an instance of LitElement', async () => {
      const el = await createDsBadge({}, 'Badge');
      expect(el).toBeInstanceOf(LitElement);
    });
  });

  describe('color property', () => {
    it('should default to "success"', async () => {
      const el = await createDsBadge({}, 'Default badge');
      expect(el.color).toBe('success');
    });

    it.each([{ color: 'success' }, { color: 'warning' }])(
      'should accept color="$color" via attribute',
      async ({ color }) => {
        const el = await createDsBadge({ color }, `${color} badge`);
        expect(el.color).toBe(color);
      },
    );

    it('should reflect the color attribute on the host element', async () => {
      const el = await createDsBadge({}, 'Reflected badge');
      expect(el.hasAttribute('color')).toBe(true);
      expect(el.getAttribute('color')).toBe('success');

      el.color = 'warning';
      await el.updateComplete;
      expect(el.getAttribute('color')).toBe('warning');
    });

    it('should update when color changes dynamically', async () => {
      const el = await createDsBadge({ color: 'success' }, 'Dynamic badge');

      el.color = 'warning';
      await el.updateComplete;
      expect(el.color).toBe('warning');
      expect(el.getAttribute('color')).toBe('warning');

      el.color = 'success';
      await el.updateComplete;
      expect(el.color).toBe('success');
      expect(el.getAttribute('color')).toBe('success');
    });
  });

  describe('CSS styles', () => {
    it('should apply display: inline-flex on the host', async () => {
      const el = await createDsBadge({}, 'Styled badge');
      const computed = globalThis.getComputedStyle(el);
      expect(computed.display).toBe('inline-flex');
    });

    it('should apply align-items: center on the host', async () => {
      const el = await createDsBadge({}, 'Styled badge');
      const computed = globalThis.getComputedStyle(el);
      expect(computed.alignItems).toBe('center');
    });

    it('should apply justify-content: center on the host', async () => {
      const el = await createDsBadge({}, 'Styled badge');
      const computed = globalThis.getComputedStyle(el);
      expect(computed.justifyContent).toBe('center');
    });

    it('should apply border-radius: 9999px (pill shape) on the host', async () => {
      const el = await createDsBadge({}, 'Pill badge');
      const computed = globalThis.getComputedStyle(el);
      expect(computed.borderRadius).toBe('9999px');
    });

    it('should apply success background by default', async () => {
      const el = await createDsBadge({}, 'Success badge');
      const computed = globalThis.getComputedStyle(el);
      expect(computed.backgroundColor).toBe('rgb(224, 249, 195)');
    });

    it('should apply warning background when color="warning"', async () => {
      const el = await createDsBadge({ color: 'warning' }, 'Warning badge');
      const computed = globalThis.getComputedStyle(el);
      expect(computed.backgroundColor).toBe('rgb(255, 250, 245)');
    });

    it('should update background when color changes dynamically', async () => {
      const el = await createDsBadge({ color: 'success' }, 'Dynamic bg');
      expect(globalThis.getComputedStyle(el).backgroundColor).toBe('rgb(224, 249, 195)');

      el.color = 'warning';
      await el.updateComplete;

      expect(globalThis.getComputedStyle(el).backgroundColor).toBe('rgb(255, 250, 245)');
    });
  });

  describe('slot content projection', () => {
    it('should project slotted content via the default slot', async () => {
      const el = await createDsBadge();
      const span = document.createElement('span');
      span.textContent = 'Slotted child';
      span.slot = '';
      el.appendChild(span);
      document.body.appendChild(el);
      await el.updateComplete;

      const slot = el.shadowRoot!.querySelector('slot');
      expect(slot).not.toBeNull();

      const assigned = slot!.assignedNodes();
      expect(assigned).toHaveLength(1);
      expect((assigned[0] as HTMLSpanElement).textContent).toBe('Slotted child');
    });

    it('should render text content projected into the slot', async () => {
      await createDsBadge({}, 'Hello Badge');
      await expect.element(page.getByText('Hello Badge')).toBeVisible();
    });
  });
});

/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../ds-tag-icon';

import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

// eslint-disable-next-line no-duplicate-imports
import type { DsTagIcon } from '../ds-tag-icon';

let element: DsTagIcon;

async function createDsBadgeIcon(
  attrs: Record<string, string> = {},
  textContent = '',
): Promise<DsTagIcon> {
  element = document.createElement('ds-tag-icon');
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

describe('ds-tag-icon', () => {
  describe('custom element registration', () => {
    it('should be defined as ds-tag-icon', () => {
      expect(customElements.get('ds-tag-icon')).toBeDefined();
    });

    it('should be an instance of DsBadgeIcon', async () => {
      const el = await createDsBadgeIcon();
      expect(el).toBeInstanceOf(customElements.get('ds-tag-icon')!);
    });
  });

  describe('type property', () => {
    it('should default to "success"', async () => {
      const el = await createDsBadgeIcon();
      expect(el.type).toBe('success');
    });

    it('should reflect the type attribute on the host element', async () => {
      const el = await createDsBadgeIcon({ type: 'warning' });
      expect(el.hasAttribute('type')).toBe(true);
      expect(el.getAttribute('type')).toBe('warning');
    });

    it.each([{ type: 'success' }, { type: 'warning' }])(
      'should accept type="$type"',
      async ({ type }) => {
        const el = await createDsBadgeIcon({ type });
        expect(el.type).toBe(type);
      },
    );
  });

  describe('dynamic type changes', () => {
    it('should update type property and attribute when changed dynamically', async () => {
      const el = await createDsBadgeIcon({ type: 'success' });
      expect(el.type).toBe('success');

      el.type = 'warning';
      await el.updateComplete;

      expect(el.type).toBe('warning');
      expect(el.getAttribute('type')).toBe('warning');
    });

    it('should update type from warning back to success', async () => {
      const el = await createDsBadgeIcon({ type: 'warning' });
      expect(el.type).toBe('warning');

      el.type = 'success';
      await el.updateComplete;

      expect(el.type).toBe('success');
      expect(el.getAttribute('type')).toBe('success');
    });
  });

  describe('rendering — ds-icon', () => {
    it('should render a ds-icon element in shadow DOM', async () => {
      const el = await createDsBadgeIcon();
      const icon = el.shadowRoot!.querySelector('ds-icon');
      expect(icon).not.toBeNull();
    });

    it('should render AlertTriangle icon when type="warning"', async () => {
      const el = await createDsBadgeIcon({ type: 'warning' });
      const icon = el.shadowRoot!.querySelector('ds-icon');
      expect(icon!.getAttribute('name')).toBe('AlertTriangle');
    });

    it('should set an empty name attribute on the icon when type="success"', async () => {
      const el = await createDsBadgeIcon({ type: 'success' });
      const icon = el.shadowRoot!.querySelector('ds-icon');
      expect(icon!.getAttribute('name')).toBe('');
    });

    it('should update the icon name when type changes dynamically', async () => {
      const el = await createDsBadgeIcon({ type: 'success' });
      const icon = el.shadowRoot!.querySelector('ds-icon');
      expect(icon!.getAttribute('name')).toBe('');

      el.type = 'warning';
      await el.updateComplete;

      const updatedIcon = el.shadowRoot!.querySelector('ds-icon');
      expect(updatedIcon!.getAttribute('name')).toBe('AlertTriangle');
    });

    it('should set color="currentColor" on the icon', async () => {
      const el = await createDsBadgeIcon();
      const icon = el.shadowRoot!.querySelector('ds-icon');
      expect(icon!.getAttribute('color')).toBe('currentColor');
    });
  });

  describe('styles', () => {
    it('should have border-radius 9999px (pill shape)', async () => {
      const el = await createDsBadgeIcon();
      const computed = globalThis.getComputedStyle(el);
      expect(computed.borderRadius).toBe('9999px');
    });

    it('should apply success background by default', async () => {
      const el = await createDsBadgeIcon();
      const computed = globalThis.getComputedStyle(el);
      expect(computed.backgroundColor).toBe('rgb(224, 249, 195)');
    });

    it('should apply warning background when type="warning"', async () => {
      const el = await createDsBadgeIcon({ type: 'warning' });
      const computed = globalThis.getComputedStyle(el);
      expect(computed.backgroundColor).toBe('rgb(255, 250, 245)');
    });

    it('should update background when type changes dynamically', async () => {
      const el = await createDsBadgeIcon({ type: 'success' });
      expect(globalThis.getComputedStyle(el).backgroundColor).toBe('rgb(224, 249, 195)');

      el.type = 'warning';
      await el.updateComplete;

      expect(globalThis.getComputedStyle(el).backgroundColor).toBe('rgb(255, 250, 245)');
    });

    it('should display as inline-flex', async () => {
      const el = await createDsBadgeIcon();
      const computed = globalThis.getComputedStyle(el);
      expect(computed.display).toBe('inline-flex');
    });

    it('should center content with align-items and justify-content', async () => {
      const el = await createDsBadgeIcon();
      const computed = globalThis.getComputedStyle(el);
      expect(computed.alignItems).toBe('center');
      expect(computed.justifyContent).toBe('center');
    });
  });

  describe('slot content projection', () => {
    it('should project slotted content via a slot', async () => {
      const el = await createDsBadgeIcon();
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

    it('should display text content via the slot', async () => {
      await createDsBadgeIcon({}, 'Badge text');
      await expect.element(page.getByText('Badge text')).toBeVisible();
    });
  });

  describe('accessibility', () => {
    it('should set aria-hidden="true" on the icon', async () => {
      const el = await createDsBadgeIcon();
      const icon = el.shadowRoot!.querySelector('ds-icon');
      expect(icon!.getAttribute('aria-hidden')).toBe('true');
    });
  });
});

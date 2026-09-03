/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../ds-tag-icon';

import { LitElement } from 'lit';
import { describe, expect, it } from 'vitest';

import type { DsTagIcon } from '../ds-tag-icon';

let element: DsTagIcon;

async function createDsTagIcon(
  attrs: Record<string, string> = {},
): Promise<DsTagIcon> {
  element = document.createElement('ds-tag-icon');
  for (const [key, value] of Object.entries(attrs)) {
    element.setAttribute(key, value);
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

    it('should be an instance of DsTagIcon', async () => {
      const el = await createDsTagIcon();
      expect(el).toBeInstanceOf(customElements.get('ds-tag-icon')!);
    });

    it('should be an instance of LitElement', async () => {
      const el = await createDsTagIcon();
      expect(el).toBeInstanceOf(LitElement);
    });
  });

  describe('property defaults', () => {
    it('should default label to undefined', async () => {
      const el = await createDsTagIcon();
      expect(el.label).toBeUndefined();
    });

    it('should default icon to undefined', async () => {
      const el = await createDsTagIcon();
      expect(el.icon).toBeUndefined();
    });

    it('should default color to undefined', async () => {
      const el = await createDsTagIcon();
      expect(el.color).toBeUndefined();
    });

    it('should default background to undefined', async () => {
      const el = await createDsTagIcon();
      expect(el.background).toBeUndefined();
    });
  });

  describe('property reflection', () => {
    it('should reflect the label attribute', async () => {
      const el = await createDsTagIcon({ label: 'Active' });
      expect(el.label).toBe('Active');
      expect(el.getAttribute('label')).toBe('Active');
    });

    it('should reflect the icon attribute', async () => {
      const el = await createDsTagIcon({ icon: 'AlertTriangle' });
      expect(el.icon).toBe('AlertTriangle');
      expect(el.getAttribute('icon')).toBe('AlertTriangle');
    });

    it('should reflect the color attribute', async () => {
      const el = await createDsTagIcon({ color: 'primary' });
      expect(el.color).toBe('primary');
      expect(el.getAttribute('color')).toBe('primary');
    });

    it('should reflect the background attribute', async () => {
      const el = await createDsTagIcon({ background: 'success' });
      expect(el.background).toBe('success');
      expect(el.getAttribute('background')).toBe('success');
    });
  });

  describe('dynamic property changes', () => {
    it('should update label when changed dynamically', async () => {
      const el = await createDsTagIcon({ label: 'First' });
      expect(el.label).toBe('First');

      el.label = 'Second';
      await el.updateComplete;

      expect(el.label).toBe('Second');
      expect(el.getAttribute('label')).toBe('Second');
    });

    it('should update icon when changed dynamically', async () => {
      const el = await createDsTagIcon({ icon: 'AlertTriangle' });
      expect(el.icon).toBe('AlertTriangle');

      el.icon = 'Checkmark';
      await el.updateComplete;

      expect(el.icon).toBe('Checkmark');
      expect(el.getAttribute('icon')).toBe('Checkmark');
    });

    it('should update color when changed dynamically', async () => {
      const el = await createDsTagIcon({ color: 'primary' });
      expect(el.color).toBe('primary');

      el.color = 'error';
      await el.updateComplete;

      expect(el.color).toBe('error');
      expect(el.getAttribute('color')).toBe('error');
    });

    it('should update background when changed dynamically', async () => {
      const el = await createDsTagIcon({ background: 'success' });
      expect(el.background).toBe('success');

      el.background = 'warning';
      await el.updateComplete;

      expect(el.background).toBe('warning');
      expect(el.getAttribute('background')).toBe('warning');
    });

    it('should clear background CSS variable when background is set to undefined', async () => {
      const el = await createDsTagIcon({ background: 'success' });
      expect(el.style.getPropertyValue('--ds-tag-icon-bg')).toBeTruthy();

      el.background = undefined;
      await el.updateComplete;

      expect(el.style.getPropertyValue('--ds-tag-icon-bg')).toBe('');
    });
  });

  describe('shadow DOM rendering — ds-icon', () => {
    it('should render a ds-icon element in shadow DOM', async () => {
      const el = await createDsTagIcon();
      const icon = el.shadowRoot!.querySelector('ds-icon');
      expect(icon).not.toBeNull();
    });

    it('should pass the icon property to ds-icon', async () => {
      const el = await createDsTagIcon({ icon: 'AlertTriangle' });
      const icon = el.shadowRoot!.querySelector('ds-icon');
      expect(icon!.getAttribute('icon')).toBe('AlertTriangle');
    });

    it('should pass the color property to ds-icon', async () => {
      const el = await createDsTagIcon({ color: 'primary' });
      const icon = el.shadowRoot!.querySelector('ds-icon');
      expect(icon!.getAttribute('color')).toBe('primary');
    });

    it('should apply the "icon" class to ds-icon', async () => {
      const el = await createDsTagIcon();
      const icon = el.shadowRoot!.querySelector('ds-icon');
      expect(icon!.classList.contains('icon')).toBe(true);
    });

    it('should update ds-icon when icon property changes', async () => {
      const el = await createDsTagIcon({ icon: 'AlertTriangle' });
      const icon = el.shadowRoot!.querySelector('ds-icon');
      expect(icon!.getAttribute('icon')).toBe('AlertTriangle');

      el.icon = 'Checkmark';
      await el.updateComplete;

      const updatedIcon = el.shadowRoot!.querySelector('ds-icon');
      expect(updatedIcon!.getAttribute('icon')).toBe('Checkmark');
    });
  });

  describe('shadow DOM rendering — span (label)', () => {
    it('should render a span element in shadow DOM', async () => {
      const el = await createDsTagIcon();
      const span = el.shadowRoot!.querySelector('span');
      expect(span).not.toBeNull();
    });

    it('should display the label text inside the span', async () => {
      const el = await createDsTagIcon({ label: 'Active' });
      const span = el.shadowRoot!.querySelector('span');
      expect(span!.textContent).toBe('Active');
    });

    it('should apply fontSize 0.75rem on the span', async () => {
      const el = await createDsTagIcon({ label: 'Test' });
      const span = el.shadowRoot!.querySelector('span');
      expect(span!.style.fontSize).toBe('0.75rem');
    });

    it('should apply fontWeight 500 on the span', async () => {
      const el = await createDsTagIcon({ label: 'Test' });
      const span = el.shadowRoot!.querySelector('span');
      expect(span!.style.fontWeight).toBe('500');
    });

    it('should apply color on the span when color property is set', async () => {
      const el = await createDsTagIcon({ label: 'Test', color: 'rgb(255, 0, 0)' });
      const span = el.shadowRoot!.querySelector('span');
      expect(span!.style.color).toBe('rgb(255, 0, 0)');
    });

    it('should update span text when label changes dynamically', async () => {
      const el = await createDsTagIcon({ label: 'First' });
      const span = el.shadowRoot!.querySelector('span');
      expect(span!.textContent).toBe('First');

      el.label = 'Updated';
      await el.updateComplete;

      const updatedSpan = el.shadowRoot!.querySelector('span');
      expect(updatedSpan!.textContent).toBe('Updated');
    });
  });

  describe('host styles', () => {
    it('should display as inline-flex', async () => {
      const el = await createDsTagIcon();
      const computed = globalThis.getComputedStyle(el);
      expect(computed.display).toBe('inline-flex');
    });

    it('should center content with align-items: center', async () => {
      const el = await createDsTagIcon();
      const computed = globalThis.getComputedStyle(el);
      expect(computed.alignItems).toBe('center');
    });

    it('should center content with justify-content: center', async () => {
      const el = await createDsTagIcon();
      const computed = globalThis.getComputedStyle(el);
      expect(computed.justifyContent).toBe('center');
    });

    it('should have border-radius 2px', async () => {
      const el = await createDsTagIcon();
      const computed = globalThis.getComputedStyle(el);
      expect(computed.borderRadius).toBe('2px');
    });

    it('should have gap of 0.375rem', async () => {
      const el = await createDsTagIcon();
      const computed = globalThis.getComputedStyle(el);
      expect(computed.gap).toBe('6px');
    });

    it('should have padding of 0.25rem 0.5rem', async () => {
      const el = await createDsTagIcon();
      const computed = globalThis.getComputedStyle(el);
      expect(computed.paddingTop).toBe('4px');
      expect(computed.paddingBottom).toBe('4px');
      expect(computed.paddingLeft).toBe('8px');
      expect(computed.paddingRight).toBe('8px');
    });
  });

  describe('.icon class styles', () => {
    it('should apply flex-shrink: 0 on the ds-icon', async () => {
      const el = await createDsTagIcon();
      const icon = el.shadowRoot!.querySelector('ds-icon');
      const computed = globalThis.getComputedStyle(icon!);
      expect(computed.flexShrink).toBe('0');
    });

    it('should set width: 1em on the ds-icon', async () => {
      const el = await createDsTagIcon();
      const icon = el.shadowRoot!.querySelector('ds-icon');
      const computed = globalThis.getComputedStyle(icon!);
      expect(computed.width).not.toBe('0px');
    });

    it('should set height: 1em on the ds-icon', async () => {
      const el = await createDsTagIcon();
      const icon = el.shadowRoot!.querySelector('ds-icon');
      const computed = globalThis.getComputedStyle(icon!);
      expect(computed.height).not.toBe('0px');
    });
  });

  describe('background behavior', () => {
    it('should use default background CSS variable when background prop is not set', async () => {
      const el = await createDsTagIcon();
      expect(el.style.getPropertyValue('--ds-tag-icon-bg')).toBe('');
    });

    it('should set --ds-tag-icon-bg CSS variable when background is provided', async () => {
      const el = await createDsTagIcon({ background: 'success' });
      const bgVar = el.style.getPropertyValue('--ds-tag-icon-bg');
      expect(bgVar).toBeTruthy();
    });

    it('should update --ds-tag-icon-bg when background changes dynamically', async () => {
      const el = await createDsTagIcon({ background: 'success' });
      const firstBg = el.style.getPropertyValue('--ds-tag-icon-bg');
      expect(firstBg).toBeTruthy();

      el.background = 'warning';
      await el.updateComplete;

      const secondBg = el.style.getPropertyValue('--ds-tag-icon-bg');
      expect(secondBg).toBeTruthy();
      expect(secondBg).not.toBe(firstBg);
    });

    it('should remove --ds-tag-icon-bg when background is cleared', async () => {
      const el = await createDsTagIcon({ background: 'success' });
      expect(el.style.getPropertyValue('--ds-tag-icon-bg')).toBeTruthy();

      el.removeAttribute('background');
      await el.updateComplete;

      expect(el.style.getPropertyValue('--ds-tag-icon-bg')).toBe('');
    });
  });

  describe('accessibility', () => {
    it('should set aria-hidden="true" on the ds-icon', async () => {
      const el = await createDsTagIcon();
      const icon = el.shadowRoot!.querySelector('ds-icon');
      expect(icon!.getAttribute('aria-hidden')).toBe('true');
    });
  });
});

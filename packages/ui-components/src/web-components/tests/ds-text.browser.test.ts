/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../ds-text';

import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

// eslint-disable-next-line no-duplicate-imports
import type { DsText } from '../ds-text';
import { dsTextVars } from '../ds-text.styles';

let element: DsText;

async function createDsText(attrs: Record<string, string> = {}, textContent = ''): Promise<DsText> {
  element = document.createElement('ds-text');
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

describe('ds-text', () => {
  describe('as property', () => {
    it.each([
      { tag: 'h1', role: 'heading', level: 1 },
      { tag: 'h2', role: 'heading', level: 2 },
      { tag: 'h3', role: 'heading', level: 3 },
      { tag: 'h4', role: 'heading', level: 4 },
      { tag: 'h5', role: 'heading', level: 5 },
      { tag: 'h6', role: 'heading', level: 6 },
    ])('should render a level $level heading when as="$tag"', async ({ tag, level }) => {
      await createDsText({ as: tag }, `Heading ${level}`);
      await expect
        .element(page.getByRole('heading', { name: `Heading ${level}`, level }))
        .toBeVisible();
    });

    it.each([
      { tag: 'p', role: 'paragraph' },
      { tag: 'strong', role: 'strong' },
      { tag: 'em', role: 'emphasis' },
    ])('should render with role "$role" when as="$tag"', async ({ tag, role }) => {
      const text = `Content in ${tag}`;
      await createDsText({ as: tag }, text);
      await expect.element(page.getByRole(role)).toBeVisible();
      await expect.element(page.getByText(text)).toBeVisible();
    });

    it.each([{ tag: 'span' }, { tag: 'small' }, { tag: 'label' }])(
      'should render a <$tag> when as="$tag"',
      async ({ tag }) => {
        const text = `Content in ${tag}`;
        const el = await createDsText({ as: tag }, text);
        await expect.element(page.getByText(text)).toBeVisible();
        expect(el.shadowRoot!.querySelector(tag)).not.toBeNull();
      },
    );

    it('should default to <span> when no as is provided', async () => {
      const el = await createDsText({}, 'Default tag');
      expect(el.as).toBe('span');
      expect(el.shadowRoot!.querySelector('span')).not.toBeNull();
    });

    it('should switch the inner element when "as" changes dynamically', async () => {
      const el = await createDsText({}, 'Dynamic content');
      expect(el.shadowRoot!.querySelector('span')).not.toBeNull();

      el.as = 'h1';
      await el.updateComplete;

      await expect
        .element(page.getByRole('heading', { name: 'Dynamic content', level: 1 }))
        .toBeVisible();
      expect(el.shadowRoot!.querySelector('span')).toBeNull();
    });

    it('should fall back to <span> when "as" is set to an unrecognized value', async () => {
      const el = await createDsText({}, 'Fallback content');
      el.setAttribute('as', 'div');
      await el.updateComplete;

      expect(el.shadowRoot!.querySelector('span')).not.toBeNull();
      expect(el.shadowRoot!.querySelector('div')).toBeNull();
    });
  });

  describe('color property', () => {
    it('should default to "text"', async () => {
      const el = await createDsText({}, 'Default color');
      expect(el.color).toBe('text');
    });

    it('should set the CSS variable when color="error"', async () => {
      const el = await createDsText({ color: 'error' }, 'Colored text');
      const innerEl = el.shadowRoot!.firstElementChild as HTMLElement;
      const cssVarValue = innerEl.style.getPropertyValue(dsTextVars.color);
      expect(cssVarValue).toContain('error');
    });

    it('should update the CSS variable when color changes dynamically', async () => {
      const el = await createDsText({ color: 'text' }, 'Dynamic color');

      el.color = 'primary';
      await el.updateComplete;

      const innerEl = el.shadowRoot!.firstElementChild as HTMLElement;
      const updatedColor = innerEl.style.getPropertyValue(dsTextVars.color);
      expect(updatedColor).toContain('primary');
    });

    it('should not reflect the color attribute on the host element', async () => {
      const el = await createDsText({}, 'Non-reflected color');

      el.color = 'error';
      await el.updateComplete;

      expect(el.hasAttribute('color')).toBe(false);
    });
  });

  describe('size property', () => {
    it('should default to "medium"', async () => {
      const el = await createDsText({}, 'Default size');
      expect(el.size).toBe('medium');
    });

    it.each([
      { size: 'extrasmall' },
      { size: 'small' },
      { size: 'medium' },
      { size: 'large' },
      { size: 'extralarge' },
    ])('should accept size="$size"', async ({ size }) => {
      const el = await createDsText({ size }, 'Sized text');
      expect(el.size).toBe(size);
    });

    it.each([
      { size: 'extrasmall', expected: '12px' },
      { size: 'small', expected: '14px' },
      { size: 'medium', expected: '16px' },
      { size: 'large', expected: '18px' },
      { size: 'extralarge', expected: '20px' },
    ])('should apply computed font-size for size="$size"', async ({ size, expected }) => {
      const el = await createDsText({ size }, 'Computed size text');
      const innerEl = el.shadowRoot!.querySelector(el.as) as HTMLElement;
      const computedFontSize = globalThis.getComputedStyle(innerEl).fontSize;
      expect(computedFontSize).toBe(expected);
    });

    it('should update computed font-size when size changes dynamically', async () => {
      const el = await createDsText({ size: 'small' }, 'Dynamic size');

      el.size = 'large';
      await el.updateComplete;

      const innerEl = el.shadowRoot!.querySelector(el.as) as HTMLElement;
      const computedFontSize = globalThis.getComputedStyle(innerEl).fontSize;
      expect(computedFontSize).toBe('18px');
    });
  });

  describe('weight property', () => {
    it('should default to "regular"', async () => {
      const el = await createDsText({}, 'Default weight');
      expect(el.weight).toBe('regular');
    });

    it.each([{ weight: 'light' }, { weight: 'regular' }, { weight: 'medium' }, { weight: 'bold' }])(
      'should accept weight="$weight"',
      async ({ weight }) => {
        const el = await createDsText({ weight }, 'Weighted text');
        expect(el.weight).toBe(weight);
      },
    );

    it.each([
      { weight: 'light', expected: '300' },
      { weight: 'regular', expected: '400' },
      { weight: 'medium', expected: '500' },
      { weight: 'bold', expected: '700' },
    ])('should apply computed font-weight for weight="$weight"', async ({ weight, expected }) => {
      const el = await createDsText({ weight }, 'Computed weight text');
      const innerEl = el.shadowRoot!.querySelector(el.as) as HTMLElement;
      const computedWeight = globalThis.getComputedStyle(innerEl).fontWeight;
      expect(computedWeight).toBe(expected);
    });

    it('should update computed font-weight when weight changes dynamically', async () => {
      const el = await createDsText({ weight: 'light' }, 'Dynamic weight');

      el.weight = 'bold';
      await el.updateComplete;

      const innerEl = el.shadowRoot!.querySelector(el.as) as HTMLElement;
      const computedWeight = globalThis.getComputedStyle(innerEl).fontWeight;
      expect(computedWeight).toBe('700');
    });
  });

  describe('overflow property', () => {
    it('should default to "ellipsis"', async () => {
      const el = await createDsText({}, 'Default overflow');
      expect(el.overflow).toBe('ellipsis');
    });

    it.each([{ overflow: 'ellipsis' }, { overflow: 'break-word' }])(
      'should accept overflow="$overflow"',
      async ({ overflow }) => {
        const el = await createDsText({ overflow }, 'Overflowed text');
        expect(el.overflow).toBe(overflow);
      },
    );

    it('should apply ellipsis overflow styles when overflow="ellipsis"', async () => {
      const el = await createDsText({ overflow: 'ellipsis' }, 'Ellipsis text');
      const innerEl = el.shadowRoot!.querySelector(el.as) as HTMLElement;
      const computed = globalThis.getComputedStyle(innerEl);
      expect(computed.whiteSpace).toBe('nowrap');
      expect(computed.overflow).toBe('hidden');
      expect(computed.textOverflow).toBe('ellipsis');
    });

    it('should apply break-word overflow styles when overflow="break-word"', async () => {
      const el = await createDsText({ overflow: 'break-word' }, 'Break word text');
      const innerEl = el.shadowRoot!.querySelector(el.as) as HTMLElement;
      const computed = globalThis.getComputedStyle(innerEl);
      expect(computed.overflowWrap).toBe('break-word');
    });

    it('should update overflow styles when overflow changes dynamically', async () => {
      const el = await createDsText({ overflow: 'ellipsis' }, 'Dynamic overflow');

      el.overflow = 'break-word';
      await el.updateComplete;

      const innerEl = el.shadowRoot!.querySelector(el.as) as HTMLElement;
      const computed = globalThis.getComputedStyle(innerEl);
      expect(computed.overflowWrap).toBe('break-word');
      expect(computed.whiteSpace).not.toBe('nowrap');
    });
  });

  describe('disabled property', () => {
    it('should default to false', async () => {
      const el = await createDsText({}, 'Not disabled');
      expect(el.disabled).toBe(false);
    });

    it('should reflect the disabled attribute on the host', async () => {
      const el = await createDsText({ disabled: '' }, 'Disabled text');
      expect(el.disabled).toBe(true);
      expect(el.hasAttribute('disabled')).toBe(true);
    });

    it('should apply disabled color via CSS variable when disabled', async () => {
      const el = await createDsText({}, 'Toggle disabled');

      el.disabled = true;
      await el.updateComplete;

      const innerEl = el.shadowRoot!.firstElementChild as HTMLElement;
      const disabledColor = innerEl.style.getPropertyValue(dsTextVars.color);
      expect(disabledColor).toContain('disabled');
    });

    it('should restore enabled color when disabled is removed', async () => {
      const el = await createDsText({ disabled: '' }, 'Re-enabled text');

      el.disabled = false;
      await el.updateComplete;

      const innerEl = el.shadowRoot!.firstElementChild as HTMLElement;
      const enabledColor = innerEl.style.getPropertyValue(dsTextVars.color);
      expect(enabledColor).not.toContain('disabled');
    });
  });

  describe('custom CSS variables', () => {
    it('should allow overriding font-size via CSS variable', async () => {
      const customSize = '40px';
      const el = await createDsText(
        { style: `--ds-text-font-size: ${customSize}` },
        'Custom pixel size',
      );

      const innerEl = el.shadowRoot!.querySelector(el.as) as HTMLElement;

      const computedFontSize = globalThis.getComputedStyle(innerEl).fontSize;
      expect(computedFontSize).toBe(customSize);
    });
  });

  describe('slot content projection', () => {
    it('should project slotted content inside the inner element', async () => {
      const el = await createDsText({ as: 'p' });
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
  });
});

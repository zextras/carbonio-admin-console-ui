/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { PlainRadio } from '../plain-radio';

function resolveColorToken(token: string): string {
  const probe = document.createElement('span');
  probe.style.color = `var(${token})`;
  document.body.append(probe);
  const { color } = getComputedStyle(probe);
  probe.remove();
  return color;
}

function getIcon(name: string): SVGSVGElement {
  const input = page.getByRole('radio', { name }).element();
  return input.nextElementSibling as SVGSVGElement;
}

describe('PlainRadio', () => {
  describe('visual states', () => {
    it('should render a 20 x 20 control', async () => {
      await render(<PlainRadio label="Email" />);

      const rect = getIcon('Email').getBoundingClientRect();
      expect(rect.width).toBeCloseTo(20, 1);
      expect(rect.height).toBeCloseTo(20, 1);
    });

    it('should draw a 16.67px ring with a 1.67px stroke and an 8.33px dot', async () => {
      await render(<PlainRadio label="Email" defaultChecked />);

      const [ringEl, dotEl] = getIcon('Email').querySelectorAll('circle');
      const strokeWidth = Number.parseFloat(getComputedStyle(ringEl).strokeWidth);
      expect(strokeWidth).toBeCloseTo(1.67, 2);
      expect(2 * Number(ringEl.getAttribute('r')) + strokeWidth).toBeCloseTo(16.67, 1);
      expect(2 * Number(dotEl.getAttribute('r'))).toBeCloseTo(8.33, 1);
    });

    it('should center the control on a single-line title', async () => {
      await render(<PlainRadio label="Email" />);

      const icon = getIcon('Email').getBoundingClientRect();
      const title = page.getByText('Email', { exact: true }).element().getBoundingClientRect();
      expect(icon.top + icon.height / 2).toBeCloseTo(title.top + title.height / 2, 0);
    });

    it.each([
      ['unchecked', {}, '--color-gray0-regular', '0', '--color-primary-regular'],
      [
        'checked',
        { defaultChecked: true },
        '--color-primary-regular',
        '1',
        '--color-primary-regular',
      ],
      [
        'unchecked disabled',
        { disabled: true },
        '--color-gray0-disabled',
        '0',
        '--color-primary-regular',
      ],
      [
        'checked disabled',
        { defaultChecked: true, disabled: true },
        '--color-primary-disabled',
        '1',
        '--color-primary-disabled',
      ],
    ])(
      'should paint the %s ring and dot per spec',
      async (_state, props, ring, dotOpacity, dot) => {
        await render(<PlainRadio label="Email" {...props} />);

        const [ringEl, dotEl] = getIcon('Email').querySelectorAll('circle');
        expect(getComputedStyle(ringEl).stroke).toBe(resolveColorToken(ring));
        expect(getComputedStyle(dotEl).opacity).toBe(dotOpacity);
        expect(getComputedStyle(dotEl).fill).toBe(resolveColorToken(dot));
      },
    );

    it('should use Text/M for the title and Text/S Gray1 for the description', async () => {
      await render(<PlainRadio label="Email" description="Email and mobile apps" />);

      const title = getComputedStyle(page.getByText('Email', { exact: true }).element());
      const description = getComputedStyle(page.getByText('Email and mobile apps').element());
      expect(title.fontSize).toBe('16px');
      expect(title.color).toBe(resolveColorToken('--color-text-regular'));
      expect(description.fontSize).toBe('14px');
      expect(description.color).toBe(resolveColorToken('--color-gray1-focus'));
    });

    it('should grey out title and description when disabled', async () => {
      await render(<PlainRadio label="Email" description="Email and mobile apps" disabled />);

      const disabledColor = resolveColorToken('--color-text-disabled');
      expect(getComputedStyle(page.getByText('Email', { exact: true }).element()).color).toBe(
        disabledColor,
      );
      expect(getComputedStyle(page.getByText('Email and mobile apps').element()).color).toBe(
        disabledColor,
      );
    });

    it('should show the default cursor on the title and control when disabled', async () => {
      await render(<PlainRadio label="Email" disabled />);

      const input = page.getByRole('radio', { name: 'Email' }).element();
      expect(getComputedStyle(page.getByText('Email', { exact: true }).element()).cursor).toBe(
        'default',
      );
      expect(getComputedStyle(input).cursor).toBe('default');
    });

    it('should show a round focus ring on keyboard focus', async () => {
      await render(<PlainRadio label="Email" />);

      await userEvent.tab();
      const icon = getComputedStyle(getIcon('Email'));
      expect(icon.outlineStyle).toBe('solid');
      expect(icon.borderRadius).toBe('50%');
    });
  });

  describe('native passthrough', () => {
    it('should forward the ref and native props to the input', async () => {
      const ref = React.createRef<HTMLInputElement>();
      await render(<PlainRadio label="Email" ref={ref} name="edition" value="mail" />);

      expect(ref.current).toBe(page.getByRole('radio', { name: 'Email' }).element());
      expect(ref.current?.name).toBe('edition');
      expect(ref.current?.value).toBe('mail');
    });

    it('should apply className, style and rootRef to the root', async () => {
      const rootRef = React.createRef<HTMLDivElement>();
      await render(
        <PlainRadio label="Email" className="custom" style={{ marginTop: 4 }} rootRef={rootRef} />,
      );

      const root = rootRef.current;
      expect(root?.contains(page.getByRole('radio', { name: 'Email' }).element())).toBe(true);
      expect(root?.classList.contains('custom')).toBe(true);
      expect(root?.style.marginTop).toBe('4px');
    });
  });
});

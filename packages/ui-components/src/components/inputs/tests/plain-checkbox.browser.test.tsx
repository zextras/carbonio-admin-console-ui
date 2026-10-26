/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { PlainCheckbox } from '../plain-checkbox';

function resolveColorToken(token: string): string {
  const probe = document.createElement('span');
  probe.style.color = `var(${token})`;
  document.body.append(probe);
  const { color } = getComputedStyle(probe);
  probe.remove();
  return color;
}

function getIcon(name: string): SVGSVGElement {
  const input = page.getByRole('checkbox', { name }).element();
  return input.nextElementSibling as SVGSVGElement;
}

const ControlledCheckbox = () => {
  const [checked, setChecked] = useState(false);
  return (
    <PlainCheckbox
      label="Keep a copy"
      checked={checked}
      onChange={(e) => setChecked(e.target.checked)}
    />
  );
};

describe('PlainCheckbox', () => {
  describe('semantics', () => {
    it('should expose a native checkbox whose accessible name is the label', async () => {
      await render(<PlainCheckbox label="Keep a copy" />);

      await expect.element(page.getByRole('checkbox', { name: 'Keep a copy' })).not.toBeChecked();
    });

    it('should keep the description out of the accessible name and link it via aria-describedby', async () => {
      await render(<PlainCheckbox label="Keep a copy" description="Stored in the sent folder" />);

      await expect
        .element(page.getByRole('checkbox', { name: 'Keep a copy' }))
        .toHaveAccessibleDescription('Stored in the sent folder');
    });

    it('should merge a caller-provided aria-describedby with the description id', async () => {
      await render(
        <>
          <span id="extra">Extra hint</span>
          <PlainCheckbox label="Keep a copy" description="Main hint" aria-describedby="extra" />
        </>,
      );

      await expect
        .element(page.getByRole('checkbox', { name: 'Keep a copy' }))
        .toHaveAccessibleDescription('Extra hint Main hint');
    });

    it('should not set aria-describedby without a description', async () => {
      await render(<PlainCheckbox label="Keep a copy" description={null} />);

      await expect
        .element(page.getByRole('checkbox', { name: 'Keep a copy' }))
        .not.toHaveAttribute('aria-describedby');
    });

    it('should be named by aria-label when rendered without a visible label', async () => {
      await render(<PlainCheckbox aria-label="Select row" />);

      await expect.element(page.getByRole('checkbox', { name: 'Select row' })).toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('should toggle when the label is clicked', async () => {
      await render(<ControlledCheckbox />);

      await page.getByText('Keep a copy').click();
      await expect.element(page.getByRole('checkbox', { name: 'Keep a copy' })).toBeChecked();
    });

    it('should not toggle when the description is clicked', async () => {
      await render(<PlainCheckbox label="Keep a copy" description="Stored in the sent folder" />);

      await page.getByText('Stored in the sent folder').click();
      await expect.element(page.getByRole('checkbox', { name: 'Keep a copy' })).not.toBeChecked();
    });

    it('should toggle with Space when focused', async () => {
      await render(<ControlledCheckbox />);

      await userEvent.tab();
      const input = page.getByRole('checkbox', { name: 'Keep a copy' });
      await expect.element(input).toHaveFocus();
      await userEvent.keyboard(' ');
      await expect.element(input).toBeChecked();
    });

    it('should not toggle nor fire onChange when disabled', async () => {
      const onChange = vi.fn();
      await render(<PlainCheckbox label="Keep a copy" disabled onChange={onChange} />);

      const input = page.getByRole('checkbox', { name: 'Keep a copy' });
      await expect.element(input).toBeDisabled();
      await page.getByText('Keep a copy').click({ force: true });
      expect(onChange).not.toHaveBeenCalled();
      await expect.element(input).not.toBeChecked();
    });

    it('should skip a disabled checkbox when tabbing', async () => {
      await render(
        <>
          <PlainCheckbox label="Disabled" disabled />
          <PlainCheckbox label="Enabled" />
        </>,
      );

      await userEvent.tab();
      await expect.element(page.getByRole('checkbox', { name: 'Enabled' })).toHaveFocus();
    });
  });

  describe('visual states', () => {
    it('should render a 20 x 20 control', async () => {
      await render(<PlainCheckbox label="Keep a copy" />);

      const rect = getIcon('Keep a copy').getBoundingClientRect();
      expect(rect.width).toBeCloseTo(20, 1);
      expect(rect.height).toBeCloseTo(20, 1);
    });

    it('should draw a 15px box with a 1.67px stroke and 2.5px outer radius', async () => {
      await render(<PlainCheckbox label="Keep a copy" />);

      const box = getIcon('Keep a copy').querySelector('rect') as SVGRectElement;
      const strokeWidth = Number.parseFloat(getComputedStyle(box).strokeWidth);
      expect(box.getBBox().width + strokeWidth).toBeCloseTo(15, 1);
      expect(box.getBBox().x - strokeWidth / 2).toBeCloseTo(2.5, 1);
      expect(strokeWidth).toBeCloseTo(1.67, 2);
      expect(Number(box.getAttribute('rx')) + strokeWidth / 2).toBeCloseTo(2.5, 1);
    });

    it('should center the control on a single-line title', async () => {
      await render(<PlainCheckbox label="Keep a copy" />);

      const icon = getIcon('Keep a copy').getBoundingClientRect();
      const title = page.getByText('Keep a copy').element().getBoundingClientRect();
      expect(icon.top + icon.height / 2).toBeCloseTo(title.top + title.height / 2, 0);
    });

    it('should top-align the control and the title when a description is present', async () => {
      await render(<PlainCheckbox label="Keep a copy" description="Stored in the sent folder" />);

      const icon = getIcon('Keep a copy').getBoundingClientRect();
      const title = page.getByText('Keep a copy').element().getBoundingClientRect();
      expect(title.top).toBeCloseTo(icon.top, 0);
    });

    it.each([
      ['unchecked', {}, 'transparent', '--color-gray0-regular', '0'],
      [
        'checked',
        { defaultChecked: true },
        '--color-primary-regular',
        '--color-primary-regular',
        '1',
      ],
      ['unchecked disabled', { disabled: true }, 'transparent', '--color-gray0-disabled', '0'],
      [
        'checked disabled',
        { defaultChecked: true, disabled: true },
        '--color-primary-disabled',
        '--color-primary-disabled',
        '1',
      ],
    ])('should paint the %s box per spec', async (_state, props, fill, stroke, checkOpacity) => {
      await render(<PlainCheckbox label="Keep a copy" {...props} />);

      const box = getIcon('Keep a copy').querySelector('rect') as SVGRectElement;
      const check = getIcon('Keep a copy').querySelector('path') as SVGPathElement;
      const expectedFill = fill === 'transparent' ? 'rgba(0, 0, 0, 0)' : resolveColorToken(fill);
      expect(getComputedStyle(box).fill).toBe(expectedFill);
      expect(getComputedStyle(box).stroke).toBe(resolveColorToken(stroke));
      expect(getComputedStyle(check).opacity).toBe(checkOpacity);
    });

    it('should draw a white check mark', async () => {
      await render(<PlainCheckbox label="Keep a copy" defaultChecked />);

      const check = getIcon('Keep a copy').querySelector('path') as SVGPathElement;
      expect(getComputedStyle(check).stroke).toBe(resolveColorToken('--color-gray6-regular'));
    });

    it('should use Text/M for the title and Text/S Gray1 for the description', async () => {
      await render(<PlainCheckbox label="Keep a copy" description="Stored in the sent folder" />);

      const title = getComputedStyle(page.getByText('Keep a copy').element());
      const description = getComputedStyle(page.getByText('Stored in the sent folder').element());
      expect(title.fontSize).toBe('16px');
      expect(title.color).toBe(resolveColorToken('--color-text-regular'));
      expect(description.fontSize).toBe('14px');
      expect(description.color).toBe(resolveColorToken('--color-gray1-focus'));
    });

    it('should grey out title and description when disabled', async () => {
      await render(
        <PlainCheckbox label="Keep a copy" description="Stored in the sent folder" disabled />,
      );

      const disabledColor = resolveColorToken('--color-text-disabled');
      expect(getComputedStyle(page.getByText('Keep a copy').element()).color).toBe(disabledColor);
      expect(getComputedStyle(page.getByText('Stored in the sent folder').element()).color).toBe(
        disabledColor,
      );
    });

    it('should show a pointer cursor on the title and control, not on the description', async () => {
      await render(<PlainCheckbox label="Keep a copy" description="Stored in the sent folder" />);

      const input = page.getByRole('checkbox', { name: 'Keep a copy' }).element();
      expect(getComputedStyle(page.getByText('Keep a copy').element()).cursor).toBe('pointer');
      expect(getComputedStyle(input).cursor).toBe('pointer');
      expect(
        getComputedStyle(page.getByText('Stored in the sent folder').element()).cursor,
      ).not.toBe('pointer');
    });

    it('should show the default cursor on the title and control when disabled', async () => {
      await render(<PlainCheckbox label="Keep a copy" disabled />);

      const input = page.getByRole('checkbox', { name: 'Keep a copy' }).element();
      expect(getComputedStyle(page.getByText('Keep a copy').element()).cursor).toBe('default');
      expect(getComputedStyle(input).cursor).toBe('default');
    });

    it('should show a focus ring on keyboard focus', async () => {
      await render(<PlainCheckbox label="Keep a copy" />);

      await userEvent.tab();
      expect(getComputedStyle(getIcon('Keep a copy')).outlineStyle).toBe('solid');
    });
  });

  describe('native passthrough', () => {
    it('should forward the ref and native props to the input', async () => {
      const ref = React.createRef<HTMLInputElement>();
      await render(<PlainCheckbox label="Keep a copy" ref={ref} name="copy" data-testid="copy" />);

      expect(ref.current).toBe(page.getByRole('checkbox', { name: 'Keep a copy' }).element());
      expect(ref.current?.name).toBe('copy');
      expect(ref.current?.dataset.testid).toBe('copy');
    });

    it('should apply className, style and rootRef to the root', async () => {
      const rootRef = React.createRef<HTMLDivElement>();
      await render(
        <PlainCheckbox
          label="Keep a copy"
          className="custom"
          style={{ marginTop: 4 }}
          rootRef={rootRef}
        />,
      );

      const root = rootRef.current;
      expect(root?.contains(page.getByRole('checkbox', { name: 'Keep a copy' }).element())).toBe(
        true,
      );
      expect(root?.classList.contains('custom')).toBe(true);
      expect(root?.style.marginTop).toBe('4px');
    });
  });
});

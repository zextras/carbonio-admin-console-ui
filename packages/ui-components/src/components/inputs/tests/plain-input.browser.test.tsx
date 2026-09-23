/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { PlainInput } from '../plain-input';

async function getBox(label: string): Promise<HTMLElement> {
  const input = page.getByRole('textbox', { name: label }).element();
  return input.parentElement as HTMLElement;
}

function formatRgba(r: number, g: number, b: number, a: number): string {
  if (a >= 1) return `rgb(${r}, ${g}, ${b})`;
  return `rgba(${r}, ${g}, ${b}, ${Math.round(a * 100) / 100})`;
}

function toRgba(color: string): string {
  const normalized = color.trim().toLowerCase();
  if (normalized === 'transparent') return 'rgba(0, 0, 0, 0)';
  if (normalized.startsWith('#')) {
    let hex = normalized.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      hex = hex
        .split('')
        .map((char) => char + char)
        .join('');
    }
    if (hex.length !== 6 && hex.length !== 8) {
      throw new Error(`Unsupported hex color: ${color}`);
    }
    const r = Number.parseInt(hex.slice(0, 2), 16);
    const g = Number.parseInt(hex.slice(2, 4), 16);
    const b = Number.parseInt(hex.slice(4, 6), 16);
    const a = hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1;
    return formatRgba(r, g, b, a);
  }
  const match = /^rgba?\(([^)]+)\)$/.exec(normalized);
  if (!match) {
    throw new Error(`Unsupported color: ${color}`);
  }
  const parts = match[1].split(',').map((part) => part.trim());
  return formatRgba(
    Number.parseInt(parts[0], 10),
    Number.parseInt(parts[1], 10),
    Number.parseInt(parts[2], 10),
    parts[3] !== undefined ? Number.parseFloat(parts[3]) : 1,
  );
}

function expectColor(actual: string, expected: string): void {
  expect(toRgba(actual)).toBe(toRgba(expected));
}

describe('PlainInput', () => {
  describe('label association', () => {
    it('renders a textbox whose accessible name is the label', async () => {
      await render(<PlainInput label="Display Name" />);

      const input = page.getByRole('textbox', { name: 'Display Name' });
      await expect.element(input).toBeVisible();
    });

    it('renders the label as a visible element', async () => {
      await render(<PlainInput label="Display Name" />);

      await expect.element(page.getByText('Display Name')).toBeVisible();
    });

    it('uses a custom id and wires the label to it', async () => {
      await render(<PlainInput label="Display Name" id="custom-id" />);

      const input = page.getByRole('textbox', { name: 'Display Name' });
      await expect.element(input).toHaveAttribute('id', 'custom-id');
      await expect.element(page.getByText('Display Name')).toHaveAttribute('for', 'custom-id');
    });

    it('renders a red hidden asterisk after the label when required', async () => {
      await render(<PlainInput label="Name" required />);

      const input = (await page.getByRole('textbox', { name: 'Name' }).element()) as HTMLInputElement;
      const label = input.labels?.[0] as HTMLLabelElement;
      const mark = label.querySelector('span');
      expect(mark?.textContent).toBe('*');
      expect(mark?.getAttribute('aria-hidden')).toBe('true');
      expectColor(getComputedStyle(mark as HTMLElement).color, '#BE3028');
    });

    it('keeps the accessible name free of the required asterisk', async () => {
      await render(<PlainInput label="Name" required />);

      await expect.element(page.getByRole('textbox', { name: 'Name' })).toBeVisible();
    });

    it('does not render an asterisk when not required', async () => {
      await render(<PlainInput label="Name" />);

      const input = (await page.getByRole('textbox', { name: 'Name' }).element()) as HTMLInputElement;
      const label = input.labels?.[0] as HTMLLabelElement;
      expect(label.querySelector('span')).toBeNull();
    });
  });

  describe('value handling', () => {
    it('renders the controlled value', async () => {
      await render(<PlainInput label="Name" value="Alice" onChange={() => {}} />);

      await expect.element(page.getByRole('textbox', { name: 'Name' })).toHaveValue('Alice');
    });

    it('fires onChange with e.target.value and stays controlled while typing', async () => {
      const changes: Array<string> = [];
      const ControlledNameInput = (): React.JSX.Element => {
        const [value, setValue] = useState('');
        return (
          <PlainInput
            label="Name"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              changes.push(e.target.value);
            }}
          />
        );
      };
      await render(<ControlledNameInput />);

      await userEvent.type(page.getByRole('textbox', { name: 'Name' }), 'Hi');

      await expect.element(page.getByRole('textbox', { name: 'Name' })).toHaveValue('Hi');
      expect(changes).toEqual(['H', 'Hi']);
    });

    it('updates its own value in uncontrolled mode', async () => {
      await render(<PlainInput label="Name" defaultValue="Bob" />);

      const input = page.getByRole('textbox', { name: 'Name' });
      await expect.element(input).toHaveValue('Bob');
      await userEvent.type(input, 'x');
      await expect.element(input).toHaveValue('Bobx');
    });
  });

  describe('disabled state', () => {
    it('cannot be interacted with when disabled', async () => {
      await render(<PlainInput label="Name" defaultValue="Bob" disabled />);

      const input = page.getByRole('textbox', { name: 'Name' });
      await expect.element(input).toBeDisabled();
      await expect.element(input).toHaveValue('Bob');
    });

    it('applies disabled styling to the field box', async () => {
      await render(<PlainInput label="Name" disabled />);

      const input = await page.getByRole('textbox', { name: 'Name' }).element();
      const box = input.parentElement as HTMLElement;
      const style = getComputedStyle(box);
      expectColor(style.backgroundColor, '#F5F6F8');
      expect(style.cursor).not.toBe('not-allowed');
    });
  });

  describe('visual states', () => {
    it('renders the field box at the 2.5rem total height (border-box)', async () => {
      await render(<PlainInput label="Name" />);

      const style = getComputedStyle(await getBox('Name'));
      expect(style.height).toBe('40px');
      expect(style.boxSizing).toBe('border-box');
    });

    it('shows a white background at rest', async () => {
      await render(<PlainInput label="Name" />);

      const style = getComputedStyle(await getBox('Name'));
      expectColor(style.backgroundColor, '#FFFFFF');
    });

    it('does not change the cursor over the field box', async () => {
      await render(<PlainInput label="Name" />);

      const style = getComputedStyle(await getBox('Name'));
      expect(style.cursor).toBe('auto');
    });

    it('renders a 1px solid #858C93 border on all four sides at rest', async () => {
      await render(<PlainInput label="Name" />);

      const style = getComputedStyle(await getBox('Name'));
      expect(style.borderTopWidth).toBe('1px');
      expect(style.borderTopStyle).toBe('solid');
      expectColor(style.borderTopColor, '#858C93');
      expect(style.borderRightWidth).toBe('1px');
      expect(style.borderRightStyle).toBe('solid');
      expectColor(style.borderRightColor, '#858C93');
      expect(style.borderBottomWidth).toBe('1px');
      expect(style.borderBottomStyle).toBe('solid');
      expectColor(style.borderBottomColor, '#858C93');
      expect(style.borderLeftWidth).toBe('1px');
      expect(style.borderLeftStyle).toBe('solid');
      expectColor(style.borderLeftColor, '#858C93');
    });

    it('changes the border color on hover', async () => {
      await render(<PlainInput label="Name" />);

      await page.getByRole('textbox', { name: 'Name' }).hover();

      const style = getComputedStyle(await getBox('Name'));
      expectColor(style.borderColor, '#225CA8');
    });

    it('shows the solid focus border and halo when the input is focused', async () => {
      await render(<PlainInput label="Name" />);

      await page.getByRole('textbox', { name: 'Name' }).click();

      const style = getComputedStyle(await getBox('Name'));
      expectColor(style.borderColor, '#225CA8');
      expect(style.boxShadow).toBe('rgba(43, 115, 210, 0.25) 0px 0px 0px 2px');
    });

    it('does not show the focus ring when the input is disabled', async () => {
      await render(<PlainInput label="Name" disabled />);

      await page.getByRole('textbox', { name: 'Name' }).click({ force: true });

      const style = getComputedStyle(await getBox('Name'));
      expect(style.boxShadow).toBe('none');
    });

    it('renders the native input without its own chrome', async () => {
      await render(<PlainInput label="Name" />);

      const input = page.getByRole('textbox', { name: 'Name' }).element() as HTMLInputElement;
      const style = getComputedStyle(input);
      expect(style.borderStyle).toBe('none');
      expectColor(style.backgroundColor, 'transparent');
      expect(style.flexGrow).toBe('1');
    });

    it('keeps a caller-provided className on the input', async () => {
      await render(<PlainInput label="Name" className="custom-class" />);

      await expect.element(page.getByRole('textbox', { name: 'Name' })).toHaveClass(/custom-class/);
    });
  });

  describe('native passthrough', () => {
    it('passes placeholder, type, autoComplete and name to the input', async () => {
      await render(
        <PlainInput
          label="Search Bind User"
          placeholder="Type here"
          type="email"
          autoComplete="off"
          name="bind-user"
        />,
      );

      const input = page.getByRole('textbox', { name: 'Search Bind User' });
      await expect.element(input).toHaveAttribute('placeholder', 'Type here');
      await expect.element(input).toHaveAttribute('type', 'email');
      await expect.element(input).toHaveAttribute('autocomplete', 'off');
      await expect.element(input).toHaveAttribute('name', 'bind-user');
    });

    it('marks the input as required when required is passed', async () => {
      await render(<PlainInput label="Name" required />);

      await expect.element(page.getByRole('textbox', { name: 'Name' })).toHaveAttribute('required');
    });

    it('forwards the ref to the native input element', async () => {
      const inputRef = React.createRef<HTMLInputElement>();
      await render(<PlainInput label="Name" ref={inputRef} />);

      expect(inputRef.current).toBeInstanceOf(HTMLInputElement);
      expect(inputRef.current?.tagName).toBe('INPUT');
    });
  });

  describe('info icon', () => {
    it('renders the InfoOutline icon inside the field box when infoIcon is true', async () => {
      await render(<PlainInput label="Name" infoIcon />);

      const input = await page.getByRole('textbox', { name: 'Name' }).element();
      const box = input.parentElement as HTMLElement;
      const host = input.nextElementSibling;
      expect(host?.tagName).toBe('DS-ICON');
      expect(host?.getAttribute('icon')).toBe('InfoOutline');
      expect(host?.getAttribute('aria-hidden')).toBe('true');
      expect(host?.shadowRoot?.querySelector('svg')).not.toBeNull();
      expect(box.contains(host as Node)).toBe(true);
    });

    it('sizes and colors the icon per spec', async () => {
      await render(<PlainInput label="Name" infoIcon />);

      const input = await page.getByRole('textbox', { name: 'Name' }).element();
      const host = input.nextElementSibling as HTMLElement;
      const svg = host.shadowRoot?.querySelector('svg') as SVGSVGElement | null;
      expect(svg).not.toBeNull();
      const svgStyle = getComputedStyle(svg as Element);
      expect(Number.parseFloat(svgStyle.width)).toBeCloseTo(0.83331 * 16, 1);
      expect(Number.parseFloat(svgStyle.height)).toBeCloseTo(0.83331 * 16, 1);
      expectColor(svgStyle.color, '#696969');
    });

    it('does not render any icon inside the box without infoIcon', async () => {
      await render(<PlainInput label="Name" />);

      const input = await page.getByRole('textbox', { name: 'Name' }).element();
      const box = input.parentElement as HTMLElement;
      expect(box.querySelector('ds-icon')).toBeNull();
    });
  });

  describe('error and description support', () => {
    it('renders the description below the input and links it via aria-describedby', async () => {
      await render(<PlainInput label="Token" description="Invalid token" />);

      const input = await page.getByRole('textbox', { name: 'Token' }).element();
      const describedBy = input.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      const description = document.getElementById(describedBy as string);
      expect(description?.textContent).toBe('Invalid token');
      expect(description?.tagName).toBe('P');
    });

    it('merges a caller-provided aria-describedby with the description id', async () => {
      await render(<PlainInput label="Token" description="Invalid token" aria-describedby="external-hint" />);

      const input = await page.getByRole('textbox', { name: 'Token' }).element();
      const ids = (input.getAttribute('aria-describedby') ?? '').split(/\s+/);
      expect(ids).toContain('external-hint');
      expect(document.getElementById(ids.find((id) => id !== 'external-hint') as string)?.textContent).toBe(
        'Invalid token',
      );
    });

    it('does not set aria-describedby when no description is provided', async () => {
      await render(<PlainInput label="Token" />);

      await expect
        .element(page.getByRole('textbox', { name: 'Token' }))
        .not.toHaveAttribute('aria-describedby');
    });

    it('always reserves the description slot even without a description', async () => {
      await render(<PlainInput label="Token" />);

      const box = await getBox('Token');
      const slot = box.nextElementSibling;
      expect(slot?.tagName).toBe('P');
      expect(slot?.textContent).toBe('');
      expect(getComputedStyle(slot as HTMLElement).minHeight).toBe('16px');
    });

    it('treats a null description as absent', async () => {
      await render(<PlainInput label="Token" description={null} />);

      await expect
        .element(page.getByRole('textbox', { name: 'Token' }))
        .not.toHaveAttribute('aria-describedby');

      const box = await getBox('Token');
      expect(box.nextElementSibling?.textContent).toBe('');
    });

    it('marks the input as invalid when hasError is true', async () => {
      await render(<PlainInput label="Token" hasError />);

      await expect
        .element(page.getByRole('textbox', { name: 'Token' }))
        .toHaveAttribute('aria-invalid', 'true');
    });

    it('does not mark the input as invalid without hasError', async () => {
      await render(<PlainInput label="Token" />);

      await expect
        .element(page.getByRole('textbox', { name: 'Token' }))
        .not.toHaveAttribute('aria-invalid');
    });

    it('shows the error border at rest', async () => {
      await render(<PlainInput label="Token" hasError />);

      const style = getComputedStyle(await getBox('Token'));
      expectColor(style.borderColor, '#D74942');
    });

    it('shows the error hover border on hover', async () => {
      await render(<PlainInput label="Token" hasError />);

      await page.getByRole('textbox', { name: 'Token' }).hover();

      const style = getComputedStyle(await getBox('Token'));
      expectColor(style.borderColor, '#BE3028');
    });

    it('shows the error focus ring when focused', async () => {
      await render(<PlainInput label="Token" hasError />);

      await page.getByRole('textbox', { name: 'Token' }).click();

      const style = getComputedStyle(await getBox('Token'));
      expectColor(style.borderColor, 'rgba(215, 73, 66, 0.25)');
      expect(style.boxShadow).toBe('rgba(215, 73, 66, 0.25) 0px 0px 0px 2px');
    });

    it('keeps the disabled styling when both disabled and hasError are set', async () => {
      await render(<PlainInput label="Token" hasError disabled />);

      const style = getComputedStyle(await getBox('Token'));
      expectColor(style.borderColor, '#E6E9ED');
      expectColor(style.backgroundColor, '#F5F6F8');
    });

    it('renders the description in error color when hasError, secondary otherwise', async () => {
      await render(<PlainInput label="Token" description="Invalid token" hasError />);
      const errorDescription = await page.getByText('Invalid token').element();
      expectColor(getComputedStyle(errorDescription).color, '#D74942');

      await render(<PlainInput label="Token" description="Helper text" />);
      const helperDescription = await page.getByText('Helper text').element();
      expectColor(getComputedStyle(helperDescription).color, '#828282');
    });

    it('renders the alert icon inside the error description', async () => {
      await render(<PlainInput label="Token" description="Invalid token" hasError />);

      const input = await page.getByRole('textbox', { name: 'Token' }).element();
      const describedBy = input.getAttribute('aria-describedby');
      const description = document.getElementById(describedBy as string);
      const icon = description?.querySelector('ds-icon');
      expect(icon?.getAttribute('icon')).toBe('AlertCircleOutline');
      expect(icon?.getAttribute('aria-hidden')).toBe('true');
      expect(icon?.shadowRoot?.querySelector('svg')).not.toBeNull();
    });

    it('does not render the alert icon without hasError', async () => {
      await render(<PlainInput label="Token" description="Helper text" />);

      const input = await page.getByRole('textbox', { name: 'Token' }).element();
      const describedBy = input.getAttribute('aria-describedby');
      const description = document.getElementById(describedBy as string);
      expect(description?.querySelector('ds-icon')).toBeNull();
    });

    it('styles the error description as an icon row', async () => {
      await render(<PlainInput label="Token" description="Invalid token" hasError />);

      const input = await page.getByRole('textbox', { name: 'Token' }).element();
      const describedBy = input.getAttribute('aria-describedby');
      const description = document.getElementById(describedBy as string) as HTMLElement;
      const style = getComputedStyle(description);
      expect(style.display).toBe('flex');
      expect(style.height).toBe('19px');
      expect(style.alignItems).toBe('center');
    });
  });
});

/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { LabeledValue } from '../labeled-value';

function CustomIcon(): React.JSX.Element {
  return <span>custom icon</span>;
}

async function getFieldWrapper(): Promise<HTMLElement> {
  const value = await page.getByText('42').element();
  return value.parentElement as HTMLElement;
}

describe('LabeledValue', () => {
  it('renders the label and the value', async () => {
    await render(<LabeledValue label="Accounts" value="42" />);

    await expect.element(page.getByText('Accounts')).toBeVisible();
    await expect.element(page.getByText('42')).toBeVisible();
  });

  it('renders a custom icon when provided', async () => {
    await render(<LabeledValue label="Accounts" value="42" CustomIcon={CustomIcon} />);

    await expect.element(page.getByText('custom icon')).toBeVisible();
  });

  it('applies the input-family box geometry to the field wrapper', async () => {
    await render(<LabeledValue label="Accounts" value="42" />);

    const fieldWrapper = await getFieldWrapper();
    const computed = getComputedStyle(fieldWrapper);
    expect(computed.display).toBe('flex');
    expect(parseFloat(computed.height)).toBeCloseTo(40, 0);
    expect(computed.justifyContent).toBe('space-between');
    expect(computed.alignItems).toBe('center');
    expect(computed.flexShrink).toBe('0');
    expect(computed.alignSelf).toBe('stretch');
  });

  it('colors the label and value like the input-family resting state', async () => {
    await render(<LabeledValue label="Accounts" value="42" />);

    const value = (await page.getByText('42').element()) as HTMLElement;
    const label = (await page.getByText('Accounts').element()) as HTMLElement;
    expect(getComputedStyle(value).color).toBe('rgb(51, 51, 51)');
    expect(getComputedStyle(label).color).toBe('rgb(51, 51, 51)');
    expect(getComputedStyle(label).fontWeight).toBe('500');
  });

  it('renders the label above and outside the field box with family typography', async () => {
    await render(<LabeledValue label="Accounts" value="42" />);

    const label = (await page.getByText('Accounts').element()) as HTMLElement;
    const fieldWrapper = await getFieldWrapper();
    expect(fieldWrapper.contains(label)).toBe(false);
    expect(fieldWrapper.previousElementSibling).toBe(label);
    const computed = getComputedStyle(label);
    expect(parseFloat(computed.fontSize)).toBeCloseTo(14, 0);
  });
});

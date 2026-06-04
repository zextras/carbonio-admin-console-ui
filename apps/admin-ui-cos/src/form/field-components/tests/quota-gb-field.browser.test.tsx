/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { useAppForm } from '../../form-hook';

const Wrapper = ({
  defaultValue = '',
  label = 'Total quota(GB)',
  disabled = false,
}: {
  defaultValue?: string;
  label?: string;
  disabled?: boolean;
}) => {
  const form = useAppForm({
    defaultValues: { quota: defaultValue } as { quota: string },
    onSubmit: vi.fn(),
  });

  return (
    <form.AppForm>
      <form.AppField name="quota">
        {(field) => (
          <field.QuotaGBField
            label={label}
            maximumDigitsLabel="Maximum 3 decimal digits"
            disabled={disabled}
          />
        )}
      </form.AppField>
    </form.AppForm>
  );
};

describe('QuotaGBField (browser)', () => {
  it('should render the input with label', async () => {
    await setupBrowserTest(<Wrapper />);
    await expect.element(page.getByPlaceholder('Total quota(GB)')).toBeVisible();
  });

  it('should display empty value when no default', async () => {
    await setupBrowserTest(<Wrapper />);
    const input = page.getByPlaceholder('Total quota(GB)');
    await expect.element(input).toHaveValue('');
  });

  it('should display GB value when initialized with bytes', async () => {
    await setupBrowserTest(<Wrapper defaultValue={String(1073741824)} />);
    const input = page.getByPlaceholder('Total quota(GB)');
    await expect.element(input).toHaveValue('1.00');
  });

  it('should update field value when typing a valid number', async () => {
    await setupBrowserTest(<Wrapper />);
    const input = page.getByPlaceholder('Total quota(GB)');
    await userEvent.fill(input, '2.5');
    await expect.element(input).toHaveValue('2.5');
  });

  it('should not accept non-numeric input', async () => {
    await setupBrowserTest(<Wrapper defaultValue={String(1073741824)} />);
    const input = page.getByPlaceholder('Total quota(GB)');
    await userEvent.fill(input, 'abc');
    await expect.element(input).toHaveValue('1.00');
  });

  it('should show warning when more than 3 decimal places', async () => {
    await setupBrowserTest(<Wrapper />);
    const input = page.getByPlaceholder('Total quota(GB)');
    await userEvent.fill(input, '1.1234');
    await expect.element(page.getByText('Maximum 3 decimal digits')).toBeVisible();
  });

  it('should not show warning with exactly 3 decimal places', async () => {
    await setupBrowserTest(<Wrapper />);
    const input = page.getByPlaceholder('Total quota(GB)');
    await userEvent.fill(input, '1.123');
    await expect.element(page.getByText('Maximum 3 decimal digits')).not.toBeInTheDocument();
  });

  it('should handle empty input clearing the value', async () => {
    await setupBrowserTest(<Wrapper defaultValue={String(1073741824)} />);
    const input = page.getByPlaceholder('Total quota(GB)');
    await input.clear();
    await expect.element(input).toHaveValue('');
  });

  it('should be disabled when disabled prop is true', async () => {
    await setupBrowserTest(<Wrapper disabled />);
    const input = page.getByPlaceholder('Total quota(GB)');
    await expect.element(input).toBeDisabled();
  });

  it('should show revert icon after editing', async () => {
    await setupBrowserTest(<Wrapper defaultValue={String(1073741824)} />);
    const input = page.getByPlaceholder('Total quota(GB)');
    await userEvent.fill(input, '5');
    const revertIcon = document.querySelector(
      'ds-icon[aria-label="Click to revert to the inherited value"]',
    );
    expect(revertIcon).not.toBeNull();
  });

  it('should revert to initial value when revert icon is clicked', async () => {
    await setupBrowserTest(<Wrapper defaultValue={String(1073741824)} />);
    const input = page.getByPlaceholder('Total quota(GB)');
    await userEvent.fill(input, '5');
    await expect.element(input).toHaveValue('5');

    const revertWrapper = document.querySelector(
      'ds-icon[aria-label="Click to revert to the inherited value"]',
    );
    const clickTarget = revertWrapper?.closest('[style*="cursor: pointer"]') ?? revertWrapper;
    (clickTarget as HTMLElement).click();

    await expect.element(input).toHaveValue('1.00');
  });
});

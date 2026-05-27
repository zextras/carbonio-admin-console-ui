/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useForm } from '@tanstack/react-form';
import { setupBrowserTest } from 'admin-ui-test-utils';
import { FC } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { AccountType } from '../../../../../types/account';
import { CosFormApi } from '../cos-form-api';
import { TimeFieldGroup } from '../time-field-group';

const timeItems = [
  { label: 'Seconds', value: 's' },
  { label: 'Minutes', value: 'm' },
  { label: 'Hours', value: 'h' },
  { label: 'Days', value: 'd' },
];

const TestWrapper: FC<{ initialValue?: string; onSubmit?: (v: string) => void }> = ({
  initialValue = '',
  onSubmit = vi.fn(),
}) => {
  const form = useForm({
    defaultValues: { zimbraPasswordLockoutDuration: initialValue } as AccountType,
    onSubmit: ({ value }) => onSubmit(value.zimbraPasswordLockoutDuration ?? ''),
  });
  return (
    <TimeFieldGroup
      form={form as CosFormApi}
      name="zimbraPasswordLockoutDuration"
      label="Lockout duration"
      readonlyCOS={false}
      timeItems={timeItems}
    />
  );
};

describe('TimeFieldGroup (browser)', () => {
  it('renders the label and a time range select', async () => {
    await setupBrowserTest(<TestWrapper />);
    await expect.element(page.getByText('Lockout duration')).toBeVisible();
    await expect.element(page.getByText('Time Range')).toBeVisible();
  });

  it('splits an existing combined value into num and unit', async () => {
    await setupBrowserTest(<TestWrapper initialValue="5m" />);
    const input = page.getByRole('textbox', { name: 'Lockout duration' });
    await expect.element(input).toHaveValue('5');
  });

  it('shows empty input when value is empty', async () => {
    await setupBrowserTest(<TestWrapper initialValue="" />);
    const input = page.getByRole('textbox', { name: 'Lockout duration' });
    await expect.element(input).toHaveValue('');
  });

  it('disables inputs when readonlyCOS is true', async () => {
    const W: FC = () => {
      const f = useForm({ defaultValues: {} as AccountType });
      return (
        <TimeFieldGroup
          form={f as CosFormApi}
          name="zimbraPasswordLockoutDuration"
          label="Lockout duration"
          readonlyCOS={true}
          timeItems={timeItems}
        />
      );
    };
    await setupBrowserTest(<W />);
    const input = page.getByRole('textbox', { name: 'Lockout duration' });
    await expect.element(input).toBeDisabled();
  });
});

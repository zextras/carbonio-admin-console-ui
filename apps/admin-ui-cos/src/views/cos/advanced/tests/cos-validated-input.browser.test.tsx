/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useForm } from '@tanstack/react-form';
import { setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { CosValidatedInput } from '../fields/validated-input';
import { COS_VALIDATION_MESSAGES, cosAdvancedSchema } from '../schema';
import { CosAdvancedFormValues, CosFormApi } from '../types';

const NON_NEGATIVE_INTEGER = COS_VALIDATION_MESSAGES['cos.validation.non_negative_integer'];
const MAX_LESS_THAN_MIN = COS_VALIDATION_MESSAGES['cos.validation.max_less_than_min_length'];

const Wrapper = ({
  onSubmit = vi.fn(),
}: { onSubmit?: (value: CosAdvancedFormValues) => void }) => {
  const form = useForm({
    defaultValues: {
      zimbraPasswordMinLength: '',
      zimbraPasswordMaxLength: '',
      backupEnabled: false,
      backupSelfUndeleteAllowed: false,
    } as CosAdvancedFormValues,
    validators: {
      onChange: cosAdvancedSchema,
      onSubmit: cosAdvancedSchema,
    },
    onSubmit: ({ value }) => onSubmit(value),
  });

  return (
    <>
      <CosValidatedInput
        form={form as CosFormApi}
        name="zimbraPasswordMinLength"
        label="Min length"
      />
      <CosValidatedInput
        form={form as CosFormApi}
        name="zimbraPasswordMaxLength"
        label="Max length"
      />
      <button type="button" onClick={() => form.handleSubmit()}>
        Save
      </button>
    </>
  );
};

describe('CosValidatedInput (browser)', () => {
  it('keeps errors hidden until the field is blurred', async () => {
    await setupBrowserTest(<Wrapper />);
    await userEvent.fill(page.getByRole('textbox', { name: 'Min length' }), '-5');
    await expect.element(page.getByText(NON_NEGATIVE_INTEGER)).not.toBeInTheDocument();
  });

  it('shows the validation error after the field loses focus', async () => {
    await setupBrowserTest(<Wrapper />);
    await userEvent.fill(page.getByRole('textbox', { name: 'Min length' }), '-5');
    // Move focus to another field to trigger blur on the min-length input.
    await userEvent.click(page.getByRole('textbox', { name: 'Max length' }));
    await expect.element(page.getByText(NON_NEGATIVE_INTEGER)).toBeVisible();
  });

  it('blocks submission and reveals the error when a value is invalid', async () => {
    const onSubmit = vi.fn();
    await setupBrowserTest(<Wrapper onSubmit={onSubmit} />);
    await userEvent.fill(page.getByRole('textbox', { name: 'Min length' }), 'abc');
    await userEvent.click(page.getByRole('button', { name: 'Save' }));

    await expect.element(page.getByText(NON_NEGATIVE_INTEGER)).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits when all values are valid', async () => {
    const onSubmit = vi.fn();
    await setupBrowserTest(<Wrapper onSubmit={onSubmit} />);
    await userEvent.fill(page.getByRole('textbox', { name: 'Min length' }), '8');
    await userEvent.click(page.getByRole('button', { name: 'Save' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].zimbraPasswordMinLength).toBe('8');
  });

  it('enforces the cross-field max >= min rule on submit', async () => {
    const onSubmit = vi.fn();
    await setupBrowserTest(<Wrapper onSubmit={onSubmit} />);
    await userEvent.fill(page.getByRole('textbox', { name: 'Min length' }), '10');
    await userEvent.fill(page.getByRole('textbox', { name: 'Max length' }), '3');
    await userEvent.click(page.getByRole('button', { name: 'Save' }));

    await expect.element(page.getByText(MAX_LESS_THAN_MIN)).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

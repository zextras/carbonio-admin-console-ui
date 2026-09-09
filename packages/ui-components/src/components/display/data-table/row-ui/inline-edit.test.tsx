/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DataTableInlineEdit } from './inline-edit';

const baseProps = {
  initialValue: 'Hello',
  columnLabel: 'Display Name',
  requiredMessage: 'Value is required',
  saveLabel: 'Save changes',
  cancelLabel: 'Cancel editing',
};

function setupInlineEdit() {
  const onSave = vi.fn();
  const onCancel = vi.fn();
  render(<DataTableInlineEdit {...baseProps} onSave={onSave} onCancel={onCancel} />);
  const input = screen.getByLabelText('Display Name');
  return { input, onSave, onCancel };
}

describe('DataTableInlineEdit', () => {
  it('renders the initial value in the input', () => {
    const { input } = setupInlineEdit();
    expect((input as HTMLInputElement).value).toBe('Hello');
  });

  it('clears the validation error when typing after a failed commit', () => {
    const { input, onSave } = setupInlineEdit();
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(screen.getByText('Value is required')).toBeTruthy();
    expect(onSave).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: 'Typed text' } });
    expect(screen.queryByText('Value is required')).toBeNull();
  });

  it('commits a valid value on Enter without showing an error', () => {
    const { input, onSave } = setupInlineEdit();
    fireEvent.change(input, { target: { value: 'Committed' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith('Committed');
    expect(screen.queryByText('Value is required')).toBeNull();
  });

  it('calls onCancel on Escape', () => {
    const { input, onCancel } = setupInlineEdit();
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('shows the required error, skips onSave and describes the input', () => {
    const { input, onSave } = setupInlineEdit();
    fireEvent.change(input, { target: { value: '  ' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByText('Value is required')).toBeTruthy();
    expect(onSave).not.toHaveBeenCalled();
    expect(input.getAttribute('aria-invalid')).toBe('true');
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy ?? '')?.textContent).toBe('Value is required');
  });
});

/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DataTableConfirmDialog } from './confirm-dialog';

const dialogProps = {
  title: 'Are you sure?',
  message: 'Delete 3 items? This cannot be undone.',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
};

function FocusHarness({ open }: { open: boolean }) {
  return (
    <>
      <button type="button">Trigger</button>
      {open && <DataTableConfirmDialog {...dialogProps} />}
    </>
  );
}

describe('DataTableConfirmDialog', () => {
  it('renders a modal dialog named by its title', () => {
    render(<DataTableConfirmDialog {...dialogProps} />);
    expect(screen.getByRole('dialog', { name: 'Are you sure?' })).toBeTruthy();
    expect(screen.getByText('Delete 3 items? This cannot be undone.')).toBeTruthy();
  });

  it('moves focus to the cancel button on mount and restores it on unmount', () => {
    const { rerender } = render(<FocusHarness open={false} />);
    const trigger = screen.getByRole('button', { name: 'Trigger' });
    trigger.focus();
    expect(trigger).toBe(document.activeElement);
    rerender(<FocusHarness open />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBe(document.activeElement);
    rerender(<FocusHarness open={false} />);
    expect(trigger).toBe(document.activeElement);
  });

  it('cancels on Escape at the document level (no focus needed)', () => {
    render(<DataTableConfirmDialog {...dialogProps} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(dialogProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('cancels on backdrop press but not on dialog content interaction', () => {
    render(<DataTableConfirmDialog {...dialogProps} />);
    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);
    fireEvent.pointerDown(dialog);
    expect(dialogProps.onCancel).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('Delete 3 items? This cannot be undone.'));
    expect(dialogProps.onCancel).not.toHaveBeenCalled();
    // The overlay is the dialog's parent element; a press targeting it dismisses.
    fireEvent.pointerDown(dialog.parentElement as HTMLElement);
    expect(dialogProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('cycles focus between the two actions with Tab/Shift+Tab', () => {
    render(<DataTableConfirmDialog {...dialogProps} />);
    const cancel = screen.getByRole('button', { name: 'Cancel' });
    const confirm = screen.getByRole('button', { name: 'Confirm' });
    cancel.focus();
    fireEvent.keyDown(cancel, { key: 'Tab', shiftKey: true });
    expect(confirm).toBe(document.activeElement);
    fireEvent.keyDown(confirm, { key: 'Tab' });
    expect(cancel).toBe(document.activeElement);
  });

  it('invokes the matching handler on button click', () => {
    render(<DataTableConfirmDialog {...dialogProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(dialogProps.onConfirm).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(dialogProps.onCancel).toHaveBeenCalledTimes(1);
  });
});

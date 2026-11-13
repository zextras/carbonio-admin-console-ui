/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { act, fireEvent, render, screen } from '@testing-library/react';
import { type CreateSnackbarFnArgs } from '@zextras/ui-shared';
import { useContext } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Snackbar } from '../../feedback/snackbar/Snackbar';
import { SnackbarManager, SnackbarManagerContext } from '../SnackbarManager';

type TriggerProps = {
  args: CreateSnackbarFnArgs;
  onCreated?: (close: () => void) => void;
};

const Trigger = ({ args, onCreated }: TriggerProps) => {
  const createSnackbar = useContext(SnackbarManagerContext);
  return (
    <button
      type="button"
      onClick={() => {
        const close = createSnackbar?.(args);
        if (close) {
          onCreated?.(close);
        }
      }}
    >
      Show {args.label}
    </button>
  );
};

function renderManager(triggers: Array<TriggerProps>) {
  return render(
    <SnackbarManager>
      {triggers.map((trigger) => (
        <Trigger key={String(trigger.args.label)} {...trigger} />
      ))}
    </SnackbarManager>,
  );
}

describe('SnackbarManager', () => {
  it('calls onActionClick and removes the snackbar when the action is clicked', () => {
    const onActionClick = vi.fn();
    const onClose = vi.fn();
    renderManager([
      {
        args: {
          label: 'Saved',
          actionLabel: 'Undo',
          onActionClick,
          onClose,
          disableAutoHide: true,
        },
      },
    ]);

    fireEvent.click(screen.getByRole('button', { name: 'Show Saved' }));
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));

    expect(onActionClick).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.queryByText('Saved')).toBeNull();
  });

  it('calls onClose when the action is clicked and no onActionClick is provided', () => {
    const onClose = vi.fn();
    renderManager([
      { args: { label: 'Saved', actionLabel: 'Dismiss', onClose, disableAutoHide: true } },
    ]);

    fireEvent.click(screen.getByRole('button', { name: 'Show Saved' }));
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Saved')).toBeNull();
  });

  it('shows queued snackbars one at a time', () => {
    renderManager([
      { args: { label: 'First', actionLabel: 'Close first', disableAutoHide: true } },
      { args: { label: 'Second', actionLabel: 'Close second', disableAutoHide: true } },
    ]);

    fireEvent.click(screen.getByRole('button', { name: 'Show First' }));
    fireEvent.click(screen.getByRole('button', { name: 'Show Second' }));
    expect(screen.getByText('First')).toBeTruthy();
    expect(screen.queryByText('Second')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Close first' }));
    expect(screen.getByText('Second')).toBeTruthy();
  });

  it('replaces the visible snackbar when replace is set', () => {
    renderManager([
      { args: { label: 'First', disableAutoHide: true } },
      { args: { label: 'Second', disableAutoHide: true, replace: true } },
    ]);

    fireEvent.click(screen.getByRole('button', { name: 'Show First' }));
    fireEvent.click(screen.getByRole('button', { name: 'Show Second' }));

    expect(screen.queryByText('First')).toBeNull();
    expect(screen.getByText('Second')).toBeTruthy();
  });

  it('removes the snackbar through the returned close function', () => {
    let close: (() => void) | undefined;
    renderManager([
      {
        args: { label: 'Closable', disableAutoHide: true },
        onCreated: (fn) => {
          close = fn;
        },
      },
    ]);

    fireEvent.click(screen.getByRole('button', { name: 'Show Closable' }));
    expect(screen.getByText('Closable')).toBeTruthy();

    expect(close).toBeDefined();
    act(() => {
      close?.();
    });

    expect(screen.queryByText('Closable')).toBeNull();
  });
});

describe('Snackbar', () => {
  it('calls onClose when the action is clicked without onActionClick', () => {
    const onClose = vi.fn();
    render(
      <Snackbar open label="Standalone" actionLabel="Got it" onClose={onClose} disableAutoHide />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Got it' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

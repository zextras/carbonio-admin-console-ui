/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DataTableUndoToast } from './undo-toast';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string, options?: Record<string, string>) => {
      if (defaultValue === undefined) {
        return key;
      }
      if (options === undefined) {
        return defaultValue;
      }
      return defaultValue.replace(
        /\{\{(\w+)\}\}/g,
        (_match: string, name: string) => options[name] ?? '',
      );
    },
    i18n: { resolvedLanguage: 'en-US', language: 'en-US' },
  }),
}));

describe('DataTableUndoToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts a fresh countdown per mounted toast (parent keys per action id)', () => {
    const onExpireA = vi.fn();
    const onExpireB = vi.fn();
    const first = render(
      <DataTableUndoToast message="Deleted A" onUndo={vi.fn()} onExpire={onExpireA} />,
    );
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    first.unmount();
    render(<DataTableUndoToast message="Deleted B" onUndo={vi.fn()} onExpire={onExpireB} />);
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(onExpireB).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onExpireB).toHaveBeenCalledTimes(1);
  });

  it('stops the countdown at zero and expires exactly once', () => {
    const onExpire = vi.fn();
    render(<DataTableUndoToast message="Deleted" onUndo={vi.fn()} onExpire={onExpire} />);
    act(() => {
      vi.advanceTimersByTime(15000);
    });
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('does not undo via Cmd+Z while typing in an input', () => {
    const onUndo = vi.fn();
    render(
      <>
        <input type="text" aria-label="editor" />
        <DataTableUndoToast message="Deleted" onUndo={onUndo} onExpire={vi.fn()} />
      </>,
    );
    fireEvent.keyDown(screen.getByLabelText('editor'), { key: 'z', metaKey: true });
    expect(onUndo).not.toHaveBeenCalled();
  });

  it('undos via Cmd+Z outside editable targets', () => {
    const onUndo = vi.fn();
    render(<DataTableUndoToast message="Deleted" onUndo={onUndo} onExpire={vi.fn()} />);
    fireEvent.keyDown(document.body, { key: 'z', metaKey: true });
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it('suppresses Cmd+Z while ignoreShortcut returns true (e.g. a modal is open)', () => {
    const onUndo = vi.fn();
    const { rerender } = render(
      <DataTableUndoToast
        message="Deleted"
        onUndo={onUndo}
        onExpire={vi.fn()}
        ignoreShortcut={() => true}
      />,
    );
    fireEvent.keyDown(document.body, { key: 'z', metaKey: true });
    expect(onUndo).not.toHaveBeenCalled();
    rerender(
      <DataTableUndoToast
        message="Deleted"
        onUndo={onUndo}
        onExpire={vi.fn()}
        ignoreShortcut={() => false}
      />,
    );
    fireEvent.keyDown(document.body, { key: 'z', metaKey: true });
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it('undos via the undo button and shows the countdown hint', () => {
    const onUndo = vi.fn();
    render(<DataTableUndoToast message="Deleted 3 items" onUndo={onUndo} onExpire={vi.fn()} />);
    expect(screen.getByText('5s to undo (⌘Z)')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it('keeps the countdown hidden from screen readers (no per-tick chatter)', () => {
    render(<DataTableUndoToast message="Deleted" onUndo={vi.fn()} onExpire={vi.fn()} />);
    expect(screen.getByText('5s to undo (⌘Z)').getAttribute('aria-hidden')).toBe('true');
  });

  it('stays paused while focused even after the pointer leaves', () => {
    const onExpire = vi.fn();
    render(<DataTableUndoToast message="Deleted" onUndo={vi.fn()} onExpire={onExpire} />);
    const toast = screen.getByRole('status');
    fireEvent.mouseEnter(toast);
    fireEvent.focus(toast);
    fireEvent.mouseLeave(toast);
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(screen.getByText('5s to undo (⌘Z)')).toBeTruthy();
    expect(onExpire).not.toHaveBeenCalled();
  });
});

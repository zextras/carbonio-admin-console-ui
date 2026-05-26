/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { act, fireEvent, render, screen } from '@testing-library/react';
import { type MockInstance, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { VERIFY_SUCCESS_AUTO_CLOSE_MS } from '../../../../../constants';
import { VerifySuccess } from '../verify-success';

const mockT = vi.hoisted(() => (key: string, fallback?: string) => fallback ?? key);

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
}));

describe('VerifySuccess', () => {
  let showPopoverSpy: MockInstance;
  let hidePopoverSpy: MockInstance;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-26T10:00:00.000Z'));

    Object.defineProperty(HTMLElement.prototype, 'showPopover', {
      value: vi.fn(),
      configurable: true,
      writable: true,
    });
    Object.defineProperty(HTMLElement.prototype, 'hidePopover', {
      value: vi.fn(),
      configurable: true,
      writable: true,
    });

    showPopoverSpy = vi.spyOn(HTMLElement.prototype, 'showPopover');
    hidePopoverSpy = vi.spyOn(HTMLElement.prototype, 'hidePopover');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should open popover and auto-close calling onComplete after timeout', () => {
    const onComplete = vi.fn();

    render(<VerifySuccess isSuccess onComplete={onComplete} />);

    expect(showPopoverSpy).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(VERIFY_SUCCESS_AUTO_CLOSE_MS);
    });

    expect(hidePopoverSpy).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('should use the latest onComplete callback even when prop changes before timeout fires', () => {
    const firstOnComplete = vi.fn();
    const latestOnComplete = vi.fn();

    const { rerender } = render(<VerifySuccess isSuccess onComplete={firstOnComplete} />);

    rerender(<VerifySuccess isSuccess onComplete={latestOnComplete} />);

    act(() => {
      vi.advanceTimersByTime(VERIFY_SUCCESS_AUTO_CLOSE_MS);
    });

    expect(firstOnComplete).not.toHaveBeenCalled();
    expect(latestOnComplete).toHaveBeenCalledTimes(1);
  });

  it('should cancel the auto-close timeout when component unmounts before it fires', () => {
    const onComplete = vi.fn();

    const { unmount } = render(<VerifySuccess isSuccess onComplete={onComplete} />);

    unmount();

    act(() => {
      vi.advanceTimersByTime(VERIFY_SUCCESS_AUTO_CLOSE_MS + 1);
    });

    expect(hidePopoverSpy).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('should close immediately and call onComplete when close button is clicked', () => {
    const onComplete = vi.fn();

    render(<VerifySuccess isSuccess onComplete={onComplete} />);

    fireEvent.click(screen.getByRole('button', { name: 'Close', hidden: true }));

    expect(hidePopoverSpy).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('should cancel the auto-close timeout when close button is clicked before it fires', () => {
    const onComplete = vi.fn();

    render(<VerifySuccess isSuccess onComplete={onComplete} />);

    fireEvent.click(screen.getByRole('button', { name: 'Close', hidden: true }));

    act(() => {
      vi.advanceTimersByTime(VERIFY_SUCCESS_AUTO_CLOSE_MS + 1);
    });

    // onComplete and hidePopover each called exactly once (from handleClose), not again from timer
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(hidePopoverSpy).toHaveBeenCalledTimes(1);
  });

  it('should not open popover or set timeout when isSuccess is false', () => {
    const onComplete = vi.fn();

    render(<VerifySuccess isSuccess={false} onComplete={onComplete} />);

    act(() => {
      vi.advanceTimersByTime(VERIFY_SUCCESS_AUTO_CLOSE_MS + 1);
    });

    expect(showPopoverSpy).not.toHaveBeenCalled();
    expect(hidePopoverSpy).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });
});

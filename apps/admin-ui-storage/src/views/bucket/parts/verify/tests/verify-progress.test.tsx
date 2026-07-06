/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  VERIFY_PROGRESS_COMPLETE_DELAY_MS,
  VERIFY_PROGRESS_MIN_DISPLAY_MS,
} from '../../../../../constants';
import { VerifyProgress } from '../verify-progress';

const mockT = vi.hoisted(() => (key: string, fallback?: string) => fallback ?? key);

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
}));

function getProgressFill(container: HTMLElement): HTMLDivElement {
  const progressFill = container.querySelector('div[style]');

  if (!(progressFill instanceof HTMLDivElement)) {
    throw new Error('progress bar fill element not found');
  }

  return progressFill;
}

describe('VerifyProgress', () => {
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
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should open, progress, and complete using the latest onComplete callback', () => {
    const firstOnComplete = vi.fn();
    const latestOnComplete = vi.fn();

    const { container, rerender } = render(
      <VerifyProgress isPending onComplete={firstOnComplete} />,
    );

    expect(HTMLElement.prototype.showPopover).toHaveBeenCalledTimes(1);

    const progressFill = getProgressFill(container);
    expect(progressFill.style.width).toBe('0%');

    act(() => {
      vi.advanceTimersByTime(5 * 90);
    });

    expect(progressFill.style.width).toBe('5%');

    act(() => {
      vi.advanceTimersByTime(100 * 90);
    });

    expect(progressFill.style.width).toBe('90%');

    rerender(<VerifyProgress isPending onComplete={latestOnComplete} />);
    rerender(<VerifyProgress isPending={false} onComplete={latestOnComplete} />);

    act(() => {
      vi.advanceTimersByTime(VERIFY_PROGRESS_COMPLETE_DELAY_MS);
    });

    expect(HTMLElement.prototype.hidePopover).toHaveBeenCalledTimes(1);
    expect(firstOnComplete).not.toHaveBeenCalled();
    expect(latestOnComplete).toHaveBeenCalledTimes(1);
  });

  it('should keep minimum display time and cancel completion timeout on unmount', () => {
    const onComplete = vi.fn();

    const { rerender, unmount } = render(<VerifyProgress isPending onComplete={onComplete} />);

    rerender(<VerifyProgress isPending={false} onComplete={onComplete} />);

    act(() => {
      vi.advanceTimersByTime(VERIFY_PROGRESS_MIN_DISPLAY_MS - 1);
    });

    expect(HTMLElement.prototype.hidePopover).not.toHaveBeenCalled();

    unmount();

    act(() => {
      vi.advanceTimersByTime(VERIFY_PROGRESS_COMPLETE_DELAY_MS + 1);
    });

    expect(HTMLElement.prototype.hidePopover).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });
});
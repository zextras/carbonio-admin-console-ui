/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { usePostHog } from '@posthog/react';
import { renderHook } from '@testing-library/react';
import { useIsAdvanced, useUserAccount } from '@zextras/ui-shared';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import { useTracker } from '../tracker';

vi.mock('@posthog/react', () => ({
  usePostHog: vi.fn(),
}));

vi.mock('@zextras/ui-shared', () => ({
  useIsAdvanced: vi.fn(),
  useUserAccount: vi.fn(),
}));

describe('useTracker', () => {
  beforeEach(() => {
    (usePostHog as Mock).mockReturnValue({
      capture: vi.fn(),
      setPersonProperties: vi.fn(),
      identify: vi.fn(),
    });
    (useIsAdvanced as Mock).mockReturnValue(false);
    (useUserAccount as Mock).mockReturnValue(undefined);
  });

  it('capture delegates to postHog.capture with the same arguments', () => {
    const { result } = renderHook(() => useTracker());

    const postHog = usePostHog();
    const properties = { foo: 'bar' };

    result.current.capture('test-event', properties);

    expect(postHog.capture).toHaveBeenCalledTimes(1);
    expect(postHog.capture).toHaveBeenCalledWith('test-event', properties, undefined);
  });
});

/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { act, renderHook } from '@testing-library/react';

import {
  NEW_SUBSCRIPTION_FEATURE_FLAG_KEY,
  useNewSubscriptionFeatureFlag,
} from '../use-new-subscription-feature-flag';

describe('useNewSubscriptionFeatureFlag', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('returns false when the flag is not set and persists the default', () => {
    const { result } = renderHook(() => useNewSubscriptionFeatureFlag());

    expect(result.current).toBe(false);
    expect(localStorage.getItem(NEW_SUBSCRIPTION_FEATURE_FLAG_KEY)).toBe('false');
  });

  it('returns true when the flag is stored as true', () => {
    localStorage.setItem(NEW_SUBSCRIPTION_FEATURE_FLAG_KEY, 'true');
    const { result } = renderHook(() => useNewSubscriptionFeatureFlag());

    expect(result.current).toBe(true);
    expect(localStorage.getItem(NEW_SUBSCRIPTION_FEATURE_FLAG_KEY)).toBe('true');
  });

  it('returns false when the flag is stored as false', () => {
    localStorage.setItem(NEW_SUBSCRIPTION_FEATURE_FLAG_KEY, 'false');
    const { result } = renderHook(() => useNewSubscriptionFeatureFlag());

    expect(result.current).toBe(false);
    expect(localStorage.getItem(NEW_SUBSCRIPTION_FEATURE_FLAG_KEY)).toBe('false');
  });

  it('returns false and persists the default when localStorage contains invalid JSON', () => {
    localStorage.setItem(NEW_SUBSCRIPTION_FEATURE_FLAG_KEY, '{invalid json');
    const { result } = renderHook(() => useNewSubscriptionFeatureFlag());

    expect(result.current).toBe(false);
    expect(localStorage.getItem(NEW_SUBSCRIPTION_FEATURE_FLAG_KEY)).toBe('false');
  });

  it('reflects an externally toggled flag on the next mount', () => {
    const { result, unmount } = renderHook(() => useNewSubscriptionFeatureFlag());
    expect(result.current).toBe(false);

    act(() => {
      localStorage.setItem(NEW_SUBSCRIPTION_FEATURE_FLAG_KEY, 'true');
    });
    unmount();

    const { result: rerenderedResult } = renderHook(() => useNewSubscriptionFeatureFlag());
    expect(rerenderedResult.current).toBe(true);
  });
});

/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { act, renderHook } from '@testing-library/react';

import { useLoginConfigStore } from '../../store/login/store';
import { useNewSubscriptionFeatureFlag } from '../use-new-subscription-feature-flag';

describe('useNewSubscriptionFeatureFlag', () => {
  afterEach(() => {
    useLoginConfigStore.setState({ featureFlags: null });
  });

  it('returns false when featureFlags is null (default)', () => {
    const { result } = renderHook(() => useNewSubscriptionFeatureFlag());

    expect(result.current).toBe(false);
  });

  it('returns true when enforceSubscriptionRequirements is true', () => {
    useLoginConfigStore.setState({ featureFlags: { enforceSubscriptionRequirements: true } });

    const { result } = renderHook(() => useNewSubscriptionFeatureFlag());

    expect(result.current).toBe(true);
  });

  it('returns false when enforceSubscriptionRequirements is false', () => {
    useLoginConfigStore.setState({ featureFlags: { enforceSubscriptionRequirements: false } });

    const { result } = renderHook(() => useNewSubscriptionFeatureFlag());

    expect(result.current).toBe(false);
  });

  it('reacts to store updates', () => {
    const { result } = renderHook(() => useNewSubscriptionFeatureFlag());
    expect(result.current).toBe(false);

    act(() => {
      useLoginConfigStore.setState({ featureFlags: { enforceSubscriptionRequirements: true } });
    });

    expect(result.current).toBe(true);
  });
});

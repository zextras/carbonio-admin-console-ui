/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useUtilityBarStore } from '../../utility-bar/store';
import { useDetailViewMaxWidth } from '../hooks';

describe('useDetailViewMaxWidth', () => {
  beforeEach(() => {
    useUtilityBarStore.setState({ primaryBarState: false });
  });

  it('returns the wider max-width when the primary bar is collapsed', () => {
    useUtilityBarStore.setState({ primaryBarState: false });

    const { result } = renderHook(() => useDetailViewMaxWidth());

    expect(result.current).toBe('1125px');
  });

  it('returns the narrower max-width when the primary bar is expanded', () => {
    useUtilityBarStore.setState({ primaryBarState: true });

    const { result } = renderHook(() => useDetailViewMaxWidth());

    expect(result.current).toBe('981px');
  });
});

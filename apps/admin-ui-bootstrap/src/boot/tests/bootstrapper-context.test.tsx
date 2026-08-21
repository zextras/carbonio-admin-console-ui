/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { BootstrapperContext, useI18nFactory } from '../bootstrapper-context';

describe('useI18nFactory', () => {
  it('returns undefined when no provider is set', () => {
    const { result } = renderHook(() => useI18nFactory());
    expect(result.current).toBeUndefined();
  });

  it('returns the i18nFactory when provided via context', () => {
    const mockFactory = { getShellI18n: vi.fn() } as unknown as ReturnType<typeof useI18nFactory>;
    const wrapper = ({ children }: { children: ReactNode }) => (
      <BootstrapperContext.Provider value={{ i18nFactory: mockFactory }}>
        {children}
      </BootstrapperContext.Provider>
    );
    const { result } = renderHook(() => useI18nFactory(), { wrapper });
    expect(result.current).toBe(mockFactory);
  });
});

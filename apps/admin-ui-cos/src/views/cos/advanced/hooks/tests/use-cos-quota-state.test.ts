/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../../../services/use-file-quota', () => ({
  useFileQuota: () => ({ data: undefined }),
}));
vi.mock('../../../../../services/use-invalidate-cos-quota', () => ({
  useInvalidateCosQuota: () => vi.fn(),
}));
vi.mock('../../../../../services/set-cos-quota', () => ({ setCosQuota: vi.fn() }));
vi.mock('../../../../../services/unset-cos-quota', () => ({ unsetCosQuota: vi.fn() }));
vi.mock('@zextras/ui-shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@zextras/ui-shared')>();
  return {
    ...actual,
    isValidDecimalInput: (v: string) => /^\d*\.?\d*$/.test(v),
    setFileQuotaLimitById: vi.fn().mockResolvedValue(undefined),
    resetFileQuotaLimitById: vi.fn().mockResolvedValue(undefined),
  };
});

import { AccountType } from '../../../../../../types/account';
import { useCosQuotaState } from '../use-cos-quota-state';

const cosData = { zimbraId: 'cos-1', zimbraMailQuota: '' } as AccountType;

describe('useCosQuotaState', () => {
  it('isDirty is false by default', () => {
    const { result } = renderHook(() =>
      useCosQuotaState({ cosData, cosQuotaData: undefined, isTotalQuotaActive: false, isAdvanced: false }),
    );
    expect(result.current.isDirty).toBe(false);
  });

  it('isDirty is false after reset', () => {
    const { result } = renderHook(() =>
      useCosQuotaState({ cosData, cosQuotaData: undefined, isTotalQuotaActive: false, isAdvanced: true }),
    );
    act(() => {
      result.current.onFileQuotaChange({
        target: { value: '5' },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => result.current.reset());
    expect(result.current.isDirty).toBe(false);
  });
});

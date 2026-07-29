/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../../../services/use-invalidate-cos-quota', () => ({
  useInvalidateCosQuota: () => vi.fn(),
}));
vi.mock('../../../../../services/set-cos-quota', () => ({ setCosQuota: vi.fn() }));
vi.mock('../../../../../services/unset-cos-quota', () => ({ unsetCosQuota: vi.fn() }));

import { setCosQuota } from '../../../../../services/set-cos-quota';
import { unsetCosQuota } from '../../../../../services/unset-cos-quota';
import { useCosQuotaState } from '../use-cos-quota-state';

const limitedQuota = { type: 'limited' as const, value: 1073741824 };
const differentLimitedQuota = { type: 'limited' as const, value: 2147483648 };
const unlimitedQuota = { type: 'unlimited' as const };

const cosQuotaDataCos = {
  totalComputedLimit: limitedQuota,
  totalQuotaSource: 'cos' as const,
};

const cosQuotaDataGlobal = {
  totalComputedLimit: limitedQuota,
  totalQuotaSource: 'global' as const,
};

describe('useCosQuotaState', () => {
  it('isDirty is false by default', () => {
    const { result } = renderHook(() => useCosQuotaState({ cosQuotaData: undefined }));
    expect(result.current.isDirty).toBe(false);
  });

  it('isDirty is false after reset', () => {
    const { result } = renderHook(() => useCosQuotaState({ cosQuotaData: cosQuotaDataCos }));
    act(() => result.current.onTotalQuotaChange(differentLimitedQuota));
    act(() => result.current.reset());
    expect(result.current.isDirty).toBe(false);
  });

  describe('with cosQuotaData defined', () => {
    it('initializes with cosQuotaData values', () => {
      const { result } = renderHook(() => useCosQuotaState({ cosQuotaData: cosQuotaDataCos }));
      expect(result.current.totalComputedQuotaLimit).toEqual(limitedQuota);
      expect(result.current.totalQuotaSource).toBe('cos');
      expect(result.current.initialTotalComputedQuotaLimit).toEqual(limitedQuota);
      expect(result.current.isDirty).toBe(false);
      expect(result.current.showQuotaRevertButton).toBe(false);
    });

    it('showQuotaRevertButton is true when total quota differs from initial', () => {
      const { result } = renderHook(() => useCosQuotaState({ cosQuotaData: cosQuotaDataCos }));
      act(() => result.current.onTotalQuotaChange(differentLimitedQuota));
      expect(result.current.showQuotaRevertButton).toBe(true);
      expect(result.current.isDirty).toBe(true);
    });

    it('showQuotaRevertButton is false when total quota matches initial', () => {
      const { result } = renderHook(() => useCosQuotaState({ cosQuotaData: cosQuotaDataCos }));
      act(() => result.current.onTotalQuotaChange(limitedQuota));
      expect(result.current.showQuotaRevertButton).toBe(false);
    });
  });

  describe('onTotalQuotaChange', () => {
    it('sets override to undefined when value matches initial global limit', () => {
      const { result } = renderHook(() => useCosQuotaState({ cosQuotaData: cosQuotaDataGlobal }));
      act(() => result.current.onTotalQuotaChange(limitedQuota));
      expect(result.current.totalQuotaSource).toBe('global');
    });

    it('sets override to value when value differs from initial', () => {
      const { result } = renderHook(() => useCosQuotaState({ cosQuotaData: cosQuotaDataCos }));
      act(() => result.current.onTotalQuotaChange(differentLimitedQuota));
      expect(result.current.totalComputedQuotaLimit).toEqual(differentLimitedQuota);
      expect(result.current.totalQuotaSource).toBe('cos');
    });

    it('sets override to value for unlimited quota', () => {
      const { result } = renderHook(() => useCosQuotaState({ cosQuotaData: cosQuotaDataCos }));
      act(() => result.current.onTotalQuotaChange(unlimitedQuota));
      expect(result.current.totalComputedQuotaLimit).toEqual(unlimitedQuota);
    });
  });

  describe('computedLimitsEqual (via showQuotaRevertButton)', () => {
    it('returns false for different types', () => {
      const { result } = renderHook(() => useCosQuotaState({ cosQuotaData: cosQuotaDataCos }));
      act(() => result.current.onTotalQuotaChange(unlimitedQuota));
      expect(result.current.showQuotaRevertButton).toBe(true);
    });

    it('returns true for same unlimited type', () => {
      const unlimitedCosData = {
        totalComputedLimit: unlimitedQuota,
        totalQuotaSource: 'cos' as const,
      };
      const { result } = renderHook(() => useCosQuotaState({ cosQuotaData: unlimitedCosData }));
      act(() => result.current.onTotalQuotaChange(unlimitedQuota));
      expect(result.current.showQuotaRevertButton).toBe(false);
    });
  });

  describe('save', () => {
    it('early returns when the total quota was never changed', async () => {
      const { result } = renderHook(() => useCosQuotaState({ cosQuotaData: cosQuotaDataCos }));
      await act(async () => {
        await result.current.save('cos-1');
      });
      expect(setCosQuota).not.toHaveBeenCalled();
      expect(unsetCosQuota).not.toHaveBeenCalled();
    });

    it('calls setCosQuota when totalQuotaOverride is a limited value', async () => {
      const { result } = renderHook(() => useCosQuotaState({ cosQuotaData: cosQuotaDataCos }));
      act(() => result.current.onTotalQuotaChange(differentLimitedQuota));
      vi.mocked(setCosQuota).mockClear();
      await act(async () => {
        await result.current.save('cos-1');
      });
      expect(setCosQuota).toHaveBeenCalledWith('cos-1', differentLimitedQuota);
    });

    it('calls unsetCosQuota when totalQuotaOverride is undefined', async () => {
      const { result } = renderHook(() => useCosQuotaState({ cosQuotaData: cosQuotaDataGlobal }));
      act(() => result.current.onTotalQuotaChange(limitedQuota));
      vi.mocked(setCosQuota).mockClear();
      vi.mocked(unsetCosQuota).mockClear();
      await act(async () => {
        await result.current.save('cos-1');
      });
      expect(unsetCosQuota).toHaveBeenCalledWith('cos-1');
    });
  });
});

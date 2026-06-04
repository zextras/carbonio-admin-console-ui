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

import { resetFileQuotaLimitById, setFileQuotaLimitById } from '@zextras/ui-shared';

import { AccountType } from '../../../../../../types/account';
import { setCosQuota } from '../../../../../services/set-cos-quota';
import { unsetCosQuota } from '../../../../../services/unset-cos-quota';
import { useCosQuotaState } from '../use-cos-quota-state';

const cosData = { zimbraId: 'cos-1', zimbraMailQuota: '' } as AccountType;

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
    const { result } = renderHook(() =>
      useCosQuotaState({
        cosData,
        cosQuotaData: undefined,
        isTotalQuotaActive: false,
        isAdvanced: false,
      }),
    );
    expect(result.current.isDirty).toBe(false);
  });

  it('isDirty is false after reset', () => {
    const { result } = renderHook(() =>
      useCosQuotaState({
        cosData,
        cosQuotaData: undefined,
        isTotalQuotaActive: false,
        isAdvanced: true,
      }),
    );
    act(() => {
      result.current.onFileQuotaChange({
        target: { value: '5' },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => result.current.reset());
    expect(result.current.isDirty).toBe(false);
  });

  describe('with cosQuotaData defined and isTotalQuotaActive', () => {
    it('initializes with cosQuotaData values', () => {
      const { result } = renderHook(() =>
        useCosQuotaState({
          cosData,
          cosQuotaData: cosQuotaDataCos,
          isTotalQuotaActive: true,
          isAdvanced: false,
        }),
      );
      expect(result.current.totalComputedQuotaLimit).toEqual(limitedQuota);
      expect(result.current.totalQuotaSource).toBe('cos');
      expect(result.current.initialTotalComputedQuotaLimit).toEqual(limitedQuota);
      expect(result.current.isDirty).toBe(false);
      expect(result.current.showQuotaRevertButton).toBe(false);
    });

    it('showQuotaRevertButton is true when total quota differs from initial', () => {
      const { result } = renderHook(() =>
        useCosQuotaState({
          cosData,
          cosQuotaData: cosQuotaDataCos,
          isTotalQuotaActive: true,
          isAdvanced: false,
        }),
      );
      act(() => result.current.onTotalQuotaChange(differentLimitedQuota));
      expect(result.current.showQuotaRevertButton).toBe(true);
      expect(result.current.isDirty).toBe(true);
    });

    it('showQuotaRevertButton is false when total quota matches initial', () => {
      const { result } = renderHook(() =>
        useCosQuotaState({
          cosData,
          cosQuotaData: cosQuotaDataCos,
          isTotalQuotaActive: true,
          isAdvanced: false,
        }),
      );
      act(() => result.current.onTotalQuotaChange(limitedQuota));
      expect(result.current.showQuotaRevertButton).toBe(false);
    });
  });

  describe('onTotalQuotaChange', () => {
    it('sets override to undefined when value matches initial global limit', () => {
      const { result } = renderHook(() =>
        useCosQuotaState({
          cosData,
          cosQuotaData: cosQuotaDataGlobal,
          isTotalQuotaActive: true,
          isAdvanced: false,
        }),
      );
      act(() => result.current.onTotalQuotaChange(limitedQuota));
      expect(result.current.totalQuotaSource).toBe('global');
    });

    it('sets override to value when value differs from initial', () => {
      const { result } = renderHook(() =>
        useCosQuotaState({
          cosData,
          cosQuotaData: cosQuotaDataCos,
          isTotalQuotaActive: true,
          isAdvanced: false,
        }),
      );
      act(() => result.current.onTotalQuotaChange(differentLimitedQuota));
      expect(result.current.totalComputedQuotaLimit).toEqual(differentLimitedQuota);
      expect(result.current.totalQuotaSource).toBe('cos');
    });

    it('sets override to value for unlimited quota', () => {
      const { result } = renderHook(() =>
        useCosQuotaState({
          cosData,
          cosQuotaData: cosQuotaDataCos,
          isTotalQuotaActive: true,
          isAdvanced: false,
        }),
      );
      act(() => result.current.onTotalQuotaChange(unlimitedQuota));
      expect(result.current.totalComputedQuotaLimit).toEqual(unlimitedQuota);
    });
  });

  describe('computedLimitsEqual (via showQuotaRevertButton)', () => {
    it('returns false for different types', () => {
      const { result } = renderHook(() =>
        useCosQuotaState({
          cosData,
          cosQuotaData: cosQuotaDataCos,
          isTotalQuotaActive: true,
          isAdvanced: false,
        }),
      );
      act(() => result.current.onTotalQuotaChange(unlimitedQuota));
      expect(result.current.showQuotaRevertButton).toBe(true);
    });

    it('returns true for same unlimited type', () => {
      const unlimitedCosData = {
        totalComputedLimit: unlimitedQuota,
        totalQuotaSource: 'cos' as const,
      };
      const { result } = renderHook(() =>
        useCosQuotaState({
          cosData,
          cosQuotaData: unlimitedCosData,
          isTotalQuotaActive: true,
          isAdvanced: false,
        }),
      );
      act(() => result.current.onTotalQuotaChange(unlimitedQuota));
      expect(result.current.showQuotaRevertButton).toBe(false);
    });
  });

  describe('save', () => {
    it('early returns when isTotalQuotaActive is false', async () => {
      const { result } = renderHook(() =>
        useCosQuotaState({
          cosData,
          cosQuotaData: cosQuotaDataCos,
          isTotalQuotaActive: false,
          isAdvanced: false,
        }),
      );
      await act(async () => {
        await result.current.save('cos-1');
      });
      expect(setCosQuota).not.toHaveBeenCalled();
      expect(unsetCosQuota).not.toHaveBeenCalled();
    });

    it('calls setCosQuota when totalQuotaOverride is a limited value', async () => {
      const { result } = renderHook(() =>
        useCosQuotaState({
          cosData,
          cosQuotaData: cosQuotaDataCos,
          isTotalQuotaActive: true,
          isAdvanced: false,
        }),
      );
      act(() => result.current.onTotalQuotaChange(differentLimitedQuota));
      vi.mocked(setCosQuota).mockClear();
      await act(async () => {
        await result.current.save('cos-1');
      });
      expect(setCosQuota).toHaveBeenCalledWith('cos-1', differentLimitedQuota);
    });

    it('calls unsetCosQuota when totalQuotaOverride is undefined', async () => {
      const { result } = renderHook(() =>
        useCosQuotaState({
          cosData,
          cosQuotaData: cosQuotaDataGlobal,
          isTotalQuotaActive: true,
          isAdvanced: false,
        }),
      );
      act(() => result.current.onTotalQuotaChange(limitedQuota));
      vi.mocked(setCosQuota).mockClear();
      vi.mocked(unsetCosQuota).mockClear();
      await act(async () => {
        await result.current.save('cos-1');
      });
      expect(unsetCosQuota).toHaveBeenCalledWith('cos-1');
    });
  });

  describe('handleSuccess', () => {
    it('is a no-op when isTotalQuotaActive is true', () => {
      const { result } = renderHook(() =>
        useCosQuotaState({
          cosData,
          cosQuotaData: cosQuotaDataCos,
          isTotalQuotaActive: true,
          isAdvanced: true,
        }),
      );
      act(() => result.current.handleSuccess('cos-1'));
      expect(setFileQuotaLimitById).not.toHaveBeenCalled();
      expect(resetFileQuotaLimitById).not.toHaveBeenCalled();
    });

    it('is a no-op when isAdvanced is false', () => {
      const { result } = renderHook(() =>
        useCosQuotaState({
          cosData,
          cosQuotaData: cosQuotaDataCos,
          isTotalQuotaActive: false,
          isAdvanced: false,
        }),
      );
      act(() => result.current.handleSuccess('cos-1'));
      expect(setFileQuotaLimitById).not.toHaveBeenCalled();
    });

    it('is a no-op when file quota has not changed', () => {
      const { result } = renderHook(() =>
        useCosQuotaState({
          cosData,
          cosQuotaData: cosQuotaDataCos,
          isTotalQuotaActive: false,
          isAdvanced: true,
        }),
      );
      act(() => result.current.handleSuccess('cos-1'));
      expect(setFileQuotaLimitById).not.toHaveBeenCalled();
    });

    it('calls setFileQuotaLimitById when file quota changed and has value', () => {
      vi.mocked(setFileQuotaLimitById).mockClear();
      vi.mocked(setFileQuotaLimitById).mockResolvedValue(undefined);
      const { result } = renderHook(() =>
        useCosQuotaState({
          cosData,
          cosQuotaData: cosQuotaDataCos,
          isTotalQuotaActive: false,
          isAdvanced: true,
        }),
      );
      act(() => {
        result.current.onFileQuotaChange({
          target: { value: '5' },
        } as React.ChangeEvent<HTMLInputElement>);
      });
      act(() => result.current.handleSuccess('cos-1'));
      expect(setFileQuotaLimitById).toHaveBeenCalledWith(
        'cos-1',
        expect.any(String),
        expect.anything(),
      );
    });

    it('calls resetFileQuotaLimitById when file quota was cleared', () => {
      vi.mocked(resetFileQuotaLimitById).mockClear();
      vi.mocked(resetFileQuotaLimitById).mockResolvedValue(undefined);
      const { result } = renderHook(() =>
        useCosQuotaState({
          cosData,
          cosQuotaData: cosQuotaDataCos,
          isTotalQuotaActive: false,
          isAdvanced: true,
        }),
      );
      act(() => {
        result.current.onFileQuotaChange({
          target: { value: '5' },
        } as React.ChangeEvent<HTMLInputElement>);
      });
      act(() => result.current.reset());
      act(() => {
        result.current.onFileQuotaChange({
          target: { value: '' },
        } as React.ChangeEvent<HTMLInputElement>);
      });
      act(() => result.current.handleSuccess('cos-1'));
      expect(resetFileQuotaLimitById).toHaveBeenCalledWith('cos-1', expect.anything());
    });
  });

  describe('onFileQuotaChange edge cases', () => {
    it('rejects non-decimal input', () => {
      const { result } = renderHook(() =>
        useCosQuotaState({
          cosData,
          cosQuotaData: undefined,
          isTotalQuotaActive: false,
          isAdvanced: true,
        }),
      );
      act(() => {
        result.current.onFileQuotaChange({
          target: { value: 'abc' },
        } as React.ChangeEvent<HTMLInputElement>);
      });
      expect(result.current.fileQuotaLimitGBValue).toBeUndefined();
    });

    it('shows warning for more than 3 decimal places', () => {
      const { result } = renderHook(() =>
        useCosQuotaState({
          cosData,
          cosQuotaData: undefined,
          isTotalQuotaActive: false,
          isAdvanced: true,
        }),
      );
      act(() => {
        result.current.onFileQuotaChange({
          target: { value: '1.2345' },
        } as React.ChangeEvent<HTMLInputElement>);
      });
      expect(result.current.showFileQuotaLimitMsg).toBe(true);
    });

    it('accepts input with exactly 3 decimal places', () => {
      const { result } = renderHook(() =>
        useCosQuotaState({
          cosData,
          cosQuotaData: undefined,
          isTotalQuotaActive: false,
          isAdvanced: true,
        }),
      );
      act(() => {
        result.current.onFileQuotaChange({
          target: { value: '1.123' },
        } as React.ChangeEvent<HTMLInputElement>);
      });
      expect(result.current.showFileQuotaLimitMsg).toBe(false);
      expect(result.current.fileQuotaLimitGBValue).toBe('1.123');
    });
  });
});

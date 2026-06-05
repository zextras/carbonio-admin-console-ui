/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  isValidDecimalInput,
  resetFileQuotaLimitById,
  setFileQuotaLimitById,
} from '@zextras/ui-shared';
import { ChangeEvent, useState } from 'react';

import { AccountType } from '../../../../../types/account';
import { COS } from '../../../../constants';
import { ComputedLimit, QuotaSource } from '../../../../services/get-cos-quota';
import { setCosQuota } from '../../../../services/set-cos-quota';
import { unsetCosQuota } from '../../../../services/unset-cos-quota';
import { useFileQuota } from '../../../../services/use-file-quota';
import { useInvalidateCosQuota } from '../../../../services/use-invalidate-cos-quota';
import { BytesToGB, GbToBytes } from '../../../utility/utils';

type CosQuotaData = {
  totalComputedLimit: ComputedLimit;
  totalQuotaSource: QuotaSource;
};

type Params = {
  cosData: AccountType;
  cosQuotaData: CosQuotaData | undefined;
  isTotalQuotaActive: boolean;
  isAdvanced: boolean;
};

function computedLimitsEqual(a: ComputedLimit, b: ComputedLimit): boolean {
  if (a.type !== b.type) return false;
  if (a.type === 'limited' && b.type === 'limited') return a.value === b.value;
  return true;
}

function getQuotaSource(
  override: ComputedLimit | null | undefined,
  initialSource: QuotaSource | undefined,
): QuotaSource | undefined {
  if (override === null) return initialSource;
  if (override === undefined) return 'global' as QuotaSource;
  return 'cos' as QuotaSource;
}

type UseCosQuotaState = {
  fileQuotaLimitGBValue: string | undefined;
  initFileQuotaLimitGBValue: string | undefined;
  showFileQuotaLimitMsg: boolean;
  totalComputedQuotaLimit: ComputedLimit | undefined;
  totalQuotaSource: QuotaSource | undefined;
  initialTotalComputedQuotaLimit: ComputedLimit | undefined;
  showQuotaRevertButton: boolean;
  onFileQuotaChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onTotalQuotaChange: (value?: ComputedLimit) => void;
  isDirty: boolean;
  save: (zimbraId: string) => Promise<void>;
  handleSuccess: (zimbraId: string) => void;
  reset: () => void;
};

export function useCosQuotaState({
  cosData,
  cosQuotaData,
  isTotalQuotaActive,
  isAdvanced,
}: Params): UseCosQuotaState {
  const invalidateCosQuota = useInvalidateCosQuota();

  const [fileQuotaOverride, setFileQuotaOverride] = useState<string | undefined>(undefined);
  const [showFileQuotaLimitMsg, setShowFileQuotaLimitMsg] = useState(false);

  const { data: fileQuotaData } = useFileQuota(
    cosData?.zimbraId,
    !!cosData?.zimbraId && isAdvanced && !isTotalQuotaActive,
  );

  const initFileQuotaLimitGBValue = fileQuotaData?.limit
    ? BytesToGB(fileQuotaData.limit).toFixed(2)
    : undefined;
  const fileQuotaLimitGBValue = fileQuotaOverride ?? initFileQuotaLimitGBValue;

  const initTotalComputedQuotaLimit = cosQuotaData?.totalComputedLimit;
  const initTotalQuotaSource = cosQuotaData?.totalQuotaSource;

  const initialQuota = cosQuotaData
    ? { limit: cosQuotaData.totalComputedLimit, source: cosQuotaData.totalQuotaSource }
    : null;

  const [totalQuotaOverride, setTotalQuotaOverride] = useState<ComputedLimit | null | undefined>(
    null,
  );

  const totalComputedQuotaLimit =
    totalQuotaOverride === null || totalQuotaOverride === undefined
      ? initTotalComputedQuotaLimit
      : totalQuotaOverride;
  const totalQuotaSource = getQuotaSource(totalQuotaOverride, initTotalQuotaSource);

  const showQuotaRevertButton =
    totalQuotaSource === 'cos' &&
    initialQuota !== null &&
    !computedLimitsEqual(totalComputedQuotaLimit ?? initialQuota.limit, initialQuota.limit);

  function onFileQuotaChange(e: ChangeEvent<HTMLInputElement>): void {
    if (!isValidDecimalInput(e.target.value)) return;
    const dp = e.target.value?.split('.')[1];
    if (dp && dp.length > 3) {
      setShowFileQuotaLimitMsg(true);
      return;
    }
    setShowFileQuotaLimitMsg(false);
    setFileQuotaOverride(e.target.value);
  }

  function onTotalQuotaChange(value?: ComputedLimit): void {
    if (
      value &&
      initialQuota?.source === 'global' &&
      computedLimitsEqual(value, initialQuota.limit)
    ) {
      setTotalQuotaOverride(undefined);
    } else {
      setTotalQuotaOverride(value);
    }
  }

  const isDirty =
    (fileQuotaLimitGBValue !== undefined && initFileQuotaLimitGBValue !== fileQuotaLimitGBValue) ||
    (isTotalQuotaActive &&
      totalQuotaOverride !== null &&
      initialQuota !== null &&
      !computedLimitsEqual(totalComputedQuotaLimit ?? initialQuota.limit, initialQuota.limit));

  async function save(zimbraId: string): Promise<void> {
    if (!isTotalQuotaActive || totalQuotaOverride === null) return;
    if (totalQuotaOverride) {
      await setCosQuota(zimbraId, totalQuotaOverride);
    } else {
      await unsetCosQuota(zimbraId);
    }
    await invalidateCosQuota(zimbraId);
    setTotalQuotaOverride(null);
  }

  function handleSuccess(zimbraId: string): void {
    if (!isTotalQuotaActive && isAdvanced && initFileQuotaLimitGBValue !== fileQuotaLimitGBValue) {
      if (fileQuotaLimitGBValue) {
        setFileQuotaLimitById(
          zimbraId,
          Math.round(GbToBytes(fileQuotaLimitGBValue)).toString(),
          COS,
        )
          .then(() => setShowFileQuotaLimitMsg(false))
          .catch(() => setShowFileQuotaLimitMsg(true));
      } else {
        resetFileQuotaLimitById(zimbraId, COS)
          .then(() => setShowFileQuotaLimitMsg(false))
          .catch(() => setShowFileQuotaLimitMsg(true));
      }
    }
  }

  function reset(): void {
    setFileQuotaOverride(undefined);
    setShowFileQuotaLimitMsg(false);
    setTotalQuotaOverride(null);
  }

  return {
    fileQuotaLimitGBValue,
    initFileQuotaLimitGBValue,
    showFileQuotaLimitMsg,
    totalComputedQuotaLimit,
    totalQuotaSource,
    initialTotalComputedQuotaLimit: initTotalComputedQuotaLimit,
    showQuotaRevertButton,
    onFileQuotaChange,
    onTotalQuotaChange,
    isDirty,
    save,
    handleSuccess,
    reset,
  };
}

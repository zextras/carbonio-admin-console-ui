/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useState } from 'react';

import { ComputedLimit, QuotaSource } from '../../../../services/get-cos-quota';
import { setCosQuota } from '../../../../services/set-cos-quota';
import { unsetCosQuota } from '../../../../services/unset-cos-quota';
import { useInvalidateCosQuota } from '../../../../services/use-invalidate-cos-quota';

type CosQuotaData = {
  totalComputedLimit: ComputedLimit;
  totalQuotaSource: QuotaSource;
};

type Params = {
  cosQuotaData: CosQuotaData | undefined;
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
  totalComputedQuotaLimit: ComputedLimit | undefined;
  totalQuotaSource: QuotaSource | undefined;
  initialTotalComputedQuotaLimit: ComputedLimit | undefined;
  showQuotaRevertButton: boolean;
  onTotalQuotaChange: (value?: ComputedLimit) => void;
  isDirty: boolean;
  save: (zimbraId: string) => Promise<void>;
  reset: () => void;
};

export function useCosQuotaState({ cosQuotaData }: Params): UseCosQuotaState {
  const invalidateCosQuota = useInvalidateCosQuota();

  const initTotalComputedQuotaLimit = cosQuotaData?.totalComputedLimit;
  const initTotalQuotaSource = cosQuotaData?.totalQuotaSource;

  const initialQuota = cosQuotaData
    ? { limit: cosQuotaData.totalComputedLimit, source: cosQuotaData.totalQuotaSource }
    : null;

  const [totalQuotaOverride, setTotalQuotaOverride] = useState<ComputedLimit | null | undefined>(
    null,
  );

  const totalComputedQuotaLimit = totalQuotaOverride ?? initTotalComputedQuotaLimit;
  const totalQuotaSource = getQuotaSource(totalQuotaOverride, initTotalQuotaSource);

  const showQuotaRevertButton =
    totalQuotaSource === 'cos' &&
    initialQuota !== null &&
    !computedLimitsEqual(totalComputedQuotaLimit ?? initialQuota.limit, initialQuota.limit);

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
    totalQuotaOverride !== null &&
    initialQuota !== null &&
    !computedLimitsEqual(totalComputedQuotaLimit ?? initialQuota.limit, initialQuota.limit);

  async function save(zimbraId: string): Promise<void> {
    if (totalQuotaOverride === null) return;
    if (totalQuotaOverride) {
      await setCosQuota(zimbraId, totalQuotaOverride);
    } else {
      await unsetCosQuota(zimbraId);
    }
    await invalidateCosQuota(zimbraId);
    setTotalQuotaOverride(null);
  }

  function reset(): void {
    setTotalQuotaOverride(null);
  }

  return {
    totalComputedQuotaLimit,
    totalQuotaSource,
    initialTotalComputedQuotaLimit: initTotalComputedQuotaLimit,
    showQuotaRevertButton,
    onTotalQuotaChange,
    isDirty,
    save,
    reset,
  };
}

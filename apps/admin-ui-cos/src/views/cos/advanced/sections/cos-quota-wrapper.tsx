/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Ref, useEffect, useImperativeHandle } from 'react';

import { useCosQuota } from '../../../../services/use-cos-quota';
import { useCosQuotaState } from '../hooks/use-cos-quota-state';
import { CosFormApi } from '../types';
import { COSQuotas } from './quotas';

/**
 * Owns every quota call, so mounting this component is the only quota gate:
 * CE installs never render it and therefore never hit the quota API.
 *
 * Quota is saved through the COS form's single Save button, so the form drives
 * save/reset imperatively while dirtiness has to travel back up as a callback —
 * a ref alone would not re-render the form to reveal Save.
 */
export type CosQuotaHandle = {
  save: (zimbraId: string) => Promise<void>;
  reset: () => void;
};

type CosQuotaWrapperProps = {
  cosId: string | undefined;
  form: CosFormApi;
  readonlyCOS: boolean;
  onDirtyChange: (isDirty: boolean) => void;
  ref: Ref<CosQuotaHandle>;
};

export const CosQuotaWrapper = ({
  cosId,
  form,
  readonlyCOS,
  onDirtyChange,
  ref,
}: CosQuotaWrapperProps) => {
  const { data: cosQuotaData } = useCosQuota(cosId, !!cosId);
  const quotaState = useCosQuotaState({ cosQuotaData });

  useImperativeHandle(ref, () => ({
    save: quotaState.save,
    reset: quotaState.reset,
  }));

  useEffect(() => {
    onDirtyChange(quotaState.isDirty);
  }, [quotaState.isDirty, onDirtyChange]);

  if (!cosQuotaData) {
    return null;
  }

  return <COSQuotas form={form} quotaState={quotaState} readonlyCOS={readonlyCOS} />;
};

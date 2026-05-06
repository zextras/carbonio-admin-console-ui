/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTotalQuotaActive } from '@zextras/ui-shared';
import React, { ComponentProps, Dispatch, SetStateAction, useCallback } from 'react';

import { AccountDetail, CosDetail } from '../../account-context';
import { EditAccountQuotaInputsNew } from './edit-account-quota-inputs-new';

type EditAccountQuotaInputsProps = {
  accountDetail: AccountDetail;
  cosDetail: CosDetail;
  initialAccountDetail: AccountDetail;
  setAccountDetail: Dispatch<SetStateAction<AccountDetail>>;
  onQuotaErrorChange: (hasError: boolean) => void;
};

export const EditAccountQuotaInputs = ({
  accountDetail,
  cosDetail,
  initialAccountDetail,
  setAccountDetail,
  onQuotaErrorChange,
}: EditAccountQuotaInputsProps): React.JSX.Element | null => {
  const isTotalQuotaActive = useTotalQuotaActive();

  const onTotalComputedQuotaLimitChange: ComponentProps<
    typeof EditAccountQuotaInputsNew
  >['onChange'] = useCallback(
    (value) => {
      setAccountDetail((prev) => ({ ...prev, totalComputedQuotaLimit: value }));
    },
    [setAccountDetail],
  );

  if (!isTotalQuotaActive) {
    return null;
  }

  return (
    <EditAccountQuotaInputsNew
      cosComputedLimit={
        cosDetail.totalComputedQuotaLimit === undefined
          ? undefined
          : cosDetail.totalComputedQuotaLimit.type === 'unlimited'
          ? 'unlimited'
          : cosDetail.totalComputedQuotaLimit.value
      }
      totalComputedQuotaLimit={
        accountDetail.totalComputedQuotaLimit === undefined
          ? undefined
          : accountDetail.totalComputedQuotaLimit.type === 'unlimited'
          ? 'unlimited'
          : accountDetail.totalComputedQuotaLimit.value
      }
      initialTotalComputedQuotaLimit={
        initialAccountDetail.totalComputedQuotaLimit === undefined
          ? undefined
          : initialAccountDetail.totalComputedQuotaLimit.type === 'unlimited'
          ? 'unlimited'
          : initialAccountDetail.totalComputedQuotaLimit.value
      }
      totalQuotaSource={accountDetail.totalQuotaSource}
      onChange={onTotalComputedQuotaLimitChange}
      onQuotaErrorChange={onQuotaErrorChange}
    />
  );
};

/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ComponentProps, Dispatch, SetStateAction } from 'react';

import { AccountDetail, CosDetail } from '../../manage/accounts/account-detail-types';
import { EditAccountQuotaInputsNew } from './edit-account-quota-inputs-new';
import { computedLimitToLimit } from './quota-utils';

type EditAccountQuotaInputsProps = {
  accountDetail: AccountDetail;
  cosDetail: CosDetail;
  initialAccountDetail: AccountDetail;
  setAccountDetail: Dispatch<SetStateAction<AccountDetail>>;
};

export const EditAccountQuotaInputs = ({
  accountDetail,
  cosDetail,
  initialAccountDetail,
  setAccountDetail,
}: EditAccountQuotaInputsProps): React.JSX.Element => {
  const onTotalComputedQuotaLimitChange: ComponentProps<
    typeof EditAccountQuotaInputsNew
  >['onChange'] = (value) => {
    setAccountDetail((prev) => ({ ...prev, totalComputedQuotaLimit: value }));
  };

  return (
    <EditAccountQuotaInputsNew
      cosComputedLimit={computedLimitToLimit(cosDetail.totalComputedQuotaLimit)}
      totalComputedQuotaLimit={computedLimitToLimit(accountDetail.totalComputedQuotaLimit)}
      initialTotalComputedQuotaLimit={computedLimitToLimit(
        initialAccountDetail.totalComputedQuotaLimit,
      )}
      totalQuotaSource={accountDetail.totalQuotaSource}
      onChange={onTotalComputedQuotaLimitChange}
    />
  );
};

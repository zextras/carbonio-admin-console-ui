/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useIsAdvanced } from '@zextras/admin-ui-bootstrap';
import { Input, Row } from '@zextras/ui-components';
import React, { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TOTAL_COMPUTED_QUOTA_LIMIT } from '../../../../../../constants';
import { BytesToGB, GbToBytes } from '../../../../../utility/utils';
import { AccountDetail } from '../../account-context';

type EditAccountQuotaInputsNewProps = {
  accountDetail: AccountDetail;
  initAccountDetail: AccountDetail;
  setAccountDetail: Dispatch<SetStateAction<AccountDetail>>;
};

export const EditAccountQuotaInputsNew = ({
  accountDetail,
  initAccountDetail,
  setAccountDetail
}: EditAccountQuotaInputsNewProps): React.JSX.Element | null => {

  const initialTotalComputed = initAccountDetail[TOTAL_COMPUTED_QUOTA_LIMIT];
  const [inputValue, setInputValue] = useState<string| undefined>(undefined);

  useEffect(() => {
    if (initialTotalComputed !== undefined) {
      setInputValue(BytesToGB(initialTotalComputed));
    }

  }, [initialTotalComputed]);

  const inputOnChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // replace(/\D/g, '');
    setInputValue(value);
    const valueInBytes = value ? GbToBytes(value) : '';
    setAccountDetail((prev: AccountDetail) => ({ ...prev, [TOTAL_COMPUTED_QUOTA_LIMIT]: valueInBytes }));
  },[setAccountDetail]);

  const isAdvanced = useIsAdvanced();
  const [t] = useTranslation();

  if (!isAdvanced) {
    return null;
  } else {
    return (<Row
      width="100%"
      padding={{ top: 'large', left: 'large' }}
      mainAlignment="space-between"
      crossAlignment="flex-start"
    >
    <Input
      label={t('label.total_quota_limit_gb', 'Total quota(GB)')}
      background={'gray5'}
      inputName="totalQuota"
      onChange={inputOnChange}
      value={inputValue}
    />
    </Row>);
  }
}
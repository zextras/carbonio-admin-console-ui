/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useIsAdvanced } from '@zextras/admin-ui-bootstrap';
import { Input, Row } from '@zextras/ui-components';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BytesToGB, GbToBytes } from '../../../../../utility/utils';

type EditAccountQuotaInputsNewProps = {
  totalComputedQuotaLimit?: number;
  onChange: (value?: number) => void;
};

export const EditAccountQuotaInputsNew = ({
  totalComputedQuotaLimit,
  onChange
}: EditAccountQuotaInputsNewProps): React.JSX.Element | null => {

  const [inputValue, setInputValue] = useState<number | undefined >(undefined);

  useEffect(() => {
      setInputValue(totalComputedQuotaLimit ? BytesToGB(totalComputedQuotaLimit) as number : undefined);
  }, [totalComputedQuotaLimit]);

  const inputOnChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const filteredStringValue = e.target.value.replace(/\D/g, '');
    const valueInGB = filteredStringValue ? parseInt(filteredStringValue, 10) : undefined;
    const valueInBytes = valueInGB ? GbToBytes(valueInGB) as number : undefined;
    setInputValue(valueInGB);
    onChange(valueInBytes);
  },[onChange]);

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
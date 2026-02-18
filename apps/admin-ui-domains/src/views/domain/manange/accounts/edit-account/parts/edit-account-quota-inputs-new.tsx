/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Input, Row } from '@zextras/ui-components';
import { useIsAdvanced } from '@zextras/ui-shared';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BytesToGB, GbToBytes } from '../../../../../utility/utils';

type EditAccountQuotaInputsNewProps = {
  totalComputedQuotaLimit?: number;
  onChange: (value?: number) => void;
};

export const EditAccountQuotaInputsNew = ({
  totalComputedQuotaLimit,
  onChange,
}: EditAccountQuotaInputsNewProps): React.JSX.Element | null => {
  const [inputValue, setInputValue] = useState<number | ''>('');

  useEffect(() => {
    setInputValue(totalComputedQuotaLimit ? (BytesToGB(totalComputedQuotaLimit) as number) : '');
  }, [totalComputedQuotaLimit]);

  const inputOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const filteredStringValue = e.target.value.replace(/\D/g, '');
      const parsedValue =
        filteredStringValue !== '' ? parseInt(filteredStringValue, 10) : undefined;
      const valueInGB = parsedValue !== undefined && parsedValue > 0 ? parsedValue : undefined;
      const valueInBytes = valueInGB !== undefined ? (GbToBytes(valueInGB) as number) : undefined;
      // change between defined and undefined value breaks the input component, so we need to set it to empty string when it's undefined
      setInputValue(valueInGB !== undefined ? valueInGB : '');
      onChange(valueInBytes);
    },
    [onChange],
  );

  const isAdvanced = useIsAdvanced();
  const [t] = useTranslation();

  if (!isAdvanced) {
    return null;
  } else {
    return (
      <Row
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
      </Row>
    );
  }
};

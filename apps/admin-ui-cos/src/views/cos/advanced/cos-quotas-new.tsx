/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Input, Padding, Switch, SwitchProps, Text } from '@zextras/ui-components';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ComputedLimit } from '../../../services/get-cos-quota';
import { BytesToGB, GbToBytes } from '../../utility/utils';

type COSQuotasNewProps = {
  totalComputedQuotaLimit: ComputedLimit | undefined;
  initialTotalComputedQuotaLimit: ComputedLimit | undefined;
  onChange: (value?: ComputedLimit) => void;
  readonlyCOS: boolean;
};

const COSQuotasNew: FC<COSQuotasNewProps> = ({
  totalComputedQuotaLimit,
  initialTotalComputedQuotaLimit,
  onChange,
  readonlyCOS,
}) => {
  const [t] = useTranslation();
  const [quotaValue, setQuotaValue] = useState<number | 'unlimited' | undefined>(undefined);

  useEffect(() => {
    if (totalComputedQuotaLimit === undefined) {
      setQuotaValue(undefined);
    } else if (totalComputedQuotaLimit.type === 'unlimited') {
      setQuotaValue('unlimited');
    } else {
      setQuotaValue(
        totalComputedQuotaLimit.value > 0 ? BytesToGB(totalComputedQuotaLimit.value) : undefined,
      );
    }
  }, [totalComputedQuotaLimit]);

  const inputOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const filteredStringValue = e.target.value.replace(/\D/g, '');
      const parsedValue =
        filteredStringValue === '' ? undefined : Number.parseInt(filteredStringValue, 10);
      const valueInGB = parsedValue !== undefined && parsedValue > 0 ? parsedValue : undefined;
      const valueInBytes = valueInGB === undefined ? undefined : (GbToBytes(valueInGB) as number);
      onChange(valueInBytes ? { type: 'limited', value: valueInBytes } : undefined);
      setQuotaValue(valueInGB);
    },
    [onChange],
  );

  const switchOnChange = useCallback<NonNullable<SwitchProps['onClick']>>(() => {
    setQuotaValue((prevState) => {
      if (prevState === 'unlimited') {
        if (initialTotalComputedQuotaLimit && initialTotalComputedQuotaLimit.type === 'limited') {
          onChange({ type: 'limited', value: initialTotalComputedQuotaLimit.value });
          return BytesToGB(initialTotalComputedQuotaLimit.value);
        } else {
          onChange({ type: 'limited', value: GbToBytes(1) });
          return 1;
        }
      } else {
        onChange({ type: 'unlimited' });
        return 'unlimited';
      }
    });
  }, [initialTotalComputedQuotaLimit, onChange]);

  const switchValue = useMemo(() => {
    return quotaValue === 'unlimited';
  }, [quotaValue]);

  const inputValue = useMemo(() => {
    return typeof quotaValue === 'number' ? String(quotaValue) : '';
  }, [quotaValue]);

  return (
    <Container padding={{ bottom: 'small' }} gap={'1rem'}>
      <Container mainAlignment={'flex-start'} orientation={'horizontal'} gap={'0.5rem'}>
        <Switch
          iconColor="primary"
          onClick={switchOnChange}
          value={switchValue}
          disabled={readonlyCOS}
        />
        <Text size="medium">{t('label.unlimited_quota', 'Unlimited quota')}</Text>
      </Container>
      <Input
        label={t('label.total_quota_limit_gb', 'Total quota(GB)')}
        value={inputValue}
        backgroundColor="gray5"
        inputName="totalQuota"
        onChange={inputOnChange}
        disabled={readonlyCOS || switchValue}
      />
    </Container>
  );
};

export default COSQuotasNew;

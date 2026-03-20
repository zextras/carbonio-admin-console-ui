/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Container,
  IconCheckbox,
  Input,
  Padding,
  Switch,
  SwitchProps,
  Text,
  Tooltip,
} from '@zextras/ui-components';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ComputedLimit, QuotaSource } from '../../../services/get-cos-quota';
import { BytesToGB, GbToBytes } from '../../utility/utils';

type COSQuotasNewProps = {
  totalComputedQuotaLimit: ComputedLimit | undefined;
  totalQuotaSource?: QuotaSource;
  initialTotalComputedQuotaLimit: ComputedLimit | undefined;
  onChange: (value?: ComputedLimit) => void;
  readonlyCOS: boolean;
};

const COSQuotasNew: FC<COSQuotasNewProps> = ({
  totalComputedQuotaLimit,
  totalQuotaSource,
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

  const icon = totalQuotaSource === 'global' ? 'GlobeOutline' : undefined;

  const tooltipLabel =
    totalQuotaSource === 'global'
      ? t('label.quota.source.global', 'Quota inherited from the global configuration')
      : undefined;

  const showQuotaSourceIcon = totalQuotaSource !== undefined && totalQuotaSource !== 'cos';

  const onChangeReset = useCallback(() => {
    setQuotaValue(undefined);
    onChange(undefined);
  }, [onChange]);

  const CustomElement = () => (
    <Tooltip
      label={
        <>
          <Padding top="small">
            <Text weight="bold">
              {t('cos_quota.click_to_revert', 'Click to revert to the inherited value')}
            </Text>
          </Padding>
        </>
      }
    >
      <IconCheckbox
        icon="RefreshOutline"
        onClick={onChangeReset}
        style={{ cursor: 'pointer' }}
        onChange={(): null => null}
      />
    </Tooltip>
  );

  return (
    <Container padding={{ right: 'large' }} gap={'1rem'}>
      <Container mainAlignment={'flex-start'} orientation={'horizontal'} gap={'0.5rem'}>
        <Switch
          iconColor="primary"
          onClick={switchOnChange}
          value={switchValue}
          disabled={readonlyCOS}
        />
        <Text size="medium">{t('label.unlimited_quota', 'Unlimited quota')}</Text>
      </Container>
      <Container
        orientation={'horizontal'}
        gap={'0.5rem'}
        mainAlignment={'flex-start'}
        crossAlignment={'center'}
      >
        <Input
          label={t('label.total_quota_limit_gb', 'Total quota(GB)')}
          value={inputValue}
          backgroundColor="gray5"
          inputName="totalQuota"
          onChange={inputOnChange}
          disabled={readonlyCOS || switchValue}
          CustomIcon={totalQuotaSource === 'cos' ? CustomElement : undefined}
        />
        {showQuotaSourceIcon && (
          <Tooltip placement={'top-end'} label={tooltipLabel}>
            <icon-wc icon={icon} size="large" />
          </Tooltip>
        )}
      </Container>
    </Container>
  );
};

export default COSQuotasNew;

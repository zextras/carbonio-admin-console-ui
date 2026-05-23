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
  Tooltip,
} from '@zextras/ui-components';
import React, { FC, useState } from 'react';
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

  const derivedQuotaValue: number | 'unlimited' | undefined =
    totalComputedQuotaLimit === undefined
      ? undefined
      : totalComputedQuotaLimit.type === 'unlimited'
        ? 'unlimited'
        : totalComputedQuotaLimit.value > 0
          ? BytesToGB(totalComputedQuotaLimit.value)
          : undefined;

  const [quotaOverride, setQuotaOverride] = useState<number | 'unlimited' | undefined>(undefined);
  const quotaValue = quotaOverride ?? derivedQuotaValue;

  const inputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filteredStringValue = e.target.value.replaceAll(/\D/g, '');
    const parsedValue =
      filteredStringValue === '' ? undefined : Number.parseInt(filteredStringValue, 10);
    const valueInGB = parsedValue !== undefined && parsedValue > 0 ? parsedValue : undefined;
    const valueInBytes = valueInGB === undefined ? undefined : (GbToBytes(valueInGB) as number);
    onChange(valueInBytes ? { type: 'limited', value: valueInBytes } : undefined);
    setQuotaOverride(valueInGB);
  };

  const switchOnChange = () => {
    if (quotaValue === 'unlimited') {
      if (initialTotalComputedQuotaLimit && initialTotalComputedQuotaLimit.type === 'limited') {
        onChange({ type: 'limited', value: initialTotalComputedQuotaLimit.value });
        setQuotaOverride(BytesToGB(initialTotalComputedQuotaLimit.value));
      } else {
        onChange({ type: 'limited', value: GbToBytes(1) });
        setQuotaOverride(1);
      }
    } else {
      onChange({ type: 'unlimited' });
      setQuotaOverride('unlimited');
    }
  };

  const switchValue = quotaValue === 'unlimited';

  const inputValue = typeof quotaValue === 'number' ? String(quotaValue) : '';

  const icon = totalQuotaSource === 'global' ? 'GlobeOutline' : undefined;

  const tooltipLabel =
    totalQuotaSource === 'global'
      ? t('label.quota.source.global', 'Quota inherited from the global configuration')
      : undefined;

  const showQuotaSourceIcon = totalQuotaSource !== undefined && totalQuotaSource !== 'cos';

  const onChangeReset = () => {
    setQuotaOverride(undefined);
    onChange(undefined);
  };

  const CustomElement = () => (
    <Tooltip
      label={
        <>
          <Padding top="small">
            <ds-text as="strong" weight="bold">
              {t('cos_quota.click_to_revert', 'Click to revert to the inherited value')}
            </ds-text>
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
        <ds-text as="span" size="medium">{t('label.unlimited_quota', 'Unlimited quota')}</ds-text>
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
            <ds-icon icon={icon} size="large" />
          </Tooltip>
        )}
      </Container>
    </Container>
  );
};

export default COSQuotasNew;

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
  Row,
  Switch,
  SwitchProps,
  Text,
  Tooltip,
} from '@zextras/ui-components';
import { useDomainStore, useIsAdvanced } from '@zextras/ui-shared';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ComputedLimit, QuotaSource } from '../../../../../../services/get-account-quota';
import { BytesToGB, GbToBytes } from '../../../../../utility/utils';
import { TotalQuotaSourceIcon } from './total-quota-source-icon';

type EditAccountQuotaInputsNewProps = {
  totalComputedQuotaLimit?: number | 'unlimited';
  initialTotalComputedQuotaLimit?: number | 'unlimited';
  cosComputedLimit?: number | 'unlimited';
  totalQuotaSource?: QuotaSource;
  onChange: (value?: ComputedLimit) => void;
};

export const EditAccountQuotaInputsNew = ({
  totalComputedQuotaLimit,
  initialTotalComputedQuotaLimit,
  cosComputedLimit,
  totalQuotaSource,
  onChange,
}: EditAccountQuotaInputsNewProps): React.JSX.Element | null => {
  const [quotaValue, setQuotaValue] = useState<number | 'unlimited' | undefined>(undefined);

  const domainQuotaConstraint = useDomainStore((state) => {
    if (state.domain.id) {
      return state.domainsQuota[state.domain.id];
    } else {
      return undefined;
    }
  });

  useEffect(() => {
    setQuotaValue(
      typeof totalComputedQuotaLimit === 'number'
        ? totalComputedQuotaLimit > 0
          ? BytesToGB(totalComputedQuotaLimit)
          : undefined
        : totalComputedQuotaLimit,
    );
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
        if (typeof initialTotalComputedQuotaLimit === 'number') {
          onChange({ type: 'limited', value: initialTotalComputedQuotaLimit });
          return BytesToGB(initialTotalComputedQuotaLimit);
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

  const isAdvanced = useIsAdvanced();
  const [t] = useTranslation();

  const switchValue = useMemo(() => {
    return quotaValue === 'unlimited';
  }, [quotaValue]);

  const inputValue = useMemo(() => {
    // change between defined and undefined value breaks the input component, so we need to set it to empty string when it's undefined
    return typeof quotaValue === 'number' ? quotaValue : '';
  }, [quotaValue]);

  const onChangeReset = useCallback(() => {
    setQuotaValue(undefined);
    onChange(undefined);
  }, [onChange]);

  const inheritedValue = useMemo(() => {
    if (typeof domainQuotaConstraint === 'number') {
      if (typeof cosComputedLimit === 'number') {
        return BytesToGB(Math.min(domainQuotaConstraint, cosComputedLimit));
      }
      return domainQuotaConstraint;
    }
    return cosComputedLimit === 'unlimited'
      ? t('account_details.unlimited', 'Unlimited')
      : typeof cosComputedLimit === 'number'
      ? BytesToGB(cosComputedLimit)
      : undefined;
  }, [cosComputedLimit, domainQuotaConstraint, t]);

  const CustomElement = () => (
    <Tooltip
      label={
        <>
          <Row>
            <Text weight="bold">
              {t('account_details.inherited_value_was', 'The inherited value was')} :
            </Text>
            <Text>{`  ${inheritedValue || ''}`}</Text>
          </Row>
          <Padding top="small">
            <Text weight="bold">{t('account_details.click_to_revert', 'Click to revert.')}</Text>
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

  if (!isAdvanced) {
    return null;
  }

  return (
    <Container crossAlignment={'flex-start'} mainAlignment={'flex-start'} height={'fit'}>
      <Padding top={'large'} left={'large'}>
        <Container orientation={'horizontal'} gap={'0.5rem'}>
          <Switch
            iconColor="primary"
            onClick={switchOnChange}
            value={switchValue}
            disabled={typeof domainQuotaConstraint === 'number'}
          />
          <Text size="medium">{t('label.unlimited_quota', 'Unlimited quota')}</Text>
        </Container>
      </Padding>
      <Row
        wrap={'nowrap'}
        width="100%"
        padding={{ top: 'large', left: 'large' }}
        mainAlignment="space-between"
        crossAlignment="center"
      >
        <Container
          orientation={'horizontal'}
          gap={'0.5rem'}
          mainAlignment={'flex-start'}
          crossAlignment={'center'}
        >
          <Input
            label={t('label.total_quota_limit_gb', 'Total quota(GB)')}
            background={'gray5'}
            inputName="totalQuota"
            onChange={inputOnChange}
            value={inputValue}
            disabled={switchValue}
            CustomIcon={totalQuotaSource === 'account' ? CustomElement : undefined}
          />
          {totalQuotaSource !== undefined && <TotalQuotaSourceIcon source={totalQuotaSource} />}
        </Container>
      </Row>
    </Container>
  );
};

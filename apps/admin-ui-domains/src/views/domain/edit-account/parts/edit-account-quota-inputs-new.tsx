/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, IconCheckbox, Input, Padding, Row, Switch, SwitchProps, Tooltip, } from '@zextras/ui-components';
import { useIsAdvanced } from '@zextras/ui-shared';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { ComputedLimit, QuotaSource } from '../../../../services/get-account-quota';
import { useDomainQuota } from '../../../../services/use-domain-quota';
import { BytesToGB, GbToBytes } from '../../../utility/utils';
import { TotalQuotaSourceIcon } from './total-quota-source-icon';

type EditAccountQuotaInputsNewProps = {
  totalComputedQuotaLimit?: number | 'unlimited';
  initialTotalComputedQuotaLimit?: number | 'unlimited';
  cosComputedLimit?: number | 'unlimited';
  totalQuotaSource?: QuotaSource;
  onChange: (value?: ComputedLimit) => void;
  onQuotaErrorChange: (hasError: boolean) => void;
};

export const EditAccountQuotaInputsNew = ({
  totalComputedQuotaLimit,
  initialTotalComputedQuotaLimit,
  cosComputedLimit,
  totalQuotaSource,
  onChange,
  onQuotaErrorChange,
}: EditAccountQuotaInputsNewProps): React.JSX.Element | null => {
  const [quotaValue, setQuotaValue] = useState<number | 'unlimited' | undefined>(undefined);

  const { domainId } = useParams();
  const { data: quotaData } = useDomainQuota(domainId);
  const domainQuotaConstraint = quotaData?.type === 'success' ? quotaData.limit : 'not-set';

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
      const filteredStringValue = e.target.value.replaceAll(/\D/g, '');
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

  const inputDescription = useMemo(() => {
    if (typeof domainQuotaConstraint === 'number') {
      const quotaValueInBytes = typeof quotaValue === 'number' ? GbToBytes(quotaValue) : undefined;
      const exceedsConstraint =
        quotaValueInBytes !== undefined && quotaValueInBytes > domainQuotaConstraint;

      if (exceedsConstraint) {
        return t('label.exceeds_domain_limit', {
          defaultValue: `This value exceeds the domain limit (${BytesToGB(
            domainQuotaConstraint,
          )} GB). Please enter a lower value.`,
          limit: BytesToGB(domainQuotaConstraint),
        });
      }

      return t('label.maximum_allowed_value', {
        defaultValue: `The maximum allowed value is ${BytesToGB(
          domainQuotaConstraint,
        )} GB. Unlimited is not available.`,
        value: BytesToGB(domainQuotaConstraint),
      });
    }
    return undefined;
  }, [domainQuotaConstraint, quotaValue, t]);

  const hasError = useMemo(() => {
    if (typeof domainQuotaConstraint === 'number' && typeof quotaValue === 'number') {
      const quotaValueInBytes = GbToBytes(quotaValue);
      return quotaValueInBytes > domainQuotaConstraint;
    }
    return false;
  }, [domainQuotaConstraint, quotaValue]);

  useEffect(() => {
    onQuotaErrorChange(hasError);
  }, [hasError, onQuotaErrorChange]);

  const onChangeReset = useCallback(() => {
    setQuotaValue(undefined);
    onChange(undefined);
  }, [onChange]);

  const inheritedValue = useMemo(() => {
    if (typeof domainQuotaConstraint === 'number') {
      if (typeof cosComputedLimit === 'number') {
        return BytesToGB(Math.min(domainQuotaConstraint, cosComputedLimit));
      }
      return BytesToGB(domainQuotaConstraint);
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
          <ds-text weight="bold" as="span">
            {t('account_details.inherited_value_was', 'The inherited value was: {{value}}', {
              value: inheritedValue || '',
            })}
          </ds-text>
          <Padding top="small">
            <ds-text weight="bold" as="span">{t('account_details.click_to_revert', 'Click to revert.')}</ds-text>
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
          <ds-text size="medium" as="label">{t('label.unlimited_quota', 'Unlimited quota')}</ds-text>
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
          crossAlignment={'flex-start'}
        >
          <Input
            description={inputDescription}
            label={t('label.total_quota_limit_gb', 'Total quota(GB)')}
            background={'gray5'}
            inputName="totalQuota"
            onChange={inputOnChange}
            value={inputValue}
            disabled={switchValue}
            hasError={hasError}
            CustomIcon={totalQuotaSource === 'account' ? CustomElement : undefined}
          />
          {totalQuotaSource !== undefined && (
            <Padding top={'medium'}>
              <TotalQuotaSourceIcon source={totalQuotaSource} />
            </Padding>
          )}
        </Container>
      </Row>
    </Container>
  );
};

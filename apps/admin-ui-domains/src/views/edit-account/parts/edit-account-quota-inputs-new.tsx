/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Container,
  Input,
  InputProps,
  Padding,
  Row,
  Switch,
  SwitchProps,
} from '@zextras/ui-components';
import { useIsAdvanced } from '@zextras/ui-shared';
import { TFunction } from 'i18next';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { ComputedLimit, QuotaSource } from '../../../services/get-account-quota';
import { useDomainQuota } from '../../../services/use-domain-quota';
import { BytesToGB, GbToBytes } from '../../utility/utils';
import { EditAccountQuotaRevertIcon } from './edit-account-quota-revert-icon';
import { quotaExceedsDomainLimit, quotaValueFromLimit } from './quota-utils';
import { TotalQuotaSourceIcon } from './total-quota-source-icon';

type EditAccountQuotaInputsNewProps = {
  totalComputedQuotaLimit?: number | 'unlimited';
  initialTotalComputedQuotaLimit?: number | 'unlimited';
  cosComputedLimit?: number | 'unlimited';
  totalQuotaSource?: QuotaSource;
  onChange: (value?: ComputedLimit) => void;
};

type QuotaValue = number | 'unlimited' | undefined;

function getInputDescription(
  domainQuotaConstraint: number | 'not-set',
  quotaValue: QuotaValue,
  t: TFunction,
): string | undefined {
  if (typeof domainQuotaConstraint !== 'number') {
    return undefined;
  }
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

function getInheritedValue(
  domainQuotaConstraint: number | 'not-set',
  cosComputedLimit: number | 'unlimited' | undefined,
  t: TFunction,
): string | number | undefined {
  if (typeof domainQuotaConstraint === 'number') {
    if (typeof cosComputedLimit === 'number') {
      return BytesToGB(Math.min(domainQuotaConstraint, cosComputedLimit));
    }
    return BytesToGB(domainQuotaConstraint);
  }
  if (cosComputedLimit === 'unlimited') {
    return t('account_details.unlimited', 'Unlimited');
  }
  if (typeof cosComputedLimit === 'number') {
    return BytesToGB(cosComputedLimit);
  }
  return undefined;
}

function createRevertIcon(
  inheritedValue: string | number | undefined,
  onClick: () => void,
): InputProps['CustomIcon'] {
  return function RevertIcon() {
    return <EditAccountQuotaRevertIcon inheritedValue={inheritedValue} onClick={onClick} />;
  };
}

export const EditAccountQuotaInputsNew = ({
  totalComputedQuotaLimit,
  initialTotalComputedQuotaLimit,
  cosComputedLimit,
  totalQuotaSource,
  onChange,
}: EditAccountQuotaInputsNewProps): React.JSX.Element | null => {
  const [quotaValue, setQuotaValue] = useState<number | 'unlimited' | undefined>(() =>
    quotaValueFromLimit(totalComputedQuotaLimit),
  );
  const [prevLimit, setPrevLimit] = useState(totalComputedQuotaLimit);

  const { domainId } = useParams();
  const { data: quotaData } = useDomainQuota(domainId);
  const domainQuotaConstraint = quotaData?.type === 'success' ? quotaData.limit : 'not-set';

  // adjust during render: reseed the editable GB value when the limit changes
  if (prevLimit !== totalComputedQuotaLimit) {
    setPrevLimit(totalComputedQuotaLimit);
    setQuotaValue(quotaValueFromLimit(totalComputedQuotaLimit));
  }

  const inputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filteredStringValue = e.target.value.replaceAll(/\D/g, '');
    const parsedValue =
      filteredStringValue === '' ? undefined : Number.parseInt(filteredStringValue, 10);
    const valueInGB = parsedValue !== undefined && parsedValue > 0 ? parsedValue : undefined;
    const valueInBytes = valueInGB === undefined ? undefined : (GbToBytes(valueInGB) as number);
    onChange(valueInBytes ? { type: 'limited', value: valueInBytes } : undefined);
    setQuotaValue(valueInGB);
  };

  const switchOnChange: NonNullable<SwitchProps['onClick']> = () => {
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
  };

  const isAdvanced = useIsAdvanced();
  const [t] = useTranslation();

  const switchValue = quotaValue === 'unlimited';

  // change between defined and undefined value breaks the input component, so we need to set it to empty string when it's undefined
  const inputValue = typeof quotaValue === 'number' ? quotaValue : '';

  const inputDescription = getInputDescription(domainQuotaConstraint, quotaValue, t);

  const hasError = quotaExceedsDomainLimit(quotaValue, domainQuotaConstraint);

  const onChangeReset = () => {
    setQuotaValue(undefined);
    onChange(undefined);
  };

  const inheritedValue = getInheritedValue(domainQuotaConstraint, cosComputedLimit, t);

  const revertIcon = createRevertIcon(inheritedValue, onChangeReset);

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
          <ds-text size="medium" as="label">
            {t('label.unlimited_quota', 'Unlimited quota')}
          </ds-text>
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
            CustomIcon={totalQuotaSource === 'account' ? revertIcon : undefined}
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

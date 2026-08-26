/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import { Container } from '@zextras/ui-components';
import { useIsAdvanced } from '@zextras/ui-shared';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import {
  ComputedLimit,
  QuotaSource,
  QuotaStatus,
} from '../../../services/get-account-quota';
import { useAccountForm } from '../account-form-context';
import { EditAccountQuotaWarnings } from './edit-account-quota-warnings';
import { QuotaBar, QuotaBarEntry } from './quota-bar';
import { getPercentage, humanFileSize } from './size-utils';
import { TotalQuotaSourceIcon } from './total-quota-source-icon';

type QuotaBarBreakdownProps = {
  used: number;
  limit: ComputedLimit;
  usedByModule: Record<string, number>;
  source: QuotaSource;
  status: QuotaStatus;
};

/** Storage-usage breakdown: title, size description, source icon, warnings and the segmented quota bar. */
export const QuotaBarBreakdown = ({
  used,
  limit,
  usedByModule,
  source,
  status,
}: QuotaBarBreakdownProps): React.JSX.Element => {
  const [t] = useTranslation();

  const quotaModules: QuotaBarEntry[] = [
    {
      label: t('quota.module.mailbox', 'Mails, Calendars, Contacts'),
      color: '#10789F',
      used: usedByModule.mailbox,
    },
    {
      label: t('quota.module.wsc', 'Chats'),
      color: '#FD830B',
      used: usedByModule.wsc,
    },
    {
      label: t('quota.module.files', 'Files'),
      color: '#2EAF96',
      used: usedByModule.files,
    },
  ];

  const sizeDescription =
    limit.type === 'unlimited' ? (
      <Trans
        t={t}
        i18nKey="quota.account_quota_usage.unlimited"
        defaults="{{used}} of <bold>Unlimited</bold> storage used"
        values={{
          used: humanFileSize(used, t),
        }}
        components={{
          bold: <strong />,
        }}
      />
    ) : (
      t('label.account_quota_usage.limited', {
        used: humanFileSize(used, t),
        limit: humanFileSize(limit.value, t),
        percentage: getPercentage(used, limit.value),
        defaultValue: '{{used}} of {{limit}} ({{percentage}}%)',
      })
    );

  return (
    <Container mainAlignment="flex-start" height="fit" crossAlignment="flex-start" gap="0.5rem">
      <Container orientation="horizontal" width={'100%'} mainAlignment="space-between">
        <ds-text size="medium" weight="bold" color="regular" as="h2">
          {t('label.storage_usage', 'Storage usage')}
        </ds-text>
        <Container orientation={'horizontal'} width={'fit'} gap={'0.25rem'}>
          <ds-text size="small" color="regular" as="p">
            {sizeDescription}
          </ds-text>
          <TotalQuotaSourceIcon source={source} />
        </Container>
      </Container>
      {limit.type === 'limited' && (
        <EditAccountQuotaWarnings
          status={status}
          percentageUsed={getPercentage(used, limit.value)}
        />
      )}
      <QuotaBar modules={quotaModules} limit={limit} used={used} />
    </Container>
  );
};

/** Container reading quota values from the account form; renders nothing outside advanced mode or without data. */
export const EditAccountQuotaBar = (): React.JSX.Element | null => {
  const isAdvanced = useIsAdvanced();

  const { form } = useAccountForm();
  const {
    totalQuotaUsed,
    totalComputedQuotaLimit,
    totalQuotaUsedByModule,
    totalQuotaSource,
    totalQuotaStatus,
  } = useSelector(
    form.store,
    (s) =>
      s.values as {
        totalQuotaUsed?: number;
        totalComputedQuotaLimit?: any;
        totalQuotaUsedByModule?: Record<string, number>;
        totalQuotaSource?: any;
        totalQuotaStatus?: any;
      },
  );
  const dataMissing =
    totalQuotaUsed === undefined ||
    totalComputedQuotaLimit === undefined ||
    totalQuotaUsedByModule === undefined ||
    totalQuotaSource === undefined ||
    totalQuotaStatus === undefined;

  if (!isAdvanced || dataMissing) {
    return null;
  }
  return (
    <QuotaBarBreakdown
      used={totalQuotaUsed}
      limit={totalComputedQuotaLimit}
      usedByModule={totalQuotaUsedByModule}
      source={totalQuotaSource}
      status={totalQuotaStatus}
    />
  );
};

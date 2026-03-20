/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Text } from '@zextras/ui-components';
import React, { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { ComputedLimit, QuotaSource } from '../../../../../../services/get-account-quota';
import { EditAccountQuotaWarnings } from './edit-account-quota-warnings';
import { QuotaBar, QuotaBarEntry } from './quota-bar';
import { getPercentage, humanFileSize } from './size-utils';
import { TotalQuotaSourceIcon } from './total-quota-source-icon';

type EditAccountQuotaBarNewProps = {
  used: number;
  limit: ComputedLimit;
  usedByModule: Record<string, number>;
  source: QuotaSource;
};

export const EditAccountQuotaBarNew = ({
  used,
  limit,
  usedByModule,
  source,
}: EditAccountQuotaBarNewProps): React.JSX.Element => {
  const [t] = useTranslation();

  const quotaModules: QuotaBarEntry[] = useMemo(
    () => [
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
    ],
    [t, usedByModule.mailbox, usedByModule.wsc, usedByModule.files],
  );

  const sizeDescription = useMemo(() => {
    if (limit.type === 'unlimited') {
      return (
        <Trans
          t={t}
          i18nKey="quota.account_quota_usage.unlimited"
          defaults="{{used}} of <bold>Unlimited</bold> storage used"
          values={{
            used: humanFileSize(used, t),
          }}
          components={{
            bold: <Text weight="bold" overflow={'break-word'} style={{ display: 'inline' }} />,
          }}
        />
      );
    }

    return t('label.account_quota_usage.limited', {
      used: humanFileSize(used, t),
      limit: humanFileSize(limit.value, t),
      percentage: getPercentage(used, limit.value),
      defaultValue: '{{used}} of {{limit}} ({{percentage}}%)',
    });
  }, [t, used, limit]);

  return (
    <Container mainAlignment="flex-start" height="fit" crossAlignment="flex-start" gap="0.5rem">
      <Container orientation="horizontal" width={'100%'} mainAlignment="space-between">
        <Text size="medium" weight="bold" color="regular">
          {t('label.storage_usage', 'Storage usage')}
        </Text>
        <Container orientation={'horizontal'} width={'fit'} gap={'0.25rem'}>
          <Text size="small" color="regular">
            {sizeDescription}
          </Text>
          <TotalQuotaSourceIcon source={source} />
        </Container>
      </Container>
      {limit.type === 'limited' && (
        <EditAccountQuotaWarnings percentageUsed={getPercentage(used, limit.value)} />
      )}
      <QuotaBar modules={quotaModules} limit={limit} used={used} />
    </Container>
  );
};

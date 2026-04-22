/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useLicenseInfo } from '@zextras/ui-shared';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import styles from './subscription-status.module.css';

const DATE_FORMAT = 'dd MMM yyyy';

export const SubscriptionStatus = () => {
  const { t } = useTranslation();

  const { data: licenseData } = useLicenseInfo();
  const startDate = licenseData?.response?.dateStart
    ? format(licenseData.response.dateStart, DATE_FORMAT)
    : '';
  const startDateLabel = `${t('label.since', 'Since')} ${startDate}`;

  return (
    <div className={styles.card}>
      <ds-text size="small" as="span" color="gray0">
        {t('core.subscription.status', 'Subscription status')}
      </ds-text>
      <ds-badge>
        <ds-text weight="bold" color="gray0" style={{ fontSize: '1.5rem' }}>
          {t('label.active', 'Active').toUpperCase()}
        </ds-text>
      </ds-badge>
      <ds-text style={{ paddingTop: '1rem' }}>{startDateLabel}</ds-text>
    </div>
  );
};

/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useLicenseInfo } from '@zextras/ui-shared';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import styles from './subscription-expiry.module.css';

const DATE_FORMAT = 'dd MMM yyyy';

export const BillingPeriod = () => {
  const { t } = useTranslation();

  const title = t('core.subscription.billing_period', 'Billing period');
  const { data: licenseData } = useLicenseInfo();

  const renewDaysLeft = licenseData?.response?.renewDaysLeft;
  const renewTimeLeft = licenseData?.response?.renewTimeLeft;

  const nextBillDate = renewTimeLeft ? new Date(Date.now() + renewTimeLeft) : undefined;
  const expirationDateLabel = nextBillDate ? format(nextBillDate, DATE_FORMAT) : '';
  const daysLeftLabel = `${t('core.subscription.next_bill_due_days', {
    count: renewDaysLeft,
    defaultValue_one: 'Next bill in {{count}} day',
    defaultValue_other: 'Next bill in {{count}} days',
  })} `;
  return (
    <div className={styles.card}>
      <ds-text size="small" as="span" color="gray0">
        {title}
      </ds-text>
      <ds-text weight="bold" color="gray0" style={{ fontSize: '1.5rem' }}>
        {expirationDateLabel}
      </ds-text>
      <ds-text style={{ paddingTop: '1rem' }}>{daysLeftLabel}</ds-text>
    </div>
  );
};

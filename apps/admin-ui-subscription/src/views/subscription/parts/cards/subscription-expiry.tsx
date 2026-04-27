/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useLicenseInfo } from '@zextras/ui-shared';
import { differenceInCalendarDays, format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import { DATE_FORMAT } from '../../constants';
import styles from './card.module.css';

export const SubscriptionExpiry = () => {
  const { t } = useTranslation();

  const { data: licenseData } = useLicenseInfo();

  const dateEnd = licenseData?.response?.dateEnd;

  const expirationDateLabel = dateEnd ? format(dateEnd, DATE_FORMAT) : '';
  const daysLeft = dateEnd ? Math.max(0, differenceInCalendarDays(dateEnd, new Date())) : 0;
  const daysLeftLabel = `${t('label.in', 'In')}  ${t('label.days', {
    count: daysLeft,
    defaultValue_one: '{{count}} day',
    defaultValue_other: '{{count}} days',
  })} `;
  return (
    <div className={styles.card}>
      <ds-text size="small" as="span" color="gray0">
        {t('core.subscription.expiration', 'Expires on')}
      </ds-text>
      <ds-text weight="bold" color="gray0" style={{ fontSize: '1.5rem' }}>
        {expirationDateLabel}
      </ds-text>
      <ds-text style={{ paddingTop: '1rem' }}>{daysLeftLabel}</ds-text>
    </div>
  );
};

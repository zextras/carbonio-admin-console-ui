/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useTranslation } from 'react-i18next';

import styles from './seat-utilization.module.css';

export const SeatUtilization = () => {
  const { t } = useTranslation();
  const badgeIconLabel = t('core.subscription.normal_usage', 'normal usage').toUpperCase();

  return (
    <div className={styles.card}>
      <ds-text size="small" as="span" color="gray0">
        {t('core.subscription.seat_utilization', 'Seat utilization')}
      </ds-text>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ds-text weight="bold" color="gray0" style={{ fontSize: '1.5rem' }}>
          {/* TODO: CO-3521 fix this hardcoded value with real data from the API */}
          {'86%'}
        </ds-text>
        <ds-badge-icon label={badgeIconLabel} type="info"></ds-badge-icon>
      </div>
      {/* TODO: CO-3521 fix this hardcoded value with real data from the API */}
      <ds-text style={{ paddingTop: '1rem' }}>{'5200/5600'}</ds-text>
    </div>
  );
};

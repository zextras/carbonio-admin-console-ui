/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useLicenseInfo } from '@zextras/ui-shared';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import styles from './seat-utilization.module.css';

function calculatedAccountQuotaSizePercentage(accountCount: number, licensedUsers: number) {
  if (licensedUsers === 0) {
    return 0;
  }
  return (accountCount / licensedUsers) * 100;
}
function getUsageWarningType(usagePercentage: number) {
  if (usagePercentage >= 90) return 'error';
  if (usagePercentage >= 75) return 'warning';
  return 'info';
}

function getUsageWarningLabel(t: TFunction, usagePercentage: number) {
  if (usagePercentage >= 90) return t('core.subscription.critical_usage', 'critical usage');
  if (usagePercentage >= 75) return t('core.subscription.high_usage', 'high usage');
  return t('core.subscription.medium_usage', 'medium usage');
}

export const SeatUtilization = () => {
  const { t } = useTranslation();

  const { data: licenseData } = useLicenseInfo();

  const usagePercentage = calculatedAccountQuotaSizePercentage(
    licenseData?.response?.accountCount ?? 0,
    3,
    // licenseData?.response?.licensedUsers ?? 0,
  );

  const usageWarningType = getUsageWarningType(usagePercentage);
  const usagePercentageLabel = `${Math.round(usagePercentage)}%`;

  const badgeIconLabel = getUsageWarningLabel(t, usagePercentage).toUpperCase();

  return (
    <div className={styles.card}>
      <ds-text size="small" as="span" color="gray0">
        {t('core.subscription.seat_utilization', 'Seat utilization')}
      </ds-text>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ds-text weight="bold" color="gray0" style={{ fontSize: '1.5rem' }}>
          {usagePercentageLabel}
        </ds-text>
        <ds-tag-icon label={badgeIconLabel} type={usageWarningType}></ds-tag-icon>
      </div>
      {/* TODO: CO-3521 fix this hardcoded value with real data from the API */}
      <ds-text style={{ paddingTop: '1rem' }}>{'5200/5600'}</ds-text>
    </div>
  );
};

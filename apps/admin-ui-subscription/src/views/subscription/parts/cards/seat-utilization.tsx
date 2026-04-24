/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { theme } from '@zextras/ui-components';
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
function getTagIconColor(usagePercentage: number) {
  if (usagePercentage > 95) return theme.tag.high.text;
  if (usagePercentage > 70) return theme.tag.moderate.text;
  return theme.tag.low.text;
}

function getTagIconIcon(usagePercentage: number) {
  if (usagePercentage >= 100) return 'MinusCircleOutline';
  if (usagePercentage > 95) return 'AlertTriangleFill';
  if (usagePercentage > 70) return 'ActivityOutline';
  return 'TrendingDown';
}

function getTagIconBackground(usagePercentage: number) {
  if (usagePercentage >= 100) return theme.tag.over.bg;
  if (usagePercentage > 95) return theme.tag.high.bg;
  if (usagePercentage > 70) return theme.tag.moderate.bg;
  return theme.tag.low.bg;
}

function getUsageWarningLabel(t: TFunction, usagePercentage: number) {
  if (usagePercentage > 100) return t('core.subscription.over_usage', 'over usage');
  if (usagePercentage === 100) return t('core.subscription.full_usage', 'full usage');
  if (usagePercentage > 95) return t('core.subscription.high_usage', 'high usage');
  if (usagePercentage > 70) return t('core.subscription.moderate_usage', 'moderate usage');
  return t('core.subscription.low_usage', 'low usage');
}

export const SeatUtilization = () => {
  const { t } = useTranslation();

  const { data: licenseData } = useLicenseInfo();

  const usage = calculatedAccountQuotaSizePercentage(
    licenseData?.response?.accountCount ?? 0,
    licenseData?.response?.licensedUsers ?? 0,
  );

  const usagePercentageLabel = `${Math.round(usage)}%`;

  const badgeIconLabel = getUsageWarningLabel(t, usage).toUpperCase();

  return (
    <div className={styles.card}>
      <ds-text size="small" as="span" color="gray0">
        {t('core.subscription.seat_utilization', 'Seat utilization')}
      </ds-text>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ds-text weight="bold" color="gray0" style={{ fontSize: '1.5rem' }}>
          {usagePercentageLabel}
        </ds-text>
        <ds-tag-icon
          label={badgeIconLabel}
          icon={getTagIconIcon(usage)}
          color={getTagIconColor(usage)}
          background={getTagIconBackground(usage)}
        ></ds-tag-icon>{' '}
      </div>
      {/* TODO: CO-3521 fix this hardcoded value with real data from the API */}
      <ds-text style={{ paddingTop: '1rem' }}>{'5200/5600'}</ds-text>
    </div>
  );
};

/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { theme } from '@zextras/ui-components';
import { isUnlimitedQuantity, useLicenseInfo } from '@zextras/ui-shared';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import styles from './card.module.css';
import seatStyles from './seat-utilization.module.css';

function calculateUsagePercentage(used: number, total: number) {
  if (total <= 0) return 0;
  return (used / total) * 100;
}

function getTagIconColor(usagePercentage: number) {
  if (usagePercentage >= 100) return theme.color.error.active;
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
  if (usagePercentage > 100) return t('core.subscription.over_usage', 'over');
  if (usagePercentage === 100) return t('core.subscription.full_usage', 'full');
  if (usagePercentage > 95) return t('core.subscription.high_usage', 'high');
  if (usagePercentage > 70) return t('core.subscription.moderate_usage', 'moderate');
  return t('core.subscription.low_usage', 'low');
}

export const SeatUtilization = () => {
  const { t } = useTranslation();

  const { data: licenseData } = useLicenseInfo();

  const licensedUsers = licenseData?.response?.licensedUsers;
  const isUnlimited = isUnlimitedQuantity(licensedUsers);
  const activeAccounts = licenseData?.response?.accountCount ?? 0;
  const totalLicences = isUnlimited ? 0 : Number(licensedUsers ?? '0');
  const usage = calculateUsagePercentage(activeAccounts, totalLicences);

  const usagePercentageLabel = `${Math.round(usage)}%`;

  const badgeIconLabel = getUsageWarningLabel(t, usage).toUpperCase();

  return (
    <div className={styles.card}>
      <ds-text size="small" as="span" color="gray0">
        {t('core.subscription.seat_utilization', 'Seat utilization')}
      </ds-text>
      <div className={seatStyles.usageRow}>
        <ds-text weight="bold" color="gray0" style={{ fontSize: '1.5rem' }}>
          {usagePercentageLabel}
        </ds-text>
        <ds-tag-icon
          label={badgeIconLabel}
          icon={getTagIconIcon(usage)}
          color={getTagIconColor(usage)}
          background={getTagIconBackground(usage)}
        ></ds-tag-icon>
      </div>
      <ds-text style={{ paddingTop: '1rem' }}>{`${activeAccounts}/${
        isUnlimited ? t('label.unlimited', 'Unlimited') : totalLicences
      }`}</ds-text>
    </div>
  );
};

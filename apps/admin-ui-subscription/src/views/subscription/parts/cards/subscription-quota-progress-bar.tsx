/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Quota, theme } from '@zextras/ui-components';

function getProgressBarColor(usagePercentage: number) {
  if (usagePercentage > 95) return 'linear-gradient(90deg, #FFE9E8 -14.73%, #D74942 100%);';
  if (usagePercentage > 70) return 'linear-gradient(90deg, #FFF7E0 -14.73%, #FFC107 100%)';
  return 'linear-gradient(90deg, #ebf4ff -34.98%, #2b73d2 100%)';
}

export const SubscriptionQuotaProgressBar = ({ fillPercent }: { fillPercent: number }) => {
  const progressBarColor = getProgressBarColor(fillPercent);
  return (
    <Quota
      fill={fillPercent}
      background={theme.color.gray5.regular}
      fillBackground={progressBarColor}
      style={{ borderRadius: '2px' }}
    />
  );
};

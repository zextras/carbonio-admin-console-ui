/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTranslation } from 'react-i18next';

import { Banner } from '../../../../../../../../../packages/ui-components/src/components/feedback/banner/Banner';

export const EditAccountQuotaWarnings = ({ percentageUsed }: { percentageUsed: number }) => {
  const [t] = useTranslation();

  return (
    <>
      {percentageUsed >= 100 && (
        <Banner
          type={'standard'}
          severity="error"
          description={t(
            'label.accountquota.banner.overQuota',
            'This account has reached its storage limit. Increase storage quota immediately or notify the user to free up space.',
          )}
        />
      )}
      {percentageUsed >= 80 && percentageUsed < 100 && (
        <Banner
          type={'standard'}
          severity="warning"
          description={t(
            'label.accountquota.banner.thresholdReached',
            'This account is approaching its storage limit. Increase storage quota or notify the user to free up space.',
          )}
        />
      )}
    </>
  );
};

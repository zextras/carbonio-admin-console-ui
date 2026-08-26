/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Banner } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { QuotaStatus } from '../../../services/get-account-quota';

export const EditAccountQuotaWarnings = ({
  status,
  percentageUsed,
}: {
  status: QuotaStatus | undefined;
  percentageUsed: number;
}) => {
  const [t] = useTranslation();

  return (
    <>
      {status === 'OVERQUOTA' && (
        <Banner
          type={'standard'}
          severity="error"
          description={t(
            'label.accountQuota.banner.overQuota',
            'This account has reached its storage limit. Increase storage quota immediately or notify the user to free up space.',
          )}
        />
      )}
      {percentageUsed >= 80 && status !== 'OVERQUOTA' && (
        <Banner
          type={'standard'}
          severity="warning"
          description={t(
            'label.accountQuota.banner.thresholdReached',
            'This account is approaching its storage limit. Increase storage quota or notify the user to free up space.',
          )}
        />
      )}
    </>
  );
};

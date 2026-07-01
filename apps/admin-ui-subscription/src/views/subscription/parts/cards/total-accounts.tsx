/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Tooltip } from '@zextras/ui-components';
import { isUnlimitedQuantity, useLicenseInfo } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';

import styles from './card.module.css';

export const TotalAccounts = () => {
  const { t } = useTranslation();

  const title = t('core.subscription.total_accounts', 'Total active accounts');
  const { data: licenseData } = useLicenseInfo();

  const licensedUsers = licenseData?.response?.licensedUsers;
  const isUnlimited = isUnlimitedQuantity(licensedUsers);

  return (
    <div className={styles.card}>
      <div className={styles.labelWithIcon}>
        <ds-text size="small" as="span" color="gray0">
          {title}
        </ds-text>
        <Tooltip
          placement="top"
          label={t(
            'core.subscription.totalActiveAccountsTooltip',
            'System accounts, distribution lists, external or guest, closed or inactive accounts are excluded from this count.',
          )}
        >
          <ds-icon icon="InfoOutline" size="medium" color="gray0" />
        </Tooltip>
      </div>
      <ds-text weight="bold" color="gray0" style={{ fontSize: '1.5rem' }}>
        {isUnlimited ? t('label.unlimited', 'Unlimited') : licensedUsers}
      </ds-text>
    </div>
  );
};

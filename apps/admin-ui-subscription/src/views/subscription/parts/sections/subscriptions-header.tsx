/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button } from '@zextras/ui-components';
import { useLicenseV1Info } from '@zextras/ui-shared';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import { DATE_FORMAT } from '../../constants';
import styles from './sections.module.css';

export const SubscriptionsHeader = () => {
  const { t } = useTranslation();

  const { data: licenseData, isFetching, refetch } = useLicenseV1Info();
  const lastSyncTime = licenseData?.lastSyncTime;

  return (
    <div className={styles.header}>
      <ds-text as="h2" weight="bold" size="extralarge" color="gray0">
        {t('label.subscriptions', 'Subscriptions')}
      </ds-text>
      <div className={styles.syncRow}>
        {lastSyncTime && (
          <ds-text size="small">
            {`${t('label.last_sync', 'Last sync')} ${format(lastSyncTime, DATE_FORMAT)}`}
          </ds-text>
        )}
        <Button
          label={t('label.update_data', 'Update data')}
          type="outlined"
          icon="Sync"
          iconPlacement="right"
          onClick={(): void => {
            void refetch();
          }}
          loading={isFetching}
        />
      </div>
    </div>
  );
};

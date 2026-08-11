/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, ListRow, NotificationView } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import styles from './dashboard-notification.module.css';

type DashboardNotificationProps = {
  goToMailNotification: () => void;
};

export const DashboardNotification = ({ goToMailNotification }: DashboardNotificationProps) => {
  const [t] = useTranslation();
  return (
    <div className={styles.root}>
      <ListRow>
        <div className={styles.headerContent}>
          <ListRow>
            <div className={styles.icon}>
              <ds-icon icon="BellOutline" size="large" aria-label={t('dashboard.notifications', 'Notifications')}></ds-icon>
            </div>
            <div className={styles.title}>
              <ds-text as="strong" size="medium" color="gray0" weight="bold">
                {t('dashboard.your_notifications', 'Your Notifications')}
              </ds-text>
            </div>
          </ListRow>
        </div>
        <div className={styles.buttonWrap}>
          <Button
            type="ghost"
            label={t('dashboard.go_to_notification', 'Go to notification')}
            color="primary"
            onClick={goToMailNotification}
            size="large"
          />
        </div>
      </ListRow>

      <ListRow>
        <NotificationView isShowTitle={false} />
      </ListRow>
    </div>
  );
};


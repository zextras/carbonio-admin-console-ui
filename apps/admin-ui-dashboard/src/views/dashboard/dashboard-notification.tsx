/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Container, ListRow, NotificationView } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

type DashboardNotificationProps = {
  goToMailNotification: () => void;
};

export const DashboardNotification = ({ goToMailNotification }: DashboardNotificationProps) => {
  const [t] = useTranslation();
  return (
    <Container
      background="gray6"
      style={{ borderRadius: '0.5rem' }}
      padding={{ bottom: 'extralarge' }}
    >
      <ListRow>
        <Container
          padding={{ all: 'extralarge' }}
          mainAlignment="flex-start"
          crossAlignment="flex-start"
        >
          <ListRow>
            <Container mainAlignment="flex-start" crossAlignment="flex-start" width="2.2rem">
              <ds-icon icon="BellOutline" size="large"></ds-icon>
            </Container>
            <Container mainAlignment="center" crossAlignment="flex-start">
              <ds-text as="strong" size="medium" color="gray0" weight="bold">
                {t('dashboard.your_notifications', 'Your Notifications')}
              </ds-text>
            </Container>
          </ListRow>
        </Container>
        <Container
          mainAlignment="flex-end"
          crossAlignment="flex-end"
          padding={{ all: 'extralarge' }}
        >
          <Button
            type="ghost"
            label={t('dashboard.go_to_notification', 'Go to notification')}
            color="primary"
            onClick={goToMailNotification}
            size="large"
          />
        </Container>
      </ListRow>

      <ListRow>
        <NotificationView isShowTitle={false} />
      </ListRow>
    </Container>
  );
};


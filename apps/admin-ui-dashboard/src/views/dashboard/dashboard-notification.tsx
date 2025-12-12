/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Container, Icon, Text } from '@zextras/carbonio-design-system';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import NotificationView from '../app/shared/notification-view';
import ListRow from '../list/list-row';

const DashboardNotification: FC<{
	goToMailNotificationt: () => void;
}> = ({ goToMailNotificationt }) => {
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
							<Icon icon="BellOutline" size="large" />
						</Container>
						<Container mainAlignment="center" crossAlignment="flex-start">
							<Text size="medium" color="gray0" weight="bold">
								{t('dashboard.your_notifications', 'Your Notifications')}
							</Text>
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
						onClick={goToMailNotificationt}
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

export default DashboardNotification;

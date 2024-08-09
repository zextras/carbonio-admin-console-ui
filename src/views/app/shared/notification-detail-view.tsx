/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC } from 'react';

import { Container, Text, Row, IconButton, Divider, Input } from '@zextras/carbonio-design-system';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { useStickyBarStore } from '../../../store/sticky-bar/store';
import Displayer from '../../components/displayer';
import ListRow from '../../list/list-row';

const NotificationDetail: FC<{
	notification: any;
	setShowNotificationDetail: (arg: boolean) => void;
	copyNotificationOperation: (args: any) => void;
	markAsReadUnread: (args: any) => void;
	isRequestInProgress: boolean;
}> = ({
	notification,
	setShowNotificationDetail,
	copyNotificationOperation,
	markAsReadUnread,
	isRequestInProgress
}) => {
	const [t] = useTranslation();
	const { isSticky, setIsSticky } = useStickyBarStore();
	const buttons = [
		{
			align: 'right',
			label: notification?.ack
				? t('notification.mark_as_unread', 'Mark as unread')
				: t('notification.mark_as_read', 'Mark as read'),
			onClick: (): void => {
				markAsReadUnread(notification);
			},
			disabled: isRequestInProgress,
			loading: isRequestInProgress
		},
		{
			align: 'right',
			label: t('notification.copy', 'Copy'),
			onClick: (): void => {
				copyNotificationOperation(notification);
			}
		},
		{
			align: 'left',
			icon: isSticky ? 'Pin3Outline' : 'Unpin3Outline',
			onClick: (): void => {
				setIsSticky(!isSticky);
			}
		}
	];
	return (
		<Container
			background="gray6"
			mainAlignment="flex-start"
			style={{
				position: 'absolute',
				top: '0rem',
				overflow: 'hidden',
				transition: 'left 0.2s ease-in-out',
				zIndex: '9'
			}}
		>
			<Row
				mainAlignment="flex-start"
				crossAlignment="center"
				orientation="horizontal"
				background="white"
				width="fill"
				height="4.15rem"
			>
				<Row padding={{ horizontal: 'small' }}></Row>
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text size="medium" overflow="ellipsis" weight="bold">
						{t('notification.notification_details', 'Notification Details')} |{' '}
						{notification?.server}
					</Text>
				</Row>
				<Row padding={{ right: 'extrasmall' }}>
					<IconButton
						size="medium"
						icon="CloseOutline"
						onClick={(): void => {
							setShowNotificationDetail(false);
						}}
					/>
				</Row>
			</Row>
			<ListRow>
				<Divider />
			</ListRow>
			<Row width="100%" padding={{ all: 'small' }}>
				<Displayer buttons={buttons} pinIcon={isSticky} />
			</Row>
			<ListRow>
				<Container padding={{ bottom: 'large', right: 'small', left: 'extralarge' }}>
					<Input
						label={t('label.date', 'Date')}
						value={moment(notification?.date).format('DD-MM-YYYY - HH:mm A')}
						backgroundColor="gray6"
					/>
				</Container>
				<Container padding={{ bottom: 'large', left: 'small', right: 'extralarge' }}>
					<Input
						label={t('label.type', 'Type')}
						value={notification?.level}
						backgroundColor="gray6"
					/>
				</Container>
			</ListRow>
			<ListRow>
				<Container
					padding={{ top: 'small', bottom: 'small', right: 'extralarge', left: 'extralarge' }}
				>
					<Input
						label={t('label.what_inside', 'What’s inside?')}
						value={notification?.subject}
						backgroundColor="gray6"
					/>
				</Container>
			</ListRow>
			<ListRow>
				<Row padding={{ all: 'extralarge' }}>
					<Text size="medium" weight="bold" color="gray0">
						{t('label.content', 'Content')}
					</Text>
				</Row>
			</ListRow>

			<Row
				padding={{ right: 'extralarge', left: 'extralarge', bottom: 'extralarge' }}
				wrap="nowrap"
			>
				<Container
					height="calc(100vh - 26rem)"
					style={{ overflow: 'auto' }}
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					dangerouslySetInnerHTML={{ __html: notification?.text.replace(/(\r\n|\r|\n)/g, '<br>') }}
				></Container>
			</Row>
		</Container>
	);
};

export default NotificationDetail;

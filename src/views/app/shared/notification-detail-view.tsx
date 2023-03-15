/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useEffect } from 'react';
import {
	Container,
	Text,
	Row,
	IconButton,
	Divider,
	Padding,
	Button,
	Input
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
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
	return (
		<Container
			background="gray6"
			mainAlignment="flex-start"
			style={{
				position: 'absolute',
				left: `${'max(calc(100% - 42.5rem), 0.75rem)'}`,
				top: '0rem',
				height: '100%',
				width: `42rem`,
				overflow: 'hidden',
				transition: 'left 0.2s ease-in-out',
				'box-shadow': '-0.375rem 0.25rem 0.313rem 0rem rgba(0, 0, 0, 0.1)',
				'z-index': '9'
			}}
		>
			<Row
				mainAlignment="flex-start"
				crossAlignment="center"
				orientation="horizontal"
				background="white"
				width="fill"
				height="3.25rem"
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
			<ListRow>
				<Container
					mainAlignment="flex-end"
					crossAlignment="flex-end"
					orientation="horizontal"
					padding={{ all: 'extralarge' }}
				>
					<Button
						type="ghost"
						label={t('notification.copy', 'Copy')}
						icon="CopyOutline"
						iconPlacement="right"
						color="secondary"
						onClick={(): void => {
							copyNotificationOperation(notification);
						}}
					/>
					<Padding left="large">
						<Button
							type="outlined"
							label={
								notification?.ack
									? t('notification.mark_as_unread', 'Mark as unread')
									: t('notification.mark_as_read', 'Mark as read')
							}
							icon="EmailReadOutline"
							iconPlacement="right"
							color="primary"
							disabled={isRequestInProgress}
							loading={isRequestInProgress}
							onClick={(): void => {
								markAsReadUnread(notification);
							}}
						/>
					</Padding>
				</Container>
			</ListRow>
			<ListRow>
				<Container padding={{ bottom: 'large', right: 'small', left: 'extralarge' }}>
					<Input
						label={t('label.date', 'Date')}
						value={moment(notification?.date).format('DD-MM-YYYY - HH:mm A')}
						background="gray6"
						readOnly
					/>
				</Container>
				<Container padding={{ bottom: 'large', left: 'small', right: 'extralarge' }}>
					<Input
						label={t('label.type', 'Type')}
						value={notification?.level}
						background="gray6"
						readOnly
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
						background="gray6"
						readOnly
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

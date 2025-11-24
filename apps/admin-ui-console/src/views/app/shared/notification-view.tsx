/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	Container,
	DefaultTabBarItem,
	Text,
	TabBar,
	Table,
	Icon,
	Divider,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { orderBy } from 'lodash';
import moment from 'moment';
import React, { FC, ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	NOTIFICATION_ALL,
	NOTIFICATION_ERROR,
	NOTIFICATION_INFORMATION,
	NOTIFICATION_WARNING,
	DESC
} from '../../../constants';
import { getAllNotifications } from '../../../services/get-all-notifications';
import { readUnreadNotification } from '../../../services/read-unread-notification';
import ModalOverlay from '../../components/ModalOverlay';
import ListRow from '../../list/list-row';
import { copyTextToClipboard } from '../../utility/utils';

import CustomHeaderFactory from './customTableHeaderFactory';
import CustomRowFactory from './customTableRowFactory';
import NotificationDetail from './notification-detail-view';

const ReusedDefaultTabBar: FC<{
	item: any;
	index: any;
	selected: any;
	onClick: any;
}> = ({ item, index, selected, onClick }): ReactElement => (
	<DefaultTabBarItem
		item={item}
		selected={selected}
		onClick={onClick}
		orientation="horizontal"
		background={'transparent'}
		underlineColor={'primary'}
		forceWidthEquallyDistributed={false}
	>
		<Container
			orientation="horizontal"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			padding={{ all: 'medium' }}
			width="fill"
		>
			<Container width="2rem" padding={{ right: 'small' }}>
				<Icon
					icon={item?.icon}
					height={'1rem'}
					width="1rem"
					color={selected ? 'primary' : 'gray'}
				/>
			</Container>
			<Container mainAlignment="flex-start" crossAlignment="flex-start" width="auto">
				<Text size="small" weight="regular" color={selected ? 'primary' : 'gray'}>
					{item.label} ({item?.count})
				</Text>
			</Container>
		</Container>
	</DefaultTabBarItem>
);

export type Notification = {
	ack: boolean;
	date: number;
	group: string;
	id: string;
	level: string;
	operationId: string;
	server: string;
	subject: string;
	text: string;
};

const NotificationView: FC<{
	isShowTitle: boolean;
	isAddPadding?: boolean;
}> = ({ isShowTitle, isAddPadding = false }) => {
	const [t] = useTranslation();
	const [change, setChange] = useState(NOTIFICATION_ALL);
	const [setClick] = useState('');
	const createSnackbar = useSnackbar();
	const [notificationList, setNotificationList] = useState<Array<Notification>>([]);
	const [filterdNotification, setFilterdNotification] = useState<Array<Notification>>([]);
	const [notificationRows, setNotificationRows] = useState<Array<any>>([]);
	const [showNotificationDetail, setShowNotificationDetail] = useState<boolean>(false);
	const [selectedNotification, setSelectedNotification] = useState<any>({});
	const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);
	const [notificationCount, setNotificationCount] = useState<any>({
		warning: 0,
		error: 0,
		information: 0,
		all: 0
	});
	const [selectedRow, setSelectedRow] = useState<any>([]);
	const timer = useRef<any>(null);

	const items = useMemo(
		() => [
			{
				id: NOTIFICATION_ALL,
				icon: 'KeypadOutline',
				label: t('notification.all', 'ALL'),
				count: notificationCount?.all,
				CustomComponent: ReusedDefaultTabBar
			},
			{
				id: NOTIFICATION_INFORMATION,
				icon: 'InfoOutline',
				label: t('notification.information', 'INFORMATION'),
				count: notificationCount?.information,
				CustomComponent: ReusedDefaultTabBar
			},
			{
				id: NOTIFICATION_WARNING,
				icon: 'AlertTriangleOutline',
				label: t('notification.warning', 'WARNING'),
				count: notificationCount?.warning,
				CustomComponent: ReusedDefaultTabBar
			},
			{
				id: NOTIFICATION_ERROR,
				icon: 'CloseCircleOutline',
				label: t('notification.error', 'ERROR'),
				count: notificationCount?.error,
				CustomComponent: ReusedDefaultTabBar
			}
		],
		[t, notificationCount]
	);

	const headers: any[] = useMemo(
		() => [
			{
				id: 'server',
				label: t('label.server', 'Server'),
				width: '20%',
				bold: true
			},
			{
				id: 'date',
				label: t('label.date', 'Date'),
				width: '20%',
				bold: true
			},
			{
				id: 'type',
				label: t('label.type', 'Type'),
				width: '20%',
				bold: true
			},
			{
				id: 'whatinside',
				label: t('label.what_inside', 'What’s inside?'),
				width: '40%',
				bold: true
			}
		],
		[t]
	);

	const allNotifications = useCallback(() => {
		getAllNotifications()
			.then((res) => {
				if (res?.Body?.response?.content) {
					const content = JSON.parse(res?.Body?.response?.content);
					if (content?.response) {
						const notificationItems: Array<Notification> = [];
						let infoCount = 0;
						let allCount = 0;
						let warningCount = 0;
						let errorCount = 0;
						Object.keys(content?.response).forEach((ele) => {
							if (content?.response[ele] && content?.response[ele]?.response?.notifications) {
								const allNotification = content?.response[ele]?.response?.notifications;
								notificationItems.push(...allNotification);
								const info = allNotification.filter(
									(item: Notification) => item?.level === NOTIFICATION_INFORMATION
								);
								const warn = allNotification.filter(
									(item: Notification) => item?.level === NOTIFICATION_WARNING
								);
								const error = allNotification.filter(
									(item: Notification) => item?.level === NOTIFICATION_ERROR
								);
								allCount += allNotification.length;
								infoCount += info.length;
								warningCount += warn.length;
								errorCount += error.length;
							}
						});
						setNotificationList(
							orderBy(notificationItems, (item: Notification) => new Date(item?.date), [DESC])
						);
						setNotificationCount({
							all: allCount,
							information: infoCount,
							warning: warningCount,
							error: errorCount
						});
					}
				}
			})
			.catch((error: any) => {
				createSnackbar({
					key: 'error',
					severity: 'error',
					label: error
						? error?.error
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	}, [t, createSnackbar]);

	useEffect(() => {
		allNotifications();
	}, [allNotifications]);

	useEffect(() => {
		if (notificationList.length > 0) {
			if (change === NOTIFICATION_ALL) {
				setFilterdNotification(notificationList);
			} else if (change === NOTIFICATION_INFORMATION) {
				const list = notificationList.filter(
					(item: Notification) => item?.level === NOTIFICATION_INFORMATION
				);
				setFilterdNotification(list);
			} else if (change === NOTIFICATION_WARNING) {
				const list = notificationList.filter(
					(item: Notification) => item?.level === NOTIFICATION_WARNING
				);
				setFilterdNotification(list);
			} else if (change === NOTIFICATION_ERROR) {
				const list = notificationList.filter(
					(item: Notification) => item?.level === NOTIFICATION_ERROR
				);

				setFilterdNotification(list);
			}
		} else {
			setFilterdNotification([]);
		}
	}, [change, notificationList]);

	const doClickAction = useCallback((): void => {
		setShowNotificationDetail(true);
	}, []);

	const doDoubleClickAction = useCallback((): void => {
		setShowNotificationDetail(true);
	}, []);

	const handleClick = useCallback(
		(event: any) => {
			clearTimeout(timer.current);
			if (event.detail === 1) {
				timer.current = setTimeout(doClickAction, 300);
			} else if (event.detail === 2) {
				doDoubleClickAction();
			}
		},

		[doClickAction, doDoubleClickAction]
	);

	const markAsReadUnread = useCallback(
		(item: any, isShowMessage = true) => {
			setIsRequestInProgress(true);
			readUnreadNotification(item?.id, !item?.ack)
				.then((res) => {
					const content = JSON.parse(res?.Body?.response?.content);
					if (content?.ok) {
						setIsRequestInProgress(false);
						const message = item?.ack
							? t(
									'notification.notification_mark_unread_successfully',
									'Notification mark as unread successfully'
								)
							: t(
									'notification.notification_mark_read_successfully',
									'Notification mark as read successfully'
								);
						if (isShowMessage) {
							createSnackbar({
								key: 'success',
								severity: 'success',
								label: message,
								autoHideTimeout: 3000,
								hideButton: true,
								replace: true
							});
						}
						const allData = notificationList.map((nf: Notification) => {
							if (nf?.id === item?.id) {
								nf.ack = !item?.ack;
							}
							return nf;
						});
						setNotificationList(allData);
					}
				})
				.catch((error: any) => {
					setIsRequestInProgress(false);
					createSnackbar({
						key: 'error',
						severity: 'error',
						label: error
							? error?.error
							: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				});
		},
		[createSnackbar, t, notificationList]
	);

	useEffect(() => {
		if (filterdNotification.length > 0) {
			const allRows = filterdNotification.map((item: Notification) => ({
				id: item?.id,
				columns: [
					<Text
						size="small"
						color="gray0"
						weight="regular"
						key={item.id}
						onClick={(event: any): void => {
							setSelectedNotification(item);
							handleClick(event);
							setSelectedRow([item?.id]);
							if (item?.ack === false) {
								markAsReadUnread(item, false);
							}
						}}
					>
						{item?.server}
					</Text>,
					<Text
						size="small"
						color="gray0"
						weight={item?.ack ? 'light' : 'medium'}
						key={item.id}
						onClick={(event: { stopPropagation: () => void }): void => {
							setSelectedNotification(item);
							handleClick(event);
							setSelectedRow([item?.id]);
							if (item?.ack === false) {
								markAsReadUnread(item, false);
							}
						}}
					>
						{moment(item?.date).format('DD-MM-YYYY - HH:mm A')}
					</Text>,
					<Text
						size="small"
						color="gray0"
						weight={item?.ack ? 'light' : 'medium'}
						key={item.id}
						onClick={(event: { stopPropagation: () => void }): void => {
							setSelectedNotification(item);
							handleClick(event);
							setSelectedRow([item?.id]);
							if (item?.ack === false) {
								markAsReadUnread(item, false);
							}
						}}
					>
						{item?.level}
					</Text>,
					<Text
						size="small"
						color="gray0"
						weight={item?.ack ? 'light' : 'medium'}
						key={item.id}
						onClick={(event: { stopPropagation: () => void }): void => {
							setSelectedNotification(item);
							handleClick(event);
							setSelectedRow([item?.id]);
							if (item?.ack === false) {
								markAsReadUnread(item, false);
							}
						}}
					>
						{item?.subject}
					</Text>
				]
			}));
			setNotificationRows(allRows);
		} else {
			setNotificationRows([]);
		}
	}, [filterdNotification, handleClick, markAsReadUnread]);

	const copyNotificationOperation = useCallback(
		(notificationSelected: Notification) => {
			const notificationItem = `
			${t('label.date', 'Date')} : ${moment(notificationSelected?.date).format('DD-MM-YYYY - HH:mm A')} \n
			${t('label.type', 'Type')} : ${notificationSelected?.level} \n
			${t('label.what_inside', 'What’s inside?')} : ${notificationSelected?.subject} \n
			${t('label.content', 'Content')} : ${notificationSelected?.text}
		`;
			copyTextToClipboard(notificationItem);
			createSnackbar({
				key: 'success',
				severity: 'success',
				label: t('notification.copy_notification_successfully', 'Notification copied successfully'),
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
		},
		[t, createSnackbar]
	);

	const copyNotification = useCallback(() => {
		copyNotificationOperation(selectedNotification);
	}, [selectedNotification, copyNotificationOperation]);

	return (
		<Container background="gray6">
			<ListRow>
				<Container
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ left: isAddPadding ? 'large' : '' }}
				>
					{isShowTitle && (
						<Text size="large" weight="bold" color="gray0">
							{t('notification.notifications_list', 'Notifications’ List')}
						</Text>
					)}
				</Container>
				<Container mainAlignment="flex-end" crossAlignment="flex-end">
					<TabBar
						// @ts-ignore // Need to fix it with custom soultion
						items={items}
						selected={change}
						onChange={(ev: unknown, selectedId: string): void => {
							setChange(selectedId);
						}}
						onItemClick={setClick}
						underlineColor="primary"
					/>
				</Container>
			</ListRow>
			<ListRow>
				<Divider />
			</ListRow>
			{/* 
			Ac-589 Hide the Copy/Mark as Read buttons in the table until we'll have the multiple selection available
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
						onClick={copyNotification}
						disabled={isEmpty(selectedNotification)}
					/>
					<Padding left="large">
						<Button
							type="outlined"
							label={
								isEmpty(selectedNotification) || !selectedNotification?.ack
									? t('notification.mark_as_read', 'Mark as read')
									: t('notification.mark_as_unread', 'Mark as unread')
							}
							icon="EmailReadOutline"
							iconPlacement="right"
							color="primary"
							disabled={isRequestInProgress || isEmpty(selectedNotification)}
							loading={isRequestInProgress}
							onClick={(): void => {
								markAsReadUnread(selectedNotification);
							}}
							size="medium"
						/>
					</Padding>
				</Container>
			</ListRow> */}
			<ListRow>
				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					width="fill"
					maxHeight="calc(100vh - 21.25rem)"
					minHeight="auto"
					padding={{ all: isAddPadding ? 'large' : '' }}
				>
					<Table
						selectedRows={selectedRow}
						rows={notificationRows}
						headers={headers}
						showCheckbox={false}
						multiSelect={false}
						style={{ overflow: 'auto', height: '100%' }}
						RowFactory={CustomRowFactory}
						// @ts-ignore // Need to fix it with custom soultion
						HeaderFactory={CustomHeaderFactory}
					/>
				</Container>
			</ListRow>
			{showNotificationDetail && (
				<ModalOverlay open={showNotificationDetail}>
					<NotificationDetail
						notification={selectedNotification}
						setShowNotificationDetail={setShowNotificationDetail}
						copyNotificationOperation={copyNotificationOperation}
						markAsReadUnread={markAsReadUnread}
						isRequestInProgress={isRequestInProgress}
					/>
				</ModalOverlay>
			)}
		</Container>
	);
};

export default NotificationView;

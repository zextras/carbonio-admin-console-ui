/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, {
	FC,
	ReactElement,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState
} from 'react';

import {
	Container,
	Row,
	Text,
	Button,
	Divider,
	IconButton,
	DefaultTabBarItem,
	TabBar,
	Table,
	SnackbarManagerContext
} from '@zextras/carbonio-design-system';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import {
	CreateSnackbarType,
	MtaMailQueue,
	MtaMailQueueItem,
	MtaStats,
	mtaStats
} from '../../../../types';
import logo from '../../../assets/gardian.svg';
import {
	CORRUPT,
	DEFERRED,
	HOLD,
	INCOMING,
	ACTIVE,
	RELEASE,
	REQUEUE,
	DELETE,
	RECORD_DISPLAY_LIMIT
} from '../../../constants';
import { getMailQueue } from '../../../services/get-mail-queue';
import { getMailqueueInformation } from '../../../services/get-mail-queue-info';
import { mailQueueAction } from '../../../services/mail-queue-action';
import CustomHeaderFactory from '../../app/shared/customTableHeaderFactory';
import CustomRowFactory from '../../app/shared/customTableRowFactory';
import TrackNumberPerPage from '../../app/shared/track-number-per-page';
import Paging from '../../components/paging';

export const TableContainer = styled(Table)`
	width: auto;
	table {
		width: auto;
	}
`;

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
			mainAlignment="flex-end"
			crossAlignment="flex-end"
			padding={{ all: 'medium' }}
			width="100%"
		>
			<Container mainAlignment="flex-end" crossAlignment="flex-end" width="100%" height="auto">
				<Text size="small" weight="regular" color={selected ? 'primary' : 'gray'}>
					{item.label} ({item?.count})
				</Text>
			</Container>
		</Container>
	</DefaultTabBarItem>
);

const MTAStatsMail: FC<{
	serverState: mtaStats | undefined;
	updateMailCount: (stat: MtaStats) => void;
	closeDialogMail: (val?: boolean) => void;
	flushQueues: () => void;
	requestInprogress: boolean;
	flushRequestInProgress: boolean;
}> = ({
	serverState,
	updateMailCount,
	closeDialogMail,
	flushQueues,
	requestInprogress,
	flushRequestInProgress
}) => {
	const [t] = useTranslation();
	const createSnackbar: (options: CreateSnackbarType) => void = useContext(SnackbarManagerContext);
	const [change, setChange] = useState(ACTIVE);
	const [setClick] = useState('');
	const [selectedRow, setSelectedRow] = useState<Array<string>>([]);
	const [mailRows, setMailRows] = useState<Array<any>>([]);
	const [mailStatCount, setMailStatCount] = useState<Record<string, number>>({
		queued: serverState?.active ? parseInt(serverState?.active, 10) : 0,
		corrupted: serverState?.corrupt ? parseInt(serverState?.corrupt, 10) : 0,
		deferred: serverState?.deferred ? parseInt(serverState?.deferred, 10) : 0,
		incoming: serverState?.incoming ? parseInt(serverState?.incoming, 10) : 0,
		onhold: serverState?.hold ? parseInt(serverState?.hold, 10) : 0
	});
	const [mtaMailQueueRecords, setMtaMailQueueRecords] = useState<MtaMailQueue>();
	const [isMailQueueLoading, setIsMailQueueLoading] = useState<boolean>(false);
	const [holdInProgress, setHoldInProgress] = useState<boolean>(false);
	const [releaseInProgress, setReleaseInProgress] = useState<boolean>(false);
	const [requeueInProgress, setRequeueInProgress] = useState<boolean>(false);
	const [deleteInProgress, setDeleteInProgress] = useState<boolean>(false);
	const [offset, setOffset] = useState<number>(0);
	const [limit, setLimit] = useState<number>(RECORD_DISPLAY_LIMIT);
	const [totalAccount, setTotalAccount] = useState<number>(0);

	const items = useMemo(
		() => [
			{
				id: ACTIVE,
				label: t('mta.queued', 'Queued'),
				count: mailStatCount?.queued,
				CustomComponent: ReusedDefaultTabBar
			},
			{
				id: CORRUPT,
				label: t('mta.corrupted', 'Corrupted'),
				count: mailStatCount?.corrupted,
				CustomComponent: ReusedDefaultTabBar
			},
			{
				id: DEFERRED,
				label: t('mta.deferred', 'Deferred'),
				count: mailStatCount?.deferred,
				CustomComponent: ReusedDefaultTabBar
			},
			{
				id: INCOMING,
				label: t('mta.incoming', 'Incoming'),
				count: mailStatCount?.incoming,
				CustomComponent: ReusedDefaultTabBar
			},
			{
				id: HOLD,
				label: t('mta.onhold', 'On Hold'),
				count: mailStatCount?.onhold,
				CustomComponent: ReusedDefaultTabBar
			}
		],
		[t, mailStatCount]
	);

	type THeader = {
		id: string;
		label: string;
		align?: React.ThHTMLAttributes<HTMLTableHeaderCellElement>['align'];
		width?: string;
		i18nAllLabel?: string;
		bold?: boolean;
		items?: any;
	};

	const headers: THeader[] = useMemo(
		() => [
			{
				id: 'id',
				label: t('label.ID', 'ID'),
				width: '12%',
				bold: true
			},
			{
				id: 'arrivaltime',
				label: t('label.arrival_time', 'Arrival Time'),
				width: '12%',
				bold: true
			},
			{
				id: 'size',
				label: t('label.size_kb', 'Size (KB)'),
				width: '12%',
				bold: true
			},
			{
				id: 'fromdomain',
				label: t('label.from_domain', 'FromDomain'),
				width: '12%',
				bold: true
			},
			{
				id: 'todomain',
				label: t('label.to_domain', 'ToDomain'),
				width: '12%',
				bold: true
			},
			{
				id: 'sender',
				label: t('label.sender', 'Sender'),
				width: '12%',
				bold: true
			},
			{
				id: 'receiver',
				label: t('label.receiver', 'Receiver'),
				width: '12%',
				bold: true
			},
			{
				id: 'hostorigin',
				label: t('label.host_origin', 'Host (Origin)'),
				width: '12%',
				bold: true
			},
			{
				id: 'iporigin',
				label: t('label.ip_origin', 'IP (Origin)'),
				width: '12%',
				bold: true
			},
			{
				id: 'reason',
				label: t('label.reason', 'Reason'),
				width: '12%',
				bold: true
			},
			{
				id: 'filter',
				label: t('label.filter', 'Filter'),
				width: '12%',
				bold: true
			},
			{
				id: 'received',
				label: t('label.received', 'Received'),
				width: '12%',
				bold: true
			}
		],
		[t]
	);

	const setToTable = useCallback((qi: Array<MtaMailQueueItem>) => {
		if (qi.length === 0) {
			setMailRows([]);
		} else {
			const quotaData: Array<any> = [];
			qi.forEach((item: MtaMailQueueItem) => {
				quotaData.push({
					id: item?.id,
					columns: [
						<Container crossAlignment="flex-start" key={item?.id}>
							<Text color="gray0" weight="regular">
								{item?.id}
							</Text>
						</Container>,
						<Text color="gray0" weight="light" key={item?.id}>
							{moment(parseInt(item?.arrivalTime, 10)).format('DD/MM/YY - HH:mm')}
						</Text>,
						<Text color="gray0" weight="light" key={item?.id}>
							{item?.size}
						</Text>,
						<Text color="gray0" weight="light" key={item?.id}>
							{item?.fromDomain}
						</Text>,
						<Text color="gray0" weight="light" key={item?.id}>
							{item?.toDomain}
						</Text>,
						<Text color="gray0" weight="light" key={item?.id}>
							{item?.sender}
						</Text>,
						<Text color="gray0" weight="light" key={item?.id}>
							{item?.receiver}
						</Text>,
						<Text color="gray0" weight="light" key={item?.id}>
							{item?.host}
						</Text>,
						<Text color="gray0" weight="light" key={item?.id}>
							{item?.ip}
						</Text>,
						<Text color="gray0" weight="light" key={item?.id}>
							{item?.reason}
						</Text>,
						<Text color="gray0" weight="light" key={item?.id}>
							{item?.filter}
						</Text>,
						<Text color="gray0" weight="light" key={item?.id}>
							{item?.receiveid}
						</Text>
					]
				});
			});
			setMailRows(quotaData);
		}
	}, []);

	const setMailStateCountData = useCallback((queue) => {
		setMailStatCount({
			queued: queue.find((item: Record<string, string | number>) => item?.name === ACTIVE)?.n || 0,
			corrupted:
				queue.find((item: Record<string, string | number>) => item?.name === CORRUPT)?.n || 0,
			deferred:
				queue.find((item: Record<string, string | number>) => item?.name === DEFERRED)?.n || 0,
			incoming:
				queue.find((item: Record<string, string | number>) => item?.name === INCOMING)?.n || 0,
			onhold: queue.find((item: Record<string, string | number>) => item?.name === HOLD)?.n || 0
		});
	}, []);

	const getMailQueueCount = useCallback(() => {
		if (serverState?.serverName) {
			getMailqueueInformation(serverState?.serverName)
				.then((data) => {
					if (data && data?.server && Array.isArray(data?.server) && data?.server.length > 0) {
						const queue = data?.server[0]?.queue;
						if (queue && queue?.length > 0) {
							setMailStateCountData(queue);
						}
					}
				})
				.catch((error) => {
					createSnackbar({
						key: 'error',
						type: 'error',
						label: error
							? error?.error?.message
							: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				});
		}
	}, [createSnackbar, serverState?.serverName, setMailStateCountData, t]);

	const getMailFromMailQueue = useCallback(() => {
		setIsMailQueueLoading(true);
		getMailQueue(serverState?.serverName || '', change, offset, limit)
			.then((data) => {
				setIsMailQueueLoading(false);
				if (data?.server && Array.isArray(data?.server)) {
					const queue = data?.server[0]?.queue[0];
					if (queue?.total) {
						setTotalAccount(queue?.total);
					}
					const queueItem: Array<MtaMailQueueItem> = [];
					if (queue?.qi && Array.isArray(queue?.qi)) {
						queue?.qi.forEach((qItem: Record<string, string>) => {
							queueItem.push({
								arrivalTime: qItem?.time,
								filter: qItem?.filter,
								fromDomain: qItem?.fromdomain,
								host: qItem?.host,
								id: qItem?.id,
								ip: qItem?.ip || '',
								reason: qItem?.reason,
								receiveid: qItem?.received,
								receiver: qItem?.receiver || '',
								sender: qItem?.from,
								size: qItem?.size,
								toDomain: qItem?.todomain
							});
						});
					}
					const mailQueueData = {
						name: queue?.name,
						qi: queueItem,
						total: queue?.total
					};
					setMtaMailQueueRecords(mailQueueData);
					setToTable(queueItem);
				}
			})
			.catch((error) => {
				setIsMailQueueLoading(false);
				createSnackbar({
					key: 'error',
					type: 'error',
					label: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	}, [createSnackbar, limit, offset, change, serverState?.serverName, setToTable, t]);

	useEffect(() => {
		getMailQueueCount();
	}, [getMailQueueCount]);

	useEffect(() => {
		getMailFromMailQueue();
	}, [getMailFromMailQueue]);

	const callAllRequest = useCallback(
		(request) => {
			Promise.all(request)
				.then((response) => Promise.all(response))
				.then(() => {
					getMailFromMailQueue();
					getMailQueueCount();
					setSelectedRow([]);
					setHoldInProgress(false);
					setReleaseInProgress(false);
					setRequeueInProgress(false);
					setDeleteInProgress(false);
				});
		},
		[getMailFromMailQueue, getMailQueueCount]
	);

	const mailQueAction = useCallback(
		(operation) => {
			if (serverState?.serverName) {
				const request = selectedRow.map((item) =>
					mailQueueAction(serverState?.serverName, change, operation, item)
				);
				callAllRequest(request);
			}
		},
		[callAllRequest, change, selectedRow, serverState?.serverName]
	);

	const onHoldPress = useCallback(() => {
		setHoldInProgress(true);
		mailQueAction(HOLD);
	}, [mailQueAction]);

	const onReleasePress = useCallback(() => {
		setReleaseInProgress(true);
		mailQueAction(RELEASE);
	}, [mailQueAction]);

	const onRequeuePress = useCallback(() => {
		setRequeueInProgress(true);
		mailQueAction(REQUEUE);
	}, [mailQueAction]);

	const onDeletePress = useCallback(() => {
		setDeleteInProgress(true);
		mailQueAction(DELETE);
	}, [mailQueAction]);

	const closeDialog = useCallback(
		(closeDetailDialog?: boolean) => {
			updateMailCount({
				serverName: serverState?.serverName || '',
				incoming: mailStatCount.incoming.toString() || '0',
				active: mailStatCount.queued.toString() || '0',
				corrupt: mailStatCount?.corrupted.toString() || '0',
				deferred: mailStatCount?.deferred.toString() || '0',
				hold: mailStatCount?.onhold.toString() || '0',
				id: serverState?.id || ''
			});
			closeDialogMail(closeDetailDialog);
		},
		[
			closeDialogMail,
			mailStatCount?.corrupted,
			mailStatCount?.deferred,
			mailStatCount.incoming,
			mailStatCount?.onhold,
			mailStatCount.queued,
			serverState?.id,
			serverState?.serverName,
			updateMailCount
		]
	);

	return (
		<Container
			background="gray5"
			mainAlignment="flex-start"
			style={{
				position: 'absolute',
				top: '0rem',
				height: 'auto',
				width: '62rem',
				overflow: 'hidden',
				transition: 'left 0.2s ease-in-out',
				boxShadow: '-0.375rem 0.25rem 0.313rem 0 rgba(0, 0, 0, 0.1)',
				right: 0,
				background: 'red'
			}}
		>
			<Row
				mainAlignment="flex-start"
				crossAlignment="center"
				orientation="horizontal"
				background="white"
				width="fill"
				height="3.5rem"
			>
				<Row padding={{ horizontal: 'small' }}></Row>
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text size="medium" overflow="ellipsis" weight="bold">
						{serverState?.serverName}
					</Text>
				</Row>
				<Row></Row>
				<Row padding={{ right: 'extrasmall', left: 'small' }}>
					<IconButton size="medium" icon="CloseOutline" onClick={(): void => closeDialog(true)} />
				</Row>
			</Row>
			<Container>
				<Divider />
			</Container>
			<Container
				padding={{ all: 'extralarge' }}
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				height="calc(100vh - 3.5rem)"
				style={{ overflow: 'auto' }}
				background="white"
			>
				<Container mainAlignment="flex-end" crossAlignment="flex-end" height="auto" width="100%">
					<TabBar
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore // Need to fix it with custom soultion
						items={items}
						selected={change}
						onChange={(ev: unknown, selectedId: string): void => {
							setOffset(0);
							setTotalAccount(0);
							setChange(selectedId);
						}}
						onItemClick={setClick}
						underlineColor="primary"
						height="auto"
						width="auto"
					/>
				</Container>

				<Container
					height="auto"
					crossAlignment="flex-end"
					mainAlignment="flex-end"
					orientation="horizontal"
					padding={{ top: 'large', bottom: 'large' }}
				>
					<Container height="auto" width="auto" padding={{ right: 'medium' }}>
						<Button
							label={t('mta.hold', 'Hold')}
							color="primary"
							size="large"
							type="outlined"
							onClick={onHoldPress}
							loading={holdInProgress}
							disabled={holdInProgress || selectedRow.length === 0}
						/>
					</Container>
					<Container height="auto" width="auto" padding={{ right: 'medium' }}>
						<Button
							label={t('mta.release', 'Release')}
							color="primary"
							size="large"
							type="outlined"
							onClick={onReleasePress}
							loading={releaseInProgress}
							disabled={releaseInProgress || selectedRow.length === 0}
						/>
					</Container>
					<Container height="auto" width="auto" padding={{ right: 'medium' }}>
						<Button
							label={t('mta.requeue', 'Requeue')}
							color="primary"
							size="large"
							type="outlined"
							onClick={onRequeuePress}
							loading={requeueInProgress}
							disabled={requeueInProgress || selectedRow.length === 0}
						/>
					</Container>

					<Container height="auto" width="auto" padding={{ right: 'medium' }}>
						<Button
							label={t('label.delete', 'Delete')}
							color="error"
							size="large"
							type="outlined"
							onClick={onDeletePress}
							loading={deleteInProgress}
							disabled={deleteInProgress || selectedRow.length === 0}
						/>
					</Container>
					<Container height="auto" width="auto" padding={{ right: 'medium' }}>
						<Button
							label={t('mta.flush_queues', 'Flush queues')}
							color="primary"
							size="large"
							type="outlined"
							onClick={flushQueues}
							disabled={requestInprogress || flushRequestInProgress}
							loading={requestInprogress || flushRequestInProgress}
						/>
					</Container>
				</Container>

				<Container
					height="auto"
					style={{
						height: mailRows.length === 0 ? '10rem' : 'calc(100vh - 17.25rem)',
						position: 'relative'
					}}
				>
					<TableContainer
						selectedRows={selectedRow}
						rows={mailRows}
						headers={headers}
						onSelectionChange={(selected): void => {
							setSelectedRow(selected);
						}}
						style={{ overflow: 'auto', height: '100%', width: '100%' }}
						RowFactory={CustomRowFactory}
						HeaderFactory={CustomHeaderFactory}
					/>
					{isMailQueueLoading && (
						<Container
							crossAlignment="center"
							mainAlignment="flex-start"
							height="auto"
							style={{ position: 'absolute' }}
							padding={{ top: 'medium' }}
						>
							<Button type="ghost" color="primary" label="" loading onClick={(): null => null} />
						</Container>
					)}
				</Container>
				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					width="100%"
					height="auto"
					padding={{ top: 'medium' }}
				>
					<Container crossAlignment="flex-start">
						{mailRows && mailRows.length > 0 && (
							<Paging totalItem={totalAccount} setOffset={setOffset} pageSize={limit} />
						)}
					</Container>

					<Container crossAlignment="flex-end" orientation="horizontal" mainAlignment="flex-end">
						{mailRows && mailRows.length > 0 && <TrackNumberPerPage setPageSize={setLimit} />}
					</Container>
				</Container>
				{mailRows.length === 0 && !isMailQueueLoading && (
					<Container orientation="column" crossAlignment="center" mainAlignment="center">
						<Row>
							<img src={logo} alt="logo" />
						</Row>
						<Row
							padding={{ top: 'extralarge' }}
							orientation="vertical"
							crossAlignment="center"
							style={{ textAlign: 'center' }}
						>
							<Text weight="light" color="#828282" size="large" overflow="break-word">
								{t('label.this_list_is_empty', 'This list is empty.')}
							</Text>
						</Row>
					</Container>
				)}
			</Container>
		</Container>
	);
};
export default MTAStatsMail;

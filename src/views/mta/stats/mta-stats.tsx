/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	Container,
	Row,
	Text,
	Button,
	Divider,
	SnackbarManagerContext,
	Table
} from '@zextras/carbonio-design-system';
import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import ListRow from '../../list/list-row';
import CustomRowFactory from '../../app/shared/customTableRowFactory';
import CustomHeaderFactory from '../../app/shared/customTableHeaderFactory';
import { CreateSnackbarType, MtaStats, TRow } from '../../../../types';
import { getAllServerByService } from '../../../services/get-all-servers-service';
import { ACTIVE, CORRUPT, DEFERRED, HOLD, INCOMING, MTA } from '../../../constants';
import { getMailqueueInformation } from '../../../services/get-mail-queue-info';
import logo from '../../../assets/gardian.svg';
import ModalOverlay from '../../components/ModalOverlay';
import MTAStatsDetail from './mta-stats-detail';
import { mailQueueFlushByServer } from '../../../services/mail-queue-flush';

const MTAStats: FC = () => {
	const [t] = useTranslation();
	const createSnackbar: (options: CreateSnackbarType) => void = useContext(SnackbarManagerContext);
	const [serverTableRow, setServerTableRow] = useState<Array<TRow>>([]);
	const [selectedServer, setSelectedServer] = useState<Array<string>>([]);
	const [mtaServerList, setMtaServerList] = useState<Array<Record<string, string>>>([]);
	const [mailServerStats, setMailServerStats] = useState<Array<MtaStats>>([]);
	const [requestInprogress, setRequestInprogress] = useState<boolean>(false);
	const [showMtaStatDetail, setShowMtaStatDetail] = useState<boolean>(false);
	const [currentTime, setCurrentTime] = useState<string | Date>('');
	const [flushRequestInProgress, setFlushRequestInProgress] = useState<boolean>(false);

	const serverHeader = useMemo(
		() => [
			{
				id: 'mail_server',
				label: t('mta.mail_server', 'Mail Server'),
				width: '40%',
				bold: true
			},
			{
				id: 'queued',
				label: t('mta.queued', 'Queued'),
				width: '12%',
				bold: true
			},
			{
				id: 'corrupt',
				label: t('mta.corrupt', 'Corrupt'),
				width: '12%',
				bold: true
			},
			{
				id: 'deferred',
				label: t('mta.deferred', 'Deferred'),
				width: '12%',
				bold: true
			},
			{
				id: 'incoming',
				label: t('mta.incoming', 'Incoming'),
				width: '12%',
				bold: true
			},
			{
				id: 'hold',
				label: t('mta.hold', 'Hold'),
				width: '12%',
				bold: true
			}
		],
		[t]
	);

	useMemo(() => {
		if (selectedServer && selectedServer.length > 0) {
			setShowMtaStatDetail(true);
		} else {
			setShowMtaStatDetail(false);
		}
	}, [selectedServer]);

	useMemo(() => {
		if (mailServerStats.length > 0) {
			const list: any[] = [];
			mailServerStats.forEach((item: MtaStats) => {
				list.push({
					id: item?.id,
					columns: [
						<Container
							crossAlignment="flex-start"
							key={item?.id}
							style={{ cursor: 'pointer' }}
							onClick={(): void => {
								setSelectedServer([item?.id]);
							}}
						>
							<Text size="small" weight="regular" key={`${item?.id}display-child`} color="gray0">
								{item?.serverName}
							</Text>
						</Container>,
						<Container
							crossAlignment="flex-start"
							key={item?.id}
							style={{ cursor: 'pointer' }}
							onClick={(): void => {
								setSelectedServer([item.id]);
							}}
						>
							<Text size="small" weight="regular" key={`${item?.id}display-child`} color="gray0">
								{item?.active}
							</Text>
						</Container>,
						<Container
							crossAlignment="flex-start"
							key={item?.id}
							style={{ cursor: 'pointer' }}
							onClick={(): void => {
								setSelectedServer([item?.id]);
							}}
						>
							<Text size="small" weight="regular" key={`${item?.id}display-child`} color="gray0">
								{item?.corrupt}
							</Text>
						</Container>,
						<Container
							crossAlignment="flex-start"
							key={item?.id}
							style={{ cursor: 'pointer' }}
							onClick={(): void => {
								setSelectedServer([item?.id]);
							}}
						>
							<Text size="small" weight="regular" key={`${item?.id}display-child`} color="gray0">
								{item?.deferred}
							</Text>
						</Container>,
						<Container
							crossAlignment="flex-start"
							key={item?.id}
							style={{ cursor: 'pointer' }}
							onClick={(): void => {
								setSelectedServer([item?.id]);
							}}
						>
							<Text size="small" weight="regular" key={`${item?.id}display-child`} color="gray0">
								{item?.incoming}
							</Text>
						</Container>,
						<Container
							crossAlignment="flex-start"
							key={item?.id}
							style={{ cursor: 'pointer' }}
							onClick={(): void => {
								setSelectedServer([item?.id]);
							}}
						>
							<Text size="small" weight="regular" key={`${item?.id}display-child`} color="gray0">
								{item?.hold}
							</Text>
						</Container>
					]
				});
			});
			setCurrentTime(new Date());
			setServerTableRow(list);
		} else {
			setServerTableRow([]);
		}
	}, [mailServerStats]);

	const scanServer = useCallback(() => {
		setMailServerStats([]);
		mtaServerList.forEach((item) => {
			setRequestInprogress(true);
			getMailqueueInformation(item?.name)
				.then((data) => {
					setRequestInprogress(false);
					if (data && data?.server && Array.isArray(data?.server) && data?.server.length > 0) {
						data?.server.forEach((queueInfo: any) => {
							setMailServerStats((prev) => [
								...prev,
								...[
									{
										id: item?.id,
										serverName: item?.name,
										active: queueInfo?.queue.find(
											(info: Record<string, string>) => info?.name === ACTIVE
										)?.n,
										corrupt: queueInfo?.queue.find(
											(info: Record<string, string>) => info?.name === CORRUPT
										)?.n,
										deferred: queueInfo?.queue.find(
											(info: Record<string, string>) => info?.name === DEFERRED
										)?.n,
										hold: queueInfo?.queue.find(
											(info: Record<string, string>) => info?.name === HOLD
										)?.n,
										incoming: queueInfo?.queue.find(
											(info: Record<string, string>) => info?.name === INCOMING
										)?.n
									}
								]
							]);
						});
					}
				})
				.catch((error) => {
					setRequestInprogress(false);
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
		});
	}, [createSnackbar, mtaServerList, t]);

	useEffect(() => {
		if (mtaServerList?.length > 0) {
			scanServer();
		}
	}, [mtaServerList, scanServer]);

	const getAllMTAServers = useCallback(() => {
		setRequestInprogress(true);
		getAllServerByService(MTA)
			.then((data) => {
				setRequestInprogress(false);
				if (data && data?.server && Array.isArray(data?.server) && data?.server.length > 0) {
					const serverList = data?.server;
					const list: Array<Record<string, string>> = [];
					serverList.forEach((item: Record<string, string>) => {
						list.push({ id: item?.id, name: item?.name });
					});
					setMtaServerList(list);
				}
			})
			.catch((error) => {
				setRequestInprogress(false);
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
	}, [createSnackbar, t]);

	useEffect(() => {
		getAllMTAServers();
	}, [getAllMTAServers]);

	const flushQueues = useCallback(() => {
		const flushRequest: any[] = [];
		if (showMtaStatDetail) {
			const serverName = mtaServerList.find((item) => item?.id === selectedServer[0])?.name;
			if (serverName) {
				flushRequest.push(mailQueueFlushByServer(serverName));
			}
		} else {
			mailServerStats.forEach((item: MtaStats) => {
				flushRequest.push(mailQueueFlushByServer(item?.serverName));
			});
		}

		if (flushRequest && flushRequest.length > 0) {
			setFlushRequestInProgress(true);
			Promise.all(flushRequest)
				.then((response) => Promise.all(response))
				.then(() => {
					setFlushRequestInProgress(false);
					let updatedItem: Array<MtaStats> = [];
					if (showMtaStatDetail) {
						updatedItem = mailServerStats.map((item: MtaStats) => {
							if (item?.id === selectedServer[0]) {
								return {
									active: '-',
									corrupt: '-',
									deferred: '-',
									hold: '-',
									incoming: '-',
									id: item?.id,
									serverName: item?.serverName
								};
							}
							return item;
						});
					} else {
						updatedItem = mailServerStats.map((item: MtaStats) => ({
							active: '-',
							corrupt: '-',
							deferred: '-',
							hold: '-',
							incoming: '-',
							id: item?.id,
							serverName: item?.serverName
						}));
					}
					setSelectedServer([]);
					setShowMtaStatDetail(false);
					setMailServerStats(updatedItem);
					createSnackbar({
						key: 'success',
						type: 'success',
						label: t('mta.mail_queue_flush_successfully', 'Mail queue flush successfully'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				});
		}
	}, [mailServerStats, mtaServerList, selectedServer, showMtaStatDetail, t, createSnackbar]);

	const updateMailCount = useCallback(
		(state: MtaStats) => {
			let updatedItem: Array<MtaStats> = [];
			updatedItem = mailServerStats.map((item: MtaStats) => {
				if (item?.id === state?.id) {
					return {
						active: state?.active,
						corrupt: state?.corrupt,
						deferred: state?.deferred,
						hold: state?.hold,
						incoming: state?.incoming,
						id: item?.id,
						serverName: state?.serverName
					};
				}
				return item;
			});
			setMailServerStats(updatedItem);
		},
		[mailServerStats]
	);

	return (
		<Container background="gray6" mainAlignment="flex-start">
			<Row
				mainAlignment="flex-start"
				crossAlignment="center"
				orientation="horizontal"
				background="gray6"
				width="fill"
				height="3.5rem"
			>
				<Row padding={{ horizontal: 'small' }}></Row>
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text size="medium" overflow="ellipsis" weight="bold">
						{t('mta.queue', 'Queue')}
					</Text>
				</Row>
				<Row></Row>
			</Row>
			<ListRow>
				<Divider />
			</ListRow>
			<Container
				padding={{ all: 'extralarge' }}
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				height="calc(100vh - 10.5rem)"
				style={{ overflow: 'auto' }}
			>
				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					padding={{ bottom: 'extralarge' }}
					height="auto"
				>
					<Container
						crossAlignment="flex-start"
						padding={{ right: 'medium' }}
						orientation="horizontal"
						mainAlignment="flex-end"
						width="65%"
					>
						<Container
							crossAlignment="center"
							padding={{ right: 'extralarge' }}
							orientation="horizontal"
							mainAlignment="center"
							width="auto"
						>
							<Container mainAlignment="flex-start" crossAlignment="flex-start" height="auto">
								<Text size="small" overflow="ellipsis" weight="bold">
									{t('mta.updated_at', 'Updated at')}:
								</Text>
							</Container>
							<Container mainAlignment="flex-start" crossAlignment="flex-start" height="auto">
								<Text size="small" overflow="ellipsis">
									&nbsp;
									{currentTime === '' ? '-' : moment(currentTime).format('HH:mm:ss MM dddd YYYY')}
								</Text>
							</Container>
						</Container>
						<Container
							crossAlignment="center"
							padding={{ right: 'extralarge' }}
							orientation="horizontal"
							mainAlignment="flex-end"
							width="auto"
						>
							<Container mainAlignment="flex-start" crossAlignment="flex-start" height="auto">
								<Text size="small" overflow="ellipsis" weight="bold">
									{t('mta.status', 'Status')}:
								</Text>
							</Container>
							<Container mainAlignment="flex-start" crossAlignment="flex-start" height="auto">
								<Text size="small" overflow="ellipsis">
									&nbsp;
									{requestInprogress
										? t('mta.scan_in_progress', 'Scan In progress')
										: t('mta.scan_completed', 'Scan Completed')}
								</Text>
							</Container>
						</Container>
					</Container>
					<Container
						crossAlignment="flex-end"
						orientation="horizontal"
						mainAlignment="flex-end"
						width="35%"
					>
						<Container
							crossAlignment="flex-start"
							height="auto"
							width="fit"
							padding={{ right: 'medium' }}
						>
							<Button
								type="outlined"
								size="medium"
								label={t('mta.restart_scan', 'Restart Scan')}
								color="primary"
								onClick={scanServer}
								disabled={mtaServerList.length === 0 || requestInprogress}
								loading={requestInprogress}
							/>
						</Container>
						<Container crossAlignment="flex-start" height="auto" width="fit">
							<Button
								type="outlined"
								size="medium"
								label={t('mta.flush_queues', 'Flush queues')}
								color="primary"
								onClick={flushQueues}
								disabled={mtaServerList.length === 0 || flushRequestInProgress || requestInprogress}
								loading={requestInprogress || flushRequestInProgress}
							/>
						</Container>
					</Container>
				</Container>
				<Container
					crossAlignment="center"
					height="auto"
					padding={{ top: 'medium', bottom: 'large' }}
				>
					<Text size="small" overflow="ellipsis" weight="light">
						{t('mta.select_a_mail_server_to_see_stats', 'Select a mail server to see its stats')}
					</Text>
				</Container>
				<Container mainAlignment="flex-start" crossAlignment="flex-start" height="auto">
					<Table
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore // Need to fix it with custom soultion
						rows={serverTableRow}
						headers={serverHeader}
						multiSelect={false}
						selectedRows={selectedServer}
						showCheckbox={false}
						RowFactory={CustomRowFactory}
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore // Need to fix it with custom soultion
						HeaderFactory={CustomHeaderFactory}
					/>
					{requestInprogress && (
						<Container
							crossAlignment="center"
							mainAlignment="center"
							height="auto"
							padding={{ top: 'large' }}
						>
							<Button type="ghost" color="primary" label="" loading onClick={(): null => null} />
						</Container>
					)}
					{mtaServerList.length === 0 && !requestInprogress && (
						<Container
							orientation="column"
							crossAlignment="center"
							mainAlignment="center"
							padding={{ top: 'large' }}
						>
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
					{selectedServer && selectedServer.length > 0 && (
						<ModalOverlay setOpen={setShowMtaStatDetail} open={showMtaStatDetail}>
							<MTAStatsDetail
								serverState={mailServerStats.find((item) => item?.id === selectedServer[0])}
								setSelectedServer={setSelectedServer}
								flushQueues={flushQueues}
								requestInprogress={requestInprogress}
								flushRequestInProgress={flushRequestInProgress}
								updateCount={updateMailCount}
							/>
						</ModalOverlay>
					)}
				</Container>
			</Container>
		</Container>
	);
};
export default MTAStats;

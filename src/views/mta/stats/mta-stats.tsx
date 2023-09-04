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
import { TRow, mtaStats } from '../../../../types';
import { getAllServerByService } from '../../../services/get-all-servers-service';
import { ACTIVE, CORRUPT, DEFERRED, HOLD, INCOMING, MTA } from '../../../constants';
import { getMailqueueInformation } from '../../../services/get-mail-queue-info';
import logo from '../../../assets/gardian.svg';
import ModalOverlay from '../../components/ModalOverlay';
import MTAStatsDetail from './mta-stats-detail';

const MTAStats: FC = () => {
	const [t] = useTranslation();
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const [serverTableRow, setServerTableRow] = useState<Array<TRow>>([]);
	const [selectedServer, setSelectedServer] = useState<any[]>([]);
	const [mtaServerList, setMtaServerList] = useState<Array<Record<string, string>>>([]);
	const [mailServerStats, setMailServerStats] = useState<Array<mtaStats>>([]);
	const [requestInprogress, setRequestInprogress] = useState<boolean>(false);
	const [showMtaStatDetail, setShowMtaStatDetail] = useState<boolean>(false);
	const [currentTime, setCurrentTime] = useState<string | Date>('');

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
			mailServerStats.forEach((item: mtaStats) => {
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
		mtaServerList.forEach((item: any) => {
			setRequestInprogress(true);
			getMailqueueInformation(item?.name).then((data: any) => {
				setRequestInprogress(false);
				if (data && data?.server && Array.isArray(data?.server) && data?.server.length > 0) {
					data?.server.forEach((queueInfo: any) => {
						setMailServerStats((prev: any) => [
							...prev,
							...[
								{
									id: item?.id,
									serverName: item?.name,
									active: queueInfo?.queue.find((info: any) => info?.name === ACTIVE)?.n,
									corrupt: queueInfo?.queue.find((info: any) => info?.name === CORRUPT)?.n,
									deferred: queueInfo?.queue.find((info: any) => info?.name === DEFERRED)?.n,
									hold: queueInfo?.queue.find((info: any) => info?.name === HOLD)?.n,
									incoming: queueInfo?.queue.find((info: any) => info?.name === INCOMING)?.n
								}
							]
						]);
					});
				}
			});
		});
	}, [mtaServerList]);

	useEffect(() => {
		if (mtaServerList?.length > 0) {
			scanServer();
		}
	}, [mtaServerList, scanServer]);

	const getAllMTAServers = useCallback(() => {
		setRequestInprogress(true);
		getAllServerByService(MTA)
			.then((data: any) => {
				setRequestInprogress(false);
				if (data && data?.server && Array.isArray(data?.server) && data?.server.length > 0) {
					const serverList = data?.server;
					const list: Array<Record<string, string>> = [];
					serverList.forEach((item: any) => {
						list.push({ id: item?.id, name: item?.name });
					});
					setMtaServerList(list);
				}
			})
			.catch((error: any) => {
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

	const flushQueues = useCallback(() => {
		console.log('FLUSH');
	}, []);

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
						{t('mta.stats', 'Stats')}
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
									{currentTime === '' ? '...' : moment(currentTime).format('HH:mm:ss MM dddd YYYY')}
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
						mainAlignment="flex-start"
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
								size="large"
								label={t('mta.restart_scan', 'Restart Scan')}
								color="primary"
								onClick={scanServer}
								disabled={mtaServerList.length === 0 || requestInprogress}
								loading={requestInprogress}
							/>
						</Container>
						<Container
							crossAlignment="flex-start"
							height="auto"
							width="fit"
							padding={{ right: 'large' }}
						>
							<Button
								type="outlined"
								size="large"
								label={t('mta.flush_queues', 'Flush queues')}
								color="primary"
								onClick={flushQueues}
								disabled={mtaServerList.length === 0 || requestInprogress}
								loading={requestInprogress}
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
							/>
						</ModalOverlay>
					)}
				</Container>
			</Container>
		</Container>
	);
};
export default MTAStats;

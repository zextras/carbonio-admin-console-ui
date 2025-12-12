/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	getSoapFetchRequest,
	useIsAdvanced,
	useMailstoreServers
} from '@zextras/admin-ui-bootstrap';
import {
	Button,
	Container,
	Divider,
	Icon,
	Input,
	Row,
	Table,
	Text} from '@zextras/carbonio-design-system';
import { TFunction } from 'i18next';
import { ChangeEvent, FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import {
	DESCRIPTION,
	HSM_SCHEDULED_KEY,
	INDEXER_MANAGER_KEY,
	ZIMBRA_ADMIN_URN
} from '../../../constants';
import { fetchSoap } from '../../../services/bucket-service';
import CustomHeaderFactory from '../../app/shared/customTableHeaderFactory';
import CustomRowFactory from '../../app/shared/customTableRowFactory';
import { headerAdvanced } from '../../utility/utils';

const RelativeContainer = styled(Container)`
	position: relative;
`;

const ServersListTable: FC<{
	volumes: Array<any>;
	headers: any;
	isAdvanced: any;
	t: TFunction;
	isRequestInProgress: boolean;
}> = ({ volumes, headers, isAdvanced, t, isRequestInProgress }) => {
	const tableRowsAdvance = useMemo(
		() =>
			volumes.map((v, i) => ({
				id: i?.toString(),
				columns: [
					// eslint-disable-next-line sonarjs/no-duplicate-string
					<Row style={{ textAlign: 'left', justifyContent: 'flex-start' }} key={i}>
						<Text size="small" weight="regular">
							{v?.name}
						</Text>
					</Row>,
					<Row
						key={i}
						style={{
							textAlign: 'left',
							justifyContent: 'flex-start',
							textTransform: 'capitalize'
						}}
					>
						<Text size="small" weight="light">
							{v?.primaries}
						</Text>
					</Row>,
					<Row
						key={i}
						style={{
							textAlign: 'left',
							justifyContent: 'flex-start',
							textTransform: 'capitalize'
						}}
					>
						<Text size="small" weight="light">
							{v?.secondaries}
						</Text>
					</Row>,
					<Row
						key={i}
						style={{
							textAlign: 'left',
							justifyContent: 'flex-start',
							textTransform: 'capitalize'
						}}
					>
						<Text size="small" weight="light">
							{v?.indexes}
						</Text>
					</Row>,
					<Row
						key={i}
						style={{
							textAlign: 'left',
							justifyContent: 'flex-start',
							textTransform: 'capitalize'
						}}
					>
						<Text size="small" weight="light">
							{v?.hsmScheduled
								? t('label.scheduled', 'Scheduled')
								: t('label.disabled', 'Disabled')}
						</Text>
					</Row>,
					<Row
						key={i}
						style={{
							textAlign: 'left',
							justifyContent: 'flex-start',
							textTransform: 'capitalize'
						}}
					>
						<Text size="small" weight="light">
							{v.indexer?.running === true
								? t('volume.running', 'Running')
								: t('volume.not_running', 'Not Running')}
						</Text>
					</Row>,
					<Row
						key={i}
						style={{
							textAlign: 'left',
							justifyContent: 'flex-start',
							textTransform: 'capitalize'
						}}
					>
						<Text size="small" weight="light">
							{v?.description}
						</Text>
					</Row>
				],
				clickable: true
			})),
		[volumes, t]
	);

	const tableRowCe = useMemo(
		() =>
			volumes.map((v, i) => ({
				id: i?.toString(),
				columns: [
					<Row style={{ textAlign: 'left', justifyContent: 'flex-start' }} key={i}>
						<Text size="small" weight="regular">
							{v?.name}
						</Text>
					</Row>,
					<Row
						key={i}
						style={{
							textAlign: 'left',
							justifyContent: 'flex-start',
							textTransform: 'capitalize'
						}}
					>
						<Text size="small" weight="light">
							{v?.description}
						</Text>
					</Row>
				],
				clickable: true
			})),
		[volumes]
	);

	return (
		<Container crossAlignment="flex-start">
			<Table
				headers={headers}
				rows={isAdvanced ? tableRowsAdvance : tableRowCe}
				showCheckbox={false}
				multiSelect={false}
				RowFactory={CustomRowFactory}
				HeaderFactory={CustomHeaderFactory}
			/>
			{isRequestInProgress && (
				<Container
					crossAlignment="center"
					mainAlignment="center"
					height="fit"
					padding={{ top: 'medium' }}
				>
					<Button type="ghost" label={''} loading onClick={(): null => null} />
				</Container>
			)}
			{(tableRowsAdvance.length === 0 || tableRowCe.length === 0) && !isRequestInProgress && (
				<Row padding={{ top: 'extralarge', horizontal: 'extralarge' }} width="fill">
					<Text>{t('label.this_list_is_empty', 'This list is empty.')}</Text>
				</Row>
			)}
		</Container>
	);
};

const ServerDetailPanel: FC = () => {
	const [t] = useTranslation();
	const { data: allServersList = [] } = useMailstoreServers();
	const isAdvanced = useIsAdvanced();
	const [serversList, setServersList] = useState<any>([]);
	const [serverListAll, setServerListAll] = useState<any>([]);
	const serverHeaderAdvanced = useMemo(() => headerAdvanced(t), [t]);
	const [searchServer, setSearchServer] = useState<string>('');
	const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);

	const getServersListType = useCallback((): void => {
		if (isAdvanced) {
			setIsRequestInProgress(true);
			fetchSoap('zextras', {
				_jsns: ZIMBRA_ADMIN_URN,
				module: 'ZxPowerstore',
				action: 'getAllVolumes',
				targetServers: 'all_servers'
			})
				.then((res: any) => {
					setIsRequestInProgress(true);
					getSoapFetchRequest(
						`/service/extension/zextras_admin/core/getAllServers?module=zxpowerstore`
					)
						.then((powerStoreData: any) => {
							setIsRequestInProgress(false);
							const powerStoreServer = powerStoreData?.servers.map((s: any) => Object.values(s)[0]);
							const responseData = JSON.parse(res?.Body?.response?.content);

							if (responseData && responseData.ok) {
								if (allServersList.length > 0) {
									const serverList = allServersList.map((item) => {
										let primaries = '';
										let secondaries = '';
										let indexes = '';
										let description = '';
										let indexer = '';
										let hsmScheduled = '';
										const findPowerStoreServer = powerStoreServer?.find(
											(s: any) => s.name === item?.name
										);
										if (findPowerStoreServer) {
											indexer = findPowerStoreServer?.ZxPowerstore?.services?.[INDEXER_MANAGER_KEY];
											hsmScheduled =
												findPowerStoreServer?.ZxPowerstore?.attributes?.powerstoreMoveScheduler
													?.value?.[HSM_SCHEDULED_KEY];
										}
										if (
											responseData &&
											responseData?.response &&
											item.name &&
											responseData?.response[item.name]
										) {
											const data = responseData?.response[item.name]?.response;
											if (data) {
												primaries = data?.primaries.length;
												secondaries = data?.secondaries.length;
												indexes = data?.indexes.length;
												const descriptionData = item?.a?.filter(
													(items: any) => items?.n === DESCRIPTION
												);
												if (descriptionData && descriptionData.length > 0) {
													description = descriptionData[0]?._content || '';
												}
											}
										}
										return {
											name: item.name,
											primaries,
											secondaries,
											indexes,
											hsmScheduled,
											indexer,
											description
										};
									});
									setServersList(serverList);
									setServerListAll(serverList);
								}
							}
						})
						.catch((error: any) => {
							setIsRequestInProgress(false);
						});
				})
				.catch((error: any) => {
					setIsRequestInProgress(false);
				});
		} else if (!isAdvanced) {
			if (allServersList.length > 0) {
				const serverList = allServersList.map((item) => {
					let description = '';
					const descriptionData = item?.a?.filter((items: any) => items?.n === DESCRIPTION);
					if (descriptionData && descriptionData.length > 0) {
						description = descriptionData[0]?._content || '';
					}
					return {
						name: item.name,
						description
					};
				});
				setServersList(serverList);
				setServerListAll(serverList);
			}
		}
	}, [allServersList, isAdvanced]);

	useEffect(() => {
		getServersListType();
	}, [getServersListType]);

	const headerCE: any[] = useMemo(
		() => [
			{
				id: 'Server',
				label: t('volume.server_list_header.server', 'Server'),
				i18nAllLabel: 'All',
				width: '60%',
				bold: true
			},
			{
				id: 'Description',
				label: t('volume.server_list_header.description', 'Description'),
				i18nAllLabel: 'All',
				width: '30%',
				bold: true
			}
		],
		[t]
	);

	useEffect(() => {
		const fildterdServer = serverListAll.filter((item: any) => item.name.includes(searchServer));
		setServersList(fildterdServer);
	}, [searchServer, serverListAll]);

	return (
		<>
			<RelativeContainer
				orientation="column"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				style={{ overflowY: 'auto' }}
				background="white"
			>
				<Row mainAlignment="flex-start" padding={{ all: 'large' }}>
					<Text size="extralarge" weight="bold">
						{t('buckets.servers_list', 'Servers List')}
					</Text>
				</Row>
				<Divider />
				<Container
					orientation="column"
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					width="100%"
					height="calc(100vh - 200px)"
					padding={{ top: 'extralarge', right: 'large', bottom: 'large', left: 'large' }}
				>
					<Row mainAlignment="flex-start" width="100%">
						<Container height="fit" crossAlignment="flex-start" background="gray6">
							<Row
								orientation="horizontal"
								mainAlignment="space-between"
								crossAlignment="flex-start"
								width="fill"
								padding={{ top: 'small', bottom: 'large' }}
							>
								<Container>
									<Input
										disabled={serversList.length === 0 && searchServer.length === 0}
										label={t('label.search_for_a_Server', `Search for a Server`)}
										backgroundColor="gray5"
										CustomIcon={(): any => (
											<Icon icon="FunnelOutline" size="large" color="primary" />
										)}
										value={searchServer}
										onChange={(e: ChangeEvent<HTMLInputElement>): void => {
											setSearchServer(e.target.value);
										}}
									/>
								</Container>
							</Row>
						</Container>
					</Row>
					<Row width="100%">
						<ServersListTable
							volumes={serversList}
							headers={isAdvanced ? serverHeaderAdvanced : headerCE}
							isAdvanced={isAdvanced}
							t={t}
							isRequestInProgress={isRequestInProgress}
						/>
					</Row>
				</Container>
			</RelativeContainer>
		</>
	);
};

export default ServerDetailPanel;

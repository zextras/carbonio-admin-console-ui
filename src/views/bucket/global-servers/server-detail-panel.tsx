/* eslint-disable react-hooks/rules-of-hooks */
/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Container, Row, Text, Divider, Input, Icon, Table } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	getSoapFetchRequest
} from '@zextras/carbonio-shell-ui';
import { fetchSoap } from '../../../services/bucket-service';
import { useBucketServersListStore } from '../../../store/bucket-server-list/store';
import { useAuthIsAdvanced } from '../../../store/auth-advanced/store';
import { headerAdvanced, headerCE } from '../../utility/utils';
import {
	DESCRIPTION,
	HSM_SCHEDULED_DISABLED,
	HSM_SCHEDULED_ENABLED,
	HSM_SCHEDULED_KEY,
	INDEXER_ACTIVE,
	INDEXER_MANAGER_KEY,
	INDEXER_PAUSED,
	INDEXER_RUNNING
} from '../../../constants';

const RelativeContainer = styled(Container)`
	position: relative;
`;

const ServersListTable: FC<{
	volumes: Array<any>;
	headers: any;
	isAdvanced: any;
	selectedRows: any;
	onSelectionChange: any;
}> = ({ volumes, headers, isAdvanced, selectedRows, onSelectionChange }) => {
	const tableRows = !isAdvanced
		? useMemo(
				() =>
					volumes.map((v, i) => ({
						id: i?.toString(),
						columns: [
							<Row style={{ textAlign: 'left', justifyContent: 'flex-start' }} key={i}>
								{v?.name}
							</Row>,
							<Row
								key={i}
								style={{
									textAlign: 'left',
									justifyContent: 'flex-start',
									textTransform: 'capitalize'
								}}
							>
								{v?.primaries}
							</Row>,
							<Row
								key={i}
								style={{
									textAlign: 'left',
									justifyContent: 'flex-start',
									textTransform: 'capitalize'
								}}
							>
								{v?.indexes}
							</Row>,
							<Row
								key={i}
								style={{
									textAlign: 'left',
									justifyContent: 'flex-start',
									textTransform: 'capitalize'
								}}
							>
								{v?.description}
							</Row>
						],
						clickable: true
					})),
				[volumes]
		  )
		: useMemo(
				() =>
					volumes.map((v, i) => ({
						id: i?.toString(),
						columns: [
							<Row style={{ textAlign: 'left', justifyContent: 'flex-start' }} key={i}>
								{v?.name}
							</Row>,
							<Row
								key={i}
								style={{
									textAlign: 'left',
									justifyContent: 'flex-start',
									textTransform: 'capitalize'
								}}
							>
								{v?.primaries}
							</Row>,
							<Row
								key={i}
								style={{
									textAlign: 'left',
									justifyContent: 'flex-start',
									textTransform: 'capitalize'
								}}
							>
								{v?.secondaries}
							</Row>,
							<Row
								key={i}
								style={{
									textAlign: 'left',
									justifyContent: 'flex-start',
									textTransform: 'capitalize'
								}}
							>
								{v?.indexes}
							</Row>,
							<Row
								key={i}
								style={{
									textAlign: 'left',
									justifyContent: 'flex-start',
									textTransform: 'capitalize'
								}}
							>
								{v?.hsmScheduled ? HSM_SCHEDULED_ENABLED : HSM_SCHEDULED_DISABLED}
							</Row>,
							<Row
								key={i}
								style={{
									textAlign: 'left',
									justifyContent: 'flex-start',
									textTransform: 'capitalize'
								}}
							>
								{(v.indexer?.could_start && INDEXER_ACTIVE) ||
									(v.indexer?.could_stop && INDEXER_PAUSED) ||
									(v.indexer?.running && INDEXER_RUNNING)}
							</Row>,
							<Row
								key={i}
								style={{
									textAlign: 'left',
									justifyContent: 'flex-start',
									textTransform: 'capitalize'
								}}
							>
								{v?.description}
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
				rows={tableRows}
				showCheckbox={false}
				multiSelect={false}
				selectedRows={selectedRows}
				onSelectionChange={onSelectionChange}
			/>
			{tableRows.length === 0 && (
				<Row padding={{ top: 'extralarge', horizontal: 'extralarge' }} width="fill">
					<Text>Empty Table</Text>
				</Row>
			)}
		</Container>
	);
};

const serverDetailPanel: FC = () => {
	const [t] = useTranslation();
	const allServersList = useBucketServersListStore((state) => state.allServersList);
	const isAdvanced = useAuthIsAdvanced((state) => state.isAdvanced);
	const [serversList, setServersList] = useState<any>([]);
	const [serverSelection, setserverSelection] = useState([]);
	const serverHeaderAdvanced = useMemo(() => headerAdvanced(t), [t]);
	const serverHeaderCE = useMemo(() => headerCE(t), [t]);

	const getServersListType = useCallback(
		(service): void => {
			fetchSoap('zextras', {
				_jsns: 'urn:zimbraAdmin',
				module: 'ZxPowerstore',
				action: 'getAllVolumes',
				targetServers: 'all_servers'
			}).then((res) => {
				const responseData = JSON.parse(res.Body.response.content);
				if (responseData.ok) {
					if (allServersList.length !== 0) {
						if (!isAdvanced) {
							const serverList = allServersList.map((item) => {
								const data = responseData.response[item.name].response;
								const primaries = data.primaries.length;
								const secondaries = data.secondaries.length;
								const indexes = data.indexes.length;
								const description = item?.a.filter((items: any) => items?.n === DESCRIPTION);
								return {
									name: item.name,
									primaries,
									secondaries,
									indexes,
									description: description?.length !== 0 ? description[0]._content : ''
								};
							});
							setServersList(serverList);
						} else {
							getSoapFetchRequest(
								`/service/extension/zextras_admin/core/getAllServers?module=zxpowerstore`
							).then((data: any) => {
								const serverList = allServersList.map((item) => {
									const advacnedData = responseData.response[item.name].response;
									const primaries = advacnedData.primaries.length;
									const secondaries = advacnedData.secondaries.length;
									const indexes = advacnedData.indexes.length;
									const description = item?.a.filter((items: any) => items?.n === DESCRIPTION);
									const indexer =
										data?.servers[0]?.[item?.id]?.ZxPowerstore?.services?.[INDEXER_MANAGER_KEY];
									const hsmScheduled =
										data?.servers[0]?.[item?.id]?.ZxPowerstore?.attributes?.powerstoreMoveScheduler
											?.value?.[HSM_SCHEDULED_KEY];
									return {
										name: item.name,
										primaries,
										secondaries,
										indexes,
										hsmScheduled,
										indexer,
										description: description?.length !== 0 ? description[0]._content : ''
									};
								});
								setServersList(serverList);
							});
						}
					}
				}
			});
		},
		[allServersList, isAdvanced]
	);

	useEffect(() => {
		getServersListType('mailbox');
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
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
										label={t('label.search_for_a_Server', `Search for a Server`)}
										// value={searchString}
										background="gray5"
										// onChange={(e: any): any => {
										// 	setSearchString(e.target.value);
										// }}
										CustomIcon={(): any => <Icon icon="FunnelOutline" size="large" color="Gray0" />}
									/>
								</Container>
							</Row>
						</Container>
					</Row>
					<Row width="100%">
						<ServersListTable
							volumes={serversList}
							headers={isAdvanced ? serverHeaderAdvanced : serverHeaderCE}
							isAdvanced={isAdvanced}
							selectedRows={serverSelection}
							onSelectionChange={(selected: any): any => {
								// setBucketselection(selected);
								// const volumeObject: any = bucketList.find((s, index) => index === selected[0]);
								// setShowDetails(false);
								// setBucketDeleteName(volumeObject);
							}}
							// onDoubleClick={(i: any): any => {
							// 	handleDoubleClick(i);
							// 	setShowEditDetailView(true);
							// }}
							// onClick={(i: any): any => {
							// 	handleDoubleClick(i);
							// 	setShowEditDetailView(false);
							// }}
						/>
					</Row>
				</Container>
			</RelativeContainer>
		</>
	);
};

export default serverDetailPanel;

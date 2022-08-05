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
import { fetchSoap } from '../../../services/bucket-service';

const RelativeContainer = styled(Container)`
	position: relative;
`;

// header list for table
const headers = [
	{
		id: 'Server',
		label: 'Server',
		width: '40%',
		bold: true
	},
	{
		id: 'Primary',
		label: 'Primary',
		i18nAllLabel: 'All',
		width: '20%',
		bold: true
	},
	{
		id: 'Secondary',
		label: 'Secondary',
		i18nAllLabel: 'All',
		width: '20%',
		bold: true
	},
	{
		id: 'Index',
		label: 'Index',
		i18nAllLabel: 'All',
		width: '20%',
		bold: true
	}
	// {
	// 	id: 'HSM Scheduling',
	// 	label: 'HSM Scheduling',
	// 	i18nAllLabel: 'All',
	// 	width: '20%',
	// 	bold: true
	// },
	// {
	// 	id: 'Indexer',
	// 	label: 'Indexer',
	// 	i18nAllLabel: 'All',
	// 	width: '20%',
	// 	align: 'center',
	// 	bold: true
	// }
];

const ServersListTable: FC<{
	volumes: Array<any>;
	selectedRows: any;
	onSelectionChange: any;
}> = ({ volumes, selectedRows, onSelectionChange }) => {
	const tableRows = useMemo(
		() =>
			volumes.map((v, i) => ({
				id: i,
				columns: [
					<Row style={{ textAlign: 'left', justifyContent: 'flex-start' }} key={i}>
						{v.name}
					</Row>,
					<Row
						key={i}
						style={{ textAlign: 'left', justifyContent: 'flex-start', textTransform: 'capitalize' }}
					>
						{v.primaries}
					</Row>,
					<Row
						key={i}
						style={{ textAlign: 'left', justifyContent: 'flex-start', textTransform: 'capitalize' }}
					>
						{v.secondaries}
					</Row>,
					<Row
						key={i}
						style={{ textAlign: 'left', justifyContent: 'flex-start', textTransform: 'capitalize' }}
					>
						{v.indexes}
					</Row>
					// <Row key={i} style={{ textAlign: 'center', textTransform: 'capitalize' }}>{v.id}</Row>
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
	const [serversList, setServersList] = useState<any>([]);
	const [serverSelection, setserverSelection] = useState([]);
	const getServersListType = useCallback((service): void => {
		fetchSoap('GetAllServersRequest', {
			...(!service ? { _jsns: 'urn:zimbraAdmin' } : { _jsns: 'urn:zimbraAdmin', service })
		}).then((response) => {
			const serverResponseData = response.GetAllServersResponse.server;
			fetchSoap('zextras', {
				_jsns: 'urn:zimbraAdmin',
				module: 'ZxPowerstore',
				action: 'getAllVolumes',
				targetServers: 'all_servers'
			}).then((res) => {
				const responseData = JSON.parse(res.response.content);
				if (responseData.ok) {
					const data = responseData.response[serverResponseData[0].name].response;
					const primaries = data.primaries.length;
					const secondaries = data.secondaries.length;
					const indexes = data.indexes.length;
					setServersList([
						{
							name: serverResponseData[0].name,
							primaries,
							secondaries,
							indexes
						}
					]);
				}
			});
		});
	}, []);

	useEffect(() => {
		getServersListType('mailbox');
	}, [getServersListType]);

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

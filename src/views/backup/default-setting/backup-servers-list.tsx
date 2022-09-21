/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Row, Text, Divider, Table } from '@zextras/carbonio-design-system';
import { string } from 'prop-types';
import { useBackupModuleStore } from '../../../store/backup-module/store';
import { useServerStore } from '../../../store/server/store';

type BackupServerType = {
	id: string;
	name: string;
	description: string;
};

const ServersList: FC = () => {
	const [t] = useTranslation();
	const backupServerList = useBackupModuleStore((state) => state.backupServerList);
	const servers = useServerStore((state) => state.serverList);
	console.log('backup servers:::', backupServerList);
	console.log('servers:::', servers);
	const [serverList, setServerList] = useState<BackupServerType[]>([]);
	const [serverListRows, setServerListRows] = useState<any[]>([
		{
			id: '1',
			columns: [
				<Text size="medium" weight="light" key="11" color="gray0">
					np-demo.demo.zextras.io
				</Text>,
				<Text size="medium" weight="light" key="12" color="gray0">
					Scheduled
				</Text>,
				<Text size="medium" weight="light" key="13" color="gray0">
					Scheduled
				</Text>,
				<Text size="medium" weight="light" key="14" color="gray0">
					Local
				</Text>,
				<Text size="medium" weight="light" key="15" color="gray0">
					Scheduled
				</Text>,
				<Text size="medium" weight="light" key="16" color="gray0">
					Paused
				</Text>,
				<Text size="medium" weight="light" key="17" color="gray0">
					blablalblablablalblalbasfsaf
				</Text>,
				<Text size="medium" weight="light" key="18" color="gray0">
					6 GB
				</Text>,
				<Text size="medium" weight="light" key="19" color="gray0">
					7.7 GB
				</Text>
			]
		}
	]);

	const headers: any[] = useMemo(
		() => [
			{
				id: 'server',
				label: t('label.server', 'Server'),
				width: '20%',
				bold: true
			},
			{
				id: 'backup_at_startup',
				label: t('label.backup_at_startup', 'Backup at Startup'),
				width: '12%',
				bold: true
			},
			{
				id: 'rt_status',
				label: t('label.rt_status', 'RT Status'),
				width: '10%',
				bold: true
			},
			{
				id: 'type',
				label: t('label.type', 'Type'),
				width: '5%',
				bold: true
			},
			{
				id: 'smartscan',
				label: t('label.smartscan', 'Smartscan'),
				width: '10%',
				bold: true
			},
			{
				id: 'purge',
				label: t('label.purge', 'Purge'),
				width: '8%',
				bold: true
			},
			{
				id: 'description',
				label: t('label.description', 'Description'),
				width: '10%',
				bold: true
			},
			{
				id: 'metadata_space',
				label: t('label.metadata_space', 'Metadata Space'),
				width: '10%',
				bold: true
			},
			{
				id: 'backup_space',
				label: t('label.backup_space', 'Backup Space'),
				width: '10%',
				bold: true
			}
		],
		[t]
	);

	useEffect(() => {
		if (servers && servers?.length > 0) {
			const sList: BackupServerType[] = [];
			servers.forEach((item: any) => {
				const { id } = item;
				const { name } = item;
				const description = item?.a?.filter((value: any) => value.n === 'description')?._content;
				sList.push({ id, name, description });
			});
			setServerList(sList);
		}
	}, [servers]);

	return (
		<>
			<Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
				<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
					<Container
						orientation="vertical"
						mainAlignment="space-around"
						background="gray6"
						height="58px"
					>
						<Row
							orientation="horizontal"
							width="100%"
							padding={{ all: 'extrasmall' }}
							crossAlignment="flex-start"
							mainAlignment="flex-start"
						>
							<Row mainAlignment="flex-start" width="50%" crossAlignment="flex-start">
								<Text size="medium" weight="bold" color="gray0">
									{t('label.server_list', 'Server List')}
								</Text>
							</Row>
						</Row>
					</Container>
					<Row orientation="horizontal" width="100%" background="gray6">
						<Divider />
					</Row>
				</Row>
				<Container
					orientation="column"
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					style={{ overflow: 'auto' }}
					width="100%"
					height="calc(100vh - 200px)"
					padding={{ top: 'extralarge', left: 'small', right: 'small' }}
				>
					<Table
						rows={serverListRows}
						headers={headers}
						showCheckbox
						multiSelect
						style={{ overflow: 'auto', height: '100%' }}
					/>
				</Container>
			</Container>
		</>
	);
};
export default ServersList;

/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Container,
	Row,
	Text,
	Divider,
	Table,
	Tooltip,
	Icon
} from '@zextras/carbonio-design-system';
import _ from 'lodash';
import { useBackupModuleStore } from '../../../store/backup-module/store';
import { useServerStore } from '../../../store/server/store';
import { bytesToSize } from '../../utility/utils';
import CustomRowFactory from '../../app/shared/customTableRowFactory';
import CustomHeaderFactory from '../../app/shared/customTableHeaderFactory';

// eslint-disable-next-line no-shadow
export enum SMART_SCAN_TYPE {
	DISABLED = 1,
	ON_STARTUP_ONLY = 2,
	ON_STARTUP_AND_SCHEDULED = 3,
	SCHEDULED = 4
}

type BackupServerType = {
	id: string;
	name: string;
	description: string;
	backupAtStartup?: string;
	rtStatus?: string;
	type?: string;
	purge?: string;
	smartScan?: boolean;
	availableMetadataSpace?: string;
	availableBackupSpace?: string;
	purgeTooltip?: string;
	smartScanTooltip?: string;
	availableMetadataSpaceTooltip?: string;
	availableBackupSpaceTooltip?: string;
};

const BackupServersListTable: FC<{
	serverList: Array<BackupServerType>;
	selectedRows: any;
	onSelectionChange: any;
}> = ({ serverList, selectedRows, onSelectionChange }) => {
	const [t] = useTranslation();
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

	const tableRows = useMemo(
		() =>
			serverList.map((s, i) => ({
				id: i?.toString(),
				columns: [
					<Text size="medium" weight="light" key={i} color="gray0">
						{s?.name}
					</Text>,
					<Text size="medium" weight="light" key={i} color={s?.backupAtStartup ? 'gray0' : 'error'}>
						{s?.backupAtStartup ? s?.backupAtStartup : t('label.na', 'N/A')}
					</Text>,
					<Text size="medium" weight="light" key={i} color={s?.rtStatus ? 'gray0' : 'error'}>
						{s?.rtStatus ? s?.rtStatus : t('label.na', 'N/A')}
					</Text>,
					<Text size="medium" weight="light" key={i} color={s?.type ? 'gray0' : 'error'}>
						{s?.type ? s?.type : t('label.na', 'N/A')}
					</Text>,
					<Tooltip
						placement="bottom"
						label={s?.smartScanTooltip ? s?.smartScanTooltip : t('label.na', 'N/A')}
						key={i}
					>
						<Text size="medium" weight="light" color={s?.smartScan ? 'gray0' : 'error'}>
							{s?.smartScan ? s?.smartScan : t('label.na', 'N/A')}
						</Text>
					</Tooltip>,
					<Tooltip
						placement="bottom"
						label={s?.purgeTooltip ? s?.purgeTooltip : t('label.na', 'N/A')}
						key={i}
					>
						<Text size="medium" weight="light" color={s?.purge ? 'gray0' : 'error'}>
							{s?.purge ? s?.purge : t('label.na', 'N/A')}
						</Text>
					</Tooltip>,
					<Text size="medium" weight="light" key={i} color="gray0">
						{s?.description}
					</Text>,
					<Row mainAlignment="flex-start" width="100%" key={i}>
						<Icon icon="FolderOutline" size="medium" />
						<Row padding={{ left: 'small' }}>
							<Tooltip
								placement="bottom"
								label={
									s?.availableMetadataSpaceTooltip
										? s?.availableMetadataSpaceTooltip
										: t('label.na', 'N/A')
								}
							>
								<Text
									size="medium"
									weight="light"
									color={s?.availableMetadataSpace ? 'gray0' : 'error'}
								>
									{s?.availableMetadataSpace ? s?.availableMetadataSpace : t('label.na', 'N/A')}
								</Text>
							</Tooltip>
						</Row>
					</Row>,
					<Row mainAlignment="flex-start" width="100%" key={i}>
						<Icon icon="FolderOutline" size="medium" />
						<Row padding={{ left: 'small' }}>
							<Tooltip
								placement="bottom"
								label={
									s?.availableBackupSpaceTooltip
										? s?.availableBackupSpaceTooltip
										: t('label.na', 'N/A')
								}
							>
								<Text
									size="medium"
									weight="light"
									color={s?.availableBackupSpace ? 'gray0' : 'error'}
								>
									{s?.availableBackupSpace ? s?.availableBackupSpace : t('label.na', 'N/A')}
								</Text>
							</Tooltip>
						</Row>
					</Row>
				],
				clickable: false
			})),
		[serverList, t]
	);

	return (
		<Table
			headers={headers}
			rows={tableRows}
			showCheckbox={false}
			multiSelect={false}
			selectedRows={selectedRows}
			onSelectionChange={onSelectionChange}
			RowFactory={CustomRowFactory}
			HeaderFactory={CustomHeaderFactory}
		/>
	);
};

const ServersList: FC = () => {
	const [t] = useTranslation();
	const backupServerList = useBackupModuleStore((state) => state.backupServerList);
	const servers = useServerStore((state) => state.serverList);

	const STATUS: any[] = useMemo(
		() => [
			{
				label: t('label.scheduled', 'Scheduled'),
				value: true
			},
			{
				label: t('label.disabled', 'Disabled'),
				value: false
			}
		],
		[t]
	);

	const TYPE: any[] = useMemo(
		() => [
			{
				label: t('label.ext_volume', 'Ext. Volume'),
				value: true
			},
			{
				label: t('label.local', 'Local'),
				value: false
			}
		],
		[t]
	);

	const smartScanType: any[] = useMemo(
		() => [
			{
				label: t('label.disabled', 'Disabled'),
				value: SMART_SCAN_TYPE.DISABLED
			},
			{
				label: t('label.on_startup_only', 'On Startup Only'),
				value: SMART_SCAN_TYPE.ON_STARTUP_ONLY
			},
			{
				label: t('label.on_startup_and_scheduled', 'On Startup & Scheduled'),
				value: SMART_SCAN_TYPE.ON_STARTUP_AND_SCHEDULED
			},
			{
				label: t('label.scheduled', 'Scheduled'),
				value: SMART_SCAN_TYPE.SCHEDULED
			}
		],
		[t]
	);

	const [serverList, setServerList] = useState<BackupServerType[]>([]);
	const [selectedRows, setSelectedRows] = useState<any[]>([]);

	const getSmartScanStatus = useCallback(
		(smartScanStartup: boolean, backupSmartScan: boolean): any => {
			if (smartScanStartup === false && backupSmartScan === false) {
				return smartScanType[0]?.label;
			}
			if (smartScanStartup === true && backupSmartScan === false) {
				return smartScanType[1]?.label;
			}
			if (smartScanStartup === true && backupSmartScan === true) {
				return smartScanType[2]?.label;
			}
			return smartScanType[3]?.label;
		},
		[smartScanType]
	);

	const getBackupServerValue = useCallback(
		(backupServer: any): any => {
			const serverValue = {};
			if (backupServer) {
				const backupAtStartup = STATUS.find(
					(st) => st.value === backupServer?.attributes?.ZxBackup_ModuleEnabledAtStartup?.value
				)?.label;
				const rtStatus = STATUS.find(
					(st) => st.value === backupServer?.attributes?.ZxBackup_RealTimeScanner?.value
				)?.label;
				const type = _.isEmpty(backupServer?.attributes?.backupArchivingStore?.value)
					? TYPE[1]?.label
					: TYPE[0]?.label;
				const purge = `${backupServer?.attributes?.ZxBackup_DataRetentionDays?.value}/${backupServer?.attributes?.backupAccountsRetentionDays?.value}`;
				const purgeTooltip = backupServer?.attributes?.backupPurgeScheduler?.value['cron-pattern'];
				const smartScanStartup = backupServer?.attributes?.ZxBackup_DoSmartScanOnStartup?.value;
				const backupSmartScan =
					backupServer?.attributes?.backupSmartScanScheduler?.value['cron-enabled'];
				const smartScan = getSmartScanStatus(smartScanStartup, backupSmartScan);
				const smartScanTooltip =
					backupServer?.attributes?.backupSmartScanScheduler?.value['cron-pattern'];
				const availableMetadataSpace = backupServer?.properties?.available_space_for_metadata
					? bytesToSize(backupServer?.properties?.available_space_for_metadata)
					: '0 GB';
				const availableBackupSpace = backupServer?.properties?.available_space_for_blobs
					? bytesToSize(backupServer?.properties?.available_space_for_blobs)
					: '0 GB';
				const availableBackupSpaceTooltip = backupServer?.properties?.available_space_for_blobs
					? backupServer?.attributes?.ZxBackup_DestPath?.value
					: backupServer?.attributes?.backupArchivingStore?.value['cron-pattern'];
				const availableMetadataSpaceTooltip = backupServer?.attributes?.ZxBackup_DestPath?.value;
				return {
					backupAtStartup,
					rtStatus,
					type,
					purge,
					purgeTooltip,
					smartScan,
					smartScanTooltip,
					availableBackupSpace,
					availableMetadataSpace,
					availableBackupSpaceTooltip,
					availableMetadataSpaceTooltip
				};
			}
			return serverValue;
		},
		[STATUS, TYPE, getSmartScanStatus]
	);

	useEffect(() => {
		if (servers && servers?.length > 0) {
			const sList: BackupServerType[] = [];
			servers.forEach((item: any) => {
				const id = item?.id;
				const name = item?.name;
				const description = item?.a?.filter((value: any) => value.n === 'description')[0]?._content;
				if (backupServerList && backupServerList.length > 0) {
					const backupServerItem = backupServerList.filter((backupItem) => backupItem[item?.id])[0];
					if (backupServerItem) {
						const zxBackItem = backupServerItem[item?.id];
						if (zxBackItem && zxBackItem?.ZxBackup) {
							const backupValues = getBackupServerValue(zxBackItem?.ZxBackup);
							sList.push({ id, name, description, ...backupValues });
						}
					}
				} else {
					sList.push({ id, name, description });
				}
			});
			setServerList(sList);
		}
	}, [backupServerList, getBackupServerValue, servers]);

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
					padding={{ top: 'large', left: 'small', right: 'small' }}
				>
					<Row
						takeAvwidth="fill"
						mainAlignment="flex-start"
						width="100%"
						padding={{ top: 'large' }}
					>
						<BackupServersListTable
							serverList={serverList}
							selectedRows={selectedRows}
							// eslint-disable-next-line @typescript-eslint/no-empty-function
							onSelectionChange={(selected: any): any => {}}
						/>
					</Row>
				</Container>
			</Container>
		</>
	);
};
export default ServersList;

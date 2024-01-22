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
	Divider,
	Table,
	Tooltip,
	Icon,
	Button,
	Input,
	SnackbarManagerContext
} from '@zextras/carbonio-design-system';
import _, { debounce, find } from 'lodash';
import { Trans, useTranslation } from 'react-i18next';

import logo from '../../../assets/gardian.svg';
import { DISABLE, ENABLE, RECORD_DISPLAY_LIMIT } from '../../../constants';
import { fetchSoap } from '../../../services/bucket-service';
import { getCosBackupStatus } from '../../../services/get-cos-backup-status-service';
import { getCosList } from '../../../services/search-cos-service';
import { useBackupModuleStore } from '../../../store/backup-module/store';
import { useServerStore } from '../../../store/server/store';
import CustomHeaderFactory from '../../app/shared/customTableHeaderFactory';
import CustomRowFactory from '../../app/shared/customTableRowFactory';
import TrackNumberPerPage from '../../app/shared/track-number-per-page';
import Paging from '../../components/paging';
import { bytesToSize, cosBackupHeader } from '../../utility/utils';

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

type ZimbraCos = {
	name: string;
	id: string;
	a: ZimbraCosAttribute[];
};
type ZimbraCosResponse = {
	Cos: ZimbraCos[];
	more: boolean;
	searchTotal: number;
	_jsns: string;
};
type ZimbraCosAttribute = {
	n: string;
	_content: string;
};
type ZimbraCosEntry = {
	name: string;
	id: string;
	a: ZimbraCosAttribute[];
	zimbraCosStatus: string;
	backupStatus: boolean;
	description: any;
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
		// eslint-disable-next-line sonarjs/cognitive-complexity
		() =>
			serverList.map((s, i) => ({
				id: i?.toString(),
				columns: [
					<Text size="small" weight="regular" key={s?.name} color="gray0">
						{s?.name}
					</Text>,
					<Text
						size="small"
						weight="light"
						key={s?.name}
						color={s?.backupAtStartup ? 'gray0' : 'error'}
					>
						{s?.backupAtStartup ? s?.backupAtStartup : t('label.na', 'N/A')}
					</Text>,
					<Text size="small" weight="light" key={s?.name} color={s?.rtStatus ? 'gray0' : 'error'}>
						{s?.rtStatus ? s?.rtStatus : t('label.na', 'N/A')}
					</Text>,
					<Text size="small" weight="light" key={s?.name} color={s?.type ? 'gray0' : 'error'}>
						{s?.type ? s?.type : t('label.na', 'N/A')}
					</Text>,
					<Tooltip
						placement="bottom"
						label={s?.smartScanTooltip ? s?.smartScanTooltip : t('label.na', 'N/A')}
						key={s?.name}
					>
						<Text size="small" weight="light" color={s?.smartScan ? 'gray0' : 'error'}>
							{s?.smartScan ? s?.smartScan : t('label.na', 'N/A')}
						</Text>
					</Tooltip>,
					<Tooltip
						placement="bottom"
						label={s?.purgeTooltip ? s?.purgeTooltip : t('label.na', 'N/A')}
						key={s?.name}
					>
						<Text size="small" weight="light" color={s?.purge ? 'gray0' : 'error'}>
							{s?.purge ? s?.purge : t('label.na', 'N/A')}
						</Text>
					</Tooltip>,
					<Text size="small" weight="light" key={s?.name} color="gray0">
						{s?.description}
					</Text>,
					<Row mainAlignment="flex-start" width="100%" key={s?.name}>
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
									size="small"
									weight="light"
									color={s?.availableMetadataSpace ? 'gray0' : 'error'}
								>
									{s?.availableMetadataSpace ? s?.availableMetadataSpace : t('label.na', 'N/A')}
								</Text>
							</Tooltip>
						</Row>
					</Row>,
					<Row mainAlignment="flex-start" width="100%" key={s?.name}>
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
									size="small"
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
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const backupServerList = useBackupModuleStore((state) => state.backupServerList);
	const servers = useServerStore((state) => state.serverList);
	const [offset, setOffset] = useState<number>(0);
	const [searchString, setSearchString] = useState<string>('');
	const [hasError, setHasError] = useState<boolean>(false);
	const [limit, setLimit] = useState<number>(RECORD_DISPLAY_LIMIT);
	const [searchQuery, setSearchQuery] = useState<string>('');
	const cosHeaders = useMemo(() => cosBackupHeader(t), [t]);
	const [selectedRow, setSelectedRow] = useState<any>([]);
	const [totalCos, setTotalCos] = useState<number>(0);
	const [cosList, setcosList] = useState<
		{
			id: string;
			columns: ReactElement[];
			item: ZimbraCosEntry;
			clickable: boolean;
		}[]
	>([]);

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
	const [selectedRows] = useState<any[]>([]);

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
				// eslint-disable-next-line sonarjs/no-duplicate-string
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

	// eslint-disable-next-line sonarjs/cognitive-complexity
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

	// eslint-disable-next-line sonarjs/cognitive-complexity
	const getAllcosList = useCallback((): void => {
		getCosBackupStatus()
			.then((res) => {
				const response = JSON.parse(res?.Body?.response?.content);
				if (response?.ok) {
					const cosBackupDetail = response?.response?.cosList;
					getCosList(searchQuery, limit, offset)
						.then((data: any) => {
							const cosListResponse: ZimbraCosResponse = data?.cos || [];
							if (cosListResponse && Array.isArray(cosListResponse)) {
								const cosListArr: {
									id: string;
									columns: ReactElement[];
									item: ZimbraCosEntry;
									clickable: boolean;
								}[] = [];
								setTotalCos(data.searchTotal || 0);
								cosListResponse.forEach((item: ZimbraCosEntry) => {
									const description = find(item?.a, { n: 'description' });
									const CosIteam: ZimbraCosEntry = {
										name: item.name,
										id: item.id,
										zimbraCosStatus: 'active',
										a: item.a,
										backupStatus: cosBackupDetail[item?.name] === 'Enabled',
										description: ''
									};
									item?.a?.forEach((ele: ZimbraCosAttribute) => {
										if (ele.n === 'zimbraCosStatus') {
											CosIteam.zimbraCosStatus = ele._content;
										} else if (ele.n === 'description') {
											CosIteam.description = ele._content;
										}
									});
									cosListArr.push({
										id: item?.id,
										columns: [
											<Text size="small" key={item?.id} color="gray0" weight="regular">
												{item?.name || ' '}
											</Text>,
											<Text size="small" weight="light" key={item?.id}>
												{cosBackupDetail[item?.name]}
											</Text>,
											<Text size="small" weight="light" key={item?.id}>
												{description?._content}
											</Text>
										],
										item: CosIteam,
										clickable: true
									});
								});
								setcosList(cosListArr);
							}
						})
						.catch((error: any) => {
							createSnackbar({
								key: 'error',
								type: 'error',
								label: error
									? error?.error
									: // eslint-disable-next-line sonarjs/no-duplicate-string
									  t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
								autoHideTimeout: 3000,
								hideButton: true,
								replace: true
							});
							setHasError(true);
						});
				}
			})
			.catch((error: any) => {
				createSnackbar({
					key: 'error',
					type: 'error',
					label: error?.message
						? error?.message
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchQuery, limit, offset, createSnackbar, t]);

	useEffect(() => {
		getAllcosList();
	}, [getAllcosList]);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const searchcosList = useCallback(
		debounce((searchText) => {
			setSearchQuery(searchText);
		}, 700),
		[debounce]
	);
	useEffect(() => {
		searchcosList(searchString);
	}, [offset, searchcosList, searchString]);

	const onSelectionChange = useCallback(
		(item: any): void => {
			const description = find(cosList, { id: item[0] });
			if (description?.item) {
				setSelectedRow([description?.item]);
			} else {
				setSelectedRow([]);
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		},
		[cosList]
	);

	const handleClickedToChangeBackUpStatus = async (): Promise<void> => {
		const status = selectedRow[0]?.backupStatus ? DISABLE : ENABLE;
		await fetchSoap('zextras', {
			_jsns: 'urn:zimbraAdmin',
			module: 'ZxBackup',
			action: 'doEnableDisableCOS',
			COSName: selectedRow[0]?.name,
			cos_state: status,
			enableCOS: status
		})
			.then((res) => {
				const response = JSON.parse(res?.Body?.response?.content);
				if (response?.ok) {
					getAllcosList();
					createSnackbar({
						key: 'success',
						type: 'success',
						label: t('label.change_save_success_msg', 'The change has been saved successfully'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				} else {
					createSnackbar({
						key: 'error',
						type: 'error',
						label: response?.error?.message
							? response?.error?.message
							: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				}
			})
			.catch((error) => {
				createSnackbar({
					key: 'error',
					type: 'error',
					label: error?.message
						? error?.message
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	};

	return (
		<>
			<Container
				padding={{ all: 'large' }}
				mainAlignment="flex-start"
				background="gray6"
				style={{ overflow: 'scroll' }}
			>
				<Row mainAlignment="flex-start" width="100%">
					<Container
						orientation="vertical"
						mainAlignment="space-around"
						background="gray6"
						height="3.625rem"
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
				<Row mainAlignment="flex-start" width="100%" padding={{ top: 'large', bottom: 'large' }}>
					<BackupServersListTable
						serverList={serverList}
						selectedRows={selectedRows}
						onSelectionChange={(selected: any): any => null}
					/>
				</Row>
				<Row
					orientation="horizontal"
					width="100%"
					background="gray6"
					padding={{ top: 'large', bottom: 'large' }}
				>
					<Divider />
				</Row>
				<Row mainAlignment="flex-start" width="100%">
					<Row mainAlignment="flex-start" width="50%" crossAlignment="flex-start">
						<Text size="medium" weight="bold" color="gray0">
							{t('label.cos_to_backup', 'Cos to Backup')}
						</Text>
					</Row>
					<Row mainAlignment="flex-end" width="50%" crossAlignment="flex-start">
						<Button
							label={
								!selectedRow[0]?.backupStatus
									? t('label.enable', 'ENABLE')
									: t('label.disable', 'DISABLE')
							}
							color={!selectedRow[0]?.backupStatus ? 'primary' : 'error'}
							type="outlined"
							onClick={(): void => {
								handleClickedToChangeBackUpStatus();
							}}
							disabled={selectedRow.length === 0}
						/>
					</Row>
					<Row mainAlignment="flex-start" width="100%" padding={{ top: 'large' }}>
						<Container height="fit" crossAlignment="flex-start" background="gray6">
							<Row
								orientation="horizontal"
								mainAlignment="space-between"
								crossAlignment="flex-start"
								width="fill"
								padding={{ bottom: 'large' }}
							>
								<Container>
									<Input
										label={t('label.seach_for_cos', `Search for a COS`)}
										disabled={cosList.length === 0 && searchString.length === 0 && !hasError}
										value={searchString}
										backgroundColor="gray5"
										onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
											setSearchString(e.target.value);
										}}
										CustomIcon={(): JSX.Element => <Icon icon="FunnelOutline" size="large" />}
									/>
								</Container>
							</Row>
							<Row
								orientation="horizontal"
								mainAlignment="space-between"
								crossAlignment="flex-start"
								width="fill"
							>
								{cosList.length !== 0 && (
									<Table
										rows={cosList}
										headers={cosHeaders}
										showCheckbox={false}
										multiSelect={false}
										style={{ overflow: 'auto', height: '100%' }}
										RowFactory={CustomRowFactory}
										onSelectionChange={onSelectionChange}
										HeaderFactory={CustomHeaderFactory}
									/>
								)}
								{cosList.length === 0 && (
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
										<Row
											orientation="vertical"
											crossAlignment="center"
											style={{ textAlign: 'center' }}
											padding={{ top: 'small' }}
											width="53%"
										>
											<Text weight="light" color="#828282" size="large" overflow="break-word">
												<Trans
													i18nKey="label.create_Cos_list_msg"
													defaults="You can create a new Cos by clicking on <bold>Create</bold> button on header menu"
													components={{ bold: <strong /> }}
												/>
											</Text>
										</Row>
									</Container>
								)}
								{cosList.length !== 0 && (
									<>
										<Row
											orientation="horizontal"
											mainAlignment="space-between"
											crossAlignment="flex-start"
											width="fill"
											padding={{ top: 'medium' }}
										>
											<Divider />
										</Row>
										<Container
											orientation="horizontal"
											mainAlignment="space-between"
											width="100%"
											height="auto"
										>
											<Container crossAlignment="flex-start">
												<Paging totalItem={totalCos} setOffset={setOffset} pageSize={limit} />
											</Container>
											<Container
												crossAlignment="flex-end"
												orientation="horizontal"
												mainAlignment="flex-end"
												padding={{ top: 'small' }}
											>
												<TrackNumberPerPage setPageSize={setLimit} />
											</Container>
										</Container>
									</>
								)}
							</Row>
						</Container>
					</Row>
				</Row>
			</Container>
		</>
	);
};
export default ServersList;

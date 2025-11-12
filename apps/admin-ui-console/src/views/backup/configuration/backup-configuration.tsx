/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	getSoapFetchRequest,
	postSoapFetchRequest,
	fetchExternalSoap
, useServerStore } from '@zextras/admin-ui-bootstrap';
import {
	Container,
	Row,
	Text,
	Divider,
	Button,
	Switch,
	Input,
	Padding,
	Select,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { isEmpty, find } from 'lodash';
import React, { ChangeEvent, FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import {
	LOCAL_VALUE,
	MANAGE_EXTERNAL_VOLUME,
	MOUNTPOINT,
	MOVE_TO_EXTERNAL_BUCKET,
	MOVE_TO_LOCAL_MOUNT_POINT,
	S3,
	S3_BUCKET,
	SERVER,
	CONFIG,
	BACKUP_REALTIME,
	ZIMBRA_ADMIN_URN
} from '../../../constants';
import { useBackupStore } from '@zextras/admin-ui-bootstrap';

import { fetchSoap } from '../../../services/bucket-service';
import { setCoreAttributes } from '../../../services/set-core-attributes';
import { useModuleLicenseStore } from '../../../store/module-license/store';
import { useRightsStore, Right, Rights } from '../../../store/rights/store';
import OverlayDivision from '../../components/overlayDivision';
import ListRow from '../../list/list-row';
import { RouteLeavingGuard } from '../../ui-extras/nav-guard';

const ovelayStyle = styled(Container)`
	position: fixed;
	width: 70.35rem;
	top: 0;
	right: 0;
	bottom: 0;
	height: auto;
	max-height: 100%;
	overflow: hidden;
	background: #0d0d0d;
	opacity: 0.4;
	z-index: 11;
	padding-top: 2rem;
`;

const BackupConfiguration: FC = () => {
	const { server }: { server: string } = useParams();
	const [t] = useTranslation();
	const allServers = useServerStore((state) => state.serverList);
	const createSnackbar = useSnackbar();
	const [moduleEnableStartup, setModuleEnableStartup] = useState<boolean>(false);
	const [enableRealtimeScanner, setEnableRealtimeScanner] = useState<boolean>(false);
	const [runSmartScanStartup, setRunSmartScanStartup] = useState<boolean>(false);
	const [spaceThreshold, setSpaceThreshold] = useState<number>(0);
	const [isScheduleSmartScan, setIsScheduleSmartScan] = useState<boolean>(false);
	const [scheduleSmartScan, setScheduleSmartScan] = useState<string>('');
	const [keepDeletedItemInBackup, setKeepDeletedItemInBackup] = useState<number>(0);
	const [keepDeletedAccountsInBackup, setKeepDeletedAccountsInBackup] = useState<number>(0);
	const [scheduleAutomaticRetentionPolicy, setScheduleAutomaticRetentionPolicy] =
		useState<boolean>(false);
	const [retentionPolicySchedule, setRetentionPolicySchedule] = useState<string>('');
	const [backupDestPath, setBackupDestPath] = useState<string>('');
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);
	const [currentBackupValue, setCurrentBackupValue] = useState<any>({});
	const [backupServiceStart, setBackupServiceStart] = useState<boolean>(false);
	const [isBackupInitialized, setIsBackupInitialized] = useState<boolean>(false);
	const [isPurgeRequestRunning, setIsPurgeRequestRunning] = useState<boolean>(false);
	const [isExternalVolumeRequestRunning, setIsExternalVolumeRequestRunning] =
		useState<boolean>(false);
	const [isSaveRequestInProgress, setIsSaveRequestInProgress] = useState<boolean>(false);
	const [isManageExternalVolumeEnable, setIsManageExternalVolumeEnable] = useState<boolean>(false);
	const [isBackArchivingStoreEmpty, setIsBackArchivingStoreEmpty] = useState<boolean>(false);
	const [isShowSetExternalVolume, setIsShowSetExternalVolume] = useState<boolean>(false);
	const [bucketList, setBucketList] = useState<Array<any>>([]);
	const [backupArchivingStore, setBackupArchivingStore] = useState<any>({});
	const [initializeBackup, setInitializeBackup] = useState(
		t('backup.initialize_backup', 'Initialize Backup')
	);
	const [showIcon, setShowIcon] = useState(true);
	const [manageExternalVolumeType, setManageExternalVolumeType] = useState<string>('');
	const [manageExternalVolumeConfiguration, setManageExternalVolumeConfiguration] = useState<any>(
		{}
	);
	const [manageExternalVolumeBucketList, setManageExternalVolumeBucketList] = useState<any>([]);
	const [manageExternalVolumeLocalMountpoint, setManageExternalVolumeLocalMountpoint] =
		useState<string>('');
	const [manageExternalVolumeNewLocalMountpoint, setManageExternalVolumeNewLocalMountpoint] =
		useState<string>('');
	const [rootVolumePath, setRootVolumePath] = useState<string>('');
	const selectedBackupServer = useBackupStore((state) => state.selectedServer);
	const rights: Rights = useRightsStore((state) => state.rights);

	const allowSetBackup = useMemo(() => {
		const rightsConfig: Right = find(rights, { type: CONFIG }) || { all: [], type: CONFIG };
		return !!rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;
	}, [rights]);

	const destinationOptions: any[] = useMemo(
		() => [
			{
				label: t(
					'label.manage_external_volume_and_move_all',
					'MANAGE EXTERNAL VOLUME and Move All Items to Local Path'
				),
				value: MANAGE_EXTERNAL_VOLUME
			},
			{
				label: t('label.move_item_to_an_external_bucket', 'Move Items to an External Bucket'),
				value: MOVE_TO_EXTERNAL_BUCKET
			},
			{
				label: t('label.move_item_to_a_local_mountpoint', 'Move Items to a Local Mountpoint'),
				value: MOVE_TO_LOCAL_MOUNT_POINT
			}
		],
		[t]
	);

	const externalVolumeOptions: any[] = useMemo(
		() => [
			{
				label: t('label.mountpoint', 'Mountpoint'),
				value: MOUNTPOINT
			},
			{
				label: t('label.s3_bucket', 'S3 Bucket'),
				value: S3_BUCKET
			}
		],
		[t]
	);

	const [externalVolume, setExternalVolume] = useState<any>(externalVolumeOptions[0]);
	const [destinationSelected, setDestinationSelected] = useState<any>(destinationOptions[0]);
	const [bucketConfiguration, setBucketConfiguration] = useState<any>([]);
	const [bucketListOption, setBucketListOption] = useState<Array<any>>([]);

	const moduleLicenseInfo = useModuleLicenseStore((state) => state.licenseInfo);
	const [isBackupImportRealtimeFeatureLicensed, setIsBackupImportRealtimeFeatureLicensed] =
		useState<boolean>(false);

	useEffect(() => {
		if (moduleLicenseInfo && moduleLicenseInfo.features.length > 0) {
			const backupRealtimeModule = moduleLicenseInfo.features.filter(
				(item: Record<string, string | number | boolean>) => item?.name === BACKUP_REALTIME
			);
			if (backupRealtimeModule && backupRealtimeModule[0] && backupRealtimeModule[0]?.enabled) {
				setIsBackupImportRealtimeFeatureLicensed(true);
			}
		}
	}, [moduleLicenseInfo]);
	const onDestinationChange = useCallback(
		(v: any): any => {
			const it = destinationOptions.find((item: any) => item.value === v);
			setDestinationSelected(it);
		},
		[destinationOptions]
	);

	const onExternalVolumeChange = useCallback(
		(v: any): any => {
			const it = externalVolumeOptions.find((item: any) => item.value === v);
			setExternalVolume(it);
		},
		[externalVolumeOptions]
	);
	 
	useEffect(() => {
		if (allServers && allServers.length > 0) {
			const selectedServer = allServers.find((serverItem: any) => serverItem?.name === server);
			const currentBackupObject: any = {};
			if (selectedServer && selectedServer?.id) {
				getSoapFetchRequest(
					`/service/extension/zextras_admin/core/getServer/${selectedServer?.id}?module=zxbackup`
				)
					.then((data: any) => {
						if (data && data?.attributes) {
							const attributes = data?.attributes;
							if (attributes?.ZxBackup_ModuleEnabledAtStartup) {
								const value = attributes?.ZxBackup_ModuleEnabledAtStartup?.value;
								if (value) {
									setModuleEnableStartup(value);
									currentBackupObject.moduleEnableStartup = true;
								} else {
									setModuleEnableStartup(false);
									currentBackupObject.moduleEnableStartup = false;
								}
							}

							if (attributes?.ZxBackup_RealTimeScanner) {
								const value = attributes?.ZxBackup_RealTimeScanner?.value;
								if (value) {
									setEnableRealtimeScanner(value);
									currentBackupObject.enableRealtimeScanner = true;
								} else {
									setEnableRealtimeScanner(false);
									currentBackupObject.enableRealtimeScanner = false;
								}
							}

							if (attributes?.ZxBackup_DoSmartScanOnStartup) {
								const value = attributes?.ZxBackup_DoSmartScanOnStartup?.value;
								if (value) {
									setRunSmartScanStartup(value);
									currentBackupObject.runSmartScanStartup = true;
								} else {
									setRunSmartScanStartup(false);
									currentBackupObject.runSmartScanStartup = false;
								}
							}

							if (attributes?.ZxBackup_SpaceThreshold) {
								const value = attributes?.ZxBackup_SpaceThreshold?.value;
								if (value) {
									setSpaceThreshold(value);
									currentBackupObject.spaceThreshold = value;
								} else {
									currentBackupObject.spaceThreshold = 0;
								}
							}

							if (attributes?.backupSmartScanScheduler) {
								const value = attributes?.backupSmartScanScheduler?.value;
								 
								if (value && value?.['cron-enabled']) {
									setIsScheduleSmartScan(value['cron-enabled']);
									currentBackupObject.isScheduleSmartScan = true;
								} else {
									setIsScheduleSmartScan(false);
									currentBackupObject.isScheduleSmartScan = false;
								}
								 
								if (value && value['cron-pattern']) {
									setScheduleSmartScan(value['cron-pattern']);
									currentBackupObject.scheduleSmartScan = value['cron-pattern'];
								} else {
									currentBackupObject.scheduleSmartScan = '';
								}
							}

							if (attributes?.backupPurgeScheduler) {
								const value = attributes?.backupPurgeScheduler?.value;
								if (value && value['cron-enabled']) {
									setScheduleAutomaticRetentionPolicy(value['cron-enabled']);
									currentBackupObject.scheduleAutomaticRetentionPolicy = true;
								} else {
									setScheduleAutomaticRetentionPolicy(false);
									currentBackupObject.scheduleAutomaticRetentionPolicy = false;
								}
								if (value && value['cron-pattern']) {
									setRetentionPolicySchedule(value['cron-pattern']);
									currentBackupObject.retentionPolicySchedule = value['cron-pattern'];
								} else {
									currentBackupObject.retentionPolicySchedule = '';
								}
							}

							if (attributes?.ZxBackup_DestPath) {
								const value = attributes?.ZxBackup_DestPath?.value;
								if (value) {
									setBackupDestPath(value);
									currentBackupObject.backupDestPath = value;
								} else {
									currentBackupObject.backupDestPath = '';
								}
							}
							if (attributes?.ZxBackup_DataRetentionDays) {
								const value = attributes?.ZxBackup_DataRetentionDays?.value;
								if (value) {
									setKeepDeletedItemInBackup(value);
									currentBackupObject.keepDeletedItemInBackup = value;
								} else {
									currentBackupObject.keepDeletedItemInBackup = 0;
								}
							}

							if (attributes?.backupAccountsRetentionDays) {
								const value = attributes?.backupAccountsRetentionDays?.value;
								if (value) {
									setKeepDeletedAccountsInBackup(value);
									currentBackupObject.keepDeletedAccountsInBackup = value;
								} else {
									currentBackupObject.keepDeletedAccountsInBackup = 0;
								}
							}

							if (attributes?.backupArchivingStore) {
								const value = attributes?.backupArchivingStore?.value;
								if (isEmpty(value)) {
									setBackupArchivingStore({});
									setIsBackArchivingStoreEmpty(true);
								} else {
									setBackupArchivingStore(value);
									setIsBackArchivingStoreEmpty(false);
								}
							}
						}

						if (data && data?.services?.module?.running) {
							setBackupServiceStart(true);
						} else {
							setBackupServiceStart(false);
						}
						if (data && data?.properties && data?.properties?.backup_initialized) {
							setIsBackupInitialized(true);
						} else {
							setIsBackupInitialized(false);
						}
						setCurrentBackupValue(currentBackupObject);
						setIsDirty(false);
					})
					.catch((error: any) => {
						setIsDirty(false);
						createSnackbar({
							key: 'error',
							severity: 'error',
							label: error?.message
								? error?.message
								: // eslint-disable-next-line sonarjs/no-duplicate-string
								t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
							autoHideTimeout: 3000,
							hideButton: true,
							replace: true
						});
					});
			}
		}
	}, [server, allServers, createSnackbar, t]);

	const onCancel = useCallback(() => {
		setModuleEnableStartup(currentBackupValue.moduleEnableStartup);
		setEnableRealtimeScanner(currentBackupValue?.enableRealtimeScanner);
		setRunSmartScanStartup(currentBackupValue?.runSmartScanStartup);
		setSpaceThreshold(currentBackupValue?.spaceThreshold);
		setIsScheduleSmartScan(currentBackupValue?.isScheduleSmartScan);
		setScheduleSmartScan(currentBackupValue?.scheduleSmartScan);
		setScheduleAutomaticRetentionPolicy(currentBackupValue?.scheduleAutomaticRetentionPolicy);
		setRetentionPolicySchedule(currentBackupValue?.retentionPolicySchedule);
		setBackupDestPath(currentBackupValue?.backupDestPath);
		setKeepDeletedItemInBackup(currentBackupValue?.keepDeletedItemInBackup);
		setKeepDeletedAccountsInBackup(currentBackupValue?.keepDeletedAccountsInBackup);
		setIsDirty(false);
	}, [
		currentBackupValue?.moduleEnableStartup,
		currentBackupValue?.enableRealtimeScanner,
		currentBackupValue?.runSmartScanStartup,
		currentBackupValue?.spaceThreshold,
		currentBackupValue?.isScheduleSmartScan,
		currentBackupValue?.scheduleSmartScan,
		currentBackupValue?.scheduleAutomaticRetentionPolicy,
		currentBackupValue?.retentionPolicySchedule,
		currentBackupValue?.backupDestPath,
		currentBackupValue?.keepDeletedItemInBackup,
		currentBackupValue?.keepDeletedAccountsInBackup
	]);

	const onSave = useCallback(() => {
		let body: any = {
			ZxBackup_ModuleEnabledAtStartup: {
				value: moduleEnableStartup,
				objectName: server,
				configType: SERVER
			},
			ZxBackup_DoSmartScanOnStartup: {
				value: runSmartScanStartup,
				objectName: server,
				configType: SERVER
			},
			ZxBackup_SpaceThreshold: {
				value: spaceThreshold,
				objectName: server,
				configType: SERVER
			},
			backupSmartScanScheduler: {
				value: {
					'cron-pattern': scheduleSmartScan,
					'cron-enabled': isScheduleSmartScan
				},
				objectName: server,
				configType: SERVER
			},
			backupPurgeScheduler: {
				value: {
					'cron-pattern': retentionPolicySchedule,
					'cron-enabled': scheduleAutomaticRetentionPolicy
				},
				objectName: server,
				configType: SERVER
			},
			ZxBackup_DestPath: {
				value: backupDestPath,
				objectName: server,
				configType: SERVER
			},
			ZxBackup_DataRetentionDays: {
				value: keepDeletedItemInBackup,
				objectName: server,
				configType: SERVER
			},
			backupAccountsRetentionDays: {
				value: keepDeletedAccountsInBackup,
				objectName: server,
				configType: SERVER
			}
		};

		if (isBackupImportRealtimeFeatureLicensed) {
			const scanner = {
				ZxBackup_RealTimeScanner: {
					value: enableRealtimeScanner,
					objectName: server,
					configType: SERVER
				}
			};
			body = { ...body, ...scanner };
		}
		setIsSaveRequestInProgress(true);
		setCoreAttributes(body)
			.then((data: any) => {
				setIsSaveRequestInProgress(false);
				if ((data?.errors && Array.isArray(data?.errors)) || data?.error) {
					let errorMessage = t(
						'label.something_wrong_error_msg',
						'Something went wrong. Please try again.'
					);
					if (data?.errors && Array.isArray(data?.errors) && data?.errors[0]?.error) {
						errorMessage = data?.errors[0]?.error;
					} else if (data?.error) {
						errorMessage = data?.error?.message || data?.error;
					}
					createSnackbar({
						key: 'error',
						severity: 'error',
						label: errorMessage,
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				} else {
					setCurrentBackupValue((prev: any) => ({
						...prev,
						moduleEnableStartup,
						enableRealtimeScanner,
						runSmartScanStartup,
						spaceThreshold,
						isScheduleSmartScan,
						scheduleSmartScan,
						scheduleAutomaticRetentionPolicy,
						retentionPolicySchedule,
						backupDestPath,
						keepDeletedItemInBackup,
						keepDeletedAccountsInBackup
					}));
					setIsDirty(false);
					createSnackbar({
						key: 'success',
						severity: 'success',
						label: t(
							'label.the_last_changes_has_been_saved_successfully',
							'Changes have been saved successfully'
						),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				}
			})
			.catch((error: any) => {
				setIsSaveRequestInProgress(false);
				setCurrentBackupValue((prev: any) => ({
					...prev,
					moduleEnableStartup,
					enableRealtimeScanner,
					runSmartScanStartup,
					spaceThreshold,
					isScheduleSmartScan,
					scheduleSmartScan,
					scheduleAutomaticRetentionPolicy,
					retentionPolicySchedule,
					backupDestPath,
					keepDeletedItemInBackup,
					keepDeletedAccountsInBackup
				}));
				setIsDirty(false);
				createSnackbar({
					key: 'success',
					severity: 'success',
					label: t(
						'label.the_last_changes_has_been_saved_successfully',
						'Changes have been saved successfully'
					),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	}, [
		moduleEnableStartup,
		server,
		runSmartScanStartup,
		spaceThreshold,
		scheduleSmartScan,
		isScheduleSmartScan,
		retentionPolicySchedule,
		scheduleAutomaticRetentionPolicy,
		backupDestPath,
		keepDeletedItemInBackup,
		keepDeletedAccountsInBackup,
		isBackupImportRealtimeFeatureLicensed,
		enableRealtimeScanner,
		t,
		createSnackbar
	]);

	useEffect(() => {
		if (
			currentBackupValue.moduleEnableStartup !== undefined &&
			currentBackupValue.moduleEnableStartup !== moduleEnableStartup
		) {
			setIsDirty(true);
		}
	}, [currentBackupValue?.moduleEnableStartup, moduleEnableStartup]);

	useEffect(() => {
		if (
			currentBackupValue.enableRealtimeScanner !== undefined &&
			currentBackupValue.enableRealtimeScanner !== enableRealtimeScanner
		) {
			setIsDirty(true);
		}
	}, [currentBackupValue?.enableRealtimeScanner, enableRealtimeScanner]);

	useEffect(() => {
		if (
			currentBackupValue.runSmartScanStartup !== undefined &&
			currentBackupValue.runSmartScanStartup !== runSmartScanStartup
		) {
			setIsDirty(true);
		}
	}, [currentBackupValue?.runSmartScanStartup, runSmartScanStartup]);

	useEffect(() => {
		if (
			currentBackupValue.spaceThreshold !== undefined &&
			currentBackupValue.spaceThreshold !== spaceThreshold
		) {
			setIsDirty(true);
		}
	}, [currentBackupValue?.spaceThreshold, spaceThreshold]);

	useEffect(() => {
		if (
			currentBackupValue.isScheduleSmartScan !== undefined &&
			currentBackupValue.isScheduleSmartScan !== isScheduleSmartScan
		) {
			setIsDirty(true);
		}
	}, [currentBackupValue?.isScheduleSmartScan, isScheduleSmartScan]);

	useEffect(() => {
		if (
			currentBackupValue.scheduleSmartScan !== undefined &&
			currentBackupValue.scheduleSmartScan !== scheduleSmartScan
		) {
			setIsDirty(true);
		}
	}, [currentBackupValue?.scheduleSmartScan, scheduleSmartScan]);

	useEffect(() => {
		if (
			currentBackupValue.scheduleAutomaticRetentionPolicy !== undefined &&
			currentBackupValue.scheduleAutomaticRetentionPolicy !== scheduleAutomaticRetentionPolicy
		) {
			setIsDirty(true);
		}
	}, [currentBackupValue?.scheduleAutomaticRetentionPolicy, scheduleAutomaticRetentionPolicy]);

	useEffect(() => {
		if (
			currentBackupValue.retentionPolicySchedule !== undefined &&
			currentBackupValue.retentionPolicySchedule !== retentionPolicySchedule
		) {
			setIsDirty(true);
		}
	}, [currentBackupValue?.retentionPolicySchedule, retentionPolicySchedule]);

	useEffect(() => {
		if (
			currentBackupValue.backupDestPath !== undefined &&
			currentBackupValue.backupDestPath !== backupDestPath
		) {
			setIsDirty(true);
		}
	}, [currentBackupValue?.backupDestPath, backupDestPath]);

	useEffect(() => {
		if (
			currentBackupValue.keepDeletedItemInBackup !== undefined &&
			currentBackupValue.keepDeletedItemInBackup !== keepDeletedItemInBackup
		) {
			setIsDirty(true);
		}
	}, [currentBackupValue?.keepDeletedItemInBackup, keepDeletedItemInBackup]);

	useEffect(() => {
		if (
			currentBackupValue.keepDeletedAccountsInBackup !== undefined &&
			currentBackupValue.keepDeletedAccountsInBackup !== keepDeletedAccountsInBackup
		) {
			setIsDirty(true);
		}
	}, [currentBackupValue?.keepDeletedAccountsInBackup, keepDeletedAccountsInBackup]);

	const serviceStartStop = useCallback(() => {
		setIsRequestInProgress(true);
		postSoapFetchRequest(
			`/service/admin/soap/zextras`,
			{
				_jsns: ZIMBRA_ADMIN_URN,
				module: 'ZxBackup',
				action: backupServiceStart ? 'doStopService' : 'doStartService',
				service_name: 'module',
				targetServers: server
			},
			'zextras'
		)
			.then((res: any) => {
				setIsRequestInProgress(false);
				if (res?.Body?.response?.content) {
					const content = JSON.parse(res?.Body?.response?.content);
					if (content?.ok && content?.ok === true) {
						setBackupServiceStart(!backupServiceStart);
					}
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
	}, [backupServiceStart, createSnackbar, t, server]);

	const doInitializeBackup = useCallback(
		(isFromInitialize?: boolean) => {
			setIsRequestInProgress(true);
			fetchExternalSoap(`/service/extension/zextras_admin/backup/doSmartScan`, {
				targetServers: [server]
			})
				.then((res: any) => {
					setIsRequestInProgress(false);
					if (isFromInitialize && res && res?.serverId) {
						setIsBackupInitialized(!isBackupInitialized);
					}
					if (res && res?.error && res?.error?.message) {
						createSnackbar({
							key: 'error',
							severity: 'error',
							label: res?.error?.details?.cause || res?.error?.message,
							autoHideTimeout: 3000,
							hideButton: true,
							replace: true
						});
					}
				})
				.catch((error: any) => {
					setIsRequestInProgress(false);
					createSnackbar({
						key: 'error',
						severity: 'error',
						label: error
							? error?.error?.message
							: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				});
		},
		[server, createSnackbar, t, isBackupInitialized]
	);

	const doBackupPurge = useCallback(() => {
		setIsPurgeRequestRunning(true);
		fetchExternalSoap(`/service/extension/zextras_admin/backup/doPurge`, {
			targetServers: [server]
		})
			.then((res: any) => {
				setIsPurgeRequestRunning(false);
				if (res && res?.error && res?.error?.message) {
					createSnackbar({
						key: 'error',
						severity: 'error',
						label: res?.error?.details?.cause || res?.error?.message,
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				}
			})
			.catch((error: any) => {
				setIsPurgeRequestRunning(false);
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
	}, [server, createSnackbar, t]);

	const onBackupExternalVolume = useCallback(
		 
		(body: any) => {
			setIsExternalVolumeRequestRunning(true);
			fetchExternalSoap(`/service/extension/zextras_admin/backup/migrateBackupVolume`, {
				...body
			})
				.then((res: any) => {
					setIsExternalVolumeRequestRunning(false);
					if (res?.error && res?.error?.details) {
						createSnackbar({
							key: 'error',
							severity: 'error',
							label: res?.error
								? res?.error?.message || res?.error?.details?.cause
								: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
							autoHideTimeout: 3000,
							hideButton: true,
							replace: true
						});
					} else {
						const selectedServer = allServers.find(
							(serverItem: any) => serverItem?.name === server
						);
						getSoapFetchRequest(
							`/service/extension/zextras_admin/core/getServer/${selectedServer?.id}?module=zxbackup`
						).then((data: any) => {
							if (data && data?.attributes) {
								const attributes = data?.attributes;
								if (attributes?.backupArchivingStore) {
									const value = attributes?.backupArchivingStore?.value;
									if (isEmpty(value)) {
										setBackupArchivingStore({});
										setIsBackArchivingStoreEmpty(true);
									} else {
										setBackupArchivingStore(value);
										setIsBackArchivingStoreEmpty(false);
									}
								}
							}
						});
						setIsShowSetExternalVolume(false);
						setIsManageExternalVolumeEnable(false);
						createSnackbar({
							key: 'info',
							severity: 'info',
							label: t('label.operation_now_in_queue', 'The operation is now in the queue'),
							autoHideTimeout: 3000,
							hideButton: true,
							replace: true
						});
					}
				})
				.catch((error: any) => {
					setIsExternalVolumeRequestRunning(false);
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
		[createSnackbar, t, server, allServers]
	);

	const getAllBuckets = useCallback(() => {
		fetchSoap('zextras', {
			_jsns: ZIMBRA_ADMIN_URN,
			module: 'ZxCore',
			action: 'listBuckets',
			type: 'all',
			targetServer: server,
			showSecrets: true
		}).then((res: any) => {
			const response = JSON.parse(res.Body.response.content);
			if (response.ok) {
				setBucketList(response.response.values);
			} else {
				setBucketList([]);
			}
		});
	}, [server]);

	useEffect(() => {
		getAllBuckets();
	}, [getAllBuckets]);

	useEffect(() => {
		if (bucketList.length > 0) {
			const allOptions: any[] = [];
			bucketList.forEach((item: any) => {
				allOptions.push({
					label: `${item?.storeType} | ${item?.bucketName}`,
					value: item?.uuid
				});
			});
			setBucketListOption(allOptions);
			if (allOptions.length > 0) {
				setBucketConfiguration(allOptions[0]);
				setManageExternalVolumeBucketList(allOptions[0]);
			}
		}
	}, [bucketList]);

	const onManageExternalVolumeConfigurationChange = useCallback(
		(v: any): any => {
			if (bucketListOption.length > 0) {
				const it = bucketListOption.find((item: any) => item.value === v);
				setManageExternalVolumeBucketList(it);
			}
		},
		[bucketListOption]
	);

	const onBucketConfigurationChange = useCallback(
		(v: any): any => {
			if (bucketListOption.length > 0) {
				const it = bucketListOption.find((item: any) => item.value === v);
				setBucketConfiguration(it);
			}
		},
		[bucketListOption]
	);

	const onSaveSetExternal = useCallback(() => {
		const body: any = {
			storeType: externalVolume?.value === MOUNTPOINT ? LOCAL_VALUE : S3,
			volumeRootPath: externalVolume?.value === MOUNTPOINT ? rootVolumePath : '',
			bucketConfigurationId: externalVolume?.value === MOUNTPOINT ? '' : bucketConfiguration?.value,
			targetServers: [server]
		};
		if (externalVolume?.value === S3_BUCKET) {
			body.useInfrequentAccess = true;
			body.infrequentAcccessThreshold = 0;
			body.useIntelligentTiering = true;
		}
		onBackupExternalVolume(body);
	}, [
		server,
		externalVolume?.value,
		bucketConfiguration?.value,
		onBackupExternalVolume,
		rootVolumePath
	]);

	useEffect(() => {
		if (!isEmpty(backupArchivingStore)) {
			if (backupArchivingStore?.storeType) {
				setManageExternalVolumeType(backupArchivingStore?.storeType);
			}
			if (backupArchivingStore?.volumeRootPath) {
				setManageExternalVolumeLocalMountpoint(backupArchivingStore?.volumeRootPath);
			}
		}
		if (
			!isEmpty(backupArchivingStore) &&
			backupArchivingStore?.bucketConfigurationId &&
			bucketList.length > 0
		) {
			const bucket = bucketList.find(
				(item: any) => item?.uuid === backupArchivingStore?.bucketConfigurationId
			);
			if (bucket) {
				const name = `${bucket?.storeType} | ${bucket?.bucketName}`;
				setManageExternalVolumeConfiguration({
					label: name,
					value: bucket?.uuid
				});
			}
		}
	}, [backupArchivingStore, bucketList]);

	const onSaveManageExternalVolume = useCallback(() => {
		const body: any = {};
		if (isManageExternalVolumeEnable && destinationSelected?.value === MANAGE_EXTERNAL_VOLUME) {
			body.storeType = 'default';
			body.backup_volume_decommission = true;
		} else if (
			isManageExternalVolumeEnable &&
			destinationSelected?.value === MOVE_TO_EXTERNAL_BUCKET
		) {
			body.bucketConfigurationId = manageExternalVolumeBucketList?.value;
			body.storeType = 'S3';
		} else if (
			isManageExternalVolumeEnable &&
			destinationSelected?.value === MOVE_TO_LOCAL_MOUNT_POINT
		) {
			body.volumeRootPath = manageExternalVolumeNewLocalMountpoint;
			body.storeType = 'LOCAL';
		}
		body.targetServers = [server];
		onBackupExternalVolume(body);
	}, [
		isManageExternalVolumeEnable,
		destinationSelected?.value,
		manageExternalVolumeBucketList?.value,
		onBackupExternalVolume,
		manageExternalVolumeNewLocalMountpoint,
		server
	]);

	const isSetManageExternalButtonVisible = useMemo(
		() => isManageExternalVolumeEnable || isShowSetExternalVolume,
		[isManageExternalVolumeEnable, isShowSetExternalVolume]
	);

	return (
		<>
			{isSaveRequestInProgress && <OverlayDivision ovelayStyle={ovelayStyle} />}
			<Container mainAlignment="flex-start" background="gray6">
				<Container
					orientation="column"
					background="gray6"
					crossAlignment="flex-start"
					mainAlignment="flex-start"
				>
					<Row mainAlignment="flex-start" width="100%">
						<Container orientation="vertical" mainAlignment="space-around" height="3.5rem">
							<Row orientation="horizontal" width="100%">
								<Row
									padding={{ all: 'large' }}
									mainAlignment="flex-start"
									width="50%"
									crossAlignment="flex-start"
								>
									<Text size="medium" weight="bold" color="gray0">
										{selectedBackupServer}{' '}
										{t('backup.backup_configuration', 'backup configuration')}
									</Text>
								</Row>
								<Row
									padding={{ all: 'large' }}
									width="50%"
									mainAlignment="flex-end"
									crossAlignment="flex-end"
								>
									<Padding right="small">
										{isDirty && (
											<Button
												 
												label={t('label.cancel', 'Cancel')}
												color="secondary"
												onClick={onCancel}
												disabled={isRequestInProgress}
											/>
										)}
									</Padding>
									{isDirty && (
										<Button
											label={t('label.save', 'Save')}
											color="primary"
											onClick={onSave}
											disabled={isSaveRequestInProgress}
											loading={isSaveRequestInProgress}
										/>
									)}
								</Row>
							</Row>
						</Container>
						<Divider color="gray2" />
					</Row>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-end"
						style={{ overflow: 'auto' }}
						padding={{ all: 'large' }}
						height="calc(100vh - 9.375rem)"
					>
						<Container
							mainAlignment="flex-end"
							crossAlignment="flex-end"
							padding={{ top: 'large' }}
							height="fit"
							orientation="horizontal"
						>
							<Text>{t('backup.the_service_is', 'The service is')}</Text>&nbsp;
							{!backupServiceStart && <Text color="error">{t('backup.stopped', 'stopped')}</Text>}
							{backupServiceStart && <Text color="primary">{t('backup.running', 'running')}</Text>}
						</Container>

						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-end"
							padding={{ top: 'medium' }}
							height="fit"
						>
							<Button
								type="outlined"
								label={
									backupServiceStart
										? t('backup.stop_service', 'Stop service')
										: t('backup.start_service', 'Start service')
								}
								color={backupServiceStart ? 'error' : 'primary'}
								width="fit"
								onClick={serviceStartStop}
								disabled={isRequestInProgress || !allowSetBackup}
								loading={isRequestInProgress}
								size="large"
							/>
						</Container>

						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							padding={{ top: 'extralarge' }}
							height="fit"
						>
							<Text size="medium" weight="bold">
								{t('backup.general', 'General')}
							</Text>
						</Container>

						<ListRow>
							<Container
								padding={{ top: 'large' }}
								mainAlignment="flex-start"
								crossAlignment="flex-start"
							>
								<Switch
									label={t('backup.backup_is_enabled_at_startup', 'Backup is enabled at startup')}
									value={moduleEnableStartup}
									onClick={(): void => setModuleEnableStartup(!moduleEnableStartup)}
									iconColor="primary"
									disabled={!allowSetBackup}
								/>
							</Container>
							{isBackupImportRealtimeFeatureLicensed && (
								<Container padding={{ top: 'large' }}>
									<Switch
										label={t('backup.enable_realtime_scanner', 'Enable RealTime Scanner')}
										value={enableRealtimeScanner}
										onClick={(): void => setEnableRealtimeScanner(!enableRealtimeScanner)}
										iconColor="primary"
										disabled={!allowSetBackup}
									/>
								</Container>
							)}

							<Container padding={{ top: 'large' }}>
								<Switch
									label={t('backup.run_smartscan_at_startup', 'Run the Smartscan at startup')}
									value={runSmartScanStartup}
									onClick={(): void => setRunSmartScanStartup(!runSmartScanStartup)}
									iconColor="primary"
									disabled={!allowSetBackup}
								/>
							</Container>
						</ListRow>

						<ListRow>
							<Container padding={{ top: 'large' }} style={{ display: 'block' }}>
								<Button
									type="outlined"
									label={initializeBackup}
									color="primary"
									icon={showIcon ? 'PowerOutline' : ''}
									iconPlacement="right"
									width="fill"
									style={{ width: '100%' }}
									disabled={isBackupInitialized || !allowSetBackup}
									onClick={(): void => {
										setShowIcon(false);
										setInitializeBackup(
											t(
												'backup.initialising_backup_check_your_notifications_for_updates',
												'INITIALISING BACKUP... CHECK YOUR NOTIFICATIONS FOR UPDATES'
											)
										);
										setTimeout(() => {
											setInitializeBackup(t('backup.initialize_backup', 'Initialize Backup'));
											setShowIcon(true);
										}, 10000);
										doInitializeBackup(true);
									}}
									size="large"
								/>
							</Container>
						</ListRow>

						<ListRow>
							<Container padding={{ top: 'large' }}>
								<Input
									label={t(
										'backup.local_volume_reload_if_you_changed_this_value',
										'Local Volume (reload if you changed this value)'
									)}
									value={backupDestPath || ''}
									backgroundColor="gray5"
									onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
										setBackupDestPath(e.target.value);
									}}
								/>
							</Container>
						</ListRow>

						<ListRow>
							<Container padding={{ top: 'large' }}>
								<Input
									label={t('backup.space_threshold_mb', 'Space Threshold (MB)')}
									value={spaceThreshold}
									backgroundColor="gray5"
									onChange={(e: any): void => {
										!allowSetBackup && setSpaceThreshold(e.target.value);
									}}
									disabled={!allowSetBackup}
								/>
							</Container>
						</ListRow>

						{!isBackArchivingStoreEmpty && (
							<Container>
								<ListRow>
									<Container padding={{ top: 'large' }}>
										<Input
											label={t('backup.external_volume', 'External Volume')}
											value={manageExternalVolumeType}
											backgroundColor="gray5"
										/>
									</Container>
								</ListRow>
								<ListRow>
									<Container padding={{ top: 'large', bottom: 'large' }}>
										<Input
											label={t('backup.bucket_configuration', 'Bucket Configuration')}
											value={
												manageExternalVolumeType.startsWith('LOCAL')
													? manageExternalVolumeLocalMountpoint
													: manageExternalVolumeConfiguration?.label
											}
											backgroundColor="gray5"
										/>
									</Container>
								</ListRow>
							</Container>
						)}

						{isShowSetExternalVolume && (
							<ListRow>
								<Container padding={{ top: 'large', bottom: 'large' }}>
									<Select
										items={externalVolumeOptions}
										background="gray5"
										label={t('label.select_an_external_volume', 'Select an External Volume')}
										showCheckbox={false}
										onChange={onExternalVolumeChange}
										selection={externalVolume}
										disabled={!allowSetBackup}
									/>
								</Container>
							</ListRow>
						)}

						{isShowSetExternalVolume && externalVolume?.value === MOUNTPOINT && (
							<Container>
								<Input
									label={t('label.path', 'Path')}
									value={rootVolumePath || ''}
									backgroundColor="gray5"
									onChange={(e: ChangeEvent<HTMLInputElement>): void => {
										!allowSetBackup && setRootVolumePath(e.target.value);
									}}
								/>
							</Container>
						)}
						{isShowSetExternalVolume && externalVolume?.value === S3_BUCKET && (
							<Select
								items={bucketListOption}
								background="gray5"
								label={t('label.select_a_bucket_configuration', 'Select a Bucket Configuration')}
								showCheckbox={false}
								selection={bucketConfiguration}
								onChange={onBucketConfigurationChange}
								disabled={!allowSetBackup}
							/>
						)}

						{isShowSetExternalVolume && (
							<Row
								padding={{ all: 'large' }}
								width="50%"
								mainAlignment="flex-end"
								crossAlignment="flex-end"
							>
								<Padding right="small">
									<Button
										label={t('label.cancel', 'Cancel')}
										color="secondary"
										onClick={(): void => {
											setIsShowSetExternalVolume(false);
										}}
										disabled={!allowSetBackup}
									/>
								</Padding>

								<Button
									label={t('label.migrate', 'Migrate')}
									color="primary"
									onClick={onSaveSetExternal}
									disabled={isExternalVolumeRequestRunning || !allowSetBackup}
									loading={isExternalVolumeRequestRunning}
								/>
							</Row>
						)}

						{isManageExternalVolumeEnable && (
							<ListRow>
								<Container padding={{ bottom: 'large' }}>
									<Select
										items={destinationOptions}
										background="gray5"
										label={t('label.destination', 'Destination')}
										showCheckbox={false}
										onChange={onDestinationChange}
										selection={destinationSelected}
										disabled={!allowSetBackup}
									/>
								</Container>
							</ListRow>
						)}

						{isManageExternalVolumeEnable &&
							destinationSelected?.value === MOVE_TO_EXTERNAL_BUCKET && (
								<Container>
									<ListRow>
										<Container padding={{ bottom: 'large' }}>
											<Select
												items={bucketListOption}
												background="gray5"
												label={t('backup.bucket_list', 'Buckets List')}
												showCheckbox={false}
												selection={bucketConfiguration}
												onChange={onManageExternalVolumeConfigurationChange}
												disabled={!allowSetBackup}
											/>
										</Container>
									</ListRow>
								</Container>
							)}
						{isManageExternalVolumeEnable &&
							destinationSelected?.value === MOVE_TO_LOCAL_MOUNT_POINT && (
								<Container>
									<ListRow>
										<Container padding={{ bottom: 'large' }}>
											<Input
												label={t('backup.local_mountpoint', 'Local Mountpoint')}
												value={manageExternalVolumeNewLocalMountpoint || ''}
												backgroundColor="gray5"
												onChange={(e: ChangeEvent<HTMLInputElement>): void => {
													!allowSetBackup &&
														setManageExternalVolumeNewLocalMountpoint(e.target.value);
												}}
											/>
										</Container>
									</ListRow>
								</Container>
							)}
						{isManageExternalVolumeEnable && (
							<Row width="100%">
								<Container
									padding={{ right: 'extrasmall' }}
									mainAlignment="flex-start"
									crossAlignment="flex-start"
									width="50%"
								>
									<Button
										label={t('label.cancel', 'Cancel')}
										color="secondary"
										width="fill"
										onClick={(): void => {
											setIsManageExternalVolumeEnable(false);
										}}
										disabled={!allowSetBackup}
									/>
								</Container>

								<Button
									label={t('label.migrate', 'Migrate')}
									color="primary"
									width="fit"
									onClick={onSaveManageExternalVolume}
									disabled={isExternalVolumeRequestRunning || !allowSetBackup}
									loading={isExternalVolumeRequestRunning}
								/>
							</Row>
						)}
						<ListRow>
							<Container padding={{ top: 'large' }} style={{ display: 'block' }}>
								{!isSetManageExternalButtonVisible && (
									<Button
										type="outlined"
										label={
											isBackArchivingStoreEmpty
												? t('backup.set_external_volume', 'Set external volume')
												: t('backup.manage_external_volume', 'Manage external volume')
										}
										color="primary"
										icon="HardDriveOutline"
										iconPlacement="right"
										size="large"
										style={{ width: '100%' }}
										width="fill"
										disabled={!isBackupInitialized || !allowSetBackup}
										onClick={(): void => {
											if (!isBackArchivingStoreEmpty) {
												setIsManageExternalVolumeEnable(true);
												setIsShowSetExternalVolume(false);
											} else {
												setIsShowSetExternalVolume(true);
												setIsManageExternalVolumeEnable(false);
											}
										}}
									/>
								)}
							</Container>
						</ListRow>

						<ListRow>
							<Container
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								orientation="horizontal"
								padding={{ top: 'large' }}
							>
								<Divider />
							</Container>
						</ListRow>

						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							padding={{ top: 'large' }}
							height="fit"
						>
							<Text size="medium" weight="bold">
								{t('backup.smart_scan_configuration', 'SmartScan Configuration')}
							</Text>
						</Container>

						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							padding={{ top: 'large' }}
							height="fit"
						>
							<Switch
								label={t('backup.schedule_smartscan', 'Schedule Smartscan')}
								value={isScheduleSmartScan}
								onClick={(): void => setIsScheduleSmartScan(!isScheduleSmartScan)}
								iconColor="primary"
								disabled={!allowSetBackup}
							/>
						</Container>

						<ListRow>
							<Container padding={{ top: 'large' }}>
								<Input
									label={t('backup.schedule', 'Schedule')}
									value={scheduleSmartScan}
									onChange={(e: ChangeEvent<HTMLInputElement>): void => {
										setScheduleSmartScan(e.target.value);
									}}
									disabled={!isScheduleSmartScan || !allowSetBackup}
								/>
							</Container>
						</ListRow>

						<ListRow>
							<Container padding={{ top: 'large' }} style={{ display: 'block' }}>
								<Button
									type="outlined"
									label={t('backup.force_start_smartscan_now', 'Force start smartscan now')}
									color="primary"
									icon="PowerOutline"
									iconPlacement="right"
									size="large"
									style={{ width: '100%' }}
									width="fill"
									disabled={!isBackupInitialized || !allowSetBackup}
									onClick={(): void => {
										doInitializeBackup();
									}}
								/>
							</Container>
						</ListRow>

						<ListRow>
							<Container
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								orientation="horizontal"
								padding={{ top: 'large' }}
							>
								<Divider />
							</Container>
						</ListRow>

						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							padding={{ top: 'large' }}
							height="fit"
						>
							<Text size="medium" weight="bold">
								{t('backup.data_retention_policies', 'Data Retention Policies')}
							</Text>
						</Container>

						<ListRow>
							<Container
								padding={{ top: 'large' }}
								mainAlignment="flex-start"
								crossAlignment="flex-start"
							>
								<Switch
									label={t(
										'backup.schedule_automatic_retention_policies',
										'Schedule automatic retention policies'
									)}
									value={scheduleAutomaticRetentionPolicy}
									onClick={(): void =>
										setScheduleAutomaticRetentionPolicy(!scheduleAutomaticRetentionPolicy)
									}
									iconColor="primary"
									disabled={!allowSetBackup}
								/>
							</Container>
						</ListRow>

						<ListRow>
							<Container padding={{ top: 'large' }}>
								<Input
									label={t('backup.schedule', 'Schedule')}
									backgroundColor="gray5"
									value={retentionPolicySchedule}
									onChange={(e: ChangeEvent<HTMLInputElement>): void => {
										setRetentionPolicySchedule(e.target.value);
									}}
									disabled={!scheduleAutomaticRetentionPolicy || !allowSetBackup}
								/>
							</Container>
						</ListRow>

						<ListRow>
							<Container
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								orientation="horizontal"
								padding={{ top: 'large', right: 'large' }}
								width="35%"
							>
								<Input
									label={t(
										'backup.keep_deleted_item_in_backup',
										'Keep deleted items in the backup'
									)}
									value={keepDeletedItemInBackup}
									onChange={(e: any): void => {
										setKeepDeletedItemInBackup(e.target.value);
									}}
									disabled={!scheduleAutomaticRetentionPolicy || !allowSetBackup}
									 
									// @ts-ignore // DS only support string
									description={
										<Trans
											i18nKey="backup.back_delete_account_warning_message"
											defaults="If you set 0, <strong>accounts</strong> will be kept in backup forever"
										/>
									}
								/>
							</Container>
							<Container
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								orientation="horizontal"
								padding={{ top: 'large', right: 'large' }}
								width="15%"
							>
								<Input
									label={t('backup.range', 'Range')}
									value={t('label.days', 'Days')}
									disabled={!allowSetBackup}
								/>
							</Container>
							<Container
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								orientation="horizontal"
								padding={{ top: 'large', right: 'large' }}
								width="35%"
							>
								<Input
									label={t(
										'backup.keep_deleted_account_in_the_backup',
										'Keep deleted account in the backup'
									)}
									backgroundColor="gray5"
									value={keepDeletedAccountsInBackup}
									onChange={(e: any): void => {
										setKeepDeletedAccountsInBackup(e.target.value);
									}}
									disabled={!scheduleAutomaticRetentionPolicy || !allowSetBackup}
									 
									// @ts-ignore // DS only support string
									description={
										<Trans
											i18nKey="backup.back_delete_account_warning_message"
											defaults="If you set 0, <strong>accounts</strong> will be kept in backup forever"
										/>
									}
								/>
							</Container>
							<Container
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								orientation="horizontal"
								padding={{ top: 'large' }}
								width="15%"
							>
								<Input
									label={t('backup.range', 'Range')}
									backgroundColor="gray5"
									value={t('label.days', 'Days')}
									disabled={!allowSetBackup}
								/>
							</Container>
						</ListRow>
						<ListRow>
							<Container padding={{ top: 'large' }} style={{ display: 'block' }}>
								<Button
									type="outlined"
									label={t('backup.force_backup_purge_now', 'Force backup purge now')}
									color="primary"
									icon="PowerOutline"
									iconPlacement="right"
									style={{ width: '100%' }}
									width="fill"
									disabled={isPurgeRequestRunning || !isBackupInitialized || !allowSetBackup}
									loading={isPurgeRequestRunning}
									onClick={(): void => {
										doBackupPurge();
									}}
									size="large"
								/>
							</Container>
						</ListRow>
					</Container>
				</Container>
				<RouteLeavingGuard when={isDirty} onSave={onSave}>
					<Text>
						{t(
							'label.unsaved_changes_line1',
							'Are you sure you want to leave this page without saving?'
						)}
					</Text>
					<Text>{t('label.unsaved_changes_line2', 'All your unsaved changes will be lost')}</Text>
				</RouteLeavingGuard>
			</Container>
		</>
	);
};
export default BackupConfiguration;

/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useEffect, useState, useCallback, useMemo } from 'react';

import {
	Container,
	Row,
	Padding,
	Divider,
	Text,
	Input,
	Button,
	useSnackbar,
	Switch,
	Select
} from '@zextras/carbonio-design-system';
import { isEqual, reduce, cloneDeep, find, isEmpty } from 'lodash';
import { useTranslation } from 'react-i18next';

import { CONFIG } from '../../../constants';
import { modifyBackupRequest } from '../../../services/modify-backup';
import { useBackupStore } from '../../../store/backup/store';
import { useRightsStore, Right, Rights } from '../../../store/rights/store';
import ListRow from '../../list/list-row';
import { RouteLeavingGuard } from '../../ui-extras/nav-guard';

const BackupAdvanced: FC = () => {
	const [t] = useTranslation();
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const globalConfig = useBackupStore((state) => state.globalConfig);
	const setGlobalConfig = useBackupStore((state) => state.setGlobalConfig);
	const [initbackupDetail, setInitBackupDetail] = useState<any>({});
	const createSnackbar = useSnackbar();
	const rights: Rights = useRightsStore((state) => state.rights);
	const allowSetBackup = useMemo(() => {
		const rightsConfig: Right = find(rights, { type: CONFIG }) || { all: [], type: CONFIG };
		return !!rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;
	}, [rights]);

	const onCancel = (): void => {
		setInitBackupDetail({ ...globalConfig });
	};
	const onSave = (): void => {
		const modifiedKeys: any = reduce(
			globalConfig,
			function (result, value, key): any {
				return isEqual(value, initbackupDetail[key]) ? result : [...result, key];
			},
			[]
		);
		const modifiedData: any = {};
		modifiedKeys.forEach((ele: any) => {
			modifiedData[ele] = initbackupDetail[ele];
		});
		modifyBackupRequest(modifiedData).then((data) => {
			if (data?.status === 200 || isEmpty(data)) {
				setGlobalConfig(initbackupDetail);
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
			} else {
				createSnackbar({
					key: 'error',
					severity: 'error',
					label:
						data?.errors?.[0]?.error ||
						data?.statusText ||
						data?.error ||
						t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			}
		});
	};
	useEffect(() => {
		if (!initbackupDetail?.privateKeyAlgorithm && globalConfig?.privateKeyAlgorithm) {
			setInitBackupDetail(cloneDeep(globalConfig));
		}
	}, [globalConfig, initbackupDetail]);

	useEffect(() => {
		if (!isEqual(globalConfig, initbackupDetail)) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}
	}, [globalConfig, initbackupDetail]);

	const changeSwitchOption = useCallback(
		(key: string): void => {
			setInitBackupDetail((prev: any) => ({
				...prev,
				[key]: initbackupDetail[key] !== true
			}));
		},
		[initbackupDetail]
	);
	const changeBackupDetail = useCallback(
		(e) => {
			setInitBackupDetail((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
		},
		[setInitBackupDetail]
	);

	const compressLevelItems = useMemo(
		() => [
			{
				label: '1',
				value: '1'
			},
			{
				label: '2',
				value: '2'
			},
			{
				label: '3',
				value: '3'
			}
		],
		[]
	);
	const onBackupCompressionLevelChange = (v: any): any => {
		setInitBackupDetail((prev: any) => ({ ...prev, backupCompressionLevel: v }));
	};
	return (
		<>
			<Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
				<Container
					orientation="column"
					background="gray6"
					crossAlignment="flex-start"
					mainAlignment="flex-start"
				>
					<Row mainAlignment="flex-start" width="100%">
						<Container orientation="vertical" mainAlignment="space-around" height="56px">
							<Row orientation="horizontal" width="100%">
								<Row
									padding={{ all: 'large' }}
									mainAlignment="flex-start"
									width="50%"
									crossAlignment="flex-start"
								>
									<Text size="medium" weight="bold" color="gray0">
										{t('label.advanced', 'Advanced')}
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
											/>
										)}
									</Padding>
									{isDirty && (
										<Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />
									)}
								</Row>
							</Row>
						</Container>
						<Divider color="gray2" />
					</Row>
					<Container
						orientation="column"
						crossAlignment="flex-start"
						mainAlignment="flex-start"
						style={{ overflow: 'auto' }}
						width="100%"
						height="calc(100vh - 200px)"
						padding={{ top: 'small' }}
					>
						<Row mainAlignment="flex-start" width="100%" padding={{ top: 'large' }}>
							<Container
								height="fit"
								crossAlignment="flex-start"
								background="gray6"
								padding={{ left: 'small', right: 'small' }}
							>
								<ListRow>
									<Container padding={{ all: 'small' }}>
										<Input
											label={`${t('backup.latency_high_threshold', 'Latency High Threshold')} (${t(
												'backup.kb',
												'KB'
											)})`}
											value={initbackupDetail.backupLatencyHighThreshold}
											defaultValue={initbackupDetail.backupLatencyHighThreshold}
											onChange={changeBackupDetail}
											inputName="backupLatencyHighThreshold"
											backgroundColor="gray5"
											disabled={!allowSetBackup}
										/>
									</Container>
								</ListRow>
								<ListRow>
									<Container padding={{ all: 'small' }}>
										<Input
											label={`${t('backup.latency_low_threshold', 'Latency Low Threshold')} (${t(
												'backup.kb',
												'KB'
											)})`}
											value={initbackupDetail.backupLatencyLowThreshold}
											defaultValue={initbackupDetail.backupLatencyLowThreshold}
											onChange={changeBackupDetail}
											inputName="backupLatencyLowThreshold"
											backgroundColor="gray5"
											disabled={!allowSetBackup}
										/>
									</Container>
								</ListRow>
								<ListRow>
									<Container
										orientation="horizontal"
										mainAlignment="space-between"
										crossAlignment="flex-start"
										padding={{ all: 'small' }}
									>
										<Switch
											value={initbackupDetail.ldapDumpEnabled}
											onClick={(): void => changeSwitchOption('ldapDumpEnabled')}
											label={t('backup.ldap_dump', 'LDAP Dump')}
											iconColor="primary"
											disabled={!allowSetBackup}
										/>
									</Container>
								</ListRow>
								<ListRow>
									<Container
										orientation="horizontal"
										mainAlignment="space-between"
										crossAlignment="flex-start"
										padding={{ all: 'small' }}
									>
										<Switch
											value={initbackupDetail.ZxBackup_BackupCustomizations}
											onClick={(): void => changeSwitchOption('ZxBackup_BackupCustomizations')}
											label={t(
												'backup.store_server_configurations_in_the_backup',
												'Store Server Configuration in the backup'
											)}
											iconColor="primary"
											disabled={!allowSetBackup}
										/>
									</Container>
								</ListRow>
								<ListRow>
									<Container
										orientation="horizontal"
										mainAlignment="space-between"
										crossAlignment="flex-start"
										padding={{ all: 'small' }}
									>
										<Switch
											value={initbackupDetail.ZxBackup_PurgeCustomizations}
											onClick={(): void => changeSwitchOption('ZxBackup_PurgeCustomizations')}
											label={t('backup.purge_old_configurations', 'Purge Old Configurations')}
											iconColor="primary"
											disabled={!allowSetBackup}
										/>
									</Container>
								</ListRow>
								<ListRow>
									<Container
										orientation="horizontal"
										mainAlignment="space-between"
										crossAlignment="flex-start"
										padding={{ all: 'small' }}
									>
										<Switch
											value={initbackupDetail.backupSaveIndex}
											onClick={(): void => changeSwitchOption('backupSaveIndex')}
											label={t('backup.save_index', 'Save Index')}
											iconColor="primary"
											disabled={!allowSetBackup}
										/>
									</Container>
								</ListRow>
								<ListRow>
									<Container padding={{ all: 'small' }}>
										<Input
											label={t('backup.metatdata_size', 'Metadata Size')}
											value={initbackupDetail.ZxBackup_MaxMetadataSize}
											defaultValue={initbackupDetail.ZxBackup_MaxMetadataSize}
											onChange={changeBackupDetail}
											inputName="ZxBackup_MaxMetadataSize"
											backgroundColor="gray5"
											disabled={!allowSetBackup}
										/>
									</Container>
								</ListRow>
								<ListRow>
									<Container padding={{ all: 'small' }}>
										<Input
											label={`${t('backup.max_waiting_time', 'Max Waiting Time')} (${t(
												'backup.ms',
												'MS'
											)})`}
											value={initbackupDetail.ZxBackup_MaxWaitingTime}
											defaultValue={initbackupDetail.ZxBackup_MaxWaitingTime}
											onChange={changeBackupDetail}
											inputName="ZxBackup_MaxWaitingTime"
											backgroundColor="gray5"
											disabled={!allowSetBackup}
										/>
									</Container>
								</ListRow>
								<ListRow>
									<Container padding={{ all: 'small' }}>
										<Input
											label={t('backup.max_operations_account', 'Max Operations / Account')}
											value={initbackupDetail.ZxBackup_MaxOperationPerAccount}
											defaultValue={initbackupDetail.ZxBackup_MaxOperationPerAccount}
											onChange={changeBackupDetail}
											inputName="ZxBackup_MaxOperationPerAccount"
											backgroundColor="gray5"
											disabled={!allowSetBackup}
										/>
									</Container>
								</ListRow>
								<ListRow>
									<Container padding={{ all: 'small' }}>
										<Select
											items={compressLevelItems}
											background="gray5"
											label={t('backup.compression_level', 'Compression Level')}
											defaultSelection={compressLevelItems.find(
												(item: any) =>
													item.value === globalConfig?.backupCompressionLevel?.toString()
											)}
											onChange={onBackupCompressionLevelChange}
											showCheckbox={false}
											disabled={!allowSetBackup}
										/>
									</Container>
								</ListRow>
								<ListRow>
									<Container padding={{ all: 'small' }}>
										<Input
											label={t('backup.threads_for_items', 'Threads For Items')}
											value={initbackupDetail.backupNumberThreadsForAccounts}
											defaultValue={initbackupDetail.backupNumberThreadsForAccounts}
											onChange={changeBackupDetail}
											inputName="backupNumberThreadsForAccounts"
											backgroundColor="gray5"
											disabled={!allowSetBackup}
										/>
									</Container>
								</ListRow>
								<ListRow>
									<Container padding={{ all: 'small' }}>
										<Input
											label={t('backup.threads_for_account', 'Threads For Account')}
											value={initbackupDetail.backupNumberThreadsForAccounts}
											defaultValue={initbackupDetail.backupNumberThreadsForAccounts}
											onChange={changeBackupDetail}
											inputName="backupNumberThreadsForAccounts"
											backgroundColor="gray5"
											disabled={!allowSetBackup}
										/>
									</Container>
								</ListRow>
								<ListRow>
									<Container
										orientation="horizontal"
										mainAlignment="space-between"
										crossAlignment="flex-start"
										padding={{ all: 'small' }}
									>
										<Switch
											value={initbackupDetail.backupOnTheFlyMetadata}
											onClick={(): void => changeSwitchOption('backupOnTheFlyMetadata')}
											label={t(
												'backup.flash_metadata_in_the_disk_at_every_save',
												'Flash metadata in the disk at every save'
											)}
											iconColor="primary"
											disabled={!allowSetBackup}
										/>
									</Container>
								</ListRow>
								<ListRow>
									<Container
										orientation="horizontal"
										mainAlignment="space-between"
										crossAlignment="flex-start"
										padding={{ all: 'small' }}
									>
										<Switch
											value={initbackupDetail.scheduledMetadataArchivingEnabled}
											onClick={(): void => changeSwitchOption('scheduledMetadataArchivingEnabled')}
											label={t(
												'backup.archive_user_metadata_folder_in_the_remote_backup',
												'Archive user metadata folder in the remote backup'
											)}
											iconColor="primary"
											disabled={!allowSetBackup}
										/>
									</Container>
								</ListRow>
							</Container>
						</Row>
					</Container>
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
		</>
	);
};
export default BackupAdvanced;

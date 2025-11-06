/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Row, Divider, Input, Switch, Select } from '@zextras/carbonio-design-system';
import React, { FC, useMemo } from 'react';


import { useBackupConfig } from '../../../hooks/useBackupConfig';
import { useBackupStore } from '../../../store/backup/store';
import ListRow from '../../list/list-row';
import BackupConfigHeader from '../components/backup/BackupConfigHeader';
import BackupRouteLeavingGuard from '../components/backup/BackupRouteLeavingGuard';

const BackupAdvanced: FC = () => {
	const {
		isDirty,
		backupDetail,
		setBackupDetail,
		allowSetBackup,
		onCancel,
		onSave,
		changeSwitchOption,
		changeBackupDetail,
		t
	} = useBackupConfig();

	const globalConfig = useBackupStore((state) => state.globalConfig);

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
		setBackupDetail((prev: any) => ({ ...prev, backupCompressionLevel: v }));
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
							<BackupConfigHeader
								title={t('label.advanced', 'Advanced')}
								isDirty={isDirty}
								onCancel={onCancel}
								onSave={onSave}
								t={t}
							/>
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
											value={backupDetail.backupLatencyHighThreshold}
											defaultValue={backupDetail.backupLatencyHighThreshold}
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
											value={backupDetail.backupLatencyLowThreshold}
											defaultValue={backupDetail.backupLatencyLowThreshold}
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
											value={backupDetail.ldapDumpEnabled}
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
											value={backupDetail.ZxBackup_BackupCustomizations}
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
											value={backupDetail.ZxBackup_PurgeCustomizations}
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
											value={backupDetail.backupSaveIndex}
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
											value={backupDetail.ZxBackup_MaxMetadataSize}
											defaultValue={backupDetail.ZxBackup_MaxMetadataSize}
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
											value={backupDetail.ZxBackup_MaxWaitingTime}
											defaultValue={backupDetail.ZxBackup_MaxWaitingTime}
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
											value={backupDetail.ZxBackup_MaxOperationPerAccount}
											defaultValue={backupDetail.ZxBackup_MaxOperationPerAccount}
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
											value={backupDetail.backupNumberThreadsForAccounts}
											defaultValue={backupDetail.backupNumberThreadsForAccounts}
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
											value={backupDetail.backupNumberThreadsForAccounts}
											defaultValue={backupDetail.backupNumberThreadsForAccounts}
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
											value={backupDetail.backupOnTheFlyMetadata}
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
											value={backupDetail.scheduledMetadataArchivingEnabled}
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
			<BackupRouteLeavingGuard isDirty={isDirty} onSave={onSave} t={t} />
		</>
	);
};
export default BackupAdvanced;

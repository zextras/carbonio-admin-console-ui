/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useEffect, useState } from 'react';

import {
	Container,
	Row,
	Text,
	Divider,
	Switch,
	Input,
	Padding
} from '@zextras/carbonio-design-system';

import { BACKUP_BASIC, BACKUP_REALTIME } from '../../../constants';
import { useBackupConfig } from '../../../hooks/useBackupConfig';
import { useModuleLicenseStore } from '../../../store/module-license/store';
import ListRow from '../../list/list-row';
import BackupConfigHeader from '../components/backup/BackupConfigHeader';
import BackupRouteLeavingGuard from '../components/backup/BackupRouteLeavingGuard';

const BackupServerConfig: FC = () => {
	const {
		isDirty,
		backupDetail,
		allowSetBackup,
		onCancel,
		onSave,
		changeSwitchOption,
		changeBackupDetail,
		changeBackupSchedulerInput,
		changeBackupSchedulerSwitch,
		t
	} = useBackupConfig();

	const moduleLicense = useModuleLicenseStore((state) => state.moduleLicense);
	const [isBackupModuleLicensed, setIsBackupModuleLicensed] = useState<boolean>(false);
	const [isBackupRealTimeFeatureLicensed, setBackupRealTimeFeatureLicensed] =
		useState<boolean>(false);
	useEffect(() => {
		if (moduleLicense && moduleLicense.length > 0) {
			const backupModule = moduleLicense.filter(
				(item: Record<string, string | number | boolean>) => item?.name === BACKUP_BASIC
			);
			if (backupModule && backupModule[0] && backupModule[0]?.enabled) {
				setIsBackupModuleLicensed(true);
			}

			const realTime = moduleLicense.filter(
				(item: Record<string, string | number | boolean>) => item?.name === BACKUP_REALTIME
			);
			if (realTime && realTime[0] && realTime[0]?.enabled) {
				setBackupRealTimeFeatureLicensed(true);
			}
		}
	}, [moduleLicense]);

	return (
		<>
			{isBackupModuleLicensed && (
				<Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
					<BackupConfigHeader
						title={t('label.server_config', 'Server Config')}
						isDirty={isDirty}
						onCancel={onCancel}
						onSave={onSave}
						t={t}
					/>
					<Row orientation="horizontal" width="100%" background="gray6">
						<Divider />
					</Row>
					<Container
						orientation="column"
						crossAlignment="flex-start"
						mainAlignment="flex-start"
						style={{ overflow: 'auto' }}
						width="100%"
						height="calc(100vh - 200px)"
						padding={{ all: 'large' }}
					>
						<Row mainAlignment="flex-start" width="100%" padding={{ top: 'large' }}></Row>
						{isBackupRealTimeFeatureLicensed && (
							<ListRow>
								<Switch
									label={t('backup.enable_realtime_scanner', 'Enable Realtime Scanner')}
									value={backupDetail.ZxBackup_RealTimeScanner}
									onClick={(): void => changeSwitchOption('ZxBackup_RealTimeScanner')}
									iconColor="primary"
									disabled={!allowSetBackup}
								/>
							</ListRow>
						)}
						<ListRow>
							<Switch
								value={backupDetail.ZxBackup_ModuleEnabledAtStartup}
								label={t(
									'backup.backup_is_enable_at_the_startup',
									'Backup is enabled at the startup'
								)}
								onClick={(): void => changeSwitchOption('ZxBackup_ModuleEnabledAtStartup')}
								iconColor="primary"
								disabled={!allowSetBackup}
							/>
						</ListRow>
						<ListRow>
							<Switch
								value={backupDetail.ZxBackup_DoSmartScanOnStartup}
								label={t(
									'backup.run_the_smart_scan_at_the_startup',
									'Run the Smartscan at the startup'
								)}
								onClick={(): void => changeSwitchOption('ZxBackup_DoSmartScanOnStartup')}
								iconColor="primary"
								disabled={!allowSetBackup}
							/>
						</ListRow>
						<ListRow>
							<Container padding={{ top: 'large', bottom: 'large' }}>
								<Divider />
							</Container>
						</ListRow>
						<ListRow>
							<Container padding={{ bottom: 'large' }}>
								<Input
									label={t('backup.backup_path', 'Backup Path')}
									value={backupDetail.ZxBackup_DestPath}
									defaultValue={backupDetail.ZxBackup_DestPath}
									onChange={changeBackupDetail}
									inputName="ZxBackup_DestPath"
									backgroundColor="gray5"
									disabled={!allowSetBackup}
								/>
							</Container>
						</ListRow>
						<ListRow>
							<Container padding={{ bottom: 'large' }}>
								<Input
									label={`${t('backup.minimum_space_threshold', 'Minimum Space Threshold')} (${t(
										'label.mb',
										'MB'
									)})`}
									value={backupDetail.ZxBackup_SpaceThreshold}
									defaultValue={backupDetail.ZxBackup_SpaceThreshold}
									onChange={changeBackupDetail}
									inputName="ZxBackup_SpaceThreshold"
									backgroundColor="gray5"
									disabled={!allowSetBackup}
								/>
							</Container>
						</ListRow>
						<ListRow>
							<Container padding={{ bottom: 'medium' }}>
								<Input
									label={`${t('backup.local_metadata_threshold', 'Local Metadata Threshold')} (${t(
										'label.mb',
										'MB'
									)})`}
									value={backupDetail.backupLocalMetadataThreshold}
									defaultValue={backupDetail.backupLocalMetadataThreshold}
									onChange={changeBackupDetail}
									inputName="backupLocalMetadataThreshold"
									backgroundColor="gray5"
									disabled={!allowSetBackup}
								/>
							</Container>
						</ListRow>
						<ListRow>
							<Container padding={{ top: 'small', bottom: 'large' }}>
								<Divider />
							</Container>
						</ListRow>
						<ListRow>
							<Padding bottom="large">
								<Switch
									value={backupDetail.backupSmartScanScheduler?.['cron-enabled']}
									onClick={(): void => changeBackupSchedulerSwitch('backupSmartScanScheduler')}
									label={t('backup.schedule_smart_scan', 'Schedule Smartscan')}
									iconColor="primary"
									disabled={!allowSetBackup}
									data-testid={'smart-scan-toggle'}
								/>
							</Padding>
						</ListRow>
						<ListRow>
							<Container padding={{ bottom: 'medium' }}>
								<Input
									label={t('backup.schedule', 'Schedule')}
									// eslint-disable-next-line sonarjs/no-duplicate-string
									value={backupDetail.backupSmartScanScheduler?.['cron-pattern']}
									defaultValue={backupDetail.backupSmartScanScheduler?.['cron-pattern']}
									onChange={changeBackupSchedulerInput}
									inputName="backupSmartScanScheduler"
									backgroundColor="gray5"
									disabled={!allowSetBackup}
								/>
							</Container>
						</ListRow>
						<ListRow>
							<Container padding={{ top: 'small', bottom: 'extralarge' }}>
								<Divider />
							</Container>
						</ListRow>

						<ListRow>
							<Padding bottom="large">
								<Switch
									value={backupDetail.backupPurgeScheduler?.['cron-enabled']}
									onClick={(): void => changeBackupSchedulerSwitch('backupPurgeScheduler')}
									label={t('backup.config.schedule_purge', 'Schedule Purge')}
									iconColor="primary"
									disabled={!allowSetBackup}
									data-testid={'backup-purge-toggle'}
								/>
							</Padding>
						</ListRow>

						<ListRow>
							<Container padding={{ bottom: 'large' }}>
								<Input
									label={t('backup.schedule', 'Schedule')}
									value={backupDetail.backupPurgeScheduler?.['cron-pattern']}
									defaultValue={backupDetail.backupPurgeScheduler?.['cron-pattern']}
									onChange={changeBackupSchedulerInput}
									inputName="backupPurgeScheduler"
									backgroundColor="gray5"
									disabled={!allowSetBackup}
								/>
							</Container>
						</ListRow>
						<ListRow>
							<Container padding={{ top: 'small', bottom: 'extralarge' }}>
								<Divider />
							</Container>
						</ListRow>
						<ListRow>
							<Container padding={{ bottom: 'small' }}>
								<Input
									label={t('backup.keep_delted_items_backup', 'Keep deleted items in the backup')}
									value={backupDetail.ZxBackup_DataRetentionDays}
									defaultValue={backupDetail.ZxBackup_DataRetentionDays}
									onChange={changeBackupDetail}
									inputName="ZxBackup_DataRetentionDays"
									backgroundColor="gray5"
									disabled={!allowSetBackup}
								/>
							</Container>
						</ListRow>
						<ListRow>
							<Padding bottom="large">
								<Text size="extrasmall" weight="regular" color="secondary">
									{t(
										'backup.set_backup_forever_msg',
										'If you set 0, your data will be kept in backup forever'
									)}
								</Text>
							</Padding>
						</ListRow>

						<ListRow>
							<Container padding={{ bottom: 'small' }}>
								<Input
									label={t(
										'backup.keep_delete_accounts_in_backup',
										'Keep deleted accounts in the backup'
									)}
									value={backupDetail.backupAccountsRetentionDays}
									defaultValue={backupDetail.backupAccountsRetentionDays}
									onChange={changeBackupDetail}
									inputName="backupAccountsRetentionDays"
									backgroundColor="gray5"
									disabled={!allowSetBackup}
								/>
							</Container>
						</ListRow>
						<ListRow>
							<Padding bottom="large">
								<Text size="extrasmall" weight="regular" color="secondary">
									{t(
										'backup.set_backup_forever_msg',
										'If you set 0, your data will be kept in backup forever'
									)}
								</Text>
							</Padding>
						</ListRow>
					</Container>
				</Container>
			)}

			<BackupRouteLeavingGuard isDirty={isDirty} onSave={onSave} t={t} />
		</>
	);
};
export default BackupServerConfig;

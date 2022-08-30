/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Container,
	Row,
	Padding,
	Button,
	Text,
	Divider,
	Switch,
	Input
} from '@zextras/carbonio-design-system';
import { isEqual, reduce, cloneDeep } from 'lodash';
import ListRow from '../../list/list-row';
import { useBackupStore } from '../../../store/backup/store';
import { RouteLeavingGuard } from '../../ui-extras/nav-guard';

const BackupServerConfig: FC = () => {
	const [t] = useTranslation();
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const globalConfig = useBackupStore((state) => state.globalConfig);
	const setGlobalConfig = useBackupStore((state) => state.setGlobalConfig);
	const [initbackupDetail, setInitBackupDetail] = useState<any>({});
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
		setGlobalConfig(initbackupDetail);
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
	const changeBackupSchedulerDetail = useCallback(
		(e) => {
			setInitBackupDetail((prev: any) => ({
				...prev,
				[e.target.name]: {
					...[e.target.name],
					'cron-pattern': e.target.value
				}
			}));
		},
		[setInitBackupDetail]
	);
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
						<Row orientation="horizontal" width="100%" padding={{ all: 'extrasmall' }}>
							<Row mainAlignment="flex-start" width="50%" crossAlignment="flex-start">
								<Text size="medium" weight="bold" color="gray0">
									{t('label.server_config', 'Server Config')}
								</Text>
							</Row>
							<Row width="50%" mainAlignment="flex-end" crossAlignment="flex-end">
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
				</Row>
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
					padding={{ top: 'extralarge', left: 'small', right: 'small' }}
				>
					<ListRow>
						<Container padding={{ bottom: 'large' }}>
							<Input
								label={t('backup.backup_path', 'Backup Path')}
								value={initbackupDetail.ZxBackup_DestPath}
								defaultValue={initbackupDetail.ZxBackup_DestPath}
								onChange={changeBackupDetail}
								inputName="ZxBackup_DestPath"
								background="gray5"
							/>
						</Container>
					</ListRow>
					<ListRow>
						<Container padding={{ bottom: 'large' }}>
							<Input
								label={t('backup.minimum_space_threshold', 'Minimum Space Threshold')}
								value={initbackupDetail.backupLatencyLowThreshold}
								defaultValue={initbackupDetail.backupLatencyLowThreshold}
								onChange={changeBackupDetail}
								inputName="backupLatencyLowThreshold"
								background="gray5"
							/>
						</Container>
					</ListRow>
					<ListRow>
						<Container padding={{ bottom: 'large' }}>
							<Input
								label={t('backup.local_metadata_threshold', 'Local Metadata Threshold')}
								value={initbackupDetail.backupLatencyHighThreshold}
								defaultValue={initbackupDetail.backupLatencyHighThreshold}
								onChange={changeBackupDetail}
								inputName="backupLatencyHighThreshold"
								background="gray5"
							/>
						</Container>
					</ListRow>
					<ListRow>
						<Container padding={{ top: 'large', bottom: 'large' }}>
							<Divider />
						</Container>
					</ListRow>
					<ListRow>
						<Padding bottom="large">
							<Switch
								value={initbackupDetail.ZxBackup_SmartScanSchedulingEnabled}
								onClick={(): void => changeSwitchOption('ZxBackup_SmartScanSchedulingEnabled')}
								label={t('backup.smart_scan_scheduling', 'SmartScan Scheduling')}
							/>
						</Padding>
					</ListRow>
					<ListRow>
						<Container padding={{ bottom: 'large' }}>
							<Input
								label={t('backup.schedule', 'Schedule')}
								value={initbackupDetail.backupSmartScanScheduler?.['cron-pattern']}
								defaultValue={initbackupDetail.backupSmartScanScheduler?.['cron-pattern']}
								onChange={changeBackupSchedulerDetail}
								inputName="backupSmartScanScheduler"
								background="gray5"
							/>
						</Container>
					</ListRow>
					<ListRow>
						<Container padding={{ top: 'large', bottom: 'extralarge' }}>
							<Divider />
						</Container>
					</ListRow>

					<ListRow>
						<Padding bottom="medium">
							<Text size="medium" weight="regular">
								{t('backup.backup_purge', 'Backup Purge')}
							</Text>
						</Padding>
					</ListRow>

					<ListRow>
						<Container padding={{ bottom: 'large' }}>
							<Input
								label={t('backup.schedule', 'Schedule')}
								value={initbackupDetail.backupPurgeScheduler?.['cron-pattern']}
								defaultValue={initbackupDetail.backupPurgeScheduler?.['cron-pattern']}
								onChange={changeBackupSchedulerDetail}
								inputName="backupPurgeScheduler"
								background="gray5"
							/>
						</Container>
					</ListRow>
					<ListRow>
						<Container padding={{ bottom: 'small' }}>
							<Input
								label={t('backup.keep_delted_items_backup', 'Keep deleted items in the backup')}
								value={initbackupDetail.ZxBackup_DataRetentionDays}
								defaultValue={initbackupDetail.ZxBackup_DataRetentionDays}
								onChange={changeBackupDetail}
								inputName="ZxBackup_DataRetentionDays"
								background="gray5"
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
								value={initbackupDetail.backupAccountsRetentionDays}
								defaultValue={initbackupDetail.backupAccountsRetentionDays}
								onChange={changeBackupDetail}
								inputName="backupAccountsRetentionDays"
								background="gray5"
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
export default BackupServerConfig;

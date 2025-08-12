/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useEffect, useState, useCallback, useMemo, ChangeEvent } from 'react';

import {
	Container,
	Row,
	Padding,
	Button,
	Text,
	Divider,
	Switch,
	Input,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { isEqual, reduce, cloneDeep, find, isEmpty } from 'lodash';
import { useTranslation } from 'react-i18next';

import { BACKUP_BASIC, CONFIG, BACKUP_REALTIME } from '../../../constants';
import { modifyBackupRequest } from '../../../services/modify-backup';
import { useBackupStore } from '../../../store/backup/store';
import { useModuleLicenseStore } from '../../../store/module-license/store';
import { useRightsStore, Right, Rights } from '../../../store/rights/store';
import ListRow from '../../list/list-row';
import { RouteLeavingGuard } from '../../ui-extras/nav-guard';

const BackupServerConfig: FC = () => {
	const [t] = useTranslation();
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const globalConfig = useBackupStore((state) => state.globalConfig);
	const setGlobalConfig = useBackupStore((state) => state.setGlobalConfig);
	const [backupDetail, setBackupDetail] = useState<any>(cloneDeep(globalConfig));
	const createSnackbar = useSnackbar();
	const moduleLicense = useModuleLicenseStore((state) => state.moduleLicense);
	const [isBackupModuleLicensed, setIsBackupModuleLicensed] = useState<boolean>(false);
	const [isBackupRealTimeFeatureLicensed, setBackupRealTimeFeatureLicensed] =
		useState<boolean>(false);
	const rights: Rights = useRightsStore((state) => state.rights);
	const allowSetBackup = useMemo(() => {
		const rightsConfig: Right = find(rights, { type: CONFIG }) || { all: [], type: CONFIG };
		return !!rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;
	}, [rights]);

	const onCancel = (): void => {
		setBackupDetail({ ...globalConfig });
	};
	const onSave = (): void => {
		const modifiedKeys: any = reduce(
			globalConfig,
			function (result, value, key): any {
				return isEqual(value, backupDetail[key]) ? result : [...result, key];
			},
			[]
		);
		const modifiedData: any = {};
		modifiedKeys.forEach((ele: any) => {
			modifiedData[ele] = backupDetail[ele];
		});
		modifyBackupRequest(modifiedData)
			.then((data) => {
				if (data?.status === 200 || isEmpty(data)) {
					setGlobalConfig(backupDetail);
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
							t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				}
			})
			.catch((err) => {
				createSnackbar({
					key: 'error',
					severity: 'error',
					label:
						err?.errors?.[0]?.error ||
						err?.statusText ||
						t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	};
	useEffect(() => {
		if (!isEqual(globalConfig, backupDetail)) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}
	}, [globalConfig, backupDetail]);

	const changeSwitchOption = useCallback(
		(key: string): void => {
			setBackupDetail((prev: any) => ({
				...prev,
				[key]: backupDetail[key] !== true
			}));
		},
		[backupDetail]
	);

	const changeBackupDetail = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setBackupDetail((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
		},
		[setBackupDetail]
	);
	const changeBackupSchedulerDetail = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setBackupDetail((prev: any) => ({
				...prev,
				[e.target.name]: {
					...[e.target.name],
					'cron-pattern': e.target.value
				}
			}));
		},
		[setBackupDetail]
	);
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
					<Row mainAlignment="flex-start" width="100%" padding={{ left: 'large', right: 'large' }}>
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
									value={backupDetail.ZxBackup_SmartScanSchedulingEnabled}
									onClick={(): void => changeSwitchOption('ZxBackup_SmartScanSchedulingEnabled')}
									label={t('backup.schedule_smart_scan', 'Schedule Smartscan')}
									iconColor="primary"
									disabled={!allowSetBackup}
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
									onChange={changeBackupSchedulerDetail}
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
									value={backupDetail.backupPurgeScheduler?.['cron-pattern']}
									defaultValue={backupDetail.backupPurgeScheduler?.['cron-pattern']}
									onChange={changeBackupSchedulerDetail}
									inputName="backupPurgeScheduler"
									backgroundColor="gray5"
									disabled={!allowSetBackup}
								/>
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

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
	useSnackbar
} from '@zextras/carbonio-design-system';
import { isEqual, reduce } from 'lodash';
import ListRow from '../../list/list-row';
import { useBackupStore } from '../../../store/backup/store';
import { RouteLeavingGuard } from '../../ui-extras/nav-guard';
import { modifyBackupRequest } from '../../../services/modify-backup';

const BackupServiceStatus: FC = () => {
	const [t] = useTranslation();
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const globalConfig = useBackupStore((state) => state.globalConfig);
	const setGlobalConfig = useBackupStore((state) => state.setGlobalConfig);
	const [initbackupDetail, setInitBackupDetail] = useState<any>({});
	const createSnackbar = useSnackbar();
	const onCancel = (): void => {
		console.log('onCancel');
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
			if (data.status === 200) {
				setGlobalConfig(initbackupDetail);
				createSnackbar({
					key: 'success',
					type: 'success',
					label: t(
						'label.the_last_changes_has_been_saved_successfully',
						'The last changes has been saved successfully'
					),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			} else {
				createSnackbar({
					key: 'error',
					type: 'error',
					label:
						data?.errors?.[0]?.error ||
						data?.statusText ||
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
			setInitBackupDetail({ ...globalConfig });
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
									{t('label.service_status', 'Service Status')}
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
					padding={{ top: 'extralarge' }}
				>
					<ListRow>
						<Switch
							label={t('backup.enable_realtime_scanner', 'Enable Realtime Scanner')}
							value={initbackupDetail.ZxBackup_RealTimeScanner}
							onClick={(): void => changeSwitchOption('ZxBackup_RealTimeScanner')}
						/>
					</ListRow>
					<ListRow>
						<Switch
							value={initbackupDetail.ZxBackup_ModuleEnabledAtStartup}
							label={t(
								'backup.this_module_is_enable_at_the_startup',
								'This module is enabled at the startup'
							)}
							onClick={(): void => changeSwitchOption('ZxBackup_ModuleEnabledAtStartup')}
						/>
					</ListRow>
					<ListRow>
						<Switch
							value={initbackupDetail.ZxBackup_DoSmartScanOnStartup}
							label={t(
								'backup.run_the_smart_scan_at_the_startup',
								'Run the Smartscan at the startup'
							)}
							onClick={(): void => changeSwitchOption('ZxBackup_DoSmartScanOnStartup')}
						/>
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
export default BackupServiceStatus;

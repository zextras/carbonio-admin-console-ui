/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSnackbar } from '@zextras/ui-components';
import { useCurrentUserRights } from '@zextras/ui-shared';
import { cloneDeep, find, isEmpty,isEqual, reduce } from 'lodash-es';
import {
	ChangeEvent,
	Dispatch,
	SetStateAction,
	useCallback,
	useEffect,
	useMemo,
	useState} from 'react';
import { useTranslation } from 'react-i18next';

import { CONFIG } from '../constants';
import { modifyBackupRequest } from '../services/modify-backup';
import { useBackupStore } from '../store/backup/store';

import type { GlobalConfig, ModifyBackupData } from '../../types';

export const useBackupConfig = (): {
	isDirty: boolean;
	backupDetail: GlobalConfig;
	setBackupDetail: Dispatch<SetStateAction<GlobalConfig>>;
	allowSetBackup: boolean;
	onCancel: () => void;
	onSave: () => void;
	changeSwitchOption: (key: string) => void;
	changeBackupDetail: (e: ChangeEvent<HTMLInputElement>) => void;
	changeBackupSchedulerInput: (e: ChangeEvent<HTMLInputElement>) => void;
	changeBackupSchedulerSwitch: (key: string) => void;
	t: (key: string, fallback?: string) => string;
} => {
	const [t] = useTranslation();
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const globalConfig = useBackupStore((state) => state.globalConfig);
	const setGlobalConfig = useBackupStore((state) => state.setGlobalConfig);
	const [backupDetail, setBackupDetail] = useState<GlobalConfig>(cloneDeep(globalConfig));
	const createSnackbar = useSnackbar();
	const { data: rights } = useCurrentUserRights();
	const allowSetBackup = useMemo(() => {
		const rightsConfig = find(rights, { type: CONFIG }) || { all: [], type: CONFIG };
		return !!rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;
	}, [rights]);

	const onCancel = useCallback((): void => {
		setBackupDetail({ ...globalConfig });
	}, [globalConfig]);

	const onSave = useCallback((): void => {
		const modifiedKeys = reduce<GlobalConfig, Array<string>>(
			globalConfig,
			function (result, value, key): Array<string> {
				return isEqual(value, backupDetail[key]) ? result : [...result, key];
			},
			[]
		);
		const modifiedData: ModifyBackupData = {};
		modifiedKeys.forEach((ele: string) => {
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
							data?.errors?.[0]?.error ??
							data?.statusText ??
							(typeof data?.error === 'string' ? data?.error : '') ??
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
						err?.errors?.[0]?.error ??
						err?.statusText ??
						t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	}, [globalConfig, backupDetail, setGlobalConfig, createSnackbar, t]);

	useEffect(() => {
		if (!isEqual(globalConfig, backupDetail)) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}
	}, [globalConfig, backupDetail]);

	const changeSwitchOption = useCallback(
		(key: string): void => {
			setBackupDetail((prev: GlobalConfig) => ({
				...prev,
				[key]: backupDetail[key] !== true
			}));
		},
		[backupDetail]
	);

	const changeBackupDetail = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setBackupDetail((prev: GlobalConfig) => ({ ...prev, [e.target.name]: e.target.value }));
	}, []);

	const changeBackupSchedulerInput = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setBackupDetail((prev: GlobalConfig) => ({
				...prev,
				[e.target.name]: {
					...[e.target.name],
					'cron-pattern': e.target.value,
					'cron-enabled': (backupDetail[e.target.name] as { 'cron-enabled': boolean })['cron-enabled']
				}
			}));
		},
		[backupDetail]
	);

	const changeBackupSchedulerSwitch = useCallback(
		(key: string): void => {
			setBackupDetail((prev: GlobalConfig) => ({
				...prev,
				[key]: {
					...[key],
					'cron-pattern': (backupDetail[key] as { 'cron-pattern': string })['cron-pattern'],
					'cron-enabled': (backupDetail[key] as { 'cron-enabled': boolean })['cron-enabled'] !== true
				}
			}));
		},
		[backupDetail]
	);

	return {
		isDirty,
		backupDetail,
		setBackupDetail,
		allowSetBackup,
		onCancel,
		onSave,
		changeSwitchOption,
		changeBackupDetail,
		changeBackupSchedulerInput,
		changeBackupSchedulerSwitch,
		t
	};
};

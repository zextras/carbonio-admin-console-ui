/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { useCurrentUserRights } from '@zextras/ui-shared';
import type { TFunction } from 'i18next';
import { cloneDeep, find, isEmpty, isEqual, reduce } from 'lodash-es';
import { type ChangeEvent, type Dispatch, type SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { GlobalConfig, ModifyBackupData } from '../../types';
import { CONFIG } from '../constants';
import { backupQueryKeys } from '../services/backup-query-keys';
import { modifyBackupRequest } from '../services/modify-backup';
import { useGlobalConfig } from '../services/use-global-config';

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
  t: TFunction;
} => {
  const [t] = useTranslation();
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const { data: globalConfig = {} } = useGlobalConfig();
  const queryClient = useQueryClient();
  const [backupDetail, setBackupDetail] = useState<GlobalConfig>(cloneDeep(globalConfig));
  const createSnackbar = useSnackbar();
  const { data: rights } = useCurrentUserRights();
  const rightsConfig = find(rights, { type: CONFIG }) || { all: [], type: CONFIG };
  const allowSetBackup = !!rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;

  const onCancel = (): void => {
    setBackupDetail({ ...globalConfig });
  };

  const onSave = (): void => {
    const modifiedKeys = reduce<GlobalConfig, Array<string>>(
      globalConfig,
      function (result, value, key): Array<string> {
        return isEqual(value, backupDetail[key]) ? result : [...result, key];
      },
      [],
    );
    const modifiedData: ModifyBackupData = {};
    modifiedKeys.forEach((ele: string) => {
      modifiedData[ele] = backupDetail[ele];
    });

    modifyBackupRequest(modifiedData)
      .then((data) => {
        if (data?.status === 200 || isEmpty(data)) {
          queryClient.setQueryData(backupQueryKeys.globalConfig(), backupDetail);
          queryClient.invalidateQueries({ queryKey: backupQueryKeys.globalConfig() });
          createSnackbar({
            key: 'success',
            severity: 'success',
            label: t(
              'label.the_last_changes_has_been_saved_successfully',
              'Changes have been saved successfully',
            ),
            autoHideTimeout: 3000,
            hideButton: true,
            replace: true,
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
            replace: true,
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
          replace: true,
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

  const changeSwitchOption = (key: string): void => {
    setBackupDetail((prev: GlobalConfig) => ({
      ...prev,
      [key]: backupDetail[key] !== true,
    }));
  };

  const changeBackupDetail = (e: ChangeEvent<HTMLInputElement>) => {
    setBackupDetail((prev: GlobalConfig) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const changeBackupSchedulerInput = (e: ChangeEvent<HTMLInputElement>) => {
    setBackupDetail((prev: GlobalConfig) => ({
      ...prev,
      [e.target.name]: {
        ...prev[e.target.name],
        'cron-pattern': e.target.value,
        'cron-enabled': (backupDetail[e.target.name] as { 'cron-enabled': boolean })[
          'cron-enabled'
        ],
      },
    }));
  };

  const changeBackupSchedulerSwitch = (key: string): void => {
    setBackupDetail((prev: GlobalConfig) => ({
      ...prev,
      [key]: {
        ...prev[key],
        'cron-pattern': (backupDetail[key] as { 'cron-pattern': string })['cron-pattern'],
        'cron-enabled':
          (backupDetail[key] as { 'cron-enabled': boolean })['cron-enabled'] !== true,
      },
    }));
  };

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
    t,
  };
};

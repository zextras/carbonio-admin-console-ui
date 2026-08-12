/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCurrentUserRights } from '@zextras/ui-shared';
import type { TFunction } from 'i18next';
import { cloneDeep, isEqual, reduce } from 'lodash-es';
import { type ChangeEvent, type Dispatch, type SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { CronScheduler, GlobalConfig, ModifyBackupData } from '../../types';
import { useGlobalConfig } from '../services/use-global-config';
import { useModifyBackupConfig } from '../services/use-modify-backup-config';
import { checkAllowSetBackup } from '../utils/check-backup-rights';

export const useBackupConfig = (): {
  isDirty: boolean;
  isSaving: boolean;
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
  const modifyMutation = useModifyBackupConfig();
  const [backupDetail, setBackupDetail] = useState<GlobalConfig>(cloneDeep(globalConfig));
  const { data: rights } = useCurrentUserRights();
  const allowSetBackup = checkAllowSetBackup(rights);

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

    modifyMutation.mutate(modifiedData);
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
        ...(prev[e.target.name] as CronScheduler),
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
        ...(prev[key] as CronScheduler),
        'cron-pattern': (backupDetail[key] as { 'cron-pattern': string })['cron-pattern'],
        'cron-enabled':
          (backupDetail[key] as { 'cron-enabled': boolean })['cron-enabled'] !== true,
      },
    }));
  };

  return {
    isDirty,
    isSaving: modifyMutation.isPending,
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

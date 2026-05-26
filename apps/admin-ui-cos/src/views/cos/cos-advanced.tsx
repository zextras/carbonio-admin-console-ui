/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container } from '@zextras/ui-components';
import {
  isValidDecimalInput,
  resetFileQuotaLimitById,
  setCoreAttributes,
  setFileQuotaLimitById,
  useCurrentUserRights,
  useIsAdvanced,
  useTotalQuotaActive,
} from '@zextras/ui-shared';
import { find } from 'lodash-es';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { AccountType } from '../../../types/account';
import { Attribute } from '../../../types/attribute';
import { TimeItems } from '../../../types/general';
import {
  BACKUP_ENABLED,
  BACKUP_SELF_UNDELETE_ALLOWED,
  COS,
  ZIMBRA_ADMIN_URN,
} from '../../constants';
import { ComputedLimit, QuotaSource } from '../../services/get-cos-quota';
import { ModifyCosBody } from '../../services/modify-cos-service';
import { setCosQuota } from '../../services/set-cos-quota';
import { unsetCosQuota } from '../../services/unset-cos-quota';
import { useCoreAttributes } from '../../services/use-core-attributes';
import { useCosDetail } from '../../services/use-cos-detail';
import { useCosQuota } from '../../services/use-cos-quota';
import { useFileQuota } from '../../services/use-file-quota';
import { useInvalidateCosQuota } from '../../services/use-invalidate-cos-quota';
import { useModifyCos } from '../../services/use-modify-cos';
import { PageLayout } from '../page-layout';
import { BytesToGB, GbToBytes } from '../utility/utils';
import COSEmailRetentionPolicy from './advanced/cos-email-retention-policy';
import COSFailedLoginPolicy from './advanced/cos-failed-login-policy';
import COSForwarding from './advanced/cos-forwarding';
import COSGeneralOptions from './advanced/cos-general-options';
import COSPassword from './advanced/cos-password';
import COSQuotas from './advanced/cos-quotas';
import COSTimeoutPolicy from './advanced/cos-timeout-policy';
import { useTimeFields } from './advanced/hooks/use-time-fields';

const EXCLUDED_ATTRIBUTES_WHEN_TOTAL_QUOTA_ACTIVE: Array<string> = [
  'zimbraMailQuota',
  'zimbraQuotaWarnPercent',
  'zimbraQuotaWarnInterval',
  'zimbraQuotaWarnMessage',
] satisfies Array<keyof AccountType>;

type AdvancedBackupAttributes = {
  [BACKUP_ENABLED]: boolean | undefined;
  [BACKUP_SELF_UNDELETE_ALLOWED]: boolean | undefined;
};

type AdvancedBackupAttributesKeys = keyof AdvancedBackupAttributes;

function isBackupAttribute(key: string): key is AdvancedBackupAttributesKeys {
  return key === BACKUP_ENABLED || key === BACKUP_SELF_UNDELETE_ALLOWED;
}

function computedLimitsEqual(a: ComputedLimit, b: ComputedLimit): boolean {
  if (a.type !== b.type) return false;
  if (a.type === 'limited' && b.type === 'limited') return a.value === b.value;
  return true;
}

function saveBackupAttributes(
  cosAdvancedBackupAttributes: AdvancedBackupAttributes,
  cosName: string | undefined,
): void {
  const updateBackupAttributes = Object.keys(cosAdvancedBackupAttributes).reduce((acc, key) => {
    if (isBackupAttribute(key) && cosAdvancedBackupAttributes[key] !== undefined) {
      return {
        ...acc,
        [key]: {
          value: cosAdvancedBackupAttributes[key],
          objectName: cosName,
          configType: COS,
        },
      };
    }
    return acc;
  }, {});
  if (Object.keys(updateBackupAttributes).length > 0) {
    setCoreAttributes(updateBackupAttributes);
  }
}

const COS_ADVANCED_FIELD_DEFAULTS: Array<[keyof AccountType, string]> = [
  ['zimbraMailForwardingAddressMaxLength', ''],
  ['zimbraMailForwardingAddressMaxNumAddrs', ''],
  ['zimbraMailQuota', ''],
  ['zimbraContactMaxNumEntries', ''],
  ['zimbraQuotaWarnPercent', ''],
  ['zimbraQuotaWarnInterval', ''],
  ['zimbraQuotaWarnMessage', ''],
  ['zimbraPasswordLocked', 'FALSE'],
  ['zimbraPasswordMinLength', ''],
  ['zimbraPasswordMaxLength', ''],
  ['zimbraPasswordMinUpperCaseChars', ''],
  ['zimbraPasswordMinLowerCaseChars', ''],
  ['zimbraPasswordMinPunctuationChars', ''],
  ['zimbraPasswordMinNumericChars', ''],
  ['zimbraPasswordMinDigitsOrPuncs', ''],
  ['zimbraPasswordMinAge', ''],
  ['zimbraPasswordMaxAge', ''],
  ['zimbraPasswordEnforceHistory', ''],
  ['zimbraPasswordBlockCommonEnabled', 'FALSE'],
  ['zimbraPasswordLockoutEnabled', 'FALSE'],
  ['zimbraPasswordLockoutMaxFailures', ''],
  ['zimbraPasswordLockoutDuration', ''],
  ['zimbraPasswordLockoutFailureLifetime', ''],
  ['zimbraAdminAuthTokenLifetime', ''],
  ['zimbraAuthTokenLifetime', ''],
  ['zimbraMailIdleSessionTimeout', ''],
  ['zimbraMailMessageLifetime', ''],
  ['zimbraMailTrashLifetime', ''],
  ['zimbraMailSpamLifetime', ''],
  ['zimbraFreebusyExchangeUserOrg', ''],
];

const COS_INITIAL_VALUES_EXTRA: Array<[keyof AccountType, string]> = [
  ['zimbraDataSourceMinPollingInterval', ''],
  ['zimbraDataSourceCalendarPollingInterval', ''],
  ['zimbraDataSourceRssPollingInterval', ''],
];

function getQuotaSource(
  override: ComputedLimit | null | undefined,
  initialSource: QuotaSource | undefined,
): QuotaSource | undefined {
  if (override === null) return initialSource;
  if (override === undefined) return 'global' as QuotaSource;
  return 'cos' as QuotaSource;
}

export const CosAdvanced = () => {
  const [t] = useTranslation();
  const { cosId } = useParams();
  const invalidateCosQuota = useInvalidateCosQuota();
  const isTotalQuotaActive = useTotalQuotaActive();
  const { data: cosDetailData, isPending } = useCosDetail(cosId);
  const cosInformation = cosDetailData?.cos?.[0]?.a;
  const [cosData, setCosData] = useState<AccountType>({});
  const { data: rights = [] } = useCurrentUserRights();
  const modifyCosMutation = useModifyCos(cosId);
  const isAdvanced = useIsAdvanced();
  const readonlyCOS = (() => {
    const rightsConfig = find(rights, { type: COS }) || { all: [], type: COS };
    return !rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;
  })();
  const timeItems: TimeItems = [
    {
      label: t('label.seconds', 'Seconds'),
      value: 's',
    },
    {
      label: t('label.minutes', 'Minutes'),
      value: 'm',
    },
    {
      label: t('label.hours', 'Hours'),
      value: 'h',
    },
    {
      label: t('label.days', 'Days'),
      value: 'd',
    },
  ];

  const labels = {
    snackbar: {
      successMessage: t('label.change_save_success_msg', 'The change has been saved successfully'),
      errorMessage: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
    },
    advanced: t('cos.advanced', 'Advanced'),
    saveButton: t('label.save', 'Save'),
    cancelButton: t('label.cancel', 'Cancel'),
  };

  const [backupOverrides, setBackupOverrides] = useState<Partial<AdvancedBackupAttributes>>({});

  const [cosAdvanced, setCosAdvanced] = useState<AccountType>(
    () => Object.fromEntries(COS_ADVANCED_FIELD_DEFAULTS) as AccountType,
  );
  const timeFields = useTimeFields(setCosAdvanced);
  const [fileQuotaOverride, setFileQuotaOverride] = useState<string | undefined>(undefined);
  const [showFileQuotaLimitMsg, setShowFileQuotaLimitMsg] = useState<boolean>(false);
  const [showAccountQuotaLimitMsg, setShowAccountQuotaLimitMsg] = useState<boolean>(false);
  const [accountQuotaGBValue, setAccountQuotaGBValue] = useState('');
  const { data: fileQuotaData } = useFileQuota(
    cosData?.zimbraId,
    !!cosData?.zimbraId && isAdvanced && !isTotalQuotaActive,
  );
  const initFileQuotaLimitGBValue = fileQuotaData?.limit
    ? BytesToGB(fileQuotaData.limit).toFixed(2)
    : undefined;
  const fileQuotaLimitGBValue = fileQuotaOverride ?? initFileQuotaLimitGBValue;
  const { data: cosQuotaData, isPending: isCosQuotaPending } = useCosQuota(
    cosData?.zimbraId,
    !!cosData?.zimbraId && isAdvanced && isTotalQuotaActive,
  );
  const initTotalComputedQuotaLimit = cosQuotaData?.totalComputedLimit;
  const initTotalQuotaSource = cosQuotaData?.totalQuotaSource;
  const initialQuotaRef = useRef<{ limit: ComputedLimit; source: QuotaSource } | null>(null);
  if (cosQuotaData && initialQuotaRef.current === null) {
    initialQuotaRef.current = {
      limit: cosQuotaData.totalComputedLimit,
      source: cosQuotaData.totalQuotaSource,
    };
  }
  const [totalQuotaOverride, setTotalQuotaOverride] = useState<ComputedLimit | null | undefined>(
    null,
  );
  const totalComputedQuotaLimit =
    totalQuotaOverride === null ? initTotalComputedQuotaLimit : totalQuotaOverride;
  const totalQuotaSource = getQuotaSource(totalQuotaOverride, initTotalQuotaSource);
  const showQuotaRevertButton =
    totalQuotaSource === 'cos' &&
    initialQuotaRef.current !== null &&
    !computedLimitsEqual(
      totalComputedQuotaLimit ?? initialQuotaRef.current.limit,
      initialQuotaRef.current.limit,
    );

  const isDirty =
    (Object.keys(cosAdvanced) as Array<keyof AccountType>).some(
      (key) => cosData[key] !== undefined && cosData[key] !== cosAdvanced[key],
    ) ||
    (fileQuotaLimitGBValue !== undefined && initFileQuotaLimitGBValue !== fileQuotaLimitGBValue) ||
    (isTotalQuotaActive && totalQuotaOverride !== null) ||
    Object.keys(backupOverrides).length > 0;

  const setValue = (key: keyof AccountType, value: AccountType[keyof AccountType]): void => {
    setCosAdvanced((prev: AccountType) => ({ ...prev, [key]: value }));
  };

  const setInitialValues = (obj: AccountType): void => {
    if (!obj) return;
    [...COS_ADVANCED_FIELD_DEFAULTS, ...COS_INITIAL_VALUES_EXTRA].forEach(([key, defaultVal]) => {
      setValue(key, (obj?.[key] ? obj?.[key] : defaultVal) as AccountType[keyof AccountType]);
    });
  };

  const setStateAttrValues = (obj: AccountType): void => {
    if (!obj) return;
    const defaultType = timeItems[0]?.value;
    timeFields.quotaWarnInterval.reset(obj?.zimbraQuotaWarnInterval, defaultType);
    timeFields.passwordLockoutDuration.reset(obj?.zimbraPasswordLockoutDuration, defaultType);
    timeFields.passwordLockoutFailureLifetime.reset(
      obj?.zimbraPasswordLockoutFailureLifetime,
      defaultType,
    );
    timeFields.adminAuthTokenLifetime.reset(obj?.zimbraAdminAuthTokenLifetime, defaultType);
    timeFields.authTokenLifetime.reset(obj?.zimbraAuthTokenLifetime, defaultType);
    timeFields.mailIdleSessionTimeout.reset(obj?.zimbraMailIdleSessionTimeout, defaultType);
    timeFields.mailTrashLifetime.reset(obj?.zimbraMailTrashLifetime, defaultType);
    timeFields.mailSpamLifetime.reset(obj?.zimbraMailSpamLifetime, defaultType);
    timeFields.mailMessageLifetime.reset(obj?.zimbraMailMessageLifetime, defaultType);

    setAccountQuotaGBValue(obj?.zimbraMailQuota ? BytesToGB(obj?.zimbraMailQuota).toFixed(2) : '');
  };

  useEffect(() => {
    if (!!cosInformation && cosInformation.length > 0) {
      const obj: AccountType = {};
      cosInformation.forEach((item: Attribute) => {
        obj[item?.n as keyof AccountType] = item._content;
      });
      COS_ADVANCED_FIELD_DEFAULTS.forEach(([key, defaultVal]) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!obj[key]) (obj as any)[key] = defaultVal;
      });
      setCosData(obj);
      setInitialValues(obj);
      setStateAttrValues(obj);
    }
  }, [cosInformation, setInitialValues, setStateAttrValues]);

  const changeValue = (e: ChangeEvent<HTMLInputElement>) => {
    setCosAdvanced((prev: AccountType) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const changeSwitchOption = (key: keyof AccountType): void => {
    setCosAdvanced((prev: AccountType) => ({
      ...prev,
      [key]: cosAdvanced[key] === 'TRUE' ? 'FALSE' : 'TRUE',
    }));
  };

  const onTotalQuotaChange = (value?: ComputedLimit) => {
    if (
      value &&
      initialQuotaRef.current?.source === 'global' &&
      computedLimitsEqual(value, initialQuotaRef.current.limit)
    ) {
      setTotalQuotaOverride(undefined);
    } else {
      setTotalQuotaOverride(value);
    }
  };

  const onCancel = (): void => {
    setInitialValues(cosData);
    setStateAttrValues(cosData);
    setFileQuotaOverride(undefined);
    setBackupOverrides({});
    setTotalQuotaOverride(null);
  };

  const onFileQuotaChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isValidDecimalInput(e.target.value)) return;
    const decimalPoints = e.target.value?.split('.')[1];
    if (!!decimalPoints && decimalPoints?.length > 3) {
      setShowFileQuotaLimitMsg(true);
      return;
    }
    setShowFileQuotaLimitMsg(false);
    setFileQuotaOverride(e.target.value);
  };

  const onZimbraMailQuotaChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isValidDecimalInput(e.target.value)) return;
    const decimalPoints = e.target.value?.split('.')[1];
    if (!!decimalPoints && decimalPoints?.length > 3) {
      setShowAccountQuotaLimitMsg(true);
      return;
    }
    setShowAccountQuotaLimitMsg(false);
    setAccountQuotaGBValue(e.target.value);
    setCosAdvanced((prev: AccountType) => ({
      ...prev,
      zimbraMailQuota: e.target.value ? Math.round(GbToBytes(e.target.value)) : '',
    }));
  };

  const cosName = cosDetailData?.cos?.[0]?.name;
  const setFileQuotaLimit = (cosId: string, limit: string) => {
    setFileQuotaLimitById(cosId, limit, COS).then(() => {
      setShowFileQuotaLimitMsg(false);
    });
  };

  const resetFileQuotaLimit = (cosId: string) => {
    resetFileQuotaLimitById(cosId, COS).then(() => {
      setShowFileQuotaLimitMsg(false);
    });
  };

  const handleQuotaSave = async (zimbraId: string) => {
    if (!isTotalQuotaActive || totalQuotaOverride === null) return;
    if (totalQuotaOverride) {
      await setCosQuota(zimbraId, totalQuotaOverride);
    } else {
      await unsetCosQuota(zimbraId);
    }
    await invalidateCosQuota(zimbraId);
    setTotalQuotaOverride(null);
  };

  const getAttributesToSave = (): AccountType => {
    if (!isTotalQuotaActive) return cosAdvanced;
    return Object.fromEntries(
      Object.entries(cosAdvanced).filter(
        ([key]) => !EXCLUDED_ATTRIBUTES_WHEN_TOTAL_QUOTA_ACTIVE.includes(key),
      ),
    ) as AccountType;
  };

  const onSave = async (): Promise<void> => {
    const { zimbraId = '' } = cosData;

    saveBackupAttributes(cosAdvancedBackupAttributes, cosName);

    await handleQuotaSave(zimbraId);

    const cosAdvancedToSave = getAttributesToSave();

    const attributes: Attribute[] = Object.keys(cosAdvancedToSave).map((ele) => ({
      n: ele,
      _content: cosAdvancedToSave[ele as keyof AccountType]?.toString() ?? '',
    }));

    const body: ModifyCosBody = {
      _jsns: ZIMBRA_ADMIN_URN,
      id: { _content: zimbraId },
      a: attributes,
    };

    modifyCosMutation.mutate(body, {
      onSuccess: () => {
        if (
          !isTotalQuotaActive &&
          isAdvanced &&
          initFileQuotaLimitGBValue !== fileQuotaLimitGBValue
        ) {
          if (fileQuotaLimitGBValue) {
            setFileQuotaLimit(zimbraId, Math.round(GbToBytes(fileQuotaLimitGBValue)).toString());
          } else {
            resetFileQuotaLimit(zimbraId);
          }
        }
      },
    });
  };

  const coreAttributesBody =
    isAdvanced && cosName
      ? [
          {
            configType: COS,
            configName: [cosName],
            attrName: [BACKUP_SELF_UNDELETE_ALLOWED, BACKUP_ENABLED],
          },
        ]
      : [];

  const { data: coreAttributesData } = useCoreAttributes(coreAttributesBody);

  const cosAdvancedBackupAttributes: AdvancedBackupAttributes = {
    [BACKUP_ENABLED]:
      backupOverrides[BACKUP_ENABLED] ??
      !!coreAttributesData?.attributes?.[BACKUP_ENABLED]?.[0]?.value,
    [BACKUP_SELF_UNDELETE_ALLOWED]:
      backupOverrides[BACKUP_SELF_UNDELETE_ALLOWED] ??
      !!coreAttributesData?.attributes?.[BACKUP_SELF_UNDELETE_ALLOWED]?.[0]?.value,
  };

  const changeBackupAttribute = (key: AdvancedBackupAttributesKeys): void => {
    const newValue = !cosAdvancedBackupAttributes[key];
    const serverValue = !!coreAttributesData?.attributes?.[key]?.[0]?.value;
    if (newValue === serverValue) {
      setBackupOverrides((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } else {
      setBackupOverrides((prev) => ({
        ...prev,
        [key]: newValue,
      }));
    }
  };

  if (isPending || isCosQuotaPending) {
    return <ds-page-shimmer></ds-page-shimmer>;
  }

  return (
    <PageLayout
      title={labels.advanced}
      onSave={onSave}
      onCancel={onCancel}
      unSavedChanges={isDirty}
    >
      <Container mainAlignment="flex-start" width="100%" orientation="vertical">
        {isAdvanced && (
          <COSGeneralOptions
            cosAdvancedBackupAttributes={cosAdvancedBackupAttributes}
            readonlyCOS={readonlyCOS}
            changeBackupAttribute={changeBackupAttribute}
          />
        )}
        <COSForwarding
          cosAdvanced={cosAdvanced}
          changeValue={changeValue}
          readonlyCOS={readonlyCOS}
        />
        <COSQuotas
          isTotalQuotaActive={isTotalQuotaActive}
          isAdvanced={isAdvanced}
          showFileQuotaLimitMsg={showFileQuotaLimitMsg}
          showAccountQuotaLimitMsg={showAccountQuotaLimitMsg}
          readonlyCOS={readonlyCOS}
          cosAdvanced={cosAdvanced}
          initFileQuotaLimitGBValue={initFileQuotaLimitGBValue}
          fileQuotaLimitGBValue={fileQuotaLimitGBValue}
          accountQuotaGBValue={accountQuotaGBValue}
          quotaWarnInterval={timeFields.quotaWarnInterval}
          timeItems={timeItems}
          onFileQuotaChange={onFileQuotaChange}
          onZimbraMailQuotaChange={onZimbraMailQuotaChange}
          changeValue={changeValue}
          totalComputedQuotaLimit={totalComputedQuotaLimit}
          totalQuotaSource={totalQuotaSource}
          initialTotalComputedQuotaLimit={initTotalComputedQuotaLimit}
          onTotalQuotaChange={onTotalQuotaChange}
          showQuotaRevertButton={showQuotaRevertButton}
        />
        <COSPassword
          cosAdvanced={cosAdvanced}
          readonlyCOS={readonlyCOS}
          changeSwitchOption={changeSwitchOption}
          changeValue={changeValue}
        />
        <COSFailedLoginPolicy
          cosAdvanced={cosAdvanced}
          readonlyCOS={readonlyCOS}
          timeItems={timeItems}
          passwordLockoutDuration={timeFields.passwordLockoutDuration}
          passwordLockoutFailureLifetime={timeFields.passwordLockoutFailureLifetime}
          changeSwitchOption={changeSwitchOption}
          changeValue={changeValue}
        />
        <COSTimeoutPolicy
          adminAuthTokenLifetime={timeFields.adminAuthTokenLifetime}
          authTokenLifetime={timeFields.authTokenLifetime}
          mailIdleSessionTimeout={timeFields.mailIdleSessionTimeout}
          readonlyCOS={readonlyCOS}
          timeItems={timeItems}
        />
        <COSEmailRetentionPolicy
          mailMessageLifetime={timeFields.mailMessageLifetime}
          mailTrashLifetime={timeFields.mailTrashLifetime}
          mailSpamLifetime={timeFields.mailSpamLifetime}
          readonlyCOS={readonlyCOS}
          timeItems={timeItems}
        />
      </Container>
    </PageLayout>
  );
};

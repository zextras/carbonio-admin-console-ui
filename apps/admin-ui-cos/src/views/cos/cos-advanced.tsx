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
import { useTimeFieldState } from './advanced/hooks/use-time-field-state';

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

  const [cosAdvanced, setCosAdvanced] = useState<AccountType>({
    zimbraMailForwardingAddressMaxLength: '',
    zimbraMailForwardingAddressMaxNumAddrs: '',
    zimbraMailQuota: '',
    zimbraContactMaxNumEntries: '',
    zimbraQuotaWarnPercent: '',
    zimbraQuotaWarnInterval: '',
    zimbraQuotaWarnMessage: '',
    zimbraPasswordLocked: 'FALSE',
    zimbraPasswordMinLength: '',
    zimbraPasswordMaxLength: '',
    zimbraPasswordMinUpperCaseChars: '',
    zimbraPasswordMinLowerCaseChars: '',
    zimbraPasswordMinPunctuationChars: '',
    zimbraPasswordMinNumericChars: '',
    zimbraPasswordMinDigitsOrPuncs: '',
    zimbraPasswordMinAge: '',
    zimbraPasswordMaxAge: '',
    zimbraPasswordEnforceHistory: '',
    zimbraPasswordBlockCommonEnabled: 'FALSE',
    zimbraPasswordLockoutEnabled: 'FALSE',
    zimbraPasswordLockoutMaxFailures: '',
    zimbraPasswordLockoutDuration: '',
    zimbraPasswordLockoutFailureLifetime: '',
    zimbraAdminAuthTokenLifetime: '',
    zimbraAuthTokenLifetime: '',
    zimbraMailIdleSessionTimeout: '',
    zimbraMailMessageLifetime: '',
    zimbraMailTrashLifetime: '',
    zimbraMailSpamLifetime: '',
    zimbraFreebusyExchangeUserOrg: '',
  });
  const mailMessageLifetime = useTimeFieldState((v) =>
    setCosAdvanced((prev: AccountType) => ({ ...prev, zimbraMailMessageLifetime: v })),
  );
  const quotaWarnInterval = useTimeFieldState((v) =>
    setCosAdvanced((prev: AccountType) => ({ ...prev, zimbraQuotaWarnInterval: v })),
  );
  const passwordLockoutDuration = useTimeFieldState((v) =>
    setCosAdvanced((prev: AccountType) => ({ ...prev, zimbraPasswordLockoutDuration: v })),
  );
  const passwordLockoutFailureLifetime = useTimeFieldState((v) =>
    setCosAdvanced((prev: AccountType) => ({ ...prev, zimbraPasswordLockoutFailureLifetime: v })),
  );
  const adminAuthTokenLifetime = useTimeFieldState((v) =>
    setCosAdvanced((prev: AccountType) => ({ ...prev, zimbraAdminAuthTokenLifetime: v })),
  );
  const authTokenLifetime = useTimeFieldState((v) =>
    setCosAdvanced((prev: AccountType) => ({ ...prev, zimbraAuthTokenLifetime: v })),
  );
  const mailIdleSessionTimeout = useTimeFieldState((v) =>
    setCosAdvanced((prev: AccountType) => ({ ...prev, zimbraMailIdleSessionTimeout: v })),
  );
  const mailTrashLifetime = useTimeFieldState((v) =>
    setCosAdvanced((prev: AccountType) => ({ ...prev, zimbraMailTrashLifetime: v })),
  );
  const mailSpamLifetime = useTimeFieldState((v) =>
    setCosAdvanced((prev: AccountType) => ({ ...prev, zimbraMailSpamLifetime: v })),
  );
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
  const totalQuotaSource =
    totalQuotaOverride === null
      ? initTotalQuotaSource
      : totalQuotaOverride === undefined
        ? ('global' as QuotaSource)
        : ('cos' as QuotaSource);
  const effectiveQuotaLimit =
    totalQuotaOverride === null ? initTotalComputedQuotaLimit : totalQuotaOverride;
  const showQuotaRevertButton =
    totalQuotaSource === 'cos' &&
    initialQuotaRef.current !== null &&
    !computedLimitsEqual(
      effectiveQuotaLimit ?? initialQuotaRef.current.limit,
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

  const setInitalValues = (obj: AccountType): void => {
    if (!obj) return;
    [...COS_ADVANCED_FIELD_DEFAULTS, ...COS_INITIAL_VALUES_EXTRA].forEach(([key, defaultVal]) => {
      setValue(key, (obj?.[key] ? obj?.[key] : defaultVal) as AccountType[keyof AccountType]);
    });
  };

  const setStateAttrValues = (obj: AccountType): void => {
    if (!obj) return;
    const defaultType = timeItems[0]?.value;
    quotaWarnInterval.reset(obj?.zimbraQuotaWarnInterval, defaultType);
    passwordLockoutDuration.reset(obj?.zimbraPasswordLockoutDuration, defaultType);
    passwordLockoutFailureLifetime.reset(obj?.zimbraPasswordLockoutFailureLifetime, defaultType);
    adminAuthTokenLifetime.reset(obj?.zimbraAdminAuthTokenLifetime, defaultType);
    authTokenLifetime.reset(obj?.zimbraAuthTokenLifetime, defaultType);
    mailIdleSessionTimeout.reset(obj?.zimbraMailIdleSessionTimeout, defaultType);
    mailTrashLifetime.reset(obj?.zimbraMailTrashLifetime, defaultType);
    mailSpamLifetime.reset(obj?.zimbraMailSpamLifetime, defaultType);
    mailMessageLifetime.reset(obj?.zimbraMailMessageLifetime, defaultType);

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
      setInitalValues(obj);
      setStateAttrValues(obj);
    }
  }, [cosInformation]);

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
    setInitalValues(cosData);
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

  const onSave = async (): Promise<void> => {
    const { zimbraId = '' } = cosData;

    saveBackupAttributes(cosAdvancedBackupAttributes, cosName);

    if (isTotalQuotaActive && totalQuotaOverride !== null) {
      if (totalQuotaOverride) {
        await setCosQuota(zimbraId, totalQuotaOverride);
      } else {
        await unsetCosQuota(zimbraId);
      }
      await invalidateCosQuota(zimbraId);
      setTotalQuotaOverride(null);
    }

    const cosAdvancedToSave = isTotalQuotaActive
      ? (Object.fromEntries(
          Object.entries(cosAdvanced).filter(
            ([key]) => !EXCLUDED_ATTRIBUTES_WHEN_TOTAL_QUOTA_ACTIVE.includes(key),
          ),
        ) as AccountType)
      : cosAdvanced;

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
    return (
      <Container crossAlignment="center" mainAlignment="center" height="fill">
        <ds-spinner />
      </Container>
    );
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
          zimbraQuotaWarnIntervalNum={quotaWarnInterval.num}
          timeItems={timeItems}
          zimbraQuotaWarnIntervalType={quotaWarnInterval.type ?? ''}
          onFileQuotaChange={onFileQuotaChange}
          onZimbraMailQuotaChange={onZimbraMailQuotaChange}
          changeValue={changeValue}
          onZimbraQuotaWarnIntervalNumChange={quotaWarnInterval.onNumChange}
          onZimbraQuotaWarnIntervalTypeChange={quotaWarnInterval.onTypeChange}
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
          zimbraPasswordLockoutDurationNum={passwordLockoutDuration.num}
          zimbraPasswordLockoutDurationType={passwordLockoutDuration.type}
          zimbraPasswordLockoutFailureLifetimeNum={passwordLockoutFailureLifetime.num}
          zimbraPasswordLockoutFailureLifetimeType={passwordLockoutFailureLifetime.type}
          changeSwitchOption={changeSwitchOption}
          changeValue={changeValue}
          onZimbraPasswordLockoutDurationNumChange={passwordLockoutDuration.onNumChange}
          onZimbraPasswordLockoutDurationTypeChange={passwordLockoutDuration.onTypeChange}
          onZimbraPasswordLockoutFailureLifetimeNumChange={
            passwordLockoutFailureLifetime.onNumChange
          }
          onZimbraPasswordLockoutFailureLifetimeTypeChange={
            passwordLockoutFailureLifetime.onTypeChange
          }
        />
        <COSTimeoutPolicy
          zimbraAdminAuthTokenLifetimeNum={adminAuthTokenLifetime.num}
          zimbraAdminAuthTokenLifetimeType={adminAuthTokenLifetime.type}
          zimbraAuthTokenLifetimeNum={authTokenLifetime.num}
          zimbraAuthTokenLifetimeType={authTokenLifetime.type}
          zimbraMailIdleSessionTimeoutNum={mailIdleSessionTimeout.num}
          zimbraMailIdleSessionTimeoutType={mailIdleSessionTimeout.type}
          readonlyCOS={readonlyCOS}
          timeItems={timeItems}
          onZimbraAdminAuthTokenLifetimeNumChange={adminAuthTokenLifetime.onNumChange}
          onZimbraAdminAuthTokenLifetimeTypeChange={adminAuthTokenLifetime.onTypeChange}
          onZimbraAuthTokenLifetimeNumChange={authTokenLifetime.onNumChange}
          onZimbraAuthTokenLifetimeTypeChange={authTokenLifetime.onTypeChange}
          onZimbraMailIdleSessionTimeoutNumChange={mailIdleSessionTimeout.onNumChange}
          onZimbraMailIdleSessionTimeoutTypeChange={mailIdleSessionTimeout.onTypeChange}
        />
        <COSEmailRetentionPolicy
          zimbraMailMessageLifetimeNum={mailMessageLifetime.num}
          zimbraMailMessageLifetimeType={mailMessageLifetime.type}
          zimbraMailTrashLifetimeNum={mailTrashLifetime.num}
          zimbraMailTrashLifetimeType={mailTrashLifetime.type}
          zimbraMailSpamLifetimeNum={mailSpamLifetime.num}
          zimbraMailSpamLifetimeType={mailSpamLifetime.type}
          readonlyCOS={readonlyCOS}
          timeItems={timeItems}
          onZimbraMailMessageLifetimeNumChange={mailMessageLifetime.onNumChange}
          onZimbraMailMessageLifetimeTypeChange={mailMessageLifetime.onTypeChange}
          onZimbraMailTrashLifetimeNumChange={mailTrashLifetime.onNumChange}
          onZimbraMailTrashLifetimeTypeChange={mailTrashLifetime.onTypeChange}
          onZimbraMailSpamLifetimeNumChange={mailSpamLifetime.onNumChange}
          onZimbraMailSpamLifetimeTypeChange={mailSpamLifetime.onTypeChange}
        />
      </Container>
    </PageLayout>
  );
};

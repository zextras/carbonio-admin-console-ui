/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, useSnackbar } from '@zextras/ui-components';
import {
  isValidDecimalInput,
  useCurrentUserRights,
  useIsAdvanced,
  useTotalQuotaActive,
} from '@zextras/ui-shared';
import { find } from 'lodash-es';
import { ChangeEvent, useEffect, useState } from 'react';
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
import { getCoreAttributes } from '../../services/get-core-attributes';
import { ComputedLimit, getCosQuota, QuotaSource } from '../../services/get-cos-quota';
import { getFileQuotaById } from '../../services/get-file-quota';
import { ModifyCosBody } from '../../services/modify-cos-service';
import { resetFileQuotaLimitById } from '../../services/reset-file-quota-limit';
import { setCoreAttributes } from '../../services/set-core-attributes';
import { setCosQuota } from '../../services/set-cos-quota';
import { setFileQuotaLimitById } from '../../services/set-file-quota-limit';
import { unsetCosQuota } from '../../services/unset-cos-quota';
import { useCosDetail } from '../../services/use-cos-detail';
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

const CosAdvanced = () => {
  const [t] = useTranslation();
  const { cosId } = useParams();
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const createSnackbar = useSnackbar();
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

  const [cosAdvancedBackupAttributes, setCosAdvancedBackupAttributes] =
    useState<AdvancedBackupAttributes>({
      [BACKUP_ENABLED]: undefined,
      [BACKUP_SELF_UNDELETE_ALLOWED]: undefined,
    });

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
  const [initFileQuotaLimitGBValue, setInitFileQuotaLimitGBValue] = useState<string | undefined>(
    undefined,
  );
  const [fileQuotaLimitGBValue, setFileQuotaLimitGBValue] = useState<string | undefined>(undefined);
  const [showFileQuotaLimitMsg, setShowFileQuotaLimitMsg] = useState<boolean>(false);
  const [showAccountQuotaLimitMsg, setShowAccountQuotaLimitMsg] = useState<boolean>(false);
  const [accountQuotaGBValue, setAccountQuotaGBValue] = useState('');
  const [totalComputedQuotaLimit, setTotalComputedQuotaLimit] = useState<ComputedLimit | undefined>(
    undefined,
  );
  const [totalQuotaSource, setTotalQuotaSource] = useState<QuotaSource | undefined>(undefined);
  const [initialTotalComputedQuotaLimit, setInitialTotalComputedQuotaLimit] = useState<
    ComputedLimit | undefined
  >(undefined);
  const [initialTotalQuotaSource, setInitialTotalQuotaSource] = useState<QuotaSource | undefined>(
    undefined,
  );

  const setValue = (key: keyof AccountType, value: AccountType[keyof AccountType]): void => {
    setCosAdvanced((prev: AccountType) => ({ ...prev, [key]: value }));
  };

  const setCosAdvancedAttributeValues = (
    entries: Array<[keyof AdvancedBackupAttributes, boolean | undefined]>,
  ): void => {
    setCosAdvancedBackupAttributes((prev) => ({
      ...prev,
      ...(Object.fromEntries(entries) as Partial<AdvancedBackupAttributes>),
    }));
  };

  const setInitalValues = (obj: AccountType): void => {
    if (obj) {
      setValue(
        'zimbraMailForwardingAddressMaxLength',
        obj?.zimbraMailForwardingAddressMaxLength ? obj?.zimbraMailForwardingAddressMaxLength : '',
      );
      setValue(
        'zimbraMailForwardingAddressMaxNumAddrs',
        obj?.zimbraMailForwardingAddressMaxNumAddrs
          ? obj?.zimbraMailForwardingAddressMaxNumAddrs
          : '',
      );
      setValue('zimbraMailQuota', obj?.zimbraMailQuota ? obj?.zimbraMailQuota : '');
      setValue(
        'zimbraContactMaxNumEntries',
        obj?.zimbraContactMaxNumEntries ? obj?.zimbraContactMaxNumEntries : '',
      );
      setValue(
        'zimbraQuotaWarnPercent',
        obj?.zimbraQuotaWarnPercent ? obj?.zimbraQuotaWarnPercent : '',
      );
      setValue(
        'zimbraQuotaWarnInterval',
        obj?.zimbraQuotaWarnInterval ? obj?.zimbraQuotaWarnInterval : '',
      );
      setValue(
        'zimbraQuotaWarnMessage',
        obj?.zimbraQuotaWarnMessage ? obj?.zimbraQuotaWarnMessage : '',
      );
      setValue(
        'zimbraDataSourceMinPollingInterval',
        obj?.zimbraDataSourceMinPollingInterval ? obj?.zimbraDataSourceMinPollingInterval : '',
      );
      setValue(
        'zimbraDataSourceCalendarPollingInterval',
        obj?.zimbraDataSourceCalendarPollingInterval
          ? obj?.zimbraDataSourceCalendarPollingInterval
          : '',
      );
      setValue(
        'zimbraDataSourceRssPollingInterval',
        obj?.zimbraDataSourceRssPollingInterval ? obj?.zimbraDataSourceRssPollingInterval : '',
      );
      setValue(
        'zimbraPasswordLocked',
        obj?.zimbraPasswordLocked ? obj?.zimbraPasswordLocked : 'FALSE',
      );
      setValue(
        'zimbraPasswordMinLength',
        obj?.zimbraPasswordMinLength ? obj?.zimbraPasswordMinLength : '',
      );
      setValue(
        'zimbraPasswordMaxLength',
        obj?.zimbraPasswordMaxLength ? obj?.zimbraPasswordMaxLength : '',
      );
      setValue(
        'zimbraPasswordMinUpperCaseChars',
        obj?.zimbraPasswordMinUpperCaseChars ? obj?.zimbraPasswordMinUpperCaseChars : '',
      );
      setValue(
        'zimbraPasswordMinLowerCaseChars',
        obj?.zimbraPasswordMinLowerCaseChars ? obj?.zimbraPasswordMinLowerCaseChars : '',
      );
      setValue(
        'zimbraPasswordMinPunctuationChars',
        obj?.zimbraPasswordMinPunctuationChars ? obj?.zimbraPasswordMinPunctuationChars : '',
      );
      setValue(
        'zimbraPasswordMinNumericChars',
        obj?.zimbraPasswordMinNumericChars ? obj?.zimbraPasswordMinNumericChars : '',
      );
      setValue(
        'zimbraPasswordMinDigitsOrPuncs',
        obj?.zimbraPasswordMinDigitsOrPuncs ? obj?.zimbraPasswordMinDigitsOrPuncs : '',
      );
      setValue('zimbraPasswordMinAge', obj?.zimbraPasswordMinAge ? obj?.zimbraPasswordMinAge : '');
      setValue('zimbraPasswordMaxAge', obj?.zimbraPasswordMaxAge ? obj?.zimbraPasswordMaxAge : '');
      setValue(
        'zimbraPasswordEnforceHistory',
        obj?.zimbraPasswordEnforceHistory ? obj?.zimbraPasswordEnforceHistory : '',
      );
      setValue(
        'zimbraPasswordBlockCommonEnabled',
        obj?.zimbraPasswordBlockCommonEnabled ? obj?.zimbraPasswordBlockCommonEnabled : 'FALSE',
      );
      setValue(
        'zimbraPasswordLockoutEnabled',
        obj?.zimbraPasswordLockoutEnabled ? obj?.zimbraPasswordLockoutEnabled : 'FALSE',
      );
      setValue(
        'zimbraPasswordLockoutMaxFailures',
        obj?.zimbraPasswordLockoutMaxFailures ? obj?.zimbraPasswordLockoutMaxFailures : '',
      );
      setValue(
        'zimbraPasswordLockoutDuration',
        obj?.zimbraPasswordLockoutDuration ? obj?.zimbraPasswordLockoutDuration : '',
      );

      setValue(
        'zimbraPasswordLockoutFailureLifetime',
        obj?.zimbraPasswordLockoutFailureLifetime ? obj?.zimbraPasswordLockoutFailureLifetime : '',
      );
      setValue(
        'zimbraAdminAuthTokenLifetime',
        obj?.zimbraAdminAuthTokenLifetime ? obj?.zimbraAdminAuthTokenLifetime : '',
      );
      setValue(
        'zimbraAuthTokenLifetime',
        obj?.zimbraAuthTokenLifetime ? obj?.zimbraAuthTokenLifetime : '',
      );
      setValue(
        'zimbraMailIdleSessionTimeout',
        obj?.zimbraMailIdleSessionTimeout ? obj?.zimbraMailIdleSessionTimeout : '',
      );
      setValue(
        'zimbraMailMessageLifetime',
        obj?.zimbraMailMessageLifetime ? obj?.zimbraMailMessageLifetime : '',
      );
      setValue(
        'zimbraMailTrashLifetime',
        obj?.zimbraMailTrashLifetime ? obj?.zimbraMailTrashLifetime : '',
      );
      setValue(
        'zimbraMailSpamLifetime',
        obj?.zimbraMailSpamLifetime ? obj?.zimbraMailSpamLifetime : '',
      );
      setValue(
        'zimbraFreebusyExchangeUserOrg',
        obj?.zimbraFreebusyExchangeUserOrg ? obj?.zimbraFreebusyExchangeUserOrg : '',
      );
    }
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
      if (!obj.zimbraMailForwardingAddressMaxLength) {
        obj.zimbraMailForwardingAddressMaxLength = '';
      }
      if (!obj.zimbraMailForwardingAddressMaxNumAddrs) {
        obj.zimbraMailForwardingAddressMaxNumAddrs = '';
      }
      if (!obj.zimbraMailQuota) {
        obj.zimbraMailQuota = '';
      }
      if (!obj.zimbraContactMaxNumEntries) {
        obj.zimbraContactMaxNumEntries = '';
      }
      if (!obj.zimbraQuotaWarnPercent) {
        obj.zimbraQuotaWarnPercent = '';
      }
      if (!obj.zimbraQuotaWarnInterval) {
        obj.zimbraQuotaWarnInterval = '';
      }
      if (!obj.zimbraQuotaWarnMessage) {
        obj.zimbraQuotaWarnMessage = '';
      }
      if (!obj.zimbraPasswordLocked) {
        obj.zimbraPasswordLocked = 'FALSE';
      }
      if (!obj.zimbraPasswordMinLength) {
        obj.zimbraPasswordMinLength = '';
      }
      if (!obj.zimbraPasswordMaxLength) {
        obj.zimbraPasswordMaxLength = '';
      }
      if (!obj.zimbraPasswordMinUpperCaseChars) {
        obj.zimbraPasswordMinUpperCaseChars = '';
      }
      if (!obj.zimbraPasswordMinLowerCaseChars) {
        obj.zimbraPasswordMinLowerCaseChars = '';
      }
      if (!obj.zimbraPasswordMinPunctuationChars) {
        obj.zimbraPasswordMinPunctuationChars = '';
      }
      if (!obj.zimbraPasswordMinNumericChars) {
        obj.zimbraPasswordMinNumericChars = '';
      }
      if (!obj.zimbraPasswordMinDigitsOrPuncs) {
        obj.zimbraPasswordMinDigitsOrPuncs = '';
      }
      if (!obj.zimbraPasswordMinAge) {
        obj.zimbraPasswordMinAge = '';
      }
      if (!obj.zimbraPasswordMaxAge) {
        obj.zimbraPasswordMaxAge = '';
      }
      if (!obj.zimbraPasswordEnforceHistory) {
        obj.zimbraPasswordEnforceHistory = '';
      }
      if (!obj.zimbraPasswordBlockCommonEnabled) {
        obj.zimbraPasswordBlockCommonEnabled = 'FALSE';
      }
      if (!obj.zimbraPasswordLockoutEnabled) {
        obj.zimbraPasswordLockoutEnabled = 'FALSE';
      }
      if (!obj.zimbraPasswordLockoutMaxFailures) {
        obj.zimbraPasswordLockoutMaxFailures = '';
      }
      if (!obj.zimbraPasswordLockoutDuration) {
        obj.zimbraPasswordLockoutDuration = '';
      }
      if (!obj.zimbraPasswordLockoutFailureLifetime) {
        obj.zimbraPasswordLockoutFailureLifetime = '';
      }
      if (!obj.zimbraAdminAuthTokenLifetime) {
        obj.zimbraAdminAuthTokenLifetime = '';
      }
      if (!obj.zimbraAuthTokenLifetime) {
        obj.zimbraAuthTokenLifetime = '';
      }
      if (!obj.zimbraMailIdleSessionTimeout) {
        obj.zimbraMailIdleSessionTimeout = '';
      }
      if (!obj.zimbraMailMessageLifetime) {
        obj.zimbraMailMessageLifetime = '';
      }
      if (!obj.zimbraMailTrashLifetime) {
        obj.zimbraMailTrashLifetime = '';
      }
      if (!obj.zimbraMailSpamLifetime) {
        obj.zimbraMailSpamLifetime = '';
      }
      if (!obj.zimbraFreebusyExchangeUserOrg) {
        obj.zimbraFreebusyExchangeUserOrg = '';
      }
      setCosData(obj);
      setInitalValues(obj);
      setStateAttrValues(obj);
      setIsDirty(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cosInformation]);

  const getFileQuota = (cosId: string): void => {
    getFileQuotaById(cosId, COS).then((res: { limit: string }) => {
      if (res?.limit) {
        setInitFileQuotaLimitGBValue(BytesToGB(res.limit).toFixed(2));
        setFileQuotaLimitGBValue(BytesToGB(res.limit).toFixed(2));
      }
    });
  };

  const getCOSQuota = (cosId: string): void => {
    getCosQuota(cosId).then((res) => {
      if (res.type === 'success') {
        setTotalComputedQuotaLimit(res.totalComputedLimit);
        setTotalQuotaSource(res.totalQuotaSource);
        setInitialTotalComputedQuotaLimit(res.totalComputedLimit);
        setInitialTotalQuotaSource(res.totalQuotaSource);
      }
    });
  };

  useEffect(() => {
    if (cosData?.zimbraId && isAdvanced && !isTotalQuotaActive) {
      getFileQuota(cosData.zimbraId);
    }
  }, [cosData.zimbraId, isAdvanced, isTotalQuotaActive]);

  useEffect(() => {
    if (cosData?.zimbraId && isAdvanced && isTotalQuotaActive) {
      getCOSQuota(cosData.zimbraId);
    }
  }, [cosData.zimbraId, isAdvanced, isTotalQuotaActive]);

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
    setTotalComputedQuotaLimit(value);
    setTotalQuotaSource(value !== undefined ? 'cos' : 'global');
  };

  const onCancel = (): void => {
    setInitalValues(cosData);
    setStateAttrValues(cosData);
    setFileQuotaLimitGBValue(initFileQuotaLimitGBValue);
    if (isTotalQuotaActive) {
      setTotalComputedQuotaLimit(initialTotalComputedQuotaLimit);
      setTotalQuotaSource(initialTotalQuotaSource);
    }
    setIsDirty(false);
  };

  useEffect(() => {
    const hasFieldChanges = (Object.keys(cosAdvanced) as Array<keyof AccountType>).some(
      (key) => cosData[key] !== undefined && cosData[key] !== cosAdvanced[key],
    );
    const hasFileQuotaChange =
      fileQuotaLimitGBValue !== undefined && initFileQuotaLimitGBValue !== fileQuotaLimitGBValue;
    const hasTotalQuotaChange =
      isTotalQuotaActive &&
      totalComputedQuotaLimit !== undefined &&
      totalComputedQuotaLimit !== initialTotalComputedQuotaLimit;
    setIsDirty(hasFieldChanges || hasFileQuotaChange || hasTotalQuotaChange);
  }, [
    cosAdvanced,
    cosData,
    initFileQuotaLimitGBValue,
    fileQuotaLimitGBValue,
    totalComputedQuotaLimit,
    initialTotalComputedQuotaLimit,
    isTotalQuotaActive,
  ]);

  const onFileQuotaChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isValidDecimalInput(e.target.value)) return;
    const decimalPoints = e.target.value?.split('.')[1];
    if (!!decimalPoints && decimalPoints?.length > 3) {
      setShowFileQuotaLimitMsg(true);
      return;
    }
    setShowFileQuotaLimitMsg(false);
    setFileQuotaLimitGBValue(e.target.value);
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

    if (isTotalQuotaActive) {
      if (totalComputedQuotaLimit !== initialTotalComputedQuotaLimit) {
        if (totalComputedQuotaLimit) {
          const res = await setCosQuota(zimbraId, totalComputedQuotaLimit);
          if (res.type === 'success') {
            setInitialTotalComputedQuotaLimit(totalComputedQuotaLimit);
          }
        } else {
          const res = await unsetCosQuota(zimbraId);
          if (res.type === 'success' && cosData.zimbraId) {
            getCOSQuota(cosData.zimbraId);
          }
        }
      }
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
        setIsDirty(false);
      },
    });
  };

  useEffect(() => {
    if (!isAdvanced) return;
    const body = [
      {
        configType: COS,
        configName: [cosName],
        attrName: [BACKUP_SELF_UNDELETE_ALLOWED, BACKUP_ENABLED],
      },
    ];
    getCoreAttributes(body)
      .then((data) => {
        if (data?.attributes) {
          setCosAdvancedAttributeValues([
            [
              BACKUP_SELF_UNDELETE_ALLOWED,
              !!data?.attributes?.[BACKUP_SELF_UNDELETE_ALLOWED]?.[0]?.value,
            ],
            [BACKUP_ENABLED, !!data?.attributes?.[BACKUP_ENABLED]?.[0]?.value],
          ]);
        }
      })
      .catch((error) => {
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: error?.message ? error?.message : labels.snackbar.errorMessage,
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      });
  }, [cosName, createSnackbar, isAdvanced, t, labels.snackbar.errorMessage]);

  const changeBackupAttribute = (key: AdvancedBackupAttributesKeys): void => {
    setCosAdvancedBackupAttributes((prev: AdvancedBackupAttributes) => ({
      ...prev,
      [key]: !cosAdvancedBackupAttributes[key],
    }));
    setIsDirty(true);
  };

  if (isPending) {
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
          initialTotalComputedQuotaLimit={initialTotalComputedQuotaLimit}
          onTotalQuotaChange={onTotalQuotaChange}
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

export default CosAdvanced;

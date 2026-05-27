/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm, useStore } from '@tanstack/react-form';
import { Container, useSnackbar } from '@zextras/ui-components';
import {
  type GetCoreAttributesResponse,
  setCoreAttributes,
  useCurrentUserRights,
  useIsAdvanced,
  useTotalQuotaActive,
} from '@zextras/ui-shared';
import { find } from 'lodash-es';
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
import { type ComputedLimit, type QuotaSource } from '../../services/get-cos-quota';
import { ModifyCosBody } from '../../services/modify-cos-service';
import { useCoreAttributes } from '../../services/use-core-attributes';
import { useCosDetail } from '../../services/use-cos-detail';
import { useCosQuota } from '../../services/use-cos-quota';
import { useModifyCos } from '../../services/use-modify-cos';
import { PageLayout } from '../page-layout';
import COSEmailRetentionPolicy from './advanced/cos-email-retention-policy';
import COSFailedLoginPolicy from './advanced/cos-failed-login-policy';
import { CosAdvancedFormValues } from './advanced/cos-form-api';
import COSForwarding from './advanced/cos-forwarding';
import COSGeneralOptions from './advanced/cos-general-options';
import COSPassword from './advanced/cos-password';
import { COSQuotas } from './advanced/cos-quotas';
import { COSTimeoutPolicy } from './advanced/cos-timeout-policy';
import { useCosQuotaState } from './advanced/hooks/use-cos-quota-state';

const EXCLUDED_ATTRIBUTES_WHEN_TOTAL_QUOTA_ACTIVE: Array<string> = [
  'zimbraMailQuota',
  'zimbraQuotaWarnPercent',
  'zimbraQuotaWarnInterval',
  'zimbraQuotaWarnMessage',
] satisfies Array<keyof AccountType>;

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

const ADVANCED_FIELD_KEYS = new Set(COS_ADVANCED_FIELD_DEFAULTS.map(([key]) => key));

const BACKUP_FIELD_KEYS: ReadonlySet<string> = new Set([BACKUP_ENABLED, BACKUP_SELF_UNDELETE_ALLOWED]);

function buildCosData(cosInformation: Array<Attribute> | undefined): AccountType {
  if (!cosInformation || !cosInformation.length) return {} as AccountType;
  const obj: AccountType = {};
  cosInformation.forEach((item) => {
    obj[item?.n as keyof AccountType] = item._content;
  });
  COS_ADVANCED_FIELD_DEFAULTS.forEach(([key, defaultVal]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!obj[key]) (obj as any)[key] = defaultVal;
  });
  return obj;
}

function saveBackupAttributes(
  value: CosAdvancedFormValues,
  cosName: string | undefined,
): Promise<unknown> {
  const backupAttributes: Record<string, unknown> = {
    [BACKUP_ENABLED]: {
      value: value.backupEnabled,
      objectName: cosName,
      configType: COS,
    },
    [BACKUP_SELF_UNDELETE_ALLOWED]: {
      value: value.backupSelfUndeleteAllowed,
      objectName: cosName,
      configType: COS,
    },
  };
  return setCoreAttributes(backupAttributes);
}

type CosQuotaData = {
  totalComputedLimit: ComputedLimit;
  totalQuotaSource: QuotaSource;
};

type CosAdvancedFormProps = {
  cosData: AccountType;
  cosName: string | undefined;
  cosQuotaData: CosQuotaData | undefined;
  coreAttributesData: GetCoreAttributesResponse | undefined;
  readonlyCOS: boolean;
  isAdvanced: boolean;
  isTotalQuotaActive: boolean;
};

const CosAdvancedForm = ({
  cosData,
  cosName,
  cosQuotaData,
  coreAttributesData,
  readonlyCOS,
  isAdvanced,
  isTotalQuotaActive,
}: CosAdvancedFormProps) => {
  const { cosId } = useParams();
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const modifyCosMutation = useModifyCos(cosId);

  const quotaState = useCosQuotaState({ cosData, cosQuotaData, isTotalQuotaActive, isAdvanced });

  const timeItems: TimeItems = [
    { label: t('label.seconds', 'Seconds'), value: 's' },
    { label: t('label.minutes', 'Minutes'), value: 'm' },
    { label: t('label.hours', 'Hours'), value: 'h' },
    { label: t('label.days', 'Days'), value: 'd' },
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

  const formDefaultValues = {
    ...cosData,
    backupEnabled: !!coreAttributesData?.attributes?.[BACKUP_ENABLED]?.[0]?.value,
    backupSelfUndeleteAllowed:
      !!coreAttributesData?.attributes?.[BACKUP_SELF_UNDELETE_ALLOWED]?.[0]?.value,
  } satisfies CosAdvancedFormValues;

  const form = useForm({
    defaultValues: formDefaultValues,
    onSubmit: async ({ value }) => {
      const { zimbraId = '' } = cosData;

      try {
        await saveBackupAttributes(value, cosName);
      } catch {
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: labels.snackbar.errorMessage,
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
        return;
      }
      await quotaState.save(zimbraId);

      const cosAdvancedToSave = isTotalQuotaActive
        ? (Object.fromEntries(
            Object.entries(value).filter(
              ([key]) => !EXCLUDED_ATTRIBUTES_WHEN_TOTAL_QUOTA_ACTIVE.includes(key),
            ),
          ) as typeof value)
        : value;

      const attributes = Object.keys(cosAdvancedToSave)
        .filter(
          (key) =>
            ADVANCED_FIELD_KEYS.has(key as keyof AccountType) &&
            !BACKUP_FIELD_KEYS.has(key),
        )
        .map((ele) => ({
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
          quotaState.handleSuccess(zimbraId);
          form.reset(value);
          quotaState.reset();
        },
      });
    },
  });

  const isFormDirty = useStore(form.store, (state) => !state.isDefaultValue);
  const isDirty = isFormDirty || quotaState.isDirty;

  return (
    <PageLayout
      title={labels.advanced}
      onSave={() => form.handleSubmit()}
      onCancel={() => {
        form.reset();
        quotaState.reset();
      }}
      unSavedChanges={isDirty}
    >
      <Container mainAlignment="flex-start" width="100%" orientation="vertical">
        {isAdvanced && <COSGeneralOptions form={form} readonlyCOS={readonlyCOS} />}
        <COSForwarding form={form} readonlyCOS={readonlyCOS} />
        <COSQuotas
          form={form}
          quotaState={quotaState}
          isTotalQuotaActive={isTotalQuotaActive}
          isAdvanced={isAdvanced}
          readonlyCOS={readonlyCOS}
          timeItems={timeItems}
        />
        <COSPassword form={form} readonlyCOS={readonlyCOS} />
        <COSFailedLoginPolicy form={form} readonlyCOS={readonlyCOS} timeItems={timeItems} />
        <COSTimeoutPolicy form={form} readonlyCOS={readonlyCOS} timeItems={timeItems} />
        <COSEmailRetentionPolicy form={form} readonlyCOS={readonlyCOS} timeItems={timeItems} />
      </Container>
    </PageLayout>
  );
};

export const CosAdvanced = () => {
  const { cosId } = useParams();
  const { data: cosDetailData, isPending } = useCosDetail(cosId);
  const cosInformation = cosDetailData?.cos?.[0]?.a;
  const cosName = cosDetailData?.cos?.[0]?.name;
  const { data: rights = [] } = useCurrentUserRights();
  const isAdvanced = useIsAdvanced();
  const isTotalQuotaActive = useTotalQuotaActive();
  const cosData = buildCosData(cosInformation);

  const { data: cosQuotaData, isPending: isCosQuotaPending } = useCosQuota(
    cosData?.zimbraId,
    !!cosData?.zimbraId && isAdvanced && isTotalQuotaActive,
  );

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

  const { data: coreAttributesData, isPending: isCoreAttributesPending } =
    useCoreAttributes(coreAttributesBody);

  const rightsConfig = find(rights, { type: COS }) || { all: [], type: COS };
  const readonlyCOS = !rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;

  const isQuotaLoading = isTotalQuotaActive && isCosQuotaPending;
  const isBackupLoading = isAdvanced && isCoreAttributesPending;

  if (isPending || isQuotaLoading || isBackupLoading) {
    return <ds-page-shimmer></ds-page-shimmer>;
  }

  return (
    <CosAdvancedForm
      cosData={cosData}
      cosName={cosName}
      cosQuotaData={cosQuotaData}
      coreAttributesData={coreAttributesData}
      readonlyCOS={readonlyCOS}
      isAdvanced={isAdvanced}
      isTotalQuotaActive={isTotalQuotaActive}
    />
  );
};

/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { useSelector } from '@tanstack/react-store';
import { Container, useSnackbar } from '@zextras/ui-components';
import { type GetCoreAttributesResponse, setCoreAttributes } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { AccountType } from '../../../../types/account';
import { TimeItems } from '../../../../types/general';
import {
  BACKUP_ENABLED,
  BACKUP_SELF_UNDELETE_ALLOWED,
  COS,
  ZIMBRA_ADMIN_URN,
} from '../../../constants';
import { cosQueryKeys } from '../../../services/cos-query-keys';
import { type ComputedLimit, type QuotaSource } from '../../../services/get-cos-quota';
import { ModifyCosBody } from '../../../services/modify-cos-service';
import { useModifyCos } from '../../../services/use-modify-cos';
import { FormPageLayout } from '../../form-page-layout';
import { useCosQuotaState } from './hooks/use-cos-quota-state';
import { cosAdvancedSchema } from './schema';
import COSEmailRetentionPolicy from './sections/email-retention-policy';
import COSFailedLoginPolicy from './sections/failed-login-policy';
import COSForwarding from './sections/forwarding';
import { COSGeneralOptions } from './sections/general-options';
import { COSPassword } from './sections/password';
import { COSQuotas } from './sections/quotas';
import { COSTimeoutPolicy } from './sections/timeout-policy';
import { CosAdvancedFormValues } from './types';

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

const BACKUP_FIELD_KEYS: ReadonlySet<string> = new Set([
  BACKUP_ENABLED,
  BACKUP_SELF_UNDELETE_ALLOWED,
]);

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

export const CosAdvancedForm = ({
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
  const queryClient = useQueryClient();
  const modifyCosMutation = useModifyCos(cosId);

  const quotaState = useCosQuotaState({ cosData, cosQuotaData, isTotalQuotaActive, isAdvanced });

  const timeItems: TimeItems = [
    { label: t('label.seconds', 'Seconds'), value: 's' },
    { label: t('label.minutes', 'Minutes'), value: 'm' },
    { label: t('label.hours', 'Hours'), value: 'h' },
    { label: t('label.days', 'Days'), value: 'd' },
  ];

  const errorMessage = t(
    'label.something_wrong_error_msg',
    'Something went wrong. Please try again.',
  );

  const pageTitle = t('cos.advanced', 'Advanced');

  const formDefaultValues = {
    ...cosData,
    backupEnabled: !!coreAttributesData?.attributes?.[BACKUP_ENABLED]?.[0]?.value,
    backupSelfUndeleteAllowed:
      !!coreAttributesData?.attributes?.[BACKUP_SELF_UNDELETE_ALLOWED]?.[0]?.value,
  };

  const form = useForm({
    defaultValues: formDefaultValues,
    validators: {
      onChange: cosAdvancedSchema,
      onSubmit: cosAdvancedSchema,
    },
    onSubmit: async ({ value }) => {
      const { zimbraId = '' } = cosData;

      try {
        await saveBackupAttributes(value, cosName);
        if (isAdvanced && cosName) {
          queryClient.invalidateQueries({
            queryKey: cosQueryKeys.coreAttributes([
              {
                configType: COS,
                configName: [cosName],
                attrName: [BACKUP_SELF_UNDELETE_ALLOWED, BACKUP_ENABLED],
              },
            ]),
          });
        }
      } catch {
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: errorMessage,
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
        return;
      }
      await quotaState.save(zimbraId);

      const cosAdvancedToSave = isTotalQuotaActive
        ? Object.fromEntries(
            Object.entries(value).filter(
              ([key]) => !EXCLUDED_ATTRIBUTES_WHEN_TOTAL_QUOTA_ACTIVE.includes(key),
            ),
          )
        : value;

      const attributes = Object.keys(cosAdvancedToSave)
        .filter(
          (key) => ADVANCED_FIELD_KEYS.has(key as keyof AccountType) && !BACKUP_FIELD_KEYS.has(key),
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
          form.reset(value, { keepDefaultValues: true });
          quotaState.reset();
        },
      });
    },
  });

  const isFormDirty = useSelector(form.store, (state) => !state.isDefaultValue);
  const isDirty = isFormDirty || quotaState.isDirty;

  return (
    <FormPageLayout
      title={pageTitle}
      onSave={() => form.handleSubmit()}
      onCancel={() => {
        form.reset();
        quotaState.reset();
      }}
      unsavedChanges={isDirty}
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
    </FormPageLayout>
  );
};

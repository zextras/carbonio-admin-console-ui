/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import {
  flushCache,
  setCoreAttributes,
  useIsAdvanced,
  useSnackbar,
  useUserAccount,
  useUserSettings,
} from '@zextras/ui-shared';
import { differenceBy, isEqual, reduce, remove } from 'lodash-es';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  ABQ_MODE,
  ACCOUNT,
  BACKUP_ENABLED,
  BACKUP_SELF_UNDELETE_ALLOWED,
  CHANGE_DISPLAY_NAME_BOOLEAN,
  CHANGE_NAME_BOOLEAN,
  DOMAIN_NAME,
  IS_DEFAULT_USER_NAME,
  TOTAL_COMPUTED_QUOTA_LIMIT,
  TOTAL_QUOTA_SOURCE,
  TOTAL_QUOTA_STATUS,
  TOTAL_QUOTA_USED,
  TOTAL_QUOTA_USED_BY_MODULE,
  TRUE,
  UID,
} from '../../constants';
import { addAccountAliasRequest } from '../../services/add-account-alias';
import { checkRightRequest } from '../../services/check-right';
import { deleteAccountAliasRequest } from '../../services/delete-account-alias';
import { domainQueryKeys } from '../../services/domain-query-keys';
import { type GetAccountQuotaResponse } from '../../services/get-account-quota';
import { modifyAccountRequest } from '../../services/modify-account';
import { removeDistributionListMember } from '../../services/remove-distributionlist-member-service';
import { renameAccountRequest } from '../../services/rename-account';
import { setAccountQuota } from '../../services/set-account-quota';
import { setPasswordRequest } from '../../services/set-password';
import { unsetAccountQuota } from '../../services/unset-account-quota';
import {
  type AccountCoreAttributes,
  useAccountCoreAttributes,
} from '../../services/use-account-core-attributes';
import {
  type FlattenedAccount,
  useAccountDetail,
  useAccountSpecificDetail,
} from '../../services/use-account-detail';
import { useAccountGrants } from '../../services/use-account-grants';
import { useAccountMembership } from '../../services/use-account-membership';
import { useAccountQuota } from '../../services/use-account-quota';
import { useCosDetail } from '../../services/use-cos-detail';
import { useCredentialList, useOtpList } from '../../services/use-otp-credential-list';
import { useSignatures } from '../../services/use-signatures';
import { useUserSessions } from '../../services/use-user-sessions';
import { type AccountFormContextValue, type AccountFormValues } from './account-form-context';

export function buildAccountFormValues(detail: FlattenedAccount | undefined): AccountFormValues {
  if (!detail) {
    return {};
  }
  return {
    ...detail,
    uid: detail.name?.split('@')[0] ?? '',
    domainName: detail.name?.split('@')[1] ?? '',
    deleteAdministrationRights: [],
    totalComputedQuotaLimit: undefined,
  };
}

export function splitMembership(dl: Array<any> = []): {
  direct: Array<any>;
  inDirect: Array<any>;
} {
  const direct: Array<any> = [];
  const inDirect: Array<any> = [];
  dl.forEach((ele) => {
    if (ele?.via) {
      inDirect.push({ label: ele?.name, closable: false, disabled: true });
    } else {
      direct.push({ label: ele?.name, closable: false, disabled: true });
    }
  });
  return { direct, inDirect };
}

type SuccessfulAccountQuota = Extract<GetAccountQuotaResponse, { type: 'success' }>;

function buildQuotaValues(quota: SuccessfulAccountQuota): Record<string, unknown> {
  return {
    [TOTAL_COMPUTED_QUOTA_LIMIT]: quota.totalComputedLimit,
    [TOTAL_QUOTA_USED]: quota.totalUsed,
    [TOTAL_QUOTA_USED_BY_MODULE]: quota.usedByModules,
    [TOTAL_QUOTA_SOURCE]: quota.totalLimitSource,
    [TOTAL_QUOTA_STATUS]: quota.totalStatus,
  };
}

function buildCoreAttrValues(coreAttrs: AccountCoreAttributes): Record<string, unknown> {
  return {
    [ABQ_MODE]: coreAttrs.abqMode,
    [BACKUP_ENABLED]: coreAttrs.backupEnabled,
    [BACKUP_SELF_UNDELETE_ALLOWED]: coreAttrs.backupSelfUndeleteAllowed,
  };
}

const VALUE_BLOCKED = 'VALUE-BLOCKED';

type SavedValuesBaseline = {
  detail: FlattenedAccount | undefined;
  quota: SuccessfulAccountQuota | undefined;
  coreAttrs: AccountCoreAttributes | undefined;
  values: AccountFormValues;
};

type BaselineSyncInputs = {
  formUntouched: boolean;
  accountDetailData: FlattenedAccount | undefined;
  accountQuota: SuccessfulAccountQuota | undefined;
  accountCoreAttributes: AccountCoreAttributes | undefined;
  baseline: SavedValuesBaseline | null;
};

function computeNextBaseline({
  formUntouched,
  accountDetailData,
  accountQuota,
  accountCoreAttributes,
  baseline,
}: BaselineSyncInputs): SavedValuesBaseline | null {
  if (!formUntouched) {
    return null;
  }
  if (accountDetailData !== undefined && accountDetailData !== baseline?.detail) {
    const quotaIsNew = accountQuota !== undefined && accountQuota !== baseline?.quota;
    const coreAttrsAreNew =
      accountCoreAttributes !== undefined && accountCoreAttributes !== baseline?.coreAttrs;
    return {
      detail: accountDetailData,
      quota: accountQuota,
      coreAttrs: accountCoreAttributes,
      values: {
        ...buildAccountFormValues(accountDetailData),
        ...(quotaIsNew ? buildQuotaValues(accountQuota) : {}),
        ...(coreAttrsAreNew ? buildCoreAttrValues(accountCoreAttributes) : {}),
      },
    };
  }
  if (accountQuota !== undefined && accountQuota !== baseline?.quota) {
    return {
      detail: baseline?.detail,
      quota: accountQuota,
      coreAttrs: baseline?.coreAttrs,
      values: { ...baseline?.values, ...buildQuotaValues(accountQuota) },
    };
  }
  if (accountCoreAttributes !== undefined && accountCoreAttributes !== baseline?.coreAttrs) {
    return {
      detail: baseline?.detail,
      quota: baseline?.quota,
      coreAttrs: accountCoreAttributes,
      values: { ...baseline?.values, ...buildCoreAttrValues(accountCoreAttributes) },
    };
  }
  return null;
}

type AccountFormProviderParams = {
  account: { id: string; name: string; [key: string]: any };
  onSaved: () => void;
  onDomainRenamed: () => void;
};

export function useAccountFormProvider({
  account,
  onSaved,
  onDomainRenamed,
}: AccountFormProviderParams): AccountFormContextValue {
  const { t } = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();
  const isAdvanced = useIsAdvanced();
  const userSetting = useUserSettings();
  const currentUser = useUserAccount();
  const [isSaving, setIsSaving] = useState(false);
  const [allowedDeletePassword, setAllowedDeletePassword] = useState(false);
  const [folderList, setFolderList] = useState<Array<any>>([]);
  const [folderListSeed, setFolderListSeed] = useState<Array<any> | undefined>(undefined);
  const [deligateDetail, setDeligateDetail] = useState<Record<string, any>>({});

  const { data: accountDetailData } = useAccountDetail(account.id);
  const { data: accSpecificDetail = {} } = useAccountSpecificDetail(account.id);
  const { data: cosDetail = {} } = useCosDetail(accountDetailData?.zimbraCOSId);
  const { data: signatureList = [] } = useSignatures(account.id);
  const { data: membershipDl = [] } = useAccountMembership(account.id);
  const { data: sessions = [] } = useUserSessions(account.name);
  const { data: otps } = useOtpList(account.name);
  const { data: credentials } = useCredentialList(account.name);
  const { data: grants, refetch: refetchGrants } = useAccountGrants(account);
  const { data: accountQuota } = useAccountQuota(isAdvanced ? account.id : undefined);
  const { data: accountCoreAttributes } = useAccountCoreAttributes(
    isAdvanced ? account.id : undefined,
  );
  const membership = splitMembership(membershipDl);

  const [baseline, setBaseline] = useState<SavedValuesBaseline | null>(null);
  const isGlobalAdmin = userSetting?.attrs?.zimbraIsAdminAccount === TRUE;

  const errorSnackbar = (label: string): void => {
    createSnackbar({
      key: 'error',
      severity: 'error',
      label,
      autoHideTimeout: 3000,
      hideButton: true,
      replace: true,
    });
  };

  const successSnackbar = (label: string): void => {
    createSnackbar({
      key: 'success',
      severity: 'success',
      label,
      autoHideTimeout: 3000,
      hideButton: true,
      replace: true,
    });
  };

  const notifySaveError = (error?: { message?: string }): void => {
    errorSnackbar(
      error?.message ||
        t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
    );
  };

  const removeAdministrationRights = (
    values: Record<string, any>,
    modifiedKeys: Array<string>,
  ): void => {
    if (
      values.deleteAdministrationRights?.length > 0 &&
      modifiedKeys.includes('zimbraIsAdminAccount')
    ) {
      values.deleteAdministrationRights.forEach((item: any) => {
        removeDistributionListMember(
          { n: 'id', _content: item.id } as any,
          { n: 'dlm', _content: values.name } as any,
        )
          .then((data: any) => {
            if (data) {
              successSnackbar(
                t(
                  'account_details.right_for_selected_user_deleted_successfully',
                  'Right for selected user deleted successfully',
                ),
              );
            }
          })
          .catch((error: any) => {
            notifySaveError(error);
          });
      });
    }
  };

  const applyPasswordChange = async (
    values: Record<string, any>,
    saved: Record<string, any>,
    modifiedKeys: Array<string>,
  ): Promise<'skipped' | 'changed' | 'invalid'> => {
    if (!values.password && !values.repeatPassword) {
      return 'skipped';
    }
    if (!modifiedKeys.includes('password') && !modifiedKeys.includes('repeatPassword')) {
      return 'skipped';
    }
    if (values.password?.length < 6) {
      errorSnackbar(t('label.password_length_msg', 'Password should be more than 5 character'));
      return 'invalid';
    }
    if (values.password !== values.repeatPassword) {
      errorSnackbar(t('label.password_and_repeat_password_not_match', 'Passwords do not match'));
      return 'invalid';
    }
    await setPasswordRequest(saved.zimbraId, values.password).then(() => {
      if (isGlobalAdmin) {
        flushCache('account', 'id', saved.zimbraId);
      }
    });
    remove(modifiedKeys, (ele) => ele === 'password' || ele === 'repeatPassword');
    return 'changed';
  };

  const applyAccountRename = async (
    values: Record<string, any>,
    saved: Record<string, any>,
    modifiedKeys: Array<string>,
  ): Promise<void> => {
    if (!modifiedKeys.includes(UID) && !modifiedKeys.includes(DOMAIN_NAME)) {
      return;
    }
    await renameAccountRequest(saved.zimbraId, `${values.uid}@${values.domainName}`)
      .then(() => {
        successSnackbar(
          t(
            'label.the_last_changes_has_been_saved_successfully',
            'Changes have been saved successfully',
          ),
        );
        if (isGlobalAdmin) {
          flushCache('account', 'id', saved.zimbraId);
        }
      })
      .catch((error) => {
        notifySaveError(error);
      });
    onSaved();
    remove(modifiedKeys, (ele) => ele === UID);
    if (modifiedKeys.includes(DOMAIN_NAME)) {
      remove(modifiedKeys, (ele) => ele === DOMAIN_NAME);
      onDomainRenamed();
    }
  };

  const applyCoreAttributes = async (
    values: Record<string, any>,
    modifiedKeys: Array<string>,
  ): Promise<void> => {
    const shouldApply =
      modifiedKeys.includes(ABQ_MODE) ||
      modifiedKeys.includes(BACKUP_ENABLED) ||
      modifiedKeys.includes(BACKUP_SELF_UNDELETE_ALLOWED);
    if (!shouldApply) {
      return;
    }
    const body: any = {};
    if (modifiedKeys.includes(ABQ_MODE)) {
      body.abqMode = { value: values.abqMode, objectName: values.zimbraId, configType: ACCOUNT };
    }
    if (modifiedKeys.includes(BACKUP_ENABLED)) {
      body.backupEnabled = {
        value: values.backupEnabled,
        objectName: values.zimbraId,
        configType: ACCOUNT,
      };
    }
    if (modifiedKeys.includes(BACKUP_SELF_UNDELETE_ALLOWED)) {
      body.backupSelfUndeleteAllowed = {
        value: values.backupSelfUndeleteAllowed,
        objectName: values.zimbraId,
        configType: ACCOUNT,
      };
    }
    await setCoreAttributes(body)
      .then(() => {
        successSnackbar(
          t(
            'label.the_last_changes_has_been_saved_successfully',
            'Changes have been saved successfully',
          ),
        );
      })
      .catch((error) => {
        notifySaveError(error);
      });
    remove(modifiedKeys, (ele) => ele === BACKUP_ENABLED);
    remove(modifiedKeys, (ele) => ele === ABQ_MODE);
    remove(modifiedKeys, (ele) => ele === BACKUP_SELF_UNDELETE_ALLOWED);
  };

  const applyAliasChanges = (
    values: Record<string, any>,
    saved: Record<string, any>,
    modifiedKeys: Array<string>,
  ): void => {
    if (!modifiedKeys.includes('mail')) {
      return;
    }
    differenceBy(`${saved.mail ?? ''}`.split(','), `${values.mail ?? ''}`.split(',')).forEach(
      async (aliasName: any) => {
        await deleteAccountAliasRequest(saved.zimbraId, `${aliasName}`)
          .then(() => {
            if (isGlobalAdmin) {
              flushCache('account', 'id', saved.zimbraId);
            }
          })
          .catch((error) => {
            notifySaveError(error);
          });
      },
    );
    differenceBy(`${values.mail ?? ''}`.split(','), `${saved.mail ?? ''}`.split(',')).forEach(
      (aliasName: any) => {
        addAccountAliasRequest(saved.zimbraId, `${aliasName}`)
          .then(() => {
            if (isGlobalAdmin) {
              flushCache('account', 'id', saved.zimbraId);
            }
          })
          .catch((error) => {
            notifySaveError(error);
          });
      },
    );
    remove(modifiedKeys, (ele) => ele === 'mail');
  };

  const applyQuotaChange = (values: Record<string, any>, modifiedKeys: Array<string>): void => {
    if (!modifiedKeys.includes(TOTAL_COMPUTED_QUOTA_LIMIT) || !isAdvanced) {
      return;
    }
    const notifyResult = (
      response:
        | Awaited<ReturnType<typeof setAccountQuota>>
        | Awaited<ReturnType<typeof unsetAccountQuota>>,
    ) => {
      if (response.type === 'success') {
        successSnackbar(
          t(
            'label.the_last_changes_has_been_saved_successfully',
            'Changes have been saved successfully',
          ),
        );
      } else {
        createSnackbar({
          key: 'setAccountQuotaError',
          severity: 'error',
          label: response.error,
          autoHideTimeout: 3000,
          hideButton: true,
          replace: false,
        });
      }
    };
    const setOrUnsetPromise =
      values.totalComputedQuotaLimit === undefined
        ? unsetAccountQuota(values.zimbraId)
        : setAccountQuota(values.zimbraId, values.totalComputedQuotaLimit);
    setOrUnsetPromise
      .then(notifyResult)
      .then(() => {
        void queryClient.invalidateQueries({
          queryKey: domainQueryKeys.accountQuota(values.zimbraId ?? ''),
        });
      })
      .catch((error) => {
        createSnackbar({
          key: 'getAccountQuotaError',
          severity: 'error',
          label: error.message,
          autoHideTimeout: 3000,
          hideButton: true,
          replace: false,
        });
      });
    remove(modifiedKeys, (key) => key === TOTAL_COMPUTED_QUOTA_LIMIT);
  };

  const applyRemainingAttributes = async (
    values: Record<string, any>,
    saved: Record<string, any>,
    modifiedKeys: Array<string>,
    isPasswordChange: boolean,
  ): Promise<void> => {
    const modifiedData: Record<string, any> = {};
    modifiedKeys.forEach((ele) => {
      modifiedData[ele] = values[ele];
    });

    const finalize = (): void => {
      form.reset(values as AccountFormValues, { keepDefaultValues: true });
      setBaseline({
        detail: accountDetailData,
        quota: accountQuota,
        coreAttrs: accountCoreAttributes,
        values: values as AccountFormValues,
      });
      onSaved();
      void queryClient.invalidateQueries({
        queryKey: domainQueryKeys.accountDetail(account.id),
      });
      void queryClient.invalidateQueries({
        queryKey: domainQueryKeys.accountCoreAttributes(account.id),
      });
    };

    if (modifiedKeys.length === 0) {
      if (isPasswordChange) {
        successSnackbar(t('account_details.user_password_set', 'User password set successfully'));
        values.userPassword = VALUE_BLOCKED;
        values.zimbraPasswordMustChange = 'FALSE';
      }
      finalize();
      return;
    }

    await modifyAccountRequest(saved.zimbraId, modifiedData)
      .then(async (data) => {
        if (data) {
          if (isGlobalAdmin) {
            await flushCache('account', 'id', saved.zimbraId);
          }
          successSnackbar(
            t(
              'label.the_last_changes_has_been_saved_successfully',
              'Changes have been saved successfully',
            ),
          );
          finalize();
        }
      })
      .catch((error) => {
        notifySaveError(error);
      });
  };

  const form = useForm({
    defaultValues: {
      ...buildAccountFormValues(accountDetailData),
      ...(accountCoreAttributes ? buildCoreAttrValues(accountCoreAttributes) : {}),
    },
    onSubmit: async ({ value }) => {
      const values = { ...value } as Record<string, any>;
      const saved = (baseline?.values ?? {}) as Record<string, any>;
      setIsSaving(true);
      try {
        const modifiedKeys: string[] = reduce(
          values,
          (result: string[], val, key) => (isEqual(val, saved[key]) ? result : [...result, key]),
          [],
        );

        removeAdministrationRights(values, modifiedKeys);

        remove(modifiedKeys, (ele) => ele === CHANGE_NAME_BOOLEAN);
        remove(modifiedKeys, (ele) => ele === CHANGE_DISPLAY_NAME_BOOLEAN);
        remove(modifiedKeys, (ele) => ele === IS_DEFAULT_USER_NAME);

        if (!values.sn?.trim()) {
          errorSnackbar(t('label.surname_required', 'Surname is required'));
          return;
        }

        const passwordChange = await applyPasswordChange(values, saved, modifiedKeys);
        if (passwordChange === 'invalid') {
          return;
        }

        await applyAccountRename(values, saved, modifiedKeys);
        await applyCoreAttributes(values, modifiedKeys);
        applyAliasChanges(values, saved, modifiedKeys);
        applyQuotaChange(values, modifiedKeys);
        await applyRemainingAttributes(values, saved, modifiedKeys, passwordChange === 'changed');
      } finally {
        setIsSaving(false);
      }
    },
  });

  const formUntouched = !form.state.isTouched && !form.state.isDirty;
  const nextBaseline = computeNextBaseline({
    formUntouched,
    accountDetailData,
    accountQuota,
    accountCoreAttributes,
    baseline,
  });
  if (nextBaseline !== null) {
    setBaseline(nextBaseline);
  }

  // sync form with server data while the user has not touched it yet
  useEffect(() => {
    if (!accountDetailData) {
      return;
    }
    if (form.state.isTouched || form.state.isDirty) {
      return;
    }
    form.reset(buildAccountFormValues(accountDetailData), { keepDefaultValues: false });
  }, [accountDetailData, form]);

  // merge quota data once it lands (while untouched)
  useEffect(() => {
    if (!accountQuota) {
      return;
    }
    if (form.state.isTouched || form.state.isDirty) {
      return;
    }
    const quotaValues = {
      ...form.state.values,
      ...buildQuotaValues(accountQuota),
    };
    form.reset(quotaValues as AccountFormValues, { keepDefaultValues: false });
  }, [accountQuota, form]);

  useEffect(() => {
    let cancelled = false;
    checkRightRequest(account.name, currentUser?.name ?? '', 'set.account.userPassword')
      .then((data: { allow?: boolean }) => {
        if (!cancelled) {
          setAllowedDeletePassword(!!data?.allow);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [account.name, currentUser?.name]);

  const grantsFolderList = grants?.folderList;
  if (grantsFolderList !== folderListSeed) {
    setFolderListSeed(grantsFolderList);
    setFolderList(grantsFolderList ?? []);
  }

  const resetToSaved = (): void => {
    console.error(
      'DEBUG resetToSaved pre',
      JSON.stringify({
        hasBaseline: !!baseline,
        baselineBackup: (baseline?.values as Record<string, unknown>)
          ?.backupSelfUndeleteAllowed,
        valuesBackup: (form.state.values as Record<string, unknown>)
          ?.backupSelfUndeleteAllowed,
        fieldMetaKeys: Object.keys(form.state.fieldMeta ?? {}),
      }),
    );
    form.reset(baseline?.values ?? {}, { keepDefaultValues: true });
    setTimeout(() => {
      console.error(
        'DEBUG resetToSaved post',
        JSON.stringify({
          isDirty: form.state.isDirty,
          isDefaultValue: form.state.isDefaultValue,
          isTouched: form.state.isTouched,
          valuesBackup: (form.state.values as Record<string, unknown>)
            ?.backupSelfUndeleteAllowed,
          fieldMeta: JSON.stringify(form.state.fieldMeta ?? {}),
        }),
      );
    }, 500);
  };

  const contextValue: AccountFormContextValue = {
    form,
    account,
    resetToSaved,
    isSaving,
    savedValues: baseline?.values ?? {},
    cosDetail,
    accSpecificDetail,
    signatureList,
    directMemberList: membership.direct,
    inDirectMemberList: membership.inDirect,
    otpList: otps ?? [],
    credentialList: credentials ?? [],
    identitiesList: grants?.identitiesList ?? [],
    folderList,
    setFolderList,
    deligateDetail,
    setDeligateDetail,
    sessions,
    refetchGrants: (): void => {
      void refetchGrants();
    },
    allowedDeletePassword,
  };

  return contextValue;
}

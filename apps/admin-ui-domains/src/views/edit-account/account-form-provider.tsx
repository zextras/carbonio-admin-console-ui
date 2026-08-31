/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useForm } from '@tanstack/react-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  flushCache,
  setCoreAttributes,
  useIsAdvanced,
  useSnackbar,
  useUserAccount,
  useUserSettings,
} from '@zextras/ui-shared';
import { isEqual, reduce, remove } from 'lodash-es';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  ABQ_MODE,
  BACKUP_ENABLED,
  BACKUP_SELF_UNDELETE_ALLOWED,
  CHANGE_DISPLAY_NAME_BOOLEAN,
  CHANGE_NAME_BOOLEAN,
  DEFAULT_COS_BOOLEAN,
  IS_DEFAULT_USER_NAME,
  TOTAL_COMPUTED_QUOTA_LIMIT,
  TOTAL_QUOTA_SOURCE,
  TOTAL_QUOTA_STATUS,
  TOTAL_QUOTA_USED,
  TOTAL_QUOTA_USED_BY_MODULE,
  TRUE,
} from '../../constants';
import { type GetAccountQuotaResponse } from '../../services/account-quota';
import { checkRightRequest } from '../../services/check-right';
import { domainQueryKeys } from '../../services/domain-query-keys';
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
import { useAddAccountAlias } from '../../services/use-add-account-alias';
import { useCosDetail } from '../../services/use-cos-detail';
import { useDeleteAccountAlias } from '../../services/use-delete-account-alias';
import { useModifyAccountAttributes } from '../../services/use-modify-account-attributes';
import { useCredentialList,useOtpList } from '../../services/use-otp-credential-list';
import { useRemoveDistributionListMember } from '../../services/use-remove-distribution-list-member';
import { useRenameAccount } from '../../services/use-rename-account';
import { useSetAccountQuota } from '../../services/use-set-account-quota';
import { useSetPassword } from '../../services/use-set-password';
import { useSignatures } from '../../services/use-signatures';
import { useUserSessions } from '../../services/use-user-sessions';
import { type AccountFormContextValue, type AccountFormValues } from './account-form-context';
import { saveAliases } from './save/save-aliases';
import {
  saveAdministrationRights,
  saveCoreAttributes,
  saveRemainingAttributes,
} from './save/save-general';
import { savePassword } from './save/save-password';
import { saveQuota } from './save/save-quota';
import { saveRename } from './save/save-rename';
import type { SaveContext, SaveDeps } from './save/types';

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

  const saveDeps: SaveDeps = {
    setPassword: useSetPassword(),
    renameAccount: useRenameAccount(),
    addAlias: useAddAccountAlias(),
    deleteAlias: useDeleteAccountAlias(),
    setAccountQuota: useSetAccountQuota(),
    modifyAccountAttributes: useModifyAccountAttributes(),
    removeDistributionListMember: useRemoveDistributionListMember(account.id),
    setCoreAttributes,
  };

  const form = useForm({
    defaultValues: {
      ...buildAccountFormValues(accountDetailData),
      ...(accountCoreAttributes ? buildCoreAttrValues(accountCoreAttributes) : {}),
    },
    onSubmit: async ({ value }) => {
      const values = { ...value } as Record<string, any>;
      const saved = (baseline?.values ?? {}) as Record<string, any>;
      const saveCtx: SaveContext = {
        t,
        successSnackbar,
        errorSnackbar,
        notifySaveError,
        flushAccountCache: (): Promise<void> => {
          if (isGlobalAdmin) {
            return flushCache('account', 'id', saved.zimbraId);
          }
          return Promise.resolve();
        },
        onSaved,
        onDomainRenamed,
        isAdvanced,
      };

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

      setIsSaving(true);
      try {
        const modifiedKeys: string[] = reduce(
          values,
          (result: string[], val, key) => (isEqual(val, saved[key]) ? result : [...result, key]),
          [],
        );

        saveAdministrationRights(values, modifiedKeys, saveDeps, saveCtx);

        remove(modifiedKeys, (ele) => ele === CHANGE_NAME_BOOLEAN);
        remove(modifiedKeys, (ele) => ele === CHANGE_DISPLAY_NAME_BOOLEAN);
        remove(modifiedKeys, (ele) => ele === IS_DEFAULT_USER_NAME);
        remove(modifiedKeys, (ele) => ele === DEFAULT_COS_BOOLEAN);

        if (!values.sn?.trim()) {
          errorSnackbar(t('label.surname_required', 'Surname is required'));
          return;
        }

        const passwordChange = await savePassword(values, saved, modifiedKeys, saveDeps, saveCtx);
        if (passwordChange === 'invalid') {
          return;
        }

        await saveRename(values, saved, modifiedKeys, saveDeps, saveCtx);
        await saveCoreAttributes(values, modifiedKeys, saveDeps, saveCtx);
        saveAliases(values, saved, modifiedKeys, saveDeps, saveCtx);
        saveQuota(values, modifiedKeys, saveDeps, saveCtx);
        await saveRemainingAttributes(
          values,
          saved,
          modifiedKeys,
          passwordChange === 'changed',
          saveDeps,
          saveCtx,
          finalize,
        );
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

  useEffect(() => {
    if (!accountDetailData) {
      return;
    }
    if (form.state.isTouched || form.state.isDirty) {
      return;
    }
    form.reset(buildAccountFormValues(accountDetailData), { keepDefaultValues: false });
  }, [accountDetailData, form]);

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

  const { data: deletePasswordRight } = useQuery({
    queryKey: domainQueryKeys.checkRight(
      account.name,
      currentUser?.name ?? '',
      'set.account.userPassword',
    ),
    queryFn: () =>
      checkRightRequest(account.name, currentUser?.name ?? '', 'set.account.userPassword'),
  });
  const allowedDeletePassword = !!deletePasswordRight?.allow;

  const grantsFolderList = grants?.folderList;
  if (grantsFolderList !== folderListSeed) {
    setFolderListSeed(grantsFolderList);
    setFolderList(grantsFolderList ?? []);
  }

  const resetToSaved = (): void => {
    form.reset(baseline?.values ?? {}, { keepDefaultValues: true });
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

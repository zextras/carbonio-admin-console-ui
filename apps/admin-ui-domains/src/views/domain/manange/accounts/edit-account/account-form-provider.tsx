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
import { useEffect, useRef, useState } from 'react';
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
} from '../../../../../constants';
import { addAccountAliasRequest } from '../../../../../services/add-account-alias';
import { checkRightRequest } from '../../../../../services/check-right';
import { deleteAccountAliasRequest } from '../../../../../services/delete-account-alias';
import { domainQueryKeys } from '../../../../../services/domain-query-keys';
import { modifyAccountRequest } from '../../../../../services/modify-account';
import { removeDistributionListMember } from '../../../../../services/remove-distributionlist-member-service';
import { renameAccountRequest } from '../../../../../services/rename-account';
import { setAccountQuota } from '../../../../../services/set-account-quota';
import { setPasswordRequest } from '../../../../../services/set-password';
import { unsetAccountQuota } from '../../../../../services/unset-account-quota';
import {
  type FlattenedAccount,
  useAccountDetail,
  useAccountSpecificDetail,
} from '../../../../../services/use-account-detail';
import { useAccountGrants } from '../../../../../services/use-account-grants';
import { useAccountMembership } from '../../../../../services/use-account-membership';
import { useAccountQuota } from '../../../../../services/use-account-quota';
import { useCosDetail } from '../../../../../services/use-cos-detail';
import { useCredentialList, useOtpList } from '../../../../../services/use-otp-credential-list';
import { useSignatures } from '../../../../../services/use-signatures';
import { useUserSessions } from '../../../../../services/use-user-sessions';
import {
  AccountFormContext,
  type AccountFormContextValue,
  type AccountFormValues,
} from './account-form-context';

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

type AccountFormProviderProps = {
  account: { id: string; name: string; [key: string]: any };
  children: React.ReactNode;
  onSaved: () => void;
  onDomainRenamed: () => void;
};

export const AccountFormProvider = ({
  account,
  children,
  onSaved,
  onDomainRenamed,
}: AccountFormProviderProps) => {
  const { t } = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();
  const isAdvanced = useIsAdvanced();
  const userSetting = useUserSettings();
  const currentUser = useUserAccount();
  const [isSaving, setIsSaving] = useState(false);
  const [allowedDeletePassword, setAllowedDeletePassword] = useState(false);
  const [folderList, setFolderList] = useState<Array<any>>([]);
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
  const membership = splitMembership(membershipDl);

  const savedValuesRef = useRef<Record<string, any>>({});
  const [savedValues, setSavedValues] = useState<AccountFormValues>({});
  const isGlobalAdmin = userSetting?.attrs?.zimbraIsAdminAccount === TRUE;

  const commitSaved = (v: Record<string, any>): void => {
    savedValuesRef.current = v;
    setSavedValues(v as AccountFormValues);
  };

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

  const form = useForm({
    defaultValues: buildAccountFormValues(accountDetailData) as AccountFormValues,
    onSubmit: async ({ value }) => {
      const values = { ...value } as Record<string, any>;
      const saved = savedValuesRef.current;
      setIsSaving(true);
      try {
        const modifiedKeys: string[] = reduce(
          values,
          (result: string[], val, key) => (isEqual(val, saved[key]) ? result : [...result, key]),
          [],
        );

        // administration rights deletion (remove-from-DL before attr save)
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
                errorSnackbar(
                  error?.message
                    ? error?.message
                    : t(
                        'label.something_wrong_error_msg',
                        'Something went wrong. Please try again.',
                      ),
                );
              });
          });
        }

        remove(modifiedKeys, (ele) => ele === CHANGE_NAME_BOOLEAN);
        remove(modifiedKeys, (ele) => ele === CHANGE_DISPLAY_NAME_BOOLEAN);
        remove(modifiedKeys, (ele) => ele === IS_DEFAULT_USER_NAME);

        if (!values.sn?.trim()) {
          errorSnackbar(t('label.surname_required', 'Surname is required'));
          return;
        }

        let isPasswordChange = false;
        if (values.password || values.repeatPassword) {
          if (modifiedKeys.includes('password') || modifiedKeys.includes('repeatPassword')) {
            if (values.password?.length < 6) {
              errorSnackbar(
                t('label.password_length_msg', 'Password should be more than 5 character'),
              );
              return;
            }
            if (values.password !== values.repeatPassword) {
              errorSnackbar(
                t('label.password_and_repeat_password_not_match', 'Passwords do not match'),
              );
              return;
            }
            await setPasswordRequest(saved.zimbraId, values.password).then(() => {
              if (isGlobalAdmin) {
                flushCache('account', 'id', saved.zimbraId);
              }
            });
            remove(modifiedKeys, (ele) => ele === 'password' || ele === 'repeatPassword');
            isPasswordChange = true;
          }
        }

        // account rename (uid / domain change)
        if (modifiedKeys.includes(UID) || modifiedKeys.includes(DOMAIN_NAME)) {
          await renameAccountRequest(saved.zimbraId, `${values.uid}@${values.domainName}`)
            .then(() => {
              successSnackbar(
                t('label.the_last_changes_has_been_saved_successfully', 'Changes have been saved successfully'),
              );
              if (isGlobalAdmin) {
                flushCache('account', 'id', saved.zimbraId);
              }
            })
            .catch((error) => {
              errorSnackbar(
                error?.message
                  ? error?.message
                  : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
              );
            });
          onSaved();
          remove(modifiedKeys, (ele) => ele === UID);
          if (modifiedKeys.includes(DOMAIN_NAME)) {
            remove(modifiedKeys, (ele) => ele === DOMAIN_NAME);
            onDomainRenamed();
          }
        }

        // core attributes (abqMode, backup flags)
        if (
          modifiedKeys.includes(ABQ_MODE) ||
          modifiedKeys.includes(BACKUP_ENABLED) ||
          modifiedKeys.includes(BACKUP_SELF_UNDELETE_ALLOWED)
        ) {
          const body: any = {};
          if (modifiedKeys.includes(ABQ_MODE)) {
            body.abqMode = {
              value: values.abqMode,
              objectName: values.zimbraId,
              configType: ACCOUNT,
            };
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
                t('label.the_last_changes_has_been_saved_successfully', 'Changes have been saved successfully'),
              );
            })
            .catch((error) => {
              errorSnackbar(
                error?.message
                  ? error?.message
                  : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
              );
            });
          remove(modifiedKeys, (ele) => ele === BACKUP_ENABLED);
          remove(modifiedKeys, (ele) => ele === ABQ_MODE);
          remove(modifiedKeys, (ele) => ele === BACKUP_SELF_UNDELETE_ALLOWED);
        }

        // aliases diff
        const deleteAliasArr = differenceBy(
          `${saved.mail ?? ''}`.split(','),
          `${values.mail ?? ''}`.split(','),
        );
        const addAliasArr = differenceBy(
          `${values.mail ?? ''}`.split(','),
          `${saved.mail ?? ''}`.split(','),
        );

        if (modifiedKeys.includes('mail')) {
          deleteAliasArr.forEach(async (aliasName: any) => {
            await deleteAccountAliasRequest(saved.zimbraId, `${aliasName}`)
              .then(() => {
                if (isGlobalAdmin) {
                  flushCache('account', 'id', saved.zimbraId);
                }
              })
              .catch((error) => {
                errorSnackbar(
                  error?.message
                    ? error?.message
                    : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
                );
              });
          });

          addAliasArr.forEach(async (aliasName: any) => {
            addAccountAliasRequest(saved.zimbraId, `${aliasName}`)
              .then(() => {
                if (isGlobalAdmin) {
                  flushCache('account', 'id', saved.zimbraId);
                }
              })
              .catch((error) => {
                errorSnackbar(
                  error?.message
                    ? error?.message
                    : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
                );
              });
          });

          remove(modifiedKeys, (ele) => ele === 'mail');
        }

        // quota
        if (modifiedKeys.includes(TOTAL_COMPUTED_QUOTA_LIMIT) && isAdvanced) {
          const notifyResult = (
            response:
              | Awaited<ReturnType<typeof setAccountQuota>>
              | Awaited<ReturnType<typeof unsetAccountQuota>>,
          ) => {
            if (response.type === 'success') {
              successSnackbar(
                t('label.the_last_changes_has_been_saved_successfully', 'Changes have been saved successfully'),
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
        }

        // remaining attribute modifications
        const modifiedData: Record<string, any> = {};
        modifiedKeys.forEach((ele) => {
          modifiedData[ele] = values[ele];
        });

        const finalize = (): void => {
          form.reset(values as AccountFormValues, { keepDefaultValues: true });
          commitSaved(values);
          onSaved();
          void queryClient.invalidateQueries({
            queryKey: domainQueryKeys.accountDetail(account.id),
          });
        };

        if (modifiedKeys.length > 0) {
          await modifyAccountRequest(saved.zimbraId, modifiedData)
            .then(async (data) => {
              if (data) {
                if (isGlobalAdmin) {
                  await flushCache('account', 'id', saved.zimbraId);
                }
                successSnackbar(
                  t('label.the_last_changes_has_been_saved_successfully', 'Changes have been saved successfully'),
                );
                finalize();
              }
            })
            .catch((error) => {
              errorSnackbar(
                error?.message
                  ? error?.message
                  : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
              );
            });
        } else {
          if (isPasswordChange) {
            successSnackbar(
              t('account_details.user_password_set', 'User password set successfully'),
            );
            values.userPassword = 'VALUE-BLOCKED';
            values.zimbraPasswordMustChange = 'FALSE';
          }
          finalize();
        }
      } finally {
        setIsSaving(false);
      }
    },
  });

  // sync form with server data while the user has not touched it yet
  useEffect(() => {
    if (!accountDetailData) {
      return;
    }
    if (form.state.isTouched || form.state.isDirty) {
      return;
    }
    const built = buildAccountFormValues(accountDetailData);
    form.reset(built, { keepDefaultValues: false });
    commitSaved(built);
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
      [TOTAL_COMPUTED_QUOTA_LIMIT]: accountQuota.totalComputedLimit,
      [TOTAL_QUOTA_USED]: accountQuota.totalUsed,
      [TOTAL_QUOTA_USED_BY_MODULE]: accountQuota.usedByModules,
      [TOTAL_QUOTA_SOURCE]: accountQuota.totalLimitSource,
      [TOTAL_QUOTA_STATUS]: accountQuota.totalStatus,
    };
    form.reset(quotaValues as AccountFormValues, { keepDefaultValues: false });
    commitSaved(quotaValues);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account.name]);

  // delegates wizard: keep a mutable draft of folder selection, reseeded when
  // grants are (re)fetched so selection resets after mutations
  useEffect(() => {
    setFolderList(grants?.folderList ?? []);
  }, [grants?.folderList]);

  const resetToSaved = (): void => {
    form.reset(savedValuesRef.current as AccountFormValues, { keepDefaultValues: true });
  };

  const contextValue: AccountFormContextValue = {
    form,
    account,
    resetToSaved,
    isSaving,
    savedValues,
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

  return (
    <AccountFormContext.Provider value={contextValue}>{children}</AccountFormContext.Provider>
  );
};

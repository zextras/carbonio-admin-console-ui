/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useIsMutating } from '@tanstack/react-query';
import { useSelector } from '@tanstack/react-store';
import { Button, RouteLeavingGuard, TabBar } from '@zextras/ui-components';
import { useIsAdvanced, useUserSettings } from '@zextras/ui-shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import {
  ADMINISTRATION,
  CONFIGURATION,
  DELEGATES,
  GENERAL_SECTION,
  PROFILE,
  SECURITY,
  USER_PREFERENCES,
} from '../../constants';
import { ComputedLimit } from '../../services/account-quota';
import { useDomainQuota } from '../../services/use-domain-quota';
import { AccountFormContext } from './account-form-context';
import { useAccountFormProvider } from './account-form-provider';
import { EditAccountAdministrationSection } from './administration-section';
import { ADMIN_RIGHTS_MUTATION_SCOPE } from './administration-section/admin-rights-section';
import { EditAccountConfigurationSection } from './configuration-section';
import { EditAccountContactsSection } from './contacts-section';
import { EditAccountDelegatesSection } from './delegates-section/delegates-section';
import styles from './edit-account.module.css';
import { EditAccountGeneralSection } from './general-section';
import { AccountHeaderActions } from './parts/account-header-actions';
import { AccountSaveCancelActions } from './parts/account-save-cancel-actions';
import { DeleteAccountDialog } from './parts/delete-account-dialog';
import { DeleteAccountHintModal } from './parts/delete-account-hint-modal';
import {
  computedLimitToLimit,
  quotaExceedsDomainLimit,
  quotaValueFromLimit,
} from './parts/quota-utils';
import { ReusedDefaultTabBar } from './parts/reused-default-tab-bar';
import { UnsavedChangesModal } from './parts/unsaved-changes-modal';
import { EditAccountSecuritySection } from './security-section';
import { EditAccountUserPreferencesSection } from './user-pref-section';
import { getUserTypeFromAttrs } from './user-type-utils';

export type EditAccountProps = {
  account: { id: string; name: string; [key: string]: any };
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
  defaultTab?: string;
};

export const EditAccount = ({
  account,
  onClose,
  onSaved,
  onDeleted,
  defaultTab,
}: EditAccountProps) => {
  const accountForm = useAccountFormProvider({ account, onSaved, onDomainRenamed: onClose });
  const { t } = useTranslation();
  const { form, isSaving, resetToSaved } = accountForm;
  const isDirty = useSelector(form.store, (s) => !s.isDefaultValue);
  const isAdvanced = useIsAdvanced();
  const userSetting = useUserSettings();

  const hasName = useSelector(form.store, (s) => !!s.values.name);
  const zimbraId = useSelector(form.store, (s) => s.values.zimbraId);

  const [change, setChange] = useState(defaultTab ?? GENERAL_SECTION);
  const [showModal, setShowModal] = useState(false);
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState<boolean>(false);
  const [isOpenDeleteHintModel, setIsOpenDeleteHintModel] = useState(false);

  const adminRightsAddPending = useIsMutating({
    mutationKey: ['distribution-list-member-add', ADMIN_RIGHTS_MUTATION_SCOPE],
  });
  const adminRightsRemovePending = useIsMutating({
    mutationKey: ['distribution-list-member-remove', ADMIN_RIGHTS_MUTATION_SCOPE],
  });
  const isSectionLoading = adminRightsAddPending + adminRightsRemovePending > 0;

  const { domainId } = useParams();
  const { data: quotaData } = useDomainQuota(domainId);
  const domainQuotaConstraint = quotaData?.type === 'success' ? quotaData.limit : 'not-set';
  const totalComputedQuotaLimit = useSelector(
    form.store,
    (s) => s.values.totalComputedQuotaLimit as ComputedLimit | undefined,
  );
  const hasQuotaError = quotaExceedsDomainLimit(
    quotaValueFromLimit(computedLimitToLimit(totalComputedQuotaLimit)),
    domainQuotaConstraint,
  );

  const userType = getUserTypeFromAttrs(userSetting?.attrs);

  const items = [
    {
      id: GENERAL_SECTION,
      label: t('label.general', 'GENERAL'),
      CustomComponent: ReusedDefaultTabBar,
    },
    {
      id: PROFILE,
      label: t('label.profile', 'PROFILE'),
      CustomComponent: ReusedDefaultTabBar,
    },
    {
      id: CONFIGURATION,
      label: t('label.configuration', 'CONFIGURATION'),
      CustomComponent: ReusedDefaultTabBar,
    },
    {
      id: USER_PREFERENCES,
      label: t('label.user_preferences', 'USER PREFERENCES'),
      CustomComponent: ReusedDefaultTabBar,
    },
    {
      id: SECURITY,
      label: t('label.security', 'SECURITY'),
      CustomComponent: ReusedDefaultTabBar,
    },
    {
      id: ADMINISTRATION,
      label: t('label.administration', 'ADMINISTRATION'),
      CustomComponent: ReusedDefaultTabBar,
    },
  ];

  if (isAdvanced) {
    items.push({
      id: DELEGATES,
      label: t('label.delegates', 'DELEGATES').toLocaleUpperCase(),
      CustomComponent: ReusedDefaultTabBar,
    });
  }

  const accountUserType = (item: any): string => {
    if (item.zimbraIsAdminAccount === 'TRUE') return 'Admin';
    if (item.zimbraIsDelegatedAdminAccount === 'TRUE') return 'DelegatedAdmin';
    if (item.zimbraIsExternalVirtualAccount === 'TRUE') return 'External';
    if (item.zimbraIsSystemAccount === 'TRUE') return 'System';
    return 'Normal';
  };

  const onSave = (): void => {
    void form.handleSubmit();
  };

  const onDeleteAccount = (): void => {
    if (userType === 'DelegatedAdmin' || userType === 'System') {
      if (accountUserType(account) === 'System') {
        setIsOpenDeleteHintModel(true);
      } else {
        setIsOpenDeleteDialog(true);
      }
    } else if (userType === 'Normal') {
      setIsOpenDeleteHintModel(true);
    } else {
      setIsOpenDeleteDialog(true);
    }
  };

  const handleClose = (): void => {
    if (isDirty) {
      setShowModal(true);
    } else {
      onClose();
    }
  };

  return (
    <AccountFormContext.Provider value={accountForm}>
      {(!hasName || isSaving || isSectionLoading) && <ds-spinner></ds-spinner>}
      <div className={styles.root}>
        <div className={styles.header}>
          <div className={styles.headerSpacer}></div>
          <div className={styles.title}>
            <ds-text size="medium" overflow="ellipsis" weight="bold" as="h1">
              {`${account?.name}`}
            </ds-text>
          </div>
          {isDirty && (
            <AccountSaveCancelActions
              hasQuotaError={hasQuotaError}
              onSave={onSave}
              onCancel={resetToSaved}
            />
          )}
          {!isDirty && (
            <AccountHeaderActions
              accountId={account.id}
              zimbraId={zimbraId}
              onDelete={onDeleteAccount}
            />
          )}
          <div className={styles.closeWrapper}>
            <Button
              size="medium"
              type="ghost"
              color={'text'}
              icon="CloseOutline"
              onClick={handleClose}
            />
          </div>
        </div>
        <div>
          <ds-divider color="gray3"></ds-divider>
        </div>
        <div className={styles.tabBarSection}>
          <TabBar
            items={items}
            selected={change}
            onChange={(ev: unknown, selectedId: string): void => {
              setChange(selectedId);
            }}
            width="100%"
            background="gray6"
          />
          <ds-divider></ds-divider>
        </div>
        <div className={styles.sectionsPanel}>
          {change === GENERAL_SECTION && (
            <EditAccountGeneralSection
              onNavigateToAdministration={(): void => setChange(ADMINISTRATION)}
            />
          )}
          {change === PROFILE && <EditAccountContactsSection />}
          {change === CONFIGURATION && <EditAccountConfigurationSection />}
          {change === USER_PREFERENCES && <EditAccountUserPreferencesSection />}
          {change === SECURITY && <EditAccountSecuritySection />}
          {change === DELEGATES && <EditAccountDelegatesSection />}
          {change === ADMINISTRATION && (
            <EditAccountAdministrationSection />
          )}
        </div>
      </div>
      <RouteLeavingGuard when={isDirty} onSave={onSave} />
      <UnsavedChangesModal
        open={showModal}
        onDiscard={(): void => {
          setShowModal(false);
          resetToSaved();
          onClose();
        }}
        onSave={(): void => {
          setShowModal(false);
          onSave();
        }}
        onClose={(): void => {
          setShowModal(false);
        }}
      />
      {isOpenDeleteDialog && (
        <DeleteAccountDialog
          account={account}
          zimbraId={zimbraId}
          onDeleted={(): void => {
            onDeleted();
            onClose();
          }}
          onClose={(): void => {
            setIsOpenDeleteDialog(false);
          }}
        />
      )}
      {isOpenDeleteHintModel && (
        <DeleteAccountHintModal
          account={account}
          onClose={(): void => {
            setIsOpenDeleteHintModel(false);
          }}
        />
      )}
    </AccountFormContext.Provider>
  );
};

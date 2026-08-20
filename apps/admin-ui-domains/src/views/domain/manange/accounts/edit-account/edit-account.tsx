/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import {
  Button,
  Container,
  RouteLeavingGuard,
  Row,
  TabBar,
} from '@zextras/ui-components';
import { useIsAdvanced, useUserSettings } from '@zextras/ui-shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  CONFIGURATION,
  DELEGATES,
  GENERAL_SECTION,
  PROFILE,
  SECURITY,
  USER_PREFERENCES,
} from '../../../../../constants';
import { useAccountForm } from './account-form-context';
import { AccountFormProvider } from './account-form-provider';
import EditAccountAdministrationSection from './edit-account-administration-section';
import EditAccountConfigurationSection from './edit-account-configuration-section';
import EditAccountContactsSection from './edit-account-contacts-section';
import EditAccountDelegatesSection from './edit-account-delegates-section';
import { EditAccountGeneralSection } from './edit-account-general-section';
import EditAccountSecuritySection from './edit-account-security-section';
import EditAccountUserPrefrencesSection from './edit-account-user-pref-section';
import { AccountHeaderActions } from './parts/account-header-actions';
import { AccountSaveCancelActions } from './parts/account-save-cancel-actions';
import { DeleteAccountDialog } from './parts/delete-account-dialog';
import { DeleteAccountHintModal } from './parts/delete-account-hint-modal';
import { ReusedDefaultTabBar } from './parts/reused-default-tab-bar';
import { UnsavedChangesModal } from './parts/unsaved-changes-modal';

export type EditAccountProps = {
  account: { id: string; name: string; [key: string]: any };
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
  defaultTab?: string;
};

type EditAccountContentProps = Omit<EditAccountProps, 'onSaved'>;

const EditAccountContent = ({
  account,
  onClose,
  onDeleted,
  defaultTab,
}: EditAccountContentProps) => {
  const { t } = useTranslation();
  const { form, isSaving, resetToSaved } = useAccountForm();
  const isDirty = useSelector(form.store, (s) => !s.isDefaultValue);
  const isAdvanced = useIsAdvanced();
  const userSetting = useUserSettings();

  const hasName = useSelector(form.store, (s) => !!s.values.name);
  const zimbraId = useSelector(form.store, (s) => s.values.zimbraId);

  const [change, setChange] = useState(defaultTab ?? GENERAL_SECTION);
  const [hasQuotaError, setHasQuotaError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState<boolean>(false);
  const [isOpenDeleteHintModel, setIsOpenDeleteHintModel] = useState(false);
  const [isSectionLoading, setIsSectionLoading] = useState(false);

  const userType = (() => {
    if (userSetting?.attrs?.zimbraIsDelegatedAdminAccount === 'TRUE') {
      return 'DelegatedAdmin';
    }
    if (userSetting?.attrs?.zimbraIsSystemAdminAccount === 'TRUE') {
      return 'System';
    }
    if (userSetting?.attrs?.zimbraIsAdminAccount === 'TRUE') {
      return 'Admin';
    }
    return 'Normal';
  })();

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
      id: 'administration',
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
    <>
      {(!hasName || isSaving || isSectionLoading) && <ds-spinner></ds-spinner>}
      <Container
        background="gray5"
        mainAlignment="flex-start"
        style={{
          position: 'absolute',
          top: '0rem',
          height: 'auto',
          overflow: 'hidden',
          transition: 'left 0.2s ease-in-out',
          maxHeight: '100%',
        }}
      >
        <Row
          mainAlignment="flex-start"
          crossAlignment="center"
          orientation="horizontal"
          background="white"
          width="fill"
          height="56px"
        >
          <Row padding={{ horizontal: 'small' }}></Row>
          <Row takeAvailableSpace mainAlignment="flex-start">
            <ds-text size="medium" overflow="ellipsis" weight="bold" as="h1">
              {`${account?.name}`}
            </ds-text>
          </Row>
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
          <Row padding={{ right: 'large' }}>
            <Button
              size="medium"
              type="ghost"
              color={'text'}
              icon="CloseOutline"
              onClick={handleClose}
            />
          </Row>
        </Row>
        <Row>
          <ds-divider color="gray3"></ds-divider>
        </Row>
        <Container
          padding={{ all: 'small' }}
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          background="white"
        >
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
        </Container>
        <Container
          padding={{ left: 'large', right: 'large' }}
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          height="calc(100vh - 3.6rem)"
          background="white"
          style={{ overflow: 'auto' }}
        >
          {change === GENERAL_SECTION && (
            <EditAccountGeneralSection
              setChange={setChange}
              onQuotaErrorChange={setHasQuotaError}
            />
          )}
          {change === PROFILE && <EditAccountContactsSection />}
          {change === CONFIGURATION && <EditAccountConfigurationSection />}
          {change === USER_PREFERENCES && <EditAccountUserPrefrencesSection />}
          {change === SECURITY && <EditAccountSecuritySection />}
          {change === DELEGATES && <EditAccountDelegatesSection />}
          {change === 'administration' && (
            <EditAccountAdministrationSection setIsLoading={setIsSectionLoading} />
          )}
        </Container>
      </Container>
      <RouteLeavingGuard when={isDirty} onSave={onSave} />
      <UnsavedChangesModal
        open={showModal}
        onDiscard={(): void => {
          setShowModal(false);
          resetToSaved();
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
    </>
  );
};

export const EditAccount = ({
  account,
  onClose,
  onSaved,
  onDeleted,
  defaultTab,
}: EditAccountProps) => (
  <AccountFormProvider account={account} onSaved={onSaved} onDomainRenamed={onClose}>
    <EditAccountContent
      account={account}
      onClose={onClose}
      onDeleted={onDeleted}
      defaultTab={defaultTab}
    />
  </AccountFormProvider>
);

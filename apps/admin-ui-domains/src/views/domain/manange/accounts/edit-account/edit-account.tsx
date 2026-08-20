/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import {
  Button,
  Container,
  Modal,
  Padding,
  RouteLeavingGuard,
  Row,
  TabBar,
  useSnackbar,
} from '@zextras/ui-components';
import { useIsAdvanced, useUserSettings } from '@zextras/ui-shared';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import {
  CLOSED,
  CONFIGURATION,
  DELEGATES,
  GENERAL_SECTION,
  PROFILE,
  SECURITY,
  USER_PREFERENCES,
} from '../../../../../constants';
import { deleteAccount } from '../../../../../services/delete-account-service';
import { modifyAccountRequest } from '../../../../../services/modify-account';
import { getAccountStatusColors } from '../../../constants/account-status-colors';
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
import { ReusedDefaultTabBar } from './parts/reused-default-tab-bar';

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
  const createSnackbar = useSnackbar();
  const { form, isSaving, resetToSaved } = useAccountForm();
  const isDirty = useSelector(form.store, (s) => !s.isDefaultValue);
  const isAdvanced = useIsAdvanced();
  const userSetting = useUserSettings();
  const STATUS_COLOR = getAccountStatusColors(t);

  const hasName = useSelector(form.store, (s) => !!s.values.name);
  const zimbraId = useSelector(form.store, (s) => s.values.zimbraId);

  const [change, setChange] = useState(defaultTab ?? GENERAL_SECTION);
  const [hasQuotaError, setHasQuotaError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState<boolean>(false);
  const [isOpenDeleteHintModel, setIsOpenDeleteHintModel] = useState(false);
  const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);
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

  const closeHandler = (): void => {
    setIsOpenDeleteDialog(false);
  };

  const onSuccess = (message: string): void => {
    createSnackbar({
      key: 'success',
      severity: 'success',
      label: message,
      autoHideTimeout: 3000,
      hideButton: true,
      replace: true,
    });
    setIsRequestInProgress(false);
    closeHandler();
  };

  const onDisableAccount = (): void => {
    setIsRequestInProgress(true);
    modifyAccountRequest(zimbraId ?? account.id, { zimbraAccountStatus: CLOSED })
      .then((data) => {
        if (data?.account && Array.isArray(data?.account)) {
          onSuccess(
            t('label.account_disable_correctly', 'The account has been correctly disabled.'),
          );
        }
      })
      .catch((error) => {
        setIsRequestInProgress(false);
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: error?.message
            ? error?.message
            : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      });
  };

  const onDeleteHandler = (): void => {
    setIsRequestInProgress(true);
    deleteAccount(account?.id)
      .then(() => {
        onSuccess(t('label.account_remove_correctly', 'The account has been correctly removed.'));
        onDeleted();
        onClose();
      })
      .catch((error) => {
        setIsRequestInProgress(false);
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: error.message
            ? error.message
            : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      });
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
      <Modal
        size="small"
        title={t('label.hey_there_are_unsaved_changes_here', 'Hey! There are unsaved changes here')}
        open={showModal}
        customFooter={
          <Container orientation="horizontal" mainAlignment="flex-end">
            <Row style={{ gap: '1rem' }}>
              <Button
                label={t('label.discard', 'Discard')}
                color="primary"
                type="outlined"
                onClick={(): void => {
                  setShowModal(false);
                  resetToSaved();
                }}
              />
              <Button
                label={t('label.save_the_changes', 'Save the changes')}
                color="primary"
                onClick={(): void => {
                  setShowModal(false);
                  onSave();
                }}
              />
            </Row>
          </Container>
        }
        showCloseIcon
        onClose={(): void => {
          setShowModal(false);
        }}
      >
        <ds-text
          size={'extralarge'}
          overflow="break-word"
          style={{ whiteSpace: 'pre-line', textAlign: 'center', padding: '2rem 0' }}
          as="p"
        >
          {t(
            'label.are_you_sure_you_want_to_leave_without_saving_he_changes',
            `Are you sure you want to leave without saving he changes?`,
          )}
        </ds-text>
      </Modal>
      {isOpenDeleteDialog && (
        <Modal
          size="medium"
          title={t('label.deleting_account_name', 'You are deleting {{name}} account', {
            name: account?.name,
          })}
          open={isOpenDeleteDialog}
          customFooter={
            <Container orientation="horizontal" mainAlignment="flex-end">
              <Row style={{ gap: '1rem' }}>
                <Button
                  label={t('label.delete_it_instead', 'Delete it instead')}
                  color="error"
                  type="outlined"
                  onClick={onDeleteHandler}
                  disabled={isRequestInProgress}
                />
                <Button
                  label={t('label.close_the_account', 'Close the account')}
                  color="primary"
                  onClick={onDisableAccount}
                  disabled={
                    isRequestInProgress ||
                    STATUS_COLOR[account?.zimbraAccountStatus]?.label ===
                      STATUS_COLOR?.closed?.label
                  }
                />
              </Row>
            </Container>
          }
          showCloseIcon
          onClose={closeHandler}
        >
          <Container>
            {userType === 'Admin' &&
              (accountUserType(account) === 'System' ||
                accountUserType(account) === 'DelegatedAdmin') && (
                <Padding bottom="medium" top="medium">
                  <ds-text color="warning" overflow="break-word" as="strong">
                    {t(
                      'label.deleting_account_warning_content',
                      'Deleting the system account could impact the system stability.',
                    )}
                  </ds-text>
                </Padding>
              )}
            <Padding bottom="medium">
              <ds-text size={'extralarge'} overflow="break-word" as="p">
                <Trans
                  i18nKey="label.deleting_account_content_1"
                  defaults="Are you sure you want to delete <bold>{{name}}</bod> ?"
                  values={{ name: account?.name }}
                  components={{ bold: <strong /> }}
                />
              </ds-text>
            </Padding>
            <Padding bottom="medium">
              <ds-text overflow="break-word" as="p">
                <Trans
                  i18nKey="label.deleting_account_content_2"
                  defaults="Deleting the account <bold>will PERMANENTLY delete</bold> all the data."
                  components={{ bold: <strong /> }}
                />
              </ds-text>
            </Padding>
            <Padding bottom="medium">
              <ds-text overflow="break-word" as="p">
                <Trans
                  i18nKey="label.deleting_account_content_3"
                  defaults="You can <bold>Close it to preserve</bold> the data, instead."
                  components={{ bold: <strong /> }}
                />
              </ds-text>
            </Padding>
            <Row padding={{ bottom: 'large' }}>
              <ds-icon
                icon="AlertTriangleOutline"
                size="large"
                style={{ height: '48px', width: '48px' }}
              ></ds-icon>
            </Row>
          </Container>
        </Modal>
      )}
      {isOpenDeleteHintModel && (
        <Modal
          size="medium"
          title={account?.name}
          open={isOpenDeleteHintModel}
          customFooter={
            <Container orientation="horizontal" mainAlignment="flex-end">
              <Button
                label={t('label.close', 'Close')}
                color="primary"
                onClick={(): void => {
                  setIsOpenDeleteHintModel(false);
                }}
                disabled={
                  isRequestInProgress ||
                  STATUS_COLOR[account?.zimbraAccountStatus]?.label === STATUS_COLOR?.closed?.label
                }
              />
            </Container>
          }
          showCloseIcon
          onClose={(): void => {
            setIsOpenDeleteHintModel(false);
          }}
        >
          <Container>
            <Padding bottom="medium" top="medium">
              <ds-text
                style={{ textAlign: 'center' }}
                size={'extralarge'}
                overflow="break-word"
                as="p"
              >
                {t(
                  'label.delete_delegated_account_content',
                  `The system accounts can't be deleted from here. Please visit the respective module to manage the account.`,
                )}
              </ds-text>
            </Padding>
          </Container>
        </Modal>
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

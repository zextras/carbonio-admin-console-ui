/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Modal, useSnackbar } from '@zextras/ui-components';
import { useUserSettings } from '@zextras/ui-shared';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { CLOSED } from '../../../../constants';
import { deleteAccount } from '../../../../services/delete-account-service';
import { modifyAccountRequest } from '../../../../services/modify-account';
import { getAccountStatusColors } from '../../constants/account-status-colors';
import { getUserTypeFromAttrs } from '../user-type-utils';

type DeleteAccountDialogProps = {
  account: { id: string; name: string; [key: string]: any };
  zimbraId: string | undefined;
  onDeleted: () => void;
  onClose: () => void;
};

export const DeleteAccountDialog = ({
  account,
  zimbraId,
  onDeleted,
  onClose,
}: DeleteAccountDialogProps) => {
  const { t } = useTranslation();
  const createSnackbar = useSnackbar();
  const userSetting = useUserSettings();
  const STATUS_COLOR = getAccountStatusColors(t);
  const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);

  const userType = getUserTypeFromAttrs(userSetting?.attrs);

  const accountUserType = (item: any): string => {
    if (item.zimbraIsAdminAccount === 'TRUE') return 'Admin';
    if (item.zimbraIsDelegatedAdminAccount === 'TRUE') return 'DelegatedAdmin';
    if (item.zimbraIsExternalVirtualAccount === 'TRUE') return 'External';
    if (item.zimbraIsSystemAccount === 'TRUE') return 'System';
    return 'Normal';
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
    onClose();
  };

  const onError = (error: { message?: string }): void => {
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
        onError(error);
      });
  };

  const onDeleteHandler = (): void => {
    setIsRequestInProgress(true);
    deleteAccount(account?.id)
      .then(() => {
        onSuccess(t('label.account_remove_correctly', 'The account has been correctly removed.'));
        onDeleted();
      })
      .catch((error) => {
        onError(error);
      });
  };

  return (
    <Modal
      size="medium"
      title={t('label.deleting_account_name', 'You are deleting {{name}} account', {
        name: account?.name,
      })}
      open
      customFooter={
        <div className="flex justify-end gap-4">
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
              STATUS_COLOR[account?.zimbraAccountStatus]?.label === STATUS_COLOR?.closed?.label
            }
          />
        </div>
      }
      showCloseIcon
      onClose={onClose}
    >
      <div>
        {userType === 'Admin' &&
          (accountUserType(account) === 'System' ||
            accountUserType(account) === 'DelegatedAdmin') && (
            <div className="pb-md pt-md">
              <ds-text color="warning" overflow="break-word" as="strong">
                {t(
                  'label.deleting_account_warning_content',
                  'Deleting the system account could impact the system stability.',
                )}
              </ds-text>
            </div>
          )}
        <div className="pb-md">
          <ds-text size={'extralarge'} overflow="break-word" as="p">
            <Trans
              i18nKey="label.deleting_account_content_1"
              defaults="Are you sure you want to delete <bold>{{name}}</bod> ?"
              values={{ name: account?.name }}
              components={{ bold: <strong /> }}
            />
          </ds-text>
        </div>
        <div className="pb-md">
          <ds-text overflow="break-word" as="p">
            <Trans
              i18nKey="label.deleting_account_content_2"
              defaults="Deleting the account <bold>will PERMANENTLY delete</bold> all the data."
              components={{ bold: <strong /> }}
            />
          </ds-text>
        </div>
        <div className="pb-md">
          <ds-text overflow="break-word" as="p">
            <Trans
              i18nKey="label.deleting_account_content_3"
              defaults="You can <bold>Close it to preserve</bold> the data, instead."
              components={{ bold: <strong /> }}
            />
          </ds-text>
        </div>
        <div className="pb-lg">
          <ds-icon
            icon="AlertTriangleOutline"
            size="large"
            style={{ height: '48px', width: '48px' }}
          ></ds-icon>
        </div>
      </div>
    </Modal>
  );
};

/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, useSnackbar } from '@zextras/ui-components';
import { noop } from 'lodash-es';
import { FC, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { doRestoreDeleteAccount } from '../../../../services/restore-delete-account-service';
import RestoreAccountWizard from './restore-delete-account-wizard';

export type RestoreAccountRequestParams = {
  id: string;
  createDate: string;
  copyAccount: string;
  dateTime: string | null;
  hsmApply: boolean;
  notificationReceiver: string;
  isEmailNotificationEnable: boolean;
  copyDomain: string;
  serverName: string;
};

const RestoreDeleteAccount: FC = () => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isRequestWorkInProgress, setIsRequestWorkInProgress] = useState<any>();
  const [wizardKey, setWizardKey] = useState(0);

  // Remounts the wizard (resetting its internal state to the first step) without
  // any URL manipulation. Used on successful restore and on cancel.
  const resetWizard = useCallback(() => {
    setWizardKey((state) => state + 1);
  }, []);

  useEffect(() => {
    if (isSuccess) {
      resetWizard();
      setIsSuccess(false);
    }
  }, [isSuccess, resetWizard]);

  const restoreAccountRequest = useCallback(
    (params: RestoreAccountRequestParams) => {
      const {
        id,
        createDate,
        copyAccount,
        dateTime,
        hsmApply,
        notificationReceiver,
        isEmailNotificationEnable,
        copyDomain,
        serverName,
      } = params;
      const body: any = {
        srcAccountName: id,
        obeyHSM: hsmApply,
        // restoreDatasources: dataSource
      };
      if (notificationReceiver !== '' && isEmailNotificationEnable) {
        body.notificationMails = [notificationReceiver];
      }
      if (copyAccount !== '') {
        body.dstAccountName = `${copyAccount.split('@')[0]}@${copyDomain}`;
      }
      if (dateTime) {
        body.date = new Date(dateTime).getTime();
      }
      if (body?.date < createDate) {
        body.date = createDate;
      }
      setIsRequestWorkInProgress(true);
      doRestoreDeleteAccount(body, serverName)
        .then((data) => {
          let error = data?.error?.details?.cause || data?.error?.message;
          const success = data?.operationId;
          if (error === undefined && data?.status !== 200) {
            error = t('label.something_wrong_error_msg', 'Something went wrong. Please try again.');
          }
          setIsRequestWorkInProgress(false);
          if (error) {
            createSnackbar({
              key: 'error',
              severity: 'error',
              label: error,
              autoHideTimeout: 3000,
              hideButton: true,
              replace: true,
            });
          }
          if (success) {
            createSnackbar({
              key: 'success',
              severity: 'success',
              label: t(
                'label.restore_account_has_added_operation_queue',
                'The restore of the account has been added to the operation queue successfully',
              ),
              autoHideTimeout: 3000,
              hideButton: true,
              replace: true,
            });
            setIsSuccess(true);
          }
        })
        .catch((error: any) => {
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
    },
    [createSnackbar, t],
  );

  return (
    <Container background="gray5" mainAlignment="flex-start">
      <Container
        orientation="column"
        background="gray5"
        crossAlignment="flex-start"
        mainAlignment="flex-start"
      >
        <Container
          orientation="column"
          background="gray6"
          crossAlignment="flex-start"
          mainAlignment="flex-start"
        >
          <RestoreAccountWizard
            key={wizardKey}
            setShowRestoreAccountWizard={noop}
            restoreAccountRequest={restoreAccountRequest}
            isRequestWorkInProgress={isRequestWorkInProgress}
            onReset={resetWizard}
          />
        </Container>
      </Container>
    </Container>
  );
};
export default RestoreDeleteAccount;

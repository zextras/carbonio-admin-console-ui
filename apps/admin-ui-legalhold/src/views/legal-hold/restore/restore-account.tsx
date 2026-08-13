/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Container, useSnackbar } from '@zextras/ui-components';
import { useDebouncedValue } from '@zextras/ui-shared';
import { unionBy } from 'lodash-es';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { BackupAccountItem, DirectoryAccount } from '../../../../types';
import { SEARCH_DEBOUNCE_MS } from '../../../constants';
import { useAccountDirectory } from '../../../services/use-account-directory';
import { useGetAccount } from '../../../services/use-get-account';
import { useGrantFolderPermission } from '../../../services/use-grant-folder-permission';
import { useRestoreLegalHoldAccount } from '../../../services/use-restore-legal-hold-account';
import {
  endOfDayTimestamp,
  resolveRestoreTimestamp,
  startOfDayTimestamp,
} from '../../utility/resolve-restore-timestamp';
import { LegalAccessSection } from './legal-access-section';
import { RestoreAccountHeader } from './restore-account-header';
import { RestoreAccountInfo } from './restore-account-info';
import { RestoreSettings } from './restore-settings';

type RestoreAccountViewProps = {
  legalHoldAccount: BackupAccountItem | null;
  onBack: () => void;
};

export const RestoreAccountView = ({ legalHoldAccount, onBack }: RestoreAccountViewProps) => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const [searchAccount, setSearchAccount] = useState('');
  const [unDelete, setUnDelete] = useState(false);
  const [legalHoldPrefix, setLegalHoldPrefix] = useState('');
  const [accountList, setAccountList] = useState<Array<DirectoryAccount>>([]);
  const [selectedRow, setSelectedRow] = useState<Array<string>>([]);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [undeleteFromDate, setUndeleteFromDate] = useState<Date | null>(
    legalHoldAccount?.creationTimestamp ? new Date(legalHoldAccount.creationTimestamp) : null,
  );
  const [isRestoreOperationComplete, setIsRestoreOperationComplete] = useState(false);
  const [legalHoldAccountInformation, setLegalHoldAccountInformation] =
    useState<DirectoryAccount | null>(null);

  const account = legalHoldAccount?.name ?? '';
  const accountId = legalHoldAccount?.id ?? '';
  const targetServers = legalHoldAccount?.serverName ?? '';
  const debouncedSearchAccount = useDebouncedValue(searchAccount, SEARCH_DEBOUNCE_MS);

  const accountDirectoryQuery = useAccountDirectory(
    debouncedSearchAccount,
    legalHoldAccount?.id ?? '',
  );
  const restoreMutation = useRestoreLegalHoldAccount();
  const getAccountMutation = useGetAccount();
  const grantPermissionMutation = useGrantFolderPermission();

  const searchAccountResult = accountDirectoryQuery.data ?? [];
  const isRequestInProgress = restoreMutation.isPending || grantPermissionMutation.isPending;
  const isEnableLegalAccess = grantPermissionMutation.isSuccess;

  function handleFromDateChange(date: Date | null): void {
    if (undeleteFromDate && date && date.getTime() < undeleteFromDate.getTime()) {
      setUndeleteFromDate(date);
    }
    setFromDate(date);
  }

  function onAdd(): void {
    if (searchAccount === '') {
      return;
    }
    const filterData = searchAccountResult.filter((item) => item.name === searchAccount);
    setAccountList((current) => unionBy([...current, ...filterData], 'id'));
    setSearchAccount('');
  }

  function onRemove(): void {
    setAccountList((current) => current.filter((item) => item.id !== selectedRow[0]));
  }

  function showValidationError(message: string): void {
    createSnackbar({
      key: 'error',
      severity: 'error',
      label: message,
      autoHideTimeout: 3000,
      hideButton: true,
      replace: true,
    });
  }

  function onRestore(): void {
    if (legalHoldPrefix === '') {
      showValidationError(
        t('legal_hold.legal_hold_prefix_blank_error', 'Legal Hold prefix should not be blank'),
      );
      return;
    }
    if (account === '') {
      showValidationError(
        t('legal_hold.legal_hold_account_blank_error', 'Legal Hold account should not be blank'),
      );
      return;
    }
    if (fromDate === null) {
      showValidationError(
        t('legal_hold.legal_hold_fromdate_blank_error', 'Legal Hold from date should not be blank'),
      );
      return;
    }

    const destinationAccount = `${legalHoldPrefix}_${account}`;
    const getDate = resolveRestoreTimestamp({
      requestedDate: endOfDayTimestamp(fromDate),
      creationTimestamp: legalHoldAccount?.creationTimestamp,
      deletedTimestamp: legalHoldAccount?.deletedTimestamp,
    });
    const getUndeletedDate =
      unDelete && undeleteFromDate
        ? resolveRestoreTimestamp({
            requestedDate: startOfDayTimestamp(undeleteFromDate),
            creationTimestamp: legalHoldAccount?.creationTimestamp,
            deletedTimestamp: legalHoldAccount?.deletedTimestamp,
          })
        : undefined;

    if (!getDate) {
      return;
    }

    restoreMutation.mutate(
      {
        sourceAccountId: accountId,
        destinationAccount,
        date: getDate,
        undeleteDate: getUndeletedDate ?? null,
        unDelete,
        targetServers,
      },
      {
        onSuccess: () => {
          setIsRestoreOperationComplete(true);
          if (accountList.length === 0) {
            onBack();
            return;
          }
          getAccountMutation.mutate(destinationAccount, {
            onSuccess: (restoredAccount) => {
              setLegalHoldAccountInformation(restoredAccount);
            },
          });
        },
      },
    );
  }

  function onGivePermission(): void {
    if (!legalHoldAccountInformation?.id) {
      return;
    }
    grantPermissionMutation.mutate({
      accounts: accountList,
      targetAccountId: legalHoldAccountInformation.id,
    });
  }

  return (
    <Container
      background="gray5"
      mainAlignment="flex-start"
      style={{
        position: 'absolute',
        top: '2.625rem',
        right: '0',
        bottom: '0',
        left: 'max(calc(100% - 43.125rem), 0.75rem)',
        transition: 'left 0.2s ease-in-out',
        height: 'auto',
        width: 'auto',
        maxHeight: '100%',
        overflow: 'hidden',
        boxShadow: '-0.375rem 0.25rem 0.313rem 0 rgba(0, 0, 0, 0.1)',
      }}
    >
      <Container mainAlignment="flex-start">
        <RestoreAccountHeader accountName={legalHoldAccount?.name} onBack={onBack} />
        <Container
          padding={{ all: 'extralarge' }}
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          height="calc(100vh - 14.5rem)"
          style={{ overflow: 'auto' }}
          background="gray6"
        >
          <RestoreAccountInfo legalHoldAccount={legalHoldAccount} />
          <RestoreSettings
            legalHoldAccount={legalHoldAccount}
            account={account}
            legalHoldPrefix={legalHoldPrefix}
            fromDate={fromDate}
            undeleteFromDate={undeleteFromDate}
            unDelete={unDelete}
            onPrefixChange={setLegalHoldPrefix}
            onFromDateChange={handleFromDateChange}
            onUndeleteFromDateChange={setUndeleteFromDate}
            onToggleUnDelete={() => setUnDelete((current) => !current)}
          />
          <LegalAccessSection
            searchAccount={searchAccount}
            searchAccountResult={searchAccountResult}
            accountList={accountList}
            selectedRow={selectedRow}
            onSearchChange={setSearchAccount}
            onSelectSearchResult={setSearchAccount}
            onAdd={onAdd}
            onRemove={onRemove}
            onSelectionChange={(ids) => setSelectedRow(ids[0] ? [ids[0]] : [])}
          />
          <Container mainAlignment="flex-start" height="auto">
            <Button
              size="large"
              type="outlined"
              color="primary"
              label={t('legal_hold.restore', 'Restore')}
              onClick={onRestore}
              disabled={isRequestInProgress || isRestoreOperationComplete}
              width="fill"
            />
          </Container>
          <Container height="auto" padding={{ top: 'medium', bottom: 'large' }}>
            <ds-text as="span" size="small" overflow="ellipsis" weight="light" color="gray0">
              {t(
                'legal_hold.you_must_restore_the_account_before_enable_legal_hold',
                'You must restore the account before enabling the Legal Hold',
              )}
            </ds-text>
          </Container>
        </Container>
      </Container>
      <Container
        mainAlignment="flex-end"
        crossAlignment="flex-end"
        height="auto"
        background="gray6"
        padding={{ all: 'large' }}
      >
        <Button
          size="large"
          type="default"
          color="primary"
          label={t('legal_hold.give_permission', 'Give Permission')}
          onClick={onGivePermission}
          disabled={
            accountList.length === 0 ||
            isRequestInProgress ||
            !isRestoreOperationComplete ||
            legalHoldAccountInformation === null ||
            isEnableLegalAccess
          }
        />
      </Container>
    </Container>
  );
};

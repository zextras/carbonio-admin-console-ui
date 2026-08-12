/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, Row, useSnackbar } from '@zextras/ui-components';
import {
  replaceHistory,
  useDebouncedValue,
  useDomainInformation,
  useRelativePathname,
} from '@zextras/ui-shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { matchPath } from 'react-router';

import type { BackupAccountItem, DomainItem } from '../../../types';
import {
  ACCOUNT_SEARCH_DEBOUNCE_MS,
  RECORD_DISPLAY_LIMIT,
  SEARCH_DEBOUNCE_MS,
  SET,
  TRUE,
  UNSET,
} from '../../constants';
import { useBackupAccounts } from '../../services/use-backup-accounts';
import { useDomainList } from '../../services/use-domain-list';
import { useSetUnsetLegalHold } from '../../services/use-set-unset-legal-hold';
import { buildAccountTableRows } from './build-account-table-rows';
import { LegalHoldAccountsTable } from './legal-hold-accounts-table';
import { LegalHoldFilters } from './legal-hold-filters';
import { LegalHoldHeader } from './legal-hold-header';
import { LegalHoldToolbar } from './legal-hold-toolbar';
import { RestoreAccountView } from './restore/restore-account';

export const LegalHoldPanel = () => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const { data: domainData } = useDomainInformation();
  const domainName = domainData?.name || '';

  const [accountOffset, setAccountOffset] = useState(0);
  const [searchAccountName, setSearchAccountName] = useState('');
  const [selectedAccountRows, setSelectedAccountRows] = useState<Array<BackupAccountItem>>([]);
  const [isShowOnlyLegalHoldAccount, setIsShowOnlyLegalHoldAccount] = useState(false);
  const [isDomainSelect, setIsDomainSelect] = useState(false);
  const [searchDomainName, setSearchDomainName] = useState(domainName);
  const [selectedDomainName, setSelectedDomainName] = useState(domainName);

  const debouncedAccountSearch = useDebouncedValue(searchAccountName, ACCOUNT_SEARCH_DEBOUNCE_MS);
  const debouncedDomainSearch = useDebouncedValue(searchDomainName, SEARCH_DEBOUNCE_MS);
  const activeDomain = selectedDomainName || domainName;

  const backupAccountsQuery = useBackupAccounts({
    domain: activeDomain,
    filter: debouncedAccountSearch,
    legalHold: isShowOnlyLegalHoldAccount,
    page: accountOffset,
    pageSize: RECORD_DISPLAY_LIMIT,
  });
  const domainListQuery = useDomainList(debouncedDomainSearch, !isDomainSelect);
  const setUnsetLegalHoldMutation = useSetUnsetLegalHold();

  const backupAccountList = backupAccountsQuery.data?.accounts ?? [];
  const maxPage = backupAccountsQuery.data?.maxPage ?? 0;
  const totalItem = maxPage >= 0 ? maxPage * RECORD_DISPLAY_LIMIT : 1;
  const domainList = domainListQuery.data?.domain ?? [];
  const isShowError =
    domainListQuery.isError ||
    (!isDomainSelect &&
      searchDomainName !== '' &&
      debouncedDomainSearch === searchDomainName &&
      !domainListQuery.isFetching &&
      (domainListQuery.data?.searchTotal ?? -1) === 0);
  const backupAccountsError = backupAccountsQuery.error
    ? backupAccountsQuery.error.message ||
      t('label.something_wrong_error_msg', 'Something went wrong. Please try again.')
    : undefined;

  const relativePathname = useRelativePathname();
  const restoreMatch = matchPath('/restore/:accountId', relativePathname);
  const restoreAccount = restoreMatch?.params.accountId
    ? (backupAccountList.find((item) => item.id === restoreMatch.params.accountId) ?? null)
    : null;

  const selectedAccount = selectedAccountRows[0] ?? null;
  const isLegalHoldEnabled = selectedAccount !== null;
  const legalHoldOperationLabel =
    selectedAccount?.legalHold === 'false'
      ? t('legal_hold.set_legal_hold', 'Set legal hold')
      : t('legal_hold.unset_legal_hold', 'Unset legal hold');

  const accountRows = buildAccountTableRows(backupAccountList, t);
  const selectedRowIds = selectedAccountRows.map((item) => `${item.id}-${item.serverName}`);

  function clearSelectionAndRestoreRoute(): void {
    setSelectedAccountRows([]);
    replaceHistory('/');
  }

  function onSearchAccountChange(value: string): void {
    setSearchAccountName(value);
    setAccountOffset(0);
  }

  function onSearchDomainChange(value: string): void {
    setIsDomainSelect(false);
    setSearchDomainName(value);
  }

  function onSelectDomain(domain: DomainItem): void {
    setIsDomainSelect(true);
    setSearchDomainName(domain.name);
    setSelectedDomainName(domain.name);
    setSelectedAccountRows([]);
    setAccountOffset(0);
  }

  function onToggleLegalHoldFilter(): void {
    setIsShowOnlyLegalHoldAccount((current) => !current);
    setAccountOffset(0);
    clearSelectionAndRestoreRoute();
  }

  function onSelectionChange(ids: Array<string>): void {
    const selected = backupAccountList.find((item) => `${item.id}-${item.serverName}` === ids[0]);
    setSelectedAccountRows(selected ? [selected] : []);
  }

  function onPageChange(val: number): void {
    setAccountOffset(val - 1);
    clearSelectionAndRestoreRoute();
  }

  function onLegalHoldPress(): void {
    if (!selectedAccount) {
      return;
    }
    const status = selectedAccount.legalHold?.toUpperCase() === TRUE ? UNSET : SET;
    setUnsetLegalHoldMutation.mutate(
      {
        status,
        id: selectedAccount.id,
        serverName: selectedAccount.serverName,
      },
      {
        onSuccess: () => {
          setSelectedAccountRows([]);
        },
      },
    );
  }

  function onRestore(): void {
    if (selectedAccount?.status === UNSET) {
      createSnackbar({
        key: 'error',
        severity: 'error',
        label: t('legal_hold.legal_hold_status_not_set', 'Legal hold not set in this account'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
      return;
    }
    if (selectedAccount?.id) {
      replaceHistory(`/restore/${selectedAccount.id}`);
    }
  }

  return (
    <Container mainAlignment="flex-start" background="gray6">
      <Row mainAlignment="flex-start" width="100%">
        <LegalHoldHeader />
        <Container
          orientation="column"
          crossAlignment="flex-start"
          mainAlignment="flex-start"
          style={{ overflow: 'auto' }}
          width="100%"
          height="calc(100vh - 12.5rem)"
          padding={{ all: 'large' }}
        >
          <Row mainAlignment="flex-start" width="100%">
            <Container
              orientation="vertical"
              mainAlignment="space-around"
              background="gray6"
              height="auto"
            >
              <LegalHoldToolbar
                isShowOnlyLegalHoldAccount={isShowOnlyLegalHoldAccount}
                disableSwitch={backupAccountsQuery.isFetching}
                legalHoldOperationLabel={legalHoldOperationLabel}
                isLegalHoldEnabled={isLegalHoldEnabled}
                isRestoreDisabled={selectedAccountRows.length === 0}
                onToggleLegalHoldFilter={onToggleLegalHoldFilter}
                onLegalHoldPress={onLegalHoldPress}
                onRestore={onRestore}
              />
              <LegalHoldFilters
                isLoading={domainListQuery.isFetching}
                isDomainSelect={isDomainSelect}
                isShowError={isShowError}
                searchDomainName={searchDomainName}
                searchAccountName={searchAccountName}
                domainList={domainList}
                onSearchDomainChange={onSearchDomainChange}
                onClearDomain={() => setSearchDomainName('')}
                onSelectDomain={onSelectDomain}
                onSearchAccountChange={onSearchAccountChange}
              />
              <LegalHoldAccountsTable
                rows={accountRows}
                selectedRowIds={selectedRowIds}
                totalItem={totalItem}
                accountOffset={accountOffset}
                isFetching={backupAccountsQuery.isFetching}
                errorMessage={backupAccountsError}
                onSelectionChange={onSelectionChange}
                onPageChange={onPageChange}
              />
            </Container>
          </Row>
        </Container>
      </Row>
      {restoreMatch && (
        <RestoreAccountView legalHoldAccount={restoreAccount} onBack={() => replaceHistory('/')} />
      )}
    </Container>
  );
};

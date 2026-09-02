/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  CustomHeaderFactory,
  HoverableRowFactory,
  Table,
} from '@zextras/ui-components';
import type { TFunction } from 'i18next';
import type { ReactElement, RefObject } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import logo from '../../../assets/guardian.svg';
import type { DomainAdminAccount } from '../../../services/use-domain-admin-accounts';
import styles from './delegates.module.css';

type DelegateRow = {
  id: string;
  columns: Array<ReactElement>;
  item: Record<string, unknown>;
  clickable: boolean;
};

function buildDelegateRows(
  accounts: Array<DomainAdminAccount>,
  onOpenAccount: (account: DomainAdminAccount) => void,
): Array<DelegateRow> {
  return accounts.map((account) => ({
    id: account.id,
    columns: [
      <ds-text
        as="span"
        key={account.id}
        weight="light"
        onClick={(): void => onOpenAccount(account)}
      >
        {account.name || ' '}
      </ds-text>,
    ],
    item: account.item,
    clickable: true,
  }));
}

function buildHeaders(t: TFunction): Array<{ id: string; label: string; width: string; bold: boolean }> {
  return [
    {
      id: 'account',
      label: t('label.account', 'Account'),
      width: '100%',
      bold: true,
    },
  ];
}

type AdminAccountsTableProps = {
  accounts: Array<DomainAdminAccount>;
  isFetching: boolean;
  onOpenAccount: (account: DomainAdminAccount) => void;
  tableRef: RefObject<HTMLTableElement | null>;
};

export const AdminAccountsTable = ({
  accounts,
  isFetching,
  onOpenAccount,
  tableRef,
}: AdminAccountsTableProps) => {
  const [t] = useTranslation();
  const rows = buildDelegateRows(accounts, onOpenAccount);

  return (
    <>
      <Table
        rows={rows}
        headers={buildHeaders(t)}
        showCheckbox={false}
        multiSelect={false}
        ref={tableRef}
        style={{
          overflow: 'auto',
          height: isFetching || accounts.length === 0 ? '50%' : '100%',
        }}
        RowFactory={HoverableRowFactory}
        HeaderFactory={CustomHeaderFactory}
      />
      {isFetching && (
        <div className={styles.spinnerRow}>
          <ds-spinner></ds-spinner>
        </div>
      )}
      {accounts.length === 0 && !isFetching && (
        <div className={styles.emptyState}>
          <div className={styles.emptyImageRow}>
            <img src={logo} alt="logo" />
          </div>
          <div className={styles.emptyTitleRow}>
            <ds-text as="p" weight="light" color="#828282" size="large" overflow="break-word">
              {t('label.this_list_is_empty', 'This list is empty.')}
            </ds-text>
          </div>
          <div className={styles.emptyHelpRow}>
            <ds-text as="p" weight="light" color="#828282" size="large" overflow="break-word">
              <Trans
                i18nKey="label.create_account_list_msg"
                defaults="You can create a new Account by clicking on <bold>Create</bold> button (upper left corner) or on the Add (<bold>+</bold>) button up here"
                components={{ bold: <strong /> }}
              />
            </ds-text>
          </div>
        </div>
      )}
    </>
  );
};

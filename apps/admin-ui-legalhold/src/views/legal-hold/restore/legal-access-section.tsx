/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Button,
  Container,
  CustomHeaderFactory,
  DropDownInput,
  HoverableRowFactory,
  Padding,
  Table,
  type THeader,
  type TRow,
} from '@zextras/ui-components';
import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import type { DirectoryAccount, ZimbraAttribute } from '../../../../types';

type AccountNameCellProps = {
  value: string;
};

const AccountNameCell = ({ value }: AccountNameCellProps) => (
  <ds-text as="span" size="small" color="gray0" weight="regular">
    {value}
  </ds-text>
);

function getDisplayName(item: DirectoryAccount): string {
  return item.a.find((rec: ZimbraAttribute) => rec.n === 'displayName')?._content ?? item.name;
}

export function buildLegalAccessRows(accountList: Array<DirectoryAccount>): Array<TRow> {
  return accountList.map((item) => ({
    id: item.id,
    clickable: true,
    columns: [
      <AccountNameCell key={`${item.id}-name`} value={getDisplayName(item)} />,
      <AccountNameCell key={`${item.id}-email`} value={item.name ?? ''} />,
    ],
  }));
}

type LegalAccessSectionProps = {
  searchAccount: string;
  searchAccountResult: Array<DirectoryAccount>;
  accountList: Array<DirectoryAccount>;
  selectedRow: Array<string>;
  onSearchChange: (value: string) => void;
  onSelectSearchResult: (name: string) => void;
  onAdd: () => void;
  onRemove: () => void;
  onSelectionChange: (ids: Array<string>) => void;
};

export const LegalAccessSection = ({
  searchAccount,
  searchAccountResult,
  accountList,
  selectedRow,
  onSearchChange,
  onSelectSearchResult,
  onAdd,
  onRemove,
  onSelectionChange,
}: LegalAccessSectionProps) => {
  const [t] = useTranslation();

  const header: Array<THeader> = [
    {
      id: 'name',
      label: t('label.name', 'Name'),
      width: '40%',
      bold: true,
    },
    {
      id: 'email',
      label: t('label.email', 'Email'),
      width: '60%',
      bold: true,
    },
  ];

  const items = searchAccountResult.map((item) => ({
    id: item.id,
    label: getDisplayName(item),
    customComponent: [
      <ds-text
        as="span"
        size="small"
        key={item.id}
        color="gray0"
        weight="regular"
        onClick={(): void => {
          onSelectSearchResult(item.name);
        }}
      >
        {item.name || ' '}
      </ds-text>,
    ],
  }));

  const tableRows = buildLegalAccessRows(accountList);

  return (
    <>
      <Container
        crossAlignment="flex-start"
        mainAlignment="flex-start"
        height="auto"
        padding={{ top: 'medium', bottom: 'large' }}
      >
        <ds-text as="span" size="small" overflow="ellipsis" weight="bold">
          {t('legal_hold.legal_access', 'Legal Access')}
        </ds-text>
      </Container>
      <Container crossAlignment="flex-start" height="auto">
        <Container
          crossAlignment="flex-start"
          padding={{ right: 'medium' }}
          orientation="horizontal"
          mainAlignment="space-between"
          height="auto"
        >
          <Container width="70%" padding={{ right: 'medium' }} height="auto">
            <DropDownInput
              width="100%"
              items={items}
              inputLabel={t('label.search_an_account', 'Search an Account')}
              size="medium"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                onSearchChange(e.target.value);
              }}
              inputValue={searchAccount}
              isCustomIcon={false}
            />
          </Container>
          <Container width="auto" crossAlignment="flex-end" height="auto">
            <Button
              type="outlined"
              size="large"
              label={t('label.add', 'Add')}
              color="primary"
              onClick={onAdd}
            />
          </Container>
          <Container width="auto" crossAlignment="flex-end" mainAlignment="flex-end" height="auto">
            <Button
              type="ghost"
              size="large"
              label={t('label.remove', 'Remove')}
              color="error"
              onClick={onRemove}
              disabled={accountList.length === 0}
            />
          </Container>
        </Container>
      </Container>
      <Container mainAlignment="flex-start" padding={{ top: 'medium', bottom: 'large' }} height="auto">
        <Table
          rows={tableRows}
          headers={header}
          showCheckbox={false}
          multiSelect={false}
          selectedRows={selectedRow as [] | [string]}
          onSelectionChange={onSelectionChange}
          RowFactory={HoverableRowFactory}
          HeaderFactory={CustomHeaderFactory}
        />
      </Container>
      {accountList.length === 0 && (
        <Container crossAlignment="center" mainAlignment="flex-start" padding={{ all: '3rem' }}>
          <Padding all="medium">
            <ds-text
              as="p"
              color="gray1"
              overflow="break-word"
              weight="regular"
              size="large"
              style={{ whiteSpace: 'pre-line', textAlign: 'center' }}
            >
              {t('label.this_list_is_empty', 'This list is empty.')}
            </ds-text>
          </Padding>
        </Container>
      )}
    </>
  );
};

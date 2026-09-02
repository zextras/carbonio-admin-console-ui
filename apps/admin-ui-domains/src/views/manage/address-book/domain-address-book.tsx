/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Container, Input, ModalOverlay, Row } from '@zextras/ui-components';
import { type ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { AddressBookEntry } from '../../../../types';
import { useSelectedDomain } from '../../../hooks/use-selected-domain';
import { useAddressBookList } from '../../../services/use-domain-address-book';
import { AddAddressBookPanel } from './add-address-book-panel';
import { AddressBookDetailPanel } from './address-book-detail-panel';

function getAccountAvatarLabel(account: string): string {
  return account.slice(0, 2).toUpperCase();
}

function entryMatchesSearch(entry: AddressBookEntry, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }
  if (entry.account.toLowerCase().includes(q)) {
    return true;
  }
  return (entry.folders ?? []).some((folder) => {
    const name = String(folder.name ?? '').toLowerCase();
    const id = String(folder.id ?? '').toLowerCase();
    return name.includes(q) || id.includes(q);
  });
}

function refreshSelectedEntry(
  current: AddressBookEntry | null,
  books: Array<AddressBookEntry>,
): AddressBookEntry | null {
  if (!current) {
    return null;
  }
  const refreshed = books.find(
    (book) => book.accountId === current.accountId || book.account === current.account,
  );
  if (!refreshed) {
    if ((current.folders?.length ?? 0) === 0 && current.folderIds === undefined) {
      return current;
    }
    return { ...current, folders: [], folderIds: undefined };
  }
  return refreshed;
}

type AddressBookAccountRowProps = {
  entry: AddressBookEntry;
  showTopBorder: boolean;
  onSelect: (entry: AddressBookEntry) => void;
};

const AddressBookAccountRow = ({
  entry,
  showTopBorder,
  onSelect,
}: Readonly<AddressBookAccountRowProps>) => (
  <Container
    orientation="horizontal"
    width="100%"
    height="fit"
    mainAlignment="flex-start"
    crossAlignment="center"
    padding={{ all: 'large' }}
    gap="0.875rem"
    background="gray6"
    borderColor={showTopBorder ? { top: 'gray3' } : undefined}
    style={{ cursor: 'pointer' }}
    onClick={(): void => onSelect(entry)}
  >
    <Container
      width="2.125rem"
      height="2.125rem"
      minWidth="2.125rem"
      mainAlignment="center"
      crossAlignment="center"
      background="highlight"
      style={{
        borderRadius: '50%',
        flexShrink: 0,
      }}
    >
      <ds-text as="span" size="small" weight="bold" color="primary">
        {getAccountAvatarLabel(entry.account)}
      </ds-text>
    </Container>
    <Container
      width="fill"
      height="fit"
      mainAlignment="flex-start"
      crossAlignment="flex-start"
      minWidth="0"
      flexGrow={1}
    >
      <ds-text as="span" size="small" weight="medium" overflow="ellipsis">
        {entry.account}
      </ds-text>
    </Container>
    <ds-icon icon="ChevronRight" size="large" color="secondary"></ds-icon>
  </Container>
);

export const DomainAddressBook = () => {
  const [t] = useTranslation();
  const { data: domain } = useSelectedDomain();
  const domainName = domain?.name ?? '';
  const { data: entries = [], isFetching } = useAddressBookList(domainName);

  const [searchString, setSearchString] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<AddressBookEntry | null>(null);
  const activeEntry = refreshSelectedEntry(selectedEntry, entries);

  const filteredEntries = entries.filter((entry) => entryMatchesSearch(entry, searchString));
  const searchQuery = searchString.trim();

  function openDetail(entry: AddressBookEntry): void {
    setIsAddOpen(false);
    setSelectedEntry(entry);
  }

  return (
    <Container mainAlignment="flex-start" background="gray6">
      <Row mainAlignment="flex-start" width="100%">
        <Container orientation="vertical" mainAlignment="space-around" height="56px">
          <Row orientation="horizontal" width="100%">
            <Row
              padding={{ all: 'large' }}
              mainAlignment="flex-start"
              width="50%"
              crossAlignment="flex-start"
            >
              <ds-text as="h1" size="medium" weight="bold" color="gray0">
                {t('label.ldap_addressbook', 'LDAP Address Book')}
              </ds-text>
            </Row>
            <Row
              padding={{ all: 'large' }}
              width="50%"
              mainAlignment="flex-end"
              crossAlignment="flex-end"
            >
              <Button
                label={t('label.add', 'Add')}
                color="primary"
                icon="Plus"
                onClick={(): void => {
                  setSelectedEntry(null);
                  setIsAddOpen(true);
                }}
              />
            </Row>
          </Row>
        </Container>
        <ds-divider></ds-divider>
      </Row>

      <Container
        orientation="column"
        crossAlignment="flex-start"
        mainAlignment="flex-start"
        style={{ overflow: 'auto' }}
        width="100%"
        height="calc(100vh - 9.375rem)"
        padding={{ all: 'large' }}
        gap="1rem"
      >
        <ds-text as="p" size="small" color="gray1" overflow="break-word">
          {t(
            'label.domain_address_book_description',
            'Accounts whose address books are exposed through the LDAP Address Book service for {{domain}}.',
            { domain: domainName },
          )}
        </ds-text>

        <Input
          label={t('label.search_accounts', 'Search accounts')}
          value={searchString}
          backgroundColor="gray5"
          onChange={(e: ChangeEvent<HTMLInputElement>): void => {
            setSearchString(e.target.value);
          }}
        />

        {isFetching && entries.length === 0 ? (
          <Container padding={{ all: 'extralarge' }} height="fit">
            <ds-spinner />
          </Container>
        ) : (
          <Container
            width="100%"
            height="fit"
            mainAlignment="flex-start"
            crossAlignment="stretch"
            borderColor="gray2"
            borderRadius="half"
            background="gray6"
            style={{ overflow: 'hidden' }}
          >
            {filteredEntries.length === 0 ? (
              <Container padding={{ all: 'extralarge' }} height="fit">
                <ds-text as="span" size="small" color="gray1">
                  {searchQuery
                    ? t(
                        'label.no_accounts_or_address_books_match',
                        'No accounts or address books match “{{query}}”.',
                        { query: searchQuery },
                      )
                    : t('label.this_list_is_empty', 'This list is empty.')}
                </ds-text>
              </Container>
            ) : (
              filteredEntries.map((entry, index) => (
                <AddressBookAccountRow
                  key={entry.accountId || entry.account}
                  entry={entry}
                  showTopBorder={index > 0}
                  onSelect={openDetail}
                />
              ))
            )}
          </Container>
        )}
      </Container>

      {isAddOpen && (
        <ModalOverlay open={isAddOpen} maxWidth="58.75rem">
          <AddAddressBookPanel
            domainName={domainName}
            existingEntries={entries}
            onClose={(): void => setIsAddOpen(false)}
          />
        </ModalOverlay>
      )}

      {activeEntry && (
        <ModalOverlay open={Boolean(activeEntry)} maxWidth="58.75rem">
          <AddressBookDetailPanel
            domainName={domainName}
            entry={activeEntry}
            onClose={(): void => setSelectedEntry(null)}
          />
        </ModalOverlay>
      )}
    </Container>
  );
};

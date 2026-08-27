/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import {
  Button,
  Container,
  DropDownInput,
  Padding,
  Radio,
  RadioGroup,
  Row,
  Select,
} from '@zextras/ui-components';
import { debounce } from 'lodash-es';
import { type ChangeEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { AddressBookEntry } from '../../../../types';
import {
  useAddAddressBook,
  useAddressBookAccountSearch,
  useMailboxContactFolders,
} from '../../../services/use-domain-address-book';
import { isValidEmail } from '../../utility/utils';
import { entryHasAllShared, getFolderSelectLabel, getLinkedFolderIds } from './address-book-folder-utils';
import {
  EXPOSE_ADDRESS_BOOK_DEFAULT_VALUES,
  type FolderMode,
} from './expose-address-book-schema';
import { useExposeAddressBookForm } from './use-expose-address-book-form';

type AddAddressBookPanelProps = {
  domainName: string;
  existingEntries: Array<AddressBookEntry>;
  onClose: () => void;
};

type FolderSelectItem = {
  label: string;
  value: string;
};

type TranslateFn = (key: string, defaultValue: string) => string;

function getAccountError(account: string, t: TranslateFn): string | null {
  const trimmed = account.trim();
  if (trimmed === '') {
    return t('label.account_is_required', 'Account is required');
  }
  if (isValidEmail(account)) {
    return null;
  }
  return t('label.enter_a_valid_email_address', 'Enter a valid email address');
}

export const AddAddressBookPanel = ({
  domainName,
  existingEntries,
  onClose,
}: Readonly<AddAddressBookPanelProps>) => {
  const [t] = useTranslation();
  const addAddressBookMutation = useAddAddressBook();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [accountTouched, setAccountTouched] = useState(false);
  const [folderTouched, setFolderTouched] = useState(false);

  const form = useExposeAddressBookForm(false, EXPOSE_ADDRESS_BOOK_DEFAULT_VALUES);
  const account = useSelector(form.store, (state) => state.values.account);
  const selectedAccount = useSelector(form.store, (state) => state.values.selectedAccount);
  const folderMode = useSelector(form.store, (state) => state.values.folderMode);
  const folderId = useSelector(form.store, (state) => state.values.folderId);

  const existingEntry = existingEntries.find(
    (entry) => entry.account === selectedAccount || entry.account === account.trim(),
  );
  const linkedFolderIds = getLinkedFolderIds(existingEntry);
  const hasAllShared = entryHasAllShared(existingEntry);
  const hasValidSelectedAccount = selectedAccount !== '' && isValidEmail(selectedAccount);
  const accountError = getAccountError(account, t);
  const folderError =
    folderMode === 'specific' && folderId === ''
      ? t('label.select_an_address_book', 'Select an address book')
      : null;
  const allAlreadySharedError =
    hasValidSelectedAccount && folderMode === 'all' && hasAllShared
      ? t(
          'label.all_address_books_already_exposed',
          'All address books of this account are already exposed.',
        )
      : null;
  const mailboxQuery = useMailboxContactFolders(selectedAccount, hasValidSelectedAccount);
  const isLoadingFolders = mailboxQuery.isFetching;
  const sharedLabel = t('label.shared', 'Shared');
  const folderItems: Array<FolderSelectItem> = (mailboxQuery.data ?? [])
    .filter((folder) => !linkedFolderIds.includes(String(folder.id)))
    .map((folder) => ({
      label: getFolderSelectLabel(folder.name, folder.isShared === true, sharedLabel),
      value: String(folder.id),
    }));
  const selectedFolder = folderItems.find((item) => item.value === folderId);
  const canSubmit =
    !accountError &&
    !folderError &&
    !allAlreadySharedError &&
    hasValidSelectedAccount &&
    !isLoadingFolders;
  const searchQuery = useAddressBookAccountSearch(
    domainName,
    account !== '' && account !== selectedAccount ? searchKeyword : '',
  );

  const searchAccountCallRef = useRef(
    debounce((searchValue: string) => {
      setSearchKeyword(searchValue);
    }, 700),
  );

  useEffect(() => {
    const searchAccountCall = searchAccountCallRef.current;
    return () => {
      searchAccountCall.cancel();
    };
  }, []);

  useEffect(() => {
    if (account !== '' && account !== selectedAccount) {
      searchAccountCallRef.current(account);
    } else {
      searchAccountCallRef.current.cancel();
    }
  }, [account, selectedAccount]);

  function selectAccount(accountName: string): void {
    form.setFieldValue('account', accountName);
    form.setFieldValue('selectedAccount', accountName);
    form.setFieldValue('folderMode', 'all');
    form.setFieldValue('folderId', '');
    setAccountTouched(true);
    setFolderTouched(false);
    setSearchKeyword('');
  }

  function onAccountInputChange(value: string): void {
    form.setFieldValue('account', value);
    setAccountTouched(true);
    if (value.trim() !== selectedAccount) {
      form.setFieldValue('selectedAccount', '');
      form.setFieldValue('folderId', '');
      form.setFieldValue('folderMode', 'all');
    }
    if (value === '') {
      setSearchKeyword('');
    }
  }

  function onSubmit(): void {
    setAccountTouched(true);
    setFolderTouched(true);
    if (!canSubmit || allAlreadySharedError) {
      return;
    }
    addAddressBookMutation.mutate(
      {
        domain: domainName,
        account: selectedAccount,
        folder: folderMode === 'all' ? 'all' : folderId,
      },
      { onSuccess: onClose },
    );
  }

  function renderSpecificFolderSection(): ReactNode {
    if (hasValidSelectedAccount && isLoadingFolders) {
      return (
        <Padding all="small">
          <ds-spinner />
        </Padding>
      );
    }

    if (hasValidSelectedAccount) {
      return (
        <>
          <Select
            key={selectedFolder?.value ?? 'folder-unselected'}
            items={folderItems}
            background="gray5"
            label={t('label.select_an_address_book_ellipsis', 'Select an address book…')}
            showCheckbox={false}
            defaultSelection={selectedFolder}
            onChange={(value: string | null): void => {
              setFolderTouched(true);
              form.setFieldValue('folderId', value ?? '');
            }}
          />
          {folderTouched && folderError && (
            <ds-text as="span" size="small" color="error">
              {folderError}
            </ds-text>
          )}
        </>
      );
    }

    return (
      <ds-text as="span" size="small" color="error">
        {t('label.select_a_valid_account_first', 'Select a valid account first')}
      </ds-text>
    );
  }

  const dropdownItems = (searchQuery.data ?? []).map((item) => ({
    id: item.id,
    label: item.name,
    customComponent: (
      <Row
        style={{
          display: 'block',
          textAlign: 'left',
          height: 'inherit',
          padding: '3px',
          width: 'inherit',
        }}
        onClick={(): void => {
          selectAccount(item.name);
        }}
      >
        {item.name}
      </Row>
    ),
  }));

  return (
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
      <Row mainAlignment="space-between" width="100%" padding={{ all: 'large' }}>
        <ds-text as="h2" size="medium" weight="bold" color="gray0">
          {t('label.expose_a_new_address_book', 'Expose a new address book')}
        </ds-text>
        <Button
          type="ghost"
          color="secondary"
          icon="CloseOutline"
          aria-label={t('label.close', 'Close')}
          onClick={onClose}
        />
      </Row>
      <Row width="100%">
        <ds-divider color="gray3"></ds-divider>
      </Row>

      <Container
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        background="white"
        height="calc(100vh - 8rem)"
        style={{ overflow: 'auto' }}
        padding={{ all: 'large' }}
        gap="1rem"
      >
        <ds-text as="span" size="small" weight="bold">
          {t('label.account', 'Account')}
        </ds-text>
        <Container height="fit" width="100%" crossAlignment="flex-start" gap="0.35rem">
          <DropDownInput
            width="100%"
            items={dropdownItems}
            inputLabel={t('label.start_typing_an_account_email', 'Start typing an account e-mail')}
            size="medium"
            onChange={(e: ChangeEvent<HTMLInputElement>): void => {
              onAccountInputChange(e.target.value);
            }}
            inputValue={account}
            isCustomIcon={false}
            hasError={
              (accountTouched && Boolean(accountError)) ||
              (folderMode === 'specific' && !hasValidSelectedAccount)
            }
          />
          {accountTouched && accountError && (
            <ds-text as="span" size="small" color="error">
              {accountError}
            </ds-text>
          )}
        </Container>

        <ds-text as="span" size="small" weight="bold">
          {t('label.address_books_to_expose', 'Address books to expose')}
        </ds-text>
        <RadioGroup
          value={folderMode}
          onChange={(value: string | undefined): void => {
            if (value === 'all' || value === 'specific') {
              form.setFieldValue('folderMode', value satisfies FolderMode);
            }
          }}
        >
          <Radio
            value="all"
            label={t('label.all_address_books', 'All address books')}
            iconColor="primary"
          />
          <Radio
            value="specific"
            label={t('label.a_specific_address_book', 'A specific address book')}
            iconColor="primary"
          />
        </RadioGroup>

        {allAlreadySharedError && (
          <ds-text as="span" size="small" color="error">
            {allAlreadySharedError}
          </ds-text>
        )}

        {folderMode === 'specific' && (
          <Container height="fit" width="100%" crossAlignment="flex-start" gap="0.75rem">
            {renderSpecificFolderSection()}
          </Container>
        )}

        <ds-text as="p" size="small" color="gray1" overflow="break-word">
          {t(
            'label.selected_address_books_ldap_helper',
            'The selected address books become searchable through the LDAP Address Book service.',
          )}
        </ds-text>
      </Container>

      <Row width="100%">
        <ds-divider color="gray3"></ds-divider>
      </Row>
      <Row
        mainAlignment="flex-end"
        width="100%"
        padding={{ all: 'large' }}
        style={{ gap: '1rem' }}
      >
        <Button
          label={t('label.cancel', 'Cancel')}
          color="secondary"
          type="outlined"
          onClick={onClose}
          disabled={addAddressBookMutation.isPending}
        />
        <Button
          label={t('label.add', 'Add')}
          color="primary"
          onClick={onSubmit}
          loading={addAddressBookMutation.isPending}
          disabled={addAddressBookMutation.isPending || !canSubmit}
        />
      </Row>
    </Container>
  );
};

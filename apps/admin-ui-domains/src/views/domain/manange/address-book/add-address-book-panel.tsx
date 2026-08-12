/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Button,
  Container,
  DropDownInput,
  Padding,
  Radio,
  RadioGroup,
  Row,
  Select,
  useSnackbar,
} from '@zextras/ui-components';
import { searchDirectory } from '@zextras/ui-shared';
import { debounce } from 'lodash-es';
import { type ChangeEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { AddressBookEntry, AddressBookFolder } from '../../../../../types';
import { RECORD_DISPLAY_LIMIT } from '../../../../constants';
import { addAddressBook } from '../../../../services/add-address-book';
import { getMailboxContactFolders } from '../../../../services/get-mailbox-contact-folders';
import { generateSnackbarFromError } from '../../../error/generate-snackbar-error';
import { isValidEmail } from '../../../utility/utils';

type AddAddressBookPanelProps = {
  domainName: string;
  existingEntries: Array<AddressBookEntry>;
  onClose: () => void;
  onAdded: () => void;
};

type FolderSelectItem = {
  label: string;
  value: string;
};

type FolderMode = 'all' | 'specific';

type TranslateFn = (key: string, defaultValue: string) => string;

function getLinkedFolderIds(entry: AddressBookEntry | undefined): Array<string> {
  if (!entry) {
    return [];
  }
  return (entry.folders ?? []).map((folder) => String(folder.id));
}

function getFolderSelectLabel(name: string, isShared: boolean, sharedLabel: string): string {
  if (isShared) {
    return `${name} (${sharedLabel})`;
  }
  return name;
}

function getAccountError(account: string, t: TranslateFn): string | null {
  const trimmed = account.trim();
  if (trimmed === '') {
    return t('label.account_is_required', 'Account is required');
  }
  if (isValidEmail(trimmed)) {
    return null;
  }
  return t('label.enter_a_valid_email_address', 'Enter a valid email address');
}

export function AddAddressBookPanel({
  domainName,
  existingEntries,
  onClose,
  onAdded,
}: Readonly<AddAddressBookPanelProps>) {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();

  const [account, setAccount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string }>>([]);
  const [folderMode, setFolderMode] = useState<FolderMode>('all');
  const [folderItems, setFolderItems] = useState<Array<FolderSelectItem>>([]);
  const [selectedFolder, setSelectedFolder] = useState<FolderSelectItem | undefined>(undefined);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountTouched, setAccountTouched] = useState(false);
  const [folderTouched, setFolderTouched] = useState(false);

  const existingEntry = existingEntries.find(
    (entry) => entry.account === selectedAccount || entry.account === account.trim(),
  );
  const linkedFolderIds = getLinkedFolderIds(existingEntry);
  const hasAllShared = linkedFolderIds.includes('all');

  const accountError = getAccountError(account, t);
  const folderError =
    folderMode === 'specific' && !selectedFolder?.value
      ? t('label.select_an_address_book', 'Select an address book')
      : null;
  const hasValidSelectedAccount = selectedAccount !== '' && isValidEmail(selectedAccount);
  const allAlreadySharedError =
    hasValidSelectedAccount && folderMode === 'all' && hasAllShared
      ? t(
          'label.all_address_books_already_exposed',
          'All address books of this account are already exposed.',
        )
      : null;
  const canSubmit =
    !accountError &&
    !folderError &&
    !allAlreadySharedError &&
    hasValidSelectedAccount &&
    !isLoadingFolders;
  const sharedLabel = t('label.shared', 'Shared');

  function getSearchAccountList(searchKeyword: string): void {
    const attrs =
      'displayName,zimbraId,zimbraAliasTargetId,cn,sn,zimbraMailHost,uid,zimbraCOSId,zimbraAccountStatus,zimbraLastLogonTimestamp,description,zimbraIsSystemAccount,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraAuthTokenValidityValue,zimbraIsExternalVirtualAccount,zimbraMailStatus,zimbraIsAdminGroup,zimbraCalResType,zimbraDomainType,zimbraDomainName,zimbraDomainStatus';
    const types = 'accounts';
    const query = `(&(!(zimbraAccountStatus=closed))(|(mail=*${searchKeyword}*)(cn=*${searchKeyword}*)(sn=*${searchKeyword}*)(gn=*${searchKeyword}*)(displayName=*${searchKeyword}*)(zimbraMailDeliveryAddress=*${searchKeyword}*)(zimbraMailAlias=*${searchKeyword}*)(uid=*${searchKeyword}*)))`;

    searchDirectory({
      attr: attrs,
      type: types,
      domainName,
      query,
      offset: 0,
      limit: RECORD_DISPLAY_LIMIT,
      sortBy: 'name',
    })
      .then((data) => {
        const accounts = data?.account ?? [];
        setSearchResults(
          (Array.isArray(accounts) ? accounts : [accounts]).map(
            (item: { id: string; name: string }) => ({
              id: item.id,
              name: item.name,
            }),
          ),
        );
      })
      .catch((error: Error) => {
        const snackbarConfig = generateSnackbarFromError(error, t);
        createSnackbar(snackbarConfig);
      });
  }

  const getSearchAccountListRef = useRef(getSearchAccountList);
  getSearchAccountListRef.current = getSearchAccountList;

  const searchAccountCallRef = useRef(
    debounce((searchKeyword: string) => {
      getSearchAccountListRef.current(searchKeyword);
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
    } else if (account === '') {
      searchAccountCallRef.current.cancel();
      setSearchResults([]);
    }
  }, [account, selectedAccount]);

  useEffect(() => {
    if (!hasValidSelectedAccount) {
      setFolderItems([]);
      setSelectedFolder(undefined);
      setIsLoadingFolders(false);
      return;
    }

    let cancelled = false;
    setIsLoadingFolders(true);
    setFolderItems([]);
    setSelectedFolder(undefined);

    getMailboxContactFolders({ account: selectedAccount })
      .then((folders: Array<AddressBookFolder>) => {
        if (cancelled) {
          return;
        }
        const linkedIds = new Set(
          getLinkedFolderIds(
            existingEntries.find(
              (entry) =>
                entry.account === selectedAccount || entry.accountId === selectedAccount,
            ),
          ),
        );
        const items = folders
          .filter((folder) => !linkedIds.has(String(folder.id)))
          .map((folder) => ({
            label: getFolderSelectLabel(folder.name, folder.isShared === true, sharedLabel),
            value: String(folder.id),
          }));
        setFolderItems(items);
      })
      .catch((error: Error) => {
        if (cancelled) {
          return;
        }
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: error?.message
            ? error.message
            : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingFolders(false);
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch folders when selected account changes
  }, [hasValidSelectedAccount, selectedAccount, existingEntries]);

  function selectAccount(accountName: string): void {
    setAccount(accountName);
    setSelectedAccount(accountName);
    setAccountTouched(true);
    setFolderMode('all');
    setFolderTouched(false);
    setSearchResults([]);
  }

  function onAccountInputChange(value: string): void {
    setAccount(value);
    setAccountTouched(true);
    if (value.trim() !== selectedAccount) {
      setSelectedAccount('');
      setFolderItems([]);
      setSelectedFolder(undefined);
      setFolderMode('all');
    }
  }

  function onSubmit(): void {
    setAccountTouched(true);
    setFolderTouched(true);
    if (!canSubmit || allAlreadySharedError) {
      return;
    }

    const folder = folderMode === 'all' ? 'all' : String(selectedFolder?.value);
    setIsSubmitting(true);
    addAddressBook({
      domain: domainName,
      account: selectedAccount,
      folder,
    })
      .then(() => {
        createSnackbar({
          key: 'success',
          severity: 'success',
          label: t('label.address_book_exposed', 'Address book exposed'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
        onAdded();
        onClose();
      })
      .catch((error: Error) => {
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: error?.message
            ? error.message
            : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
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
              const next = folderItems.find((item) => item.value === value);
              setSelectedFolder(next);
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

  const dropdownItems = searchResults.map((item) => ({
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
        <Button type="ghost" color="secondary" icon="CloseOutline" onClick={onClose} />
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
            inputLabel={t(
              'label.start_typing_an_account_email',
              'Start typing an account e-mail',
            )}
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
              setFolderMode(value);
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
          disabled={isSubmitting}
        />
        <Button
          label={t('label.add', 'Add')}
          color="primary"
          onClick={onSubmit}
          loading={isSubmitting}
          disabled={isSubmitting || !canSubmit}
        />
      </Row>
    </Container>
  );
}

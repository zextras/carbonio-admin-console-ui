/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Button,
  Container,
  Modal,
  Padding,
  Radio,
  RadioGroup,
  Row,
  Select,
  Tooltip,
  useSnackbar,
} from '@zextras/ui-components';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import type { AddressBookEntry, AddressBookFolder } from '../../../../../types';
import { addAddressBook } from '../../../../services/add-address-book';
import { getExposedAddressBookFolders } from '../../../../services/get-exposed-address-book-folders';
import { getMailboxContactFolders } from '../../../../services/get-mailbox-contact-folders';
import { removeAddressBook } from '../../../../services/remove-address-book';

type AddressBookDetailPanelProps = {
  domainName: string;
  entry: AddressBookEntry;
  onClose: () => void;
  onChanged: () => void;
};

type FolderSelectItem = {
  label: string;
  value: string;
};

type FolderMode = 'all' | 'specific';

function getFolderDisplayName(name: string): string {
  if (name === 'all') {
    return 'All folders';
  }
  if (!name.includes('/')) {
    return name;
  }
  const segments = name.split('/').filter(Boolean);
  return segments.at(-1) ?? name;
}

function getFolderSelectLabel(name: string, isShared: boolean, sharedLabel: string): string {
  if (isShared) {
    return `${name} (${sharedLabel})`;
  }
  return name;
}

export function AddressBookDetailPanel({
  domainName,
  entry,
  onClose,
  onChanged,
}: Readonly<AddressBookDetailPanelProps>) {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();

  const [folders, setFolders] = useState<Array<AddressBookFolder>>(entry.folders ?? []);
  const [mailboxFolders, setMailboxFolders] = useState<Array<AddressBookFolder>>([]);
  const [isResolvingFolders, setIsResolvingFolders] = useState(false);
  const [folderToRemove, setFolderToRemove] = useState<AddressBookFolder | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const [isAdding, setIsAdding] = useState(false);
  const [addMode, setAddMode] = useState<FolderMode>('all');
  const [selectedFolder, setSelectedFolder] = useState<FolderSelectItem | undefined>(undefined);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);

  const hasAllShared = folders.some((folder) => String(folder.id) === 'all');
  const linkedIds = new Set(folders.map((folder) => String(folder.id)));
  const sharedLabel = t('label.exposed', 'exposed');
  const availableFolderItems: Array<FolderSelectItem> = hasAllShared
    ? []
    : mailboxFolders
        .filter((folder) => !linkedIds.has(String(folder.id)))
        .map((folder) => ({
          label: getFolderSelectLabel(folder.name, folder.isShared === true, sharedLabel),
          value: String(folder.id),
        }));
  const canOpenInlineAdd = !hasAllShared && availableFolderItems.length > 0;
  const canSubmitAdd =
    addMode === 'all' ? !hasAllShared : Boolean(selectedFolder?.value) && !isSubmittingAdd;

  function loadExposedFolders(): Promise<void> {
    return getExposedAddressBookFolders({
      domain: domainName,
      account: entry.account,
    }).then((exposed) => {
      setFolders(exposed);
    });
  }

  useEffect(() => {
    setFolderToRemove(null);
    setIsRemoving(false);
    setIsAdding(false);
    setAddMode('all');
    setSelectedFolder(undefined);
    setFolders(entry.folders ?? []);

    let cancelled = false;
    setIsResolvingFolders(true);

    Promise.allSettled([
      getExposedAddressBookFolders({
        domain: domainName,
        account: entry.account,
      }),
      getMailboxContactFolders({ account: entry.account }),
    ]).then(([exposedResult, mailboxResult]) => {
      if (cancelled) {
        return;
      }

      if (exposedResult.status === 'fulfilled') {
        setFolders(exposedResult.value);
      } else {
        setFolders(entry.folders ?? []);
      }

      if (mailboxResult.status === 'fulfilled') {
        setMailboxFolders(mailboxResult.value);
      } else {
        setMailboxFolders([]);
      }

      setIsResolvingFolders(false);
    });

    return (): void => {
      cancelled = true;
    };
  }, [domainName, entry.accountId, entry.account, entry.folders]);

  function confirmRemoveFolder(): void {
    if (!folderToRemove) {
      return;
    }

    setIsRemoving(true);
    removeAddressBook({
      domain: domainName,
      account: entry.account,
      folder: String(folderToRemove.id),
    })
      .then(async () => {
        createSnackbar({
          key: 'success',
          severity: 'success',
          label: t('label.folder_removed_successfully', 'Folder removed successfully'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
        setFolderToRemove(null);
        onChanged();
        try {
          await loadExposedFolders();
        } catch {
          // List refresh already requested; keep current folders on refetch failure.
        }
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
        setIsRemoving(false);
      });
  }

  function submitInlineAdd(): void {
    if (!canSubmitAdd) {
      return;
    }

    const folder = addMode === 'all' ? 'all' : String(selectedFolder?.value);
    setIsSubmittingAdd(true);
    addAddressBook({
      domain: domainName,
      account: entry.account,
      folder,
    })
      .then(async () => {
        createSnackbar({
          key: 'success',
          severity: 'success',
          label: t('label.address_book_exposed', 'Address book exposed'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
        setIsAdding(false);
        setAddMode('all');
        setSelectedFolder(undefined);
        onChanged();
        try {
          await loadExposedFolders();
        } catch {
          // List refresh already requested; keep current folders on refetch failure.
        }
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
        setIsSubmittingAdd(false);
      });
  }

  return (
    <>
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
          <ds-text as="h2" size="medium" weight="bold" color="gray0" overflow="ellipsis">
            {entry.account}
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
            {t('label.exposed_address_books', 'Exposed address books')}
          </ds-text>

          {isResolvingFolders ? (
            <Padding all="small">
              <ds-spinner />
            </Padding>
          ) : (
            <Container
              width="100%"
              height="fit"
              mainAlignment="flex-start"
              crossAlignment="stretch"
              borderColor="gray2"
              borderRadius="half"
              style={{ overflow: 'hidden' }}
            >
              {folders.length === 0 ? (
                <Container padding={{ all: 'large' }} height="fit">
                  <ds-text as="span" size="small" color="gray1">
                    {t(
                      'label.no_address_book_exposed_for_this_account',
                      'No address book is exposed for this account.',
                    )}
                  </ds-text>
                </Container>
              ) : (
                folders.map((folder, index) => (
                  <Container
                    key={String(folder.id)}
                    orientation="horizontal"
                    width="100%"
                    height="fit"
                    mainAlignment="flex-start"
                    crossAlignment="center"
                    padding={{ all: 'medium' }}
                    gap="0.625rem"
                    background="gray6"
                    borderColor={index > 0 ? { top: 'gray3' } : undefined}
                  >
                    <ds-icon icon="FolderOutline" size="large" color="secondary"></ds-icon>
                    <Container
                      width="fill"
                      height="fit"
                      mainAlignment="flex-start"
                      crossAlignment="flex-start"
                      minWidth="0"
                      flexGrow={1}
                    >
                      <ds-text as="span" size="small" overflow="ellipsis">
                        {String(folder.id) === 'all' ? (
                          <em>{t('label.all_folders', 'All folders')}</em>
                        ) : (
                          getFolderDisplayName(folder.name)
                        )}
                      </ds-text>
                    </Container>
                    <Tooltip label={t('label.remove_exposed_folder', 'Remove exposed folder')}>
                      <Button
                        type="ghost"
                        color="error"
                        size="medium"
                        icon="Trash2Outline"
                        aria-label={t('label.remove_exposed_folder', 'Remove exposed folder')}
                        onClick={(): void => {
                          setFolderToRemove(folder);
                        }}
                      />
                    </Tooltip>
                  </Container>
                ))
              )}
            </Container>
          )}

          {isAdding ? (
            <Container
              width="100%"
              height="fit"
              mainAlignment="flex-start"
              crossAlignment="flex-start"
              gap="0.75rem"
            >
              <ds-text as="span" size="small" weight="bold">
                {t('label.add_address_books', 'Add address books')}
              </ds-text>
              <RadioGroup
                value={addMode}
                onChange={(value: string | undefined): void => {
                  if (value === 'all' || value === 'specific') {
                    setAddMode(value);
                    if (value === 'all') {
                      setSelectedFolder(undefined);
                    }
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
              {addMode === 'specific' && (
                <Select
                  key={selectedFolder?.value ?? 'folder-unselected'}
                  items={availableFolderItems}
                  background="gray5"
                  label={t('label.select_an_address_book_ellipsis', 'Select an address book…')}
                  showCheckbox={false}
                  defaultSelection={selectedFolder}
                  onChange={(value: string | null): void => {
                    const next = availableFolderItems.find((item) => item.value === value);
                    setSelectedFolder(next);
                  }}
                />
              )}
              <Row width="100%" mainAlignment="flex-end" style={{ gap: '0.625rem' }}>
                <Button
                  label={t('label.cancel', 'Cancel')}
                  color="secondary"
                  type="outlined"
                  onClick={(): void => {
                    setIsAdding(false);
                    setAddMode('all');
                    setSelectedFolder(undefined);
                  }}
                  disabled={isSubmittingAdd}
                />
                <Button
                  label={t('label.add', 'Add')}
                  color="primary"
                  onClick={submitInlineAdd}
                  loading={isSubmittingAdd}
                  disabled={!canSubmitAdd || isSubmittingAdd}
                />
              </Row>
            </Container>
          ) : (
            <>
              <Button
                type="outlined"
                color="primary"
                label={t('label.add_address_book', 'Add address book')}
                icon="Plus"
                onClick={(): void => setIsAdding(true)}
                disabled={!canOpenInlineAdd || isResolvingFolders}
              />
              {(hasAllShared || availableFolderItems.length === 0) && !isResolvingFolders && (
                <ds-text as="p" size="small" color="gray1" overflow="break-word">
                  {hasAllShared
                    ? t(
                        'label.all_address_books_already_exposed',
                        'All address books of this account are already exposed.',
                      )
                    : t(
                        'label.every_address_book_already_exposed',
                        'Every address book of this account is already exposed.',
                      )}
                </ds-text>
              )}
            </>
          )}
        </Container>
      </Container>

      <Modal
        size="small"
        title={t('label.remove_exposed_folder', 'Remove exposed folder')}
        open={Boolean(folderToRemove)}
        showCloseIcon
        onClose={(): void => {
          if (!isRemoving) {
            setFolderToRemove(null);
          }
        }}
        customFooter={
          <Container orientation="horizontal" mainAlignment="flex-end">
            <Row style={{ gap: '1rem' }}>
              <Button
                label={t('label.cancel', 'Cancel')}
                color="gray0"
                type="outlined"
                onClick={(): void => setFolderToRemove(null)}
                disabled={isRemoving}
              />
              <Button
                label={t('label.remove', 'Remove')}
                color="error"
                onClick={confirmRemoveFolder}
                loading={isRemoving}
                disabled={isRemoving}
              />
            </Row>
          </Container>
        }
      >
        <Container padding={{ top: 'extralarge', bottom: 'extralarge' }} mainAlignment="flex-start">
          <ds-text as="p" size="large" overflow="break-word" style={{ whiteSpace: 'pre-line', textAlign: 'left'}}>
            <Trans
              i18nKey="label.remove_exposed_folder_confirm"
              defaults='Remove exposed folder "{{folder}}" from {{account}}?'
              values={{
                folder:
                  folderToRemove && String(folderToRemove.id) === 'all'
                    ? t('label.all_folders', 'All folders')
                    : getFolderDisplayName(folderToRemove?.name ?? ''),
                account: entry.account,
              }}
            />
          </ds-text>
        </Container>
      </Modal>
    </>
  );
}

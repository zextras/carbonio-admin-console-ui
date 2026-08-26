/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
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
} from '@zextras/ui-components';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import type { AddressBookEntry, AddressBookFolder } from '../../../../../types';
import {
  useAddAddressBook,
  useAddressBookPickerFolders,
  useRemoveAddressBook,
} from '../../../../services/use-domain-address-book';
import {
  foldersHaveAllShared,
  getFolderDisplayName,
  getFolderSelectLabel,
} from './address-book-folder-utils';
import { type FolderMode } from './expose-address-book-schema';
import { useExposeAddressBookForm } from './use-expose-address-book-form';

type AddressBookDetailPanelProps = {
  domainName: string;
  entry: AddressBookEntry;
  onClose: () => void;
};

type FolderSelectItem = {
  label: string;
  value: string;
};

type ExposedFolderRowProps = {
  folder: AddressBookFolder;
  showTopBorder: boolean;
  sharedLabel: string;
  onRemove: (folder: AddressBookFolder) => void;
};

const ExposedFolderRow = ({
  folder,
  showTopBorder,
  sharedLabel,
  onRemove,
}: Readonly<ExposedFolderRowProps>) => {
  const [t] = useTranslation();
  return (
    <Container
      orientation="horizontal"
      width="100%"
      height="fit"
      mainAlignment="flex-start"
      crossAlignment="center"
      padding={{ all: 'medium' }}
      gap="0.625rem"
      background="gray6"
      borderColor={showTopBorder ? { top: 'gray3' } : undefined}
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
            getFolderSelectLabel(
              getFolderDisplayName(folder.name),
              folder.isShared === true,
              sharedLabel,
            )
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
            onRemove(folder);
          }}
        />
      </Tooltip>
    </Container>
  );
};

type InlineExposeFormProps = {
  domainName: string;
  account: string;
  availableFolderItems: Array<FolderSelectItem>;
  hasAllShared: boolean;
  onCancel: () => void;
};

const InlineExposeForm = ({
  domainName,
  account,
  availableFolderItems,
  hasAllShared,
  onCancel,
}: Readonly<InlineExposeFormProps>) => {
  const [t] = useTranslation();
  const addAddressBookMutation = useAddAddressBook();
  const form = useExposeAddressBookForm(hasAllShared, {
    account,
    selectedAccount: account,
    folderMode: 'all',
    folderId: '',
  });
  const folderMode = useSelector(form.store, (state) => state.values.folderMode);
  const folderId = useSelector(form.store, (state) => state.values.folderId);
  const selectedFolder = availableFolderItems.find((item) => item.value === folderId);
  const canSubmitAdd =
    folderMode === 'all' ? !hasAllShared : Boolean(folderId) && !addAddressBookMutation.isPending;

  function submitInlineAdd(): void {
    if (!canSubmitAdd) {
      return;
    }
    addAddressBookMutation.mutate(
      {
        domain: domainName,
        account,
        folder: folderMode === 'all' ? 'all' : folderId,
      },
      { onSuccess: onCancel },
    );
  }

  return (
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
        value={folderMode}
        onChange={(value: string | undefined): void => {
          if (value === 'all' || value === 'specific') {
            form.setFieldValue('folderMode', value satisfies FolderMode);
            if (value === 'all') {
              form.setFieldValue('folderId', '');
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
      {folderMode === 'specific' && (
        <Select
          key={selectedFolder?.value ?? 'folder-unselected'}
          items={availableFolderItems}
          background="gray5"
          label={t('label.select_an_address_book_ellipsis', 'Select an address book…')}
          showCheckbox={false}
          defaultSelection={selectedFolder}
          onChange={(value: string | null): void => {
            form.setFieldValue('folderId', value ?? '');
          }}
        />
      )}
      <Row width="100%" mainAlignment="flex-end" style={{ gap: '0.625rem' }}>
        <Button
          label={t('label.cancel', 'Cancel')}
          color="secondary"
          type="outlined"
          onClick={onCancel}
          disabled={addAddressBookMutation.isPending}
        />
        <Button
          label={t('label.add', 'Add')}
          color="primary"
          onClick={submitInlineAdd}
          loading={addAddressBookMutation.isPending}
          disabled={!canSubmitAdd || addAddressBookMutation.isPending}
        />
      </Row>
    </Container>
  );
};

export const AddressBookDetailPanel = ({
  domainName,
  entry,
  onClose,
}: Readonly<AddressBookDetailPanelProps>) => {
  const [t] = useTranslation();
  const removeAddressBookMutation = useRemoveAddressBook();
  const [folderToRemove, setFolderToRemove] = useState<AddressBookFolder | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const { exposedFolders, pickerFolders, isResolving } = useAddressBookPickerFolders({
    domain: domainName,
    account: entry.account,
    fallbackExposed: entry.folders ?? [],
  });
  const folders = exposedFolders;
  const hasAllShared = foldersHaveAllShared(folders);
  const sharedLabel = t('label.shared', 'Shared');
  const availableFolderItems: Array<FolderSelectItem> = hasAllShared
    ? []
    : pickerFolders.map((folder) => ({
        label: getFolderSelectLabel(folder.name, folder.isShared === true, sharedLabel),
        value: String(folder.id),
      }));
  const canOpenInlineAdd = !hasAllShared && availableFolderItems.length > 0;

  function confirmRemoveFolder(): void {
    if (!folderToRemove) {
      return;
    }
    removeAddressBookMutation.mutate(
      {
        domain: domainName,
        account: entry.account,
        folder: String(folderToRemove.id),
      },
      {
        onSuccess: () => {
          setFolderToRemove(null);
        },
      },
    );
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
            {t('label.exposed_address_books', 'Exposed address books')}
          </ds-text>

          {isResolving ? (
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
                  <ExposedFolderRow
                    key={String(folder.id)}
                    folder={folder}
                    showTopBorder={index > 0}
                    sharedLabel={sharedLabel}
                    onRemove={setFolderToRemove}
                  />
                ))
              )}
            </Container>
          )}

          {isAdding ? (
            <InlineExposeForm
              domainName={domainName}
              account={entry.account}
              availableFolderItems={availableFolderItems}
              hasAllShared={hasAllShared}
              onCancel={(): void => setIsAdding(false)}
            />
          ) : (
            <>
              <Button
                type="outlined"
                color="primary"
                label={t('label.add_address_book', 'Add address book')}
                icon="Plus"
                onClick={(): void => setIsAdding(true)}
                disabled={!canOpenInlineAdd || isResolving}
              />
              {(hasAllShared || availableFolderItems.length === 0) && !isResolving && (
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
          if (!removeAddressBookMutation.isPending) {
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
                disabled={removeAddressBookMutation.isPending}
              />
              <Button
                label={t('label.remove', 'Remove')}
                color="error"
                onClick={confirmRemoveFolder}
                loading={removeAddressBookMutation.isPending}
                disabled={removeAddressBookMutation.isPending}
              />
            </Row>
          </Container>
        }
      >
        <Container padding={{ top: 'extralarge', bottom: 'extralarge' }} mainAlignment="flex-start">
          <ds-text
            as="p"
            size="large"
            overflow="break-word"
            style={{ whiteSpace: 'pre-line', textAlign: 'left' }}
          >
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
};

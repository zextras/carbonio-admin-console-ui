/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { searchDirectory } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';

import type { AddressBookEntry, AddressBookFolder } from '../../types';
import { RECORD_DISPLAY_LIMIT } from '../constants';
import { isValidEmail } from '../views/utility/utils';
import { addAddressBook } from './add-address-book';
import { domainQueryKeys } from './domain-query-keys';
import {
  getExposedAddressBookFolders,
  getUnexposedAddressBookFolders,
} from './get-exposed-address-book-folders';
import { getMailboxContactFolders } from './get-mailbox-contact-folders';
import { listAddressBooks } from './list-address-books';
import { errorMessage, parseDirectoryAccounts } from './parse-address-book-accounts';
import { removeAddressBook } from './remove-address-book';

const FALLBACK_ERROR = 'Something went wrong. Please try again.';

const ACCOUNT_SEARCH_ATTRS =
  'displayName,zimbraId,zimbraAliasTargetId,cn,sn,zimbraMailHost,uid,zimbraCOSId,zimbraAccountStatus,zimbraLastLogonTimestamp,description,zimbraIsSystemAccount,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraAuthTokenValidityValue,zimbraIsExternalVirtualAccount,zimbraMailStatus,zimbraIsAdminGroup,zimbraCalResType,zimbraDomainType,zimbraDomainName,zimbraDomainStatus';

type AddressBookActionInput = {
  domain: string;
  account: string;
  folder: string;
};

type AccountFolderParams = {
  domain: string;
  account: string;
};

function asError(err: Error, fallback: string): Error {
  return err instanceof Error ? err : new Error(fallback);
}

function useAddressBookSnackbar() {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const fallback = t('label.something_wrong_error_msg', FALLBACK_ERROR);

  function success(label: string): void {
    createSnackbar({
      key: 'success',
      severity: 'success',
      label,
      autoHideTimeout: 3000,
      hideButton: true,
      replace: true,
    });
  }

  function error(err: Error): void {
    createSnackbar({
      key: 'error',
      severity: 'error',
      label: errorMessage(asError(err, fallback), fallback),
      autoHideTimeout: 3000,
      hideButton: true,
      replace: true,
    });
  }

  return { t, fallback, success, error };
}

function filterRemovedFolder(
  folders: Array<AddressBookFolder>,
  folderId: string,
): Array<AddressBookFolder> {
  return folders.filter((folder) => String(folder.id) !== folderId);
}

function applyFolderRemovalToList(
  entries: Array<AddressBookEntry> | undefined,
  account: string,
  folderId: string,
): Array<AddressBookEntry> | undefined {
  if (!entries) {
    return entries;
  }

  return entries.flatMap((entry) => {
    if (entry.account !== account && entry.accountId !== account) {
      return [entry];
    }
    const folders = filterRemovedFolder(entry.folders ?? [], folderId);
    if (folders.length === 0) {
      return [];
    }
    return [
      {
        ...entry,
        folders,
        folderIds: folders.map((folder) => String(folder.id)).join(','),
      },
    ];
  });
}

function useInvalidateAddressBookListAndMailbox() {
  const queryClient = useQueryClient();

  return async (domain: string, account: string): Promise<void> => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.addressBookList(domain) }),
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.mailboxContactFolders(account) }),
    ]);
  };
}

export function useAddressBookList(domainName: string | undefined) {
  const { fallback, error } = useAddressBookSnackbar();

  return useQuery({
    queryKey: domainQueryKeys.addressBookList(domainName ?? ''),
    queryFn: async () => {
      try {
        return await listAddressBooks({ domain: domainName ?? '' });
      } catch (err) {
        const caught = asError(err instanceof Error ? err : new Error(fallback), fallback);
        error(caught);
        throw caught;
      }
    },
    enabled: !!domainName,
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}

export function useMailboxContactFolders(account: string, enabled = true) {
  const { fallback, error } = useAddressBookSnackbar();
  const canFetch = enabled && isValidEmail(account);

  return useQuery({
    queryKey: domainQueryKeys.mailboxContactFolders(account),
    queryFn: async () => {
      try {
        return await getMailboxContactFolders({ account });
      } catch (err) {
        const caught = asError(err instanceof Error ? err : new Error(fallback), fallback);
        error(caught);
        throw caught;
      }
    },
    enabled: canFetch,
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}

export function useExposedAddressBookFolders({ domain, account }: AccountFolderParams) {
  return useQuery({
    queryKey: domainQueryKeys.exposedAddressBookFolders(domain, account),
    queryFn: () => getExposedAddressBookFolders({ domain, account }),
    enabled: !!domain && !!account,
    // Mutations update this cache (or invalidate after add). Avoid keepPreviousData so
    // an empty post-remove list is not masked by the previous folders.
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}

export function useUnexposedAddressBookFolders({
  domain,
  account,
  enabled = true,
}: AccountFolderParams & { enabled?: boolean }) {
  return useQuery({
    queryKey: domainQueryKeys.unexposedAddressBookFolders(domain, account),
    queryFn: () => getUnexposedAddressBookFolders({ domain, account }),
    enabled: enabled && !!domain && !!account,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}

export function useAddressBookPickerFolders({
  domain,
  account,
  fallbackExposed,
}: AccountFolderParams & { fallbackExposed: Array<AddressBookFolder> }) {
  const exposedQuery = useExposedAddressBookFolders({ domain, account });
  // On query error TanStack keeps the last successful data; prefer the list fallback so
  // removing the last folder (or a failed refetch) does not leave stale rows on screen.
  const exposedFolders = exposedQuery.isError
    ? fallbackExposed
    : (exposedQuery.data ?? fallbackExposed);
  const exposedSettled = exposedQuery.isSuccess || exposedQuery.isError;
  const useMailbox = exposedSettled && exposedFolders.length === 0;
  const useUnexposed = exposedSettled && exposedFolders.length > 0;
  const mailboxQuery = useMailboxContactFolders(account, useMailbox);
  const unexposedQuery = useUnexposedAddressBookFolders({
    domain,
    account,
    enabled: useUnexposed,
  });

  const pickerFolders = useMailbox ? (mailboxQuery.data ?? []) : (unexposedQuery.data ?? []);
  const isResolving =
    (!exposedSettled && exposedQuery.isFetching) ||
    (useMailbox && mailboxQuery.isFetching) ||
    (useUnexposed && unexposedQuery.isFetching);

  return {
    exposedFolders,
    pickerFolders,
    isResolving,
  };
}

export function useAddressBookAccountSearch(domainName: string, keyword: string) {
  const { fallback, error } = useAddressBookSnackbar();
  const trimmed = keyword.trim();

  return useQuery({
    queryKey: domainQueryKeys.addressBookAccountSearch(domainName, trimmed),
    queryFn: async () => {
      try {
        const data = await searchDirectory({
          attr: ACCOUNT_SEARCH_ATTRS,
          type: 'accounts',
          domainName,
          query: `(&(!(zimbraAccountStatus=closed))(|(mail=*${trimmed}*)(cn=*${trimmed}*)(sn=*${trimmed}*)(gn=*${trimmed}*)(displayName=*${trimmed}*)(zimbraMailDeliveryAddress=*${trimmed}*)(zimbraMailAlias=*${trimmed}*)(uid=*${trimmed}*)))`,
          offset: 0,
          limit: RECORD_DISPLAY_LIMIT,
          sortBy: 'name',
        });
        return parseDirectoryAccounts(data);
      } catch (err) {
        const caught = asError(err instanceof Error ? err : new Error(fallback), fallback);
        error(caught);
        throw caught;
      }
    },
    enabled: !!domainName && trimmed !== '',
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}

export function useAddAddressBook() {
  const { t, fallback, success, error } = useAddressBookSnackbar();
  const queryClient = useQueryClient();
  const invalidateListAndMailbox = useInvalidateAddressBookListAndMailbox();

  return useMutation({
    mutationFn: (input: AddressBookActionInput) => addAddressBook(input),
    onSuccess: async (_data, variables) => {
      success(t('label.address_book_exposed', 'Address book exposed'));
      // Add changes which folders are exposed — refetch folder queries once.
      await Promise.all([
        invalidateListAndMailbox(variables.domain, variables.account),
        queryClient.invalidateQueries({
          queryKey: domainQueryKeys.exposedAddressBookFolders(
            variables.domain,
            variables.account,
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: domainQueryKeys.unexposedAddressBookFolders(
            variables.domain,
            variables.account,
          ),
        }),
      ]);
    },
    onError: (err) => error(asError(err instanceof Error ? err : new Error(fallback), fallback)),
  });
}

export function useRemoveAddressBook() {
  const { t, fallback, success, error } = useAddressBookSnackbar();
  const queryClient = useQueryClient();
  const invalidateListAndMailbox = useInvalidateAddressBookListAndMailbox();

  return useMutation({
    mutationFn: (input: AddressBookActionInput) => removeAddressBook(input),
    onSuccess: async (_data, variables) => {
      success(t('label.folder_removed_successfully', 'Folder removed successfully'));

      const exposedKey = domainQueryKeys.exposedAddressBookFolders(
        variables.domain,
        variables.account,
      );
      const unexposedKey = domainQueryKeys.unexposedAddressBookFolders(
        variables.domain,
        variables.account,
      );
      const previousExposed =
        queryClient.getQueryData<Array<AddressBookFolder>>(exposedKey) ?? [];
      const nextExposed = filterRemovedFolder(previousExposed, variables.folder);

      queryClient.setQueryData(exposedKey, nextExposed);
      queryClient.setQueryData(
        domainQueryKeys.addressBookList(variables.domain),
        (previous: Array<AddressBookEntry> | undefined) =>
          applyFolderRemovalToList(previous, variables.account, variables.folder),
      );

      if (nextExposed.length > 0) {
        await Promise.all([
          invalidateListAndMailbox(variables.domain, variables.account),
          queryClient.invalidateQueries({ queryKey: unexposedKey }),
        ]);
      } else {
        queryClient.removeQueries({ queryKey: unexposedKey });
        await invalidateListAndMailbox(variables.domain, variables.account);
      }
    },
    onError: (err) => error(asError(err instanceof Error ? err : new Error(fallback), fallback)),
  });
}

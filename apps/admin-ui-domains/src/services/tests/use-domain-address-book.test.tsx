/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockCreateSnackbar = vi.fn();
const mockListAddressBooks = vi.fn();
const mockGetMailboxContactFolders = vi.fn();
const mockGetExposedAddressBookFolders = vi.fn();
const mockGetUnexposedAddressBookFolders = vi.fn();
const mockAddAddressBook = vi.fn();
const mockRemoveAddressBook = vi.fn();
const mockSearchDirectory = vi.fn();

vi.mock('@zextras/ui-components', () => ({
  useSnackbar: () => mockCreateSnackbar,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => [(key: string, fallback?: string) => fallback ?? key],
}));

vi.mock('../list-address-books', () => ({
  listAddressBooks: (...args: Array<{ domain: string }>) => mockListAddressBooks(...args),
}));
vi.mock('../get-mailbox-contact-folders', () => ({
  getMailboxContactFolders: (...args: Array<{ account: string }>) =>
    mockGetMailboxContactFolders(...args),
}));
vi.mock('../get-exposed-address-book-folders', () => ({
  getExposedAddressBookFolders: (...args: Array<{ domain: string; account: string }>) =>
    mockGetExposedAddressBookFolders(...args),
  getUnexposedAddressBookFolders: (...args: Array<{ domain: string; account: string }>) =>
    mockGetUnexposedAddressBookFolders(...args),
}));
vi.mock('../add-address-book', () => ({
  addAddressBook: (...args: Array<{ domain: string; account: string; folder: string }>) =>
    mockAddAddressBook(...args),
}));
vi.mock('../remove-address-book', () => ({
  removeAddressBook: (...args: Array<{ domain: string; account: string; folder: string }>) =>
    mockRemoveAddressBook(...args),
}));
vi.mock('@zextras/ui-shared', () => ({
  searchDirectory: (...args: Array<Record<string, string | number>>) => mockSearchDirectory(...args),
}));

import { domainQueryKeys } from '../domain-query-keys';
import {
  useAddAddressBook,
  useAddressBookAccountSearch,
  useAddressBookList,
  useMailboxContactFolders,
  useRemoveAddressBook,
} from '../use-domain-address-book';

const BOOK = {
  account: 'alice@example.com',
  accountId: 'acc-1',
  folders: [{ id: 'all', name: 'all', isShared: false }],
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'Wrapper';
  return { wrapper: Wrapper, queryClient };
}

describe('use-domain-address-book', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useAddressBookList', () => {
    it('returns books when a domain is provided', async () => {
      mockListAddressBooks.mockResolvedValue([BOOK]);
      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useAddressBookList('example.com'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.[0]?.account).toBe('alice@example.com');
      expect(mockListAddressBooks).toHaveBeenCalledWith({ domain: 'example.com' });
    });

    it('does not fetch when domain name is missing', () => {
      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useAddressBookList(undefined), { wrapper });
      expect(result.current.fetchStatus).toBe('idle');
      expect(mockListAddressBooks).not.toHaveBeenCalled();
    });

    it('shows an error snackbar when the list fails', async () => {
      mockListAddressBooks.mockRejectedValue(new Error('List failed'));
      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useAddressBookList('example.com'), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(mockCreateSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error', label: 'List failed' }),
      );
    });
  });

  describe('useMailboxContactFolders', () => {
    it('fetches folders for a valid account', async () => {
      mockGetMailboxContactFolders.mockResolvedValue([{ id: '7', name: 'Work', isShared: false }]);
      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useMailboxContactFolders('alice@example.com'), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.[0]?.name).toBe('Work');
    });

    it('does not fetch when the account is not a valid email', () => {
      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useMailboxContactFolders('not-an-email'), { wrapper });
      expect(result.current.fetchStatus).toBe('idle');
      expect(mockGetMailboxContactFolders).not.toHaveBeenCalled();
    });
  });

  describe('useAddressBookAccountSearch', () => {
    it('parses directory accounts', async () => {
      mockSearchDirectory.mockResolvedValue({
        account: [{ id: 'acc-3', name: 'carol@example.com', a: [] }],
      });
      const { wrapper } = createWrapper();
      const { result } = renderHook(
        () => useAddressBookAccountSearch('example.com', 'carol'),
        { wrapper },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([{ id: 'acc-3', name: 'carol@example.com' }]);
    });

    it('does not fetch when the keyword is empty', () => {
      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useAddressBookAccountSearch('example.com', ''), {
        wrapper,
      });
      expect(result.current.fetchStatus).toBe('idle');
      expect(mockSearchDirectory).not.toHaveBeenCalled();
    });
  });

  describe('mutations', () => {
    it('adds an address book and invalidates list and folder queries', async () => {
      mockAddAddressBook.mockResolvedValue(undefined);
      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const { result } = renderHook(() => useAddAddressBook(), { wrapper });

      result.current.mutate({
        domain: 'example.com',
        account: 'alice@example.com',
        folder: 'all',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockCreateSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'success', label: 'Address book exposed' }),
      );
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: domainQueryKeys.addressBookList('example.com'),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: domainQueryKeys.mailboxContactFolders('alice@example.com'),
      });
    });

    it('shows an error snackbar when add fails', async () => {
      mockAddAddressBook.mockRejectedValue(new Error('Add failed'));
      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useAddAddressBook(), { wrapper });

      result.current.mutate({
        domain: 'example.com',
        account: 'alice@example.com',
        folder: 'all',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(mockCreateSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error', label: 'Add failed' }),
      );
    });

    it('removes an address book and updates the exposed-folder cache', async () => {
      mockRemoveAddressBook.mockResolvedValue(undefined);
      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      queryClient.setQueryData(
        domainQueryKeys.exposedAddressBookFolders('example.com', 'alice@example.com'),
        [
          { id: 'all', name: 'all', isShared: false },
          { id: '7', name: 'Work', isShared: false },
        ],
      );
      queryClient.setQueryData(domainQueryKeys.addressBookList('example.com'), [
        {
          account: 'alice@example.com',
          accountId: 'acc-1',
          folders: [
            { id: 'all', name: 'all', isShared: false },
            { id: '7', name: 'Work', isShared: false },
          ],
        },
      ]);

      const { result } = renderHook(() => useRemoveAddressBook(), { wrapper });

      result.current.mutate({
        domain: 'example.com',
        account: 'alice@example.com',
        folder: 'all',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockCreateSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'success',
          label: 'Folder removed successfully',
        }),
      );
      expect(
        queryClient.getQueryData(
          domainQueryKeys.exposedAddressBookFolders('example.com', 'alice@example.com'),
        ),
      ).toEqual([{ id: '7', name: 'Work', isShared: false }]);
      expect(queryClient.getQueryData(domainQueryKeys.addressBookList('example.com'))).toEqual([
        {
          account: 'alice@example.com',
          accountId: 'acc-1',
          folderIds: '7',
          folders: [{ id: '7', name: 'Work', isShared: false }],
        },
      ]);
      expect(invalidateSpy).not.toHaveBeenCalledWith({
        queryKey: domainQueryKeys.exposedAddressBookFolders('example.com', 'alice@example.com'),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: domainQueryKeys.unexposedAddressBookFolders('example.com', 'alice@example.com'),
      });
    });

    it('does not refetch GetAddressBook when the last exposed folder is removed', async () => {
      mockRemoveAddressBook.mockResolvedValue(undefined);
      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      queryClient.setQueryData(
        domainQueryKeys.exposedAddressBookFolders('example.com', 'alice@example.com'),
        [{ id: 'all', name: 'all', isShared: false }],
      );
      queryClient.setQueryData(
        domainQueryKeys.unexposedAddressBookFolders('example.com', 'alice@example.com'),
        [{ id: '7', name: 'Work', isShared: false }],
      );
      queryClient.setQueryData(domainQueryKeys.addressBookList('example.com'), [
        {
          account: 'alice@example.com',
          accountId: 'acc-1',
          folders: [{ id: 'all', name: 'all', isShared: false }],
        },
      ]);

      const { result } = renderHook(() => useRemoveAddressBook(), { wrapper });

      result.current.mutate({
        domain: 'example.com',
        account: 'alice@example.com',
        folder: 'all',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(
        queryClient.getQueryData(
          domainQueryKeys.exposedAddressBookFolders('example.com', 'alice@example.com'),
        ),
      ).toEqual([]);
      expect(queryClient.getQueryData(domainQueryKeys.addressBookList('example.com'))).toEqual([]);
      expect(invalidateSpy).not.toHaveBeenCalledWith({
        queryKey: domainQueryKeys.exposedAddressBookFolders('example.com', 'alice@example.com'),
      });
      expect(invalidateSpy).not.toHaveBeenCalledWith({
        queryKey: domainQueryKeys.unexposedAddressBookFolders('example.com', 'alice@example.com'),
      });
      expect(
        queryClient.getQueryData(
          domainQueryKeys.unexposedAddressBookFolders('example.com', 'alice@example.com'),
        ),
      ).toBeUndefined();
    });
  });
});

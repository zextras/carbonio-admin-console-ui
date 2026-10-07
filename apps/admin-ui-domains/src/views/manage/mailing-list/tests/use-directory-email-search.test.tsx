/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

const mockCreateSnackbar = vi.fn();
const mockSearchDirectory = vi.fn();

vi.mock('@zextras/ui-components', () => ({
  useSnackbar: () => mockCreateSnackbar,
}));

vi.mock('@zextras/ui-shared', () => ({
  searchDirectory: (...args: Array<Record<string, unknown>>) => mockSearchDirectory(...args),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => [(key: string, fallback?: string) => fallback ?? key],
}));

import { useDirectoryEmailSearch } from '../../../utility/use-directory-email-search';

const CONFIG = {
  attrs: 'mail,cn,sn',
  types: 'accounts,distributionlists,aliases',
  buildQuery: (keyword: string): string => `(|(mail=*${keyword}*)(cn=*${keyword}*))`,
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'Wrapper';
  return Wrapper;
}

describe('useDirectoryEmailSearch', () => {
  it('does not search while the input is empty', () => {
    const { result } = renderHook(() => useDirectoryEmailSearch(CONFIG), {
      wrapper: createWrapper(),
    });

    expect(result.current.searchValue).toBe('');
    expect(result.current.items).toEqual([]);
    expect(mockSearchDirectory).not.toHaveBeenCalled();
  });

  it('debounces the input and merges dl, account and alias results in order', async () => {
    mockSearchDirectory.mockResolvedValue({
      dl: [{ id: 'dl-1', name: 'list@example.com' }],
      account: [{ id: 'acc-1', name: 'user@example.com' }],
      alias: [{ id: 'alias-1', name: 'alias@example.com' }],
    });
    const { result } = renderHook(() => useDirectoryEmailSearch(CONFIG), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setSearchValue('exam');
    });

    await waitFor(() => expect(result.current.items).toHaveLength(3), { timeout: 5000 });
    expect(result.current.items.map((item: { label?: string }) => item?.label)).toEqual([
      'list@example.com',
      'user@example.com',
      'alias@example.com',
    ]);
    expect(mockSearchDirectory).toHaveBeenCalledWith(
      expect.objectContaining({
        attr: CONFIG.attrs,
        type: CONFIG.types,
        domainName: '',
        query: CONFIG.buildQuery('exam'),
        offset: 0,
        limit: 10,
        sortBy: 'name',
      }),
    );
  });

  it('exposes combobox items with id and label', async () => {
    mockSearchDirectory.mockResolvedValue({
      dl: [{ id: 'dl-1', name: 'list@example.com' }],
    });
    const { result } = renderHook(() => useDirectoryEmailSearch(CONFIG), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setSearchValue('list');
    });

    await waitFor(() => expect(result.current.items).toHaveLength(1), { timeout: 5000 });
    expect(result.current.items[0]).toEqual({ id: 'dl-1', label: 'list@example.com' });
  });

  it('shows an error snackbar when the search fails', async () => {
    mockSearchDirectory.mockRejectedValue(new Error('Directory failed'));
    const { result } = renderHook(() => useDirectoryEmailSearch(CONFIG), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setSearchValue('user');
    });

    await waitFor(
      () =>
        expect(mockCreateSnackbar).toHaveBeenCalledWith(
          expect.objectContaining({ severity: 'error', label: 'Directory failed' }),
        ),
      { timeout: 5000 },
    );
    expect(result.current.items).toEqual([]);
  });
});

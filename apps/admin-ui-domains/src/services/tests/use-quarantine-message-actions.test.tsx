/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { IncompleteMessage } from '../../views/global/global-quarantine/quarantine-types';

const mocks = vi.hoisted(() => ({
  bounceMsg: vi.fn(),
  createAccount: vi.fn(),
  deleteAccount: vi.fn(),
  getAccount: vi.fn(),
  modifyConfigAttributes: vi.fn(),
  msgAction: vi.fn(),
  removeAttachments: vi.fn(),
}));

vi.mock('@zextras/ui-components', () => ({
  useSnackbar: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => [(key: string, fallback?: string) => fallback ?? key],
}));

vi.mock('../bounce-message', () => ({ bounceMsgRequest: mocks.bounceMsg }));
vi.mock('../create-account', () => ({ createAccountRequest: mocks.createAccount }));
vi.mock('../delete-account-service', () => ({ deleteAccount: mocks.deleteAccount }));
vi.mock('../get-account', () => ({ getAccountRequest: mocks.getAccount }));
vi.mock('../message-action', () => ({ msgActionRequest: mocks.msgAction }));
vi.mock('@zextras/ui-shared', async (importOriginal) => ({
	...(await importOriginal<typeof import('@zextras/ui-shared')>()),
	modifyConfigAttributes: mocks.modifyConfigAttributes,
}));
vi.mock('../remove-attachments', () => ({ removeAttachmentsRequest: mocks.removeAttachments }));
vi.mock('../../views/utility/utils', () => ({ generateRandomString: () => 'abc123' }));

import { useSnackbar } from '@zextras/ui-components';

import { domainQueryKeys } from '../domain-query-keys';
import {
  useDeleteQuarantineMessage,
  useDeliverQuarantineMessage,
  useRecreateQuarantineAccount,
  useRemoveQuarantineAttachment,
} from '../use-quarantine-message-actions';

const mockCreateSnackbar = vi.fn();

const MESSAGE = {
  id: 'msg-1',
  parent: '',
  conversation: '',
  read: false,
  size: 100,
  hasAttachment: false,
  flagged: false,
  urgent: false,
  isDeleted: false,
  isSentByMe: false,
  isForwarded: false,
  isInvite: false,
  isDraft: false,
  isScheduled: false,
  date: 0,
  subject: 'Quarantined message',
  tags: [],
  parts: [],
  body: { contentType: 'text/plain', content: 'hello' },
  isComplete: true,
  isReplied: false,
} satisfies IncompleteMessage;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'Wrapper';
  return { wrapper: Wrapper, queryClient };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useSnackbar).mockReturnValue(mockCreateSnackbar);
});

describe('useDeleteQuarantineMessage', () => {
  it('should call msgActionRequest, show a snackbar and invalidate the list on success', async () => {
    mocks.msgAction.mockResolvedValue({});

    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useDeleteQuarantineMessage(), { wrapper });

    result.current.mutate('msg-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocks.msgAction).toHaveBeenCalledWith('msg-1', 'delete');
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'info', label: 'Message deleted' }),
    );
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: domainQueryKeys.quarantineMessages(),
    });
  });

  it('should show an error snackbar on failure', async () => {
    mocks.msgAction.mockRejectedValue(new Error('boom'));

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useDeleteQuarantineMessage(), { wrapper });

    result.current.mutate('msg-1');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', label: 'boom' }),
    );
  });

  it('should fall back to the translated label when the error has no message', async () => {
    mocks.msgAction.mockRejectedValue(undefined);

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useDeleteQuarantineMessage(), { wrapper });

    result.current.mutate('msg-1');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        label: 'Something went wrong. Please try again.',
      }),
    );
  });
});

describe('useDeliverQuarantineMessage', () => {
  it('should call bounceMsgRequest, show a snackbar and invalidate the list on success', async () => {
    mocks.bounceMsg.mockResolvedValue({});

    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useDeliverQuarantineMessage(), { wrapper });

    result.current.mutate(MESSAGE);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocks.bounceMsg).toHaveBeenCalledWith(MESSAGE);
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'info', label: 'Message delivered' }),
    );
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: domainQueryKeys.quarantineMessages(),
    });
  });

  it('should show an error snackbar on failure', async () => {
    mocks.bounceMsg.mockRejectedValue(new Error('bounce failed'));

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useDeliverQuarantineMessage(), { wrapper });

    result.current.mutate(MESSAGE);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', label: 'bounce failed' }),
    );
  });
});

describe('useRemoveQuarantineAttachment', () => {
  it('should call removeAttachmentsRequest, show a snackbar and invalidate the list on success', async () => {
    mocks.removeAttachments.mockResolvedValue({});

    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useRemoveQuarantineAttachment(), { wrapper });

    result.current.mutate({ id: 'msg-1', part: '2' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocks.removeAttachments).toHaveBeenCalledWith('msg-1', '2');
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'info', label: 'Attachment deleted' }),
    );
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: domainQueryKeys.quarantineMessages(),
    });
  });

  it('should show an error snackbar on failure', async () => {
    mocks.removeAttachments.mockRejectedValue(new Error('remove failed'));

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useRemoveQuarantineAttachment(), { wrapper });

    result.current.mutate({ id: 'msg-1', part: '2' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', label: 'remove failed' }),
    );
  });
});

describe('useRecreateQuarantineAccount', () => {
  it('should create the account, update the config, delete the old account and invalidate caches', async () => {
    mocks.createAccount.mockResolvedValue({
      account: [{ name: 'virus-quarantine.abc123@example.com' }],
    });
    mocks.modifyConfigAttributes.mockResolvedValue({});
    mocks.getAccount.mockResolvedValue({ account: [{ id: 'prev-id' }] });
    mocks.deleteAccount.mockResolvedValue({});

    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useRecreateQuarantineAccount(), { wrapper });

    result.current.mutate({
      previousAccountName: 'virus-quarantine@old.com',
      defaultDomainName: 'example.com',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe('virus-quarantine.abc123@example.com');
    expect(mocks.createAccount).toHaveBeenCalledWith(
      expect.objectContaining({
        zimbraMailMessageLifetime: '7d',
        zimbraIsSystemResource: 'TRUE',
        zimbraMailQuota: 0,
      }),
      'virus-quarantine.abc123@example.com',
      '',
    );
    expect(mocks.modifyConfigAttributes).toHaveBeenCalledWith([
      { n: 'zimbraAmavisQuarantineAccount', _content: 'virus-quarantine.abc123@example.com' },
    ]);
    expect(mocks.getAccount).toHaveBeenCalledWith('', 'virus-quarantine@old.com', 0);
    expect(mocks.deleteAccount).toHaveBeenCalledWith('prev-id');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['all-config'] });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: domainQueryKeys.quarantineAccount(),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: domainQueryKeys.quarantineMessages(),
    });
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success' }),
    );
  });

  it('should skip the previous account lookup and deletion when its name is empty', async () => {
    mocks.createAccount.mockResolvedValue({
      account: [{ name: 'virus-quarantine.abc123@example.com' }],
    });
    mocks.modifyConfigAttributes.mockResolvedValue({});

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useRecreateQuarantineAccount(), { wrapper });

    result.current.mutate({ previousAccountName: '', defaultDomainName: 'example.com' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocks.getAccount).not.toHaveBeenCalled();
    expect(mocks.deleteAccount).not.toHaveBeenCalled();
  });

  it('should skip deleteAccount when the previous account lookup returns no id', async () => {
    mocks.createAccount.mockResolvedValue({
      account: [{ name: 'virus-quarantine.abc123@example.com' }],
    });
    mocks.modifyConfigAttributes.mockResolvedValue({});
    mocks.getAccount.mockResolvedValue({});

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useRecreateQuarantineAccount(), { wrapper });

    result.current.mutate({
      previousAccountName: 'virus-quarantine@old.com',
      defaultDomainName: 'example.com',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocks.getAccount).toHaveBeenCalledWith('', 'virus-quarantine@old.com', 0);
    expect(mocks.deleteAccount).not.toHaveBeenCalled();
    expect(result.current.data).toBe('virus-quarantine.abc123@example.com');
  });

  it('should show an error snackbar and skip modifyConfigAttributes when the response has no name', async () => {
    mocks.createAccount.mockResolvedValue({});

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useRecreateQuarantineAccount(), { wrapper });

    result.current.mutate({
      previousAccountName: 'virus-quarantine@old.com',
      defaultDomainName: 'example.com',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        label: 'Something went wrong. Please try again.',
      }),
    );
    expect(mocks.modifyConfigAttributes).not.toHaveBeenCalled();
  });

  it('should show an error snackbar when createAccountRequest rejects', async () => {
    mocks.createAccount.mockRejectedValue(new Error('nope'));

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useRecreateQuarantineAccount(), { wrapper });

    result.current.mutate({ previousAccountName: '', defaultDomainName: 'example.com' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', label: 'nope' }),
    );
  });
});

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
const mockCreateResource = vi.fn();
const mockCreateSignature = vi.fn();
const mockDeleteCalendarResource = vi.fn();
const mockGetCalenderResource = vi.fn();
const mockGetDelegateAuthRequest = vi.fn();
const mockModifyCalendarResource = vi.fn();
const mockRenameCalendarResource = vi.fn();
const mockSetPasswordRequest = vi.fn();
const mockSearchDirectory = vi.fn();

vi.mock('@zextras/ui-components', () => ({
  useSnackbar: () => mockCreateSnackbar,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => [(key: string, fallback?: string) => fallback ?? key],
}));

vi.mock('../create-cal-resource-service', () => ({
  createResource: (...args: Array<unknown>) => mockCreateResource(...args),
}));
vi.mock('../create-signature-service', () => ({
  createSignature: (...args: Array<unknown>) => mockCreateSignature(...args),
}));
vi.mock('../delete-cal-resource-service', () => ({
  deleteCalendarResource: (...args: Array<unknown>) => mockDeleteCalendarResource(...args),
}));
vi.mock('../get-cal-resource-service', () => ({
  getCalenderResource: (...args: Array<unknown>) => mockGetCalenderResource(...args),
}));
vi.mock('../get-delegate-auth-request', () => ({
  getDelegateAuthRequest: (...args: Array<unknown>) => mockGetDelegateAuthRequest(...args),
}));
vi.mock('../modify-cal-resource-service', () => ({
  modifyCalendarResource: (...args: Array<unknown>) => mockModifyCalendarResource(...args),
}));
vi.mock('../rename-cal-resource-service', () => ({
  renameCalendarResource: (...args: Array<unknown>) => mockRenameCalendarResource(...args),
}));
vi.mock('../set-password', () => ({
  setPasswordRequest: (...args: Array<unknown>) => mockSetPasswordRequest(...args),
}));
vi.mock('@zextras/ui-shared', () => ({
  searchDirectory: (...args: Array<unknown>) => mockSearchDirectory(...args),
}));

import { domainQueryKeys } from '../domain-query-keys';
import {
  useCalResource,
  useCalResourceList,
  useCreateCalResource,
  useDelegateAuth,
  useDeleteCalResource,
  useDisableCalResource,
  useSaveCalResource,
} from '../use-cal-resource';

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

const emptySignatureId = { value: '', label: '' };

describe('use-cal-resource', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useCalResourceList', () => {
    it('fetches the resource list when a domain name is provided', async () => {
      mockSearchDirectory.mockResolvedValue({ calresource: [{ id: 'r1' }], searchTotal: 1 });
      const { wrapper } = createWrapper();
      const { result } = renderHook(
        () =>
          useCalResourceList({
            domainName: 'example.com',
            query: '',
            sortBy: 'name',
            sortOrder: 'asc',
            offset: 0,
            limit: 25,
          }),
        { wrapper },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockSearchDirectory).toHaveBeenCalled();
      expect(result.current.data).toEqual({ calresource: [{ id: 'r1' }], searchTotal: 1 });
    });

    it('does not fetch when domain name is missing', () => {
      const { wrapper } = createWrapper();
      const { result } = renderHook(
        () =>
          useCalResourceList({
            domainName: undefined,
            query: '',
            sortBy: 'name',
            sortOrder: 'asc',
            offset: 0,
            limit: 25,
          }),
        { wrapper },
      );

      expect(result.current.fetchStatus).toBe('idle');
      expect(mockSearchDirectory).not.toHaveBeenCalled();
    });
  });

  describe('useCalResource', () => {
    it('returns the first calendar resource from the service', async () => {
      mockGetCalenderResource.mockResolvedValue({
        calresource: [{ id: 'res-1', name: 'room@example.com' }],
      });
      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useCalResource('res-1'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual({ id: 'res-1', name: 'room@example.com' });
    });

    it('does not fetch when resource id is missing', () => {
      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useCalResource(undefined), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
      expect(mockGetCalenderResource).not.toHaveBeenCalled();
    });
  });

  describe('useSaveCalResource', () => {
    it('updates password, renames, and modifies attributes on success', async () => {
      mockSetPasswordRequest.mockResolvedValue({});
      mockRenameCalendarResource.mockResolvedValue({});
      mockModifyCalendarResource.mockResolvedValue({});
      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const { result } = renderHook(() => useSaveCalResource('res-1'), { wrapper });

      result.current.mutate({
        resourceId: 'res-1',
        currentMail: 'old@example.com',
        newMail: 'new@example.com',
        password: 'secret12',
        attributes: [{ n: 'displayName', _content: 'Room' }],
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockSetPasswordRequest).toHaveBeenCalledWith('res-1', 'secret12');
      expect(mockRenameCalendarResource).toHaveBeenCalledWith('res-1', 'new@example.com');
      expect(mockModifyCalendarResource).toHaveBeenCalledWith('res-1', [
        { n: 'displayName', _content: 'Room' },
      ]);
      expect(mockCreateSnackbar).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: domainQueryKeys.calResource('res-1'),
      });
    });

    it('skips password and rename when they are unchanged', async () => {
      mockModifyCalendarResource.mockResolvedValue({});
      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useSaveCalResource('res-1'), { wrapper });

      result.current.mutate({
        resourceId: 'res-1',
        currentMail: 'room@example.com',
        newMail: 'room@example.com',
        password: '',
        attributes: [{ n: 'displayName', _content: 'Room' }],
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockSetPasswordRequest).not.toHaveBeenCalled();
      expect(mockRenameCalendarResource).not.toHaveBeenCalled();
      expect(mockModifyCalendarResource).toHaveBeenCalled();
    });

    it('shows an error snackbar when save fails', async () => {
      mockModifyCalendarResource.mockRejectedValue(new Error('Save failed'));
      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useSaveCalResource('res-1'), { wrapper });

      result.current.mutate({
        resourceId: 'res-1',
        currentMail: 'room@example.com',
        newMail: 'room@example.com',
        password: '',
        attributes: [],
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(mockCreateSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error', label: 'Save failed' }),
      );
    });
  });

  describe('useDeleteCalResource', () => {
    it('deletes the resource and invalidates the list', async () => {
      mockDeleteCalendarResource.mockResolvedValue({});
      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const { result } = renderHook(() => useDeleteCalResource(), { wrapper });

      result.current.mutate('res-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockDeleteCalendarResource).toHaveBeenCalledWith('res-1');
      expect(mockCreateSnackbar).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: [...domainQueryKeys.all, 'cal-resource-list'],
      });
    });

    it('shows an error snackbar when delete fails', async () => {
      mockDeleteCalendarResource.mockRejectedValue(new Error('Delete failed'));
      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useDeleteCalResource(), { wrapper });

      result.current.mutate('res-1');

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(mockCreateSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error', label: 'Delete failed' }),
      );
    });
  });

  describe('useDisableCalResource', () => {
    it('closes the resource by setting account status', async () => {
      mockModifyCalendarResource.mockResolvedValue({});
      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useDisableCalResource(), { wrapper });

      result.current.mutate('res-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockModifyCalendarResource).toHaveBeenCalledWith('res-1', [
        { n: 'zimbraAccountStatus', _content: 'closed' },
      ]);
      expect(mockCreateSnackbar).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    });

    it('shows an error snackbar when disable fails', async () => {
      mockModifyCalendarResource.mockRejectedValue(new Error('Disable failed'));
      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useDisableCalResource(), { wrapper });

      result.current.mutate('res-1');

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(mockCreateSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error', label: 'Disable failed' }),
      );
    });
  });

  describe('useCreateCalResource', () => {
    it('creates a resource without signatures', async () => {
      mockCreateResource.mockResolvedValue({ calresource: [{ id: 'res-1' }] });
      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useCreateCalResource(), { wrapper });

      result.current.mutate({
        name: 'room@example.com',
        password: 'secret12',
        attributes: [{ n: 'displayName', _content: 'Room' }],
        signatureList: [],
        zimbraPrefCalendarAutoAcceptSignatureId: emptySignatureId,
        zimbraPrefCalendarAutoDeclineSignatureId: emptySignatureId,
        zimbraPrefCalendarAutoDenySignatureId: emptySignatureId,
        resourceName: 'Room',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockCreateResource).toHaveBeenCalledWith('room@example.com', 'secret12', [
        { n: 'displayName', _content: 'Room' },
      ]);
      expect(mockCreateSignature).not.toHaveBeenCalled();
      expect(mockCreateSnackbar).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    });

    it('creates signatures and maps selected signature ids', async () => {
      mockCreateResource.mockResolvedValue({ calresource: [{ id: 'res-1' }] });
      mockCreateSignature.mockResolvedValue({
        Body: { CreateSignatureResponse: { signature: [{ id: 'sig-1', name: 'Accept' }] } },
      });
      mockModifyCalendarResource.mockResolvedValue({});
      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useCreateCalResource(), { wrapper });

      result.current.mutate({
        name: 'room@example.com',
        password: 'secret12',
        attributes: [],
        signatureList: [{ name: 'Accept', content: [{ _content: 'thanks' }] }],
        zimbraPrefCalendarAutoAcceptSignatureId: { value: 'placeholder', label: 'Accept' },
        zimbraPrefCalendarAutoDeclineSignatureId: emptySignatureId,
        zimbraPrefCalendarAutoDenySignatureId: emptySignatureId,
        resourceName: 'Room',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockCreateSignature).toHaveBeenCalledWith('res-1', 'Accept', 'thanks');
      expect(mockModifyCalendarResource).toHaveBeenCalledWith(
        'res-1',
        expect.arrayContaining([
          expect.objectContaining({
            n: 'zimbraPrefCalendarAutoAcceptSignatureId',
            _content: 'sig-1',
          }),
        ]),
      );
    });

    it('throws when creation returns no resource id', async () => {
      mockCreateResource.mockResolvedValue({ calresource: [] });
      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useCreateCalResource(), { wrapper });

      result.current.mutate({
        name: 'room@example.com',
        password: '',
        attributes: [],
        signatureList: [],
        zimbraPrefCalendarAutoAcceptSignatureId: emptySignatureId,
        zimbraPrefCalendarAutoDeclineSignatureId: emptySignatureId,
        zimbraPrefCalendarAutoDenySignatureId: emptySignatureId,
        resourceName: 'Room',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(mockCreateSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'error',
          label: 'Resource creation returned no ID',
        }),
      );
    });
  });

  describe('useDelegateAuth', () => {
    it('opens a preauth window when an auth token is returned', async () => {
      const openSpy = vi.spyOn(globalThis, 'open').mockImplementation(() => null);
      mockGetDelegateAuthRequest.mockResolvedValue({
        authToken: [{ _content: 'token-1' }],
      });
      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useDelegateAuth(), { wrapper });

      result.current.mutate('res-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(openSpy).toHaveBeenCalledWith(
        expect.stringContaining('authtoken=token-1'),
        'blank',
      );
      openSpy.mockRestore();
    });

    it('shows an error snackbar when no auth token is returned', async () => {
      mockGetDelegateAuthRequest.mockResolvedValue({});
      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useDelegateAuth(), { wrapper });

      result.current.mutate('res-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockCreateSnackbar).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    });

    it('shows an error snackbar when delegate auth fails', async () => {
      mockGetDelegateAuthRequest.mockRejectedValue(new Error('Auth failed'));
      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useDelegateAuth(), { wrapper });

      result.current.mutate('res-1');

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(mockCreateSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error', label: 'Auth failed' }),
      );
    });
  });
});

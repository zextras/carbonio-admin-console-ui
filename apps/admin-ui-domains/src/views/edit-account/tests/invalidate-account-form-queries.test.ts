/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

import { domainQueryKeys } from '../../../services/domain-query-keys';
import { invalidateAccountFormQueries } from '../invalidate-account-form-queries';

describe('invalidateAccountFormQueries', () => {
  it('invalidates merged account, core attributes, and account-specific detail caches', () => {
    const queryClient = {
      invalidateQueries: vi.fn(),
    } as unknown as QueryClient;

    invalidateAccountFormQueries(queryClient, 'acc-123');

    expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(3);
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: domainQueryKeys.accountDetail('acc-123'),
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: domainQueryKeys.accountCoreAttributes('acc-123'),
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: domainQueryKeys.accountSpecificDetail('acc-123'),
    });
  });
});

/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { type Action } from '../../../../types';
import { useActions } from '../hooks';
import { useIntegrationsStore } from '../store';

describe('useActions', () => {
  afterEach(() => {
    useIntegrationsStore.setState({ actions: {} });
    vi.restoreAllMocks();
  });

  it('builds the actions registered for a type with the given target', () => {
    useIntegrationsStore.getState().registerActions({
      id: 'open',
      type: 'account',
      action: (target: unknown) => ({ id: `open-${target}`, label: 'Open' }) as unknown as Action,
    });

    const { result } = renderHook(() => useActions('acc-1', 'account'));

    expect(result.current).toEqual([{ id: 'open-acc-1', label: 'Open' }]);
  });

  it('skips factories that throw or return nothing', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    useIntegrationsStore.getState().registerActions(
      {
        id: 'broken',
        type: 'account',
        action: () => {
          throw new Error('factory failure');
        },
      },
      {
        id: 'empty',
        type: 'account',
        action: () => undefined as unknown as Action,
      },
      {
        id: 'ok',
        type: 'account',
        action: () => ({ id: 'ok', label: 'Ok' }) as unknown as Action,
      },
    );

    const { result } = renderHook(() => useActions('acc-1', 'account'));

    expect(result.current).toEqual([{ id: 'ok', label: 'Ok' }]);
    expect(consoleError).toHaveBeenCalledWith(expect.any(Error));
  });

  it('returns an empty array when no action is registered for the type', () => {
    const { result } = renderHook(() => useActions('acc-1', 'unknown'));

    expect(result.current).toEqual([]);
  });
});

/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { renderHook } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  type CreateSnackbarFn,
  SnackbarManagerContext,
} from '../../components/utilities/SnackbarManager';
import { useSnackbar } from './useSnackbar';

describe('useSnackbar', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the createSnackbar function from the context', () => {
    const createSnackbar = vi.fn() as unknown as CreateSnackbarFn;
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SnackbarManagerContext.Provider value={createSnackbar}>
        {children}
      </SnackbarManagerContext.Provider>
    );

    const { result } = renderHook(() => useSnackbar(), { wrapper });

    expect(result.current).toBe(createSnackbar);
  });

  it('falls back to a function that logs an error when there is no manager', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const { result } = renderHook(() => useSnackbar());
    const close = result.current({ key: 'k', label: 'hello' });

    expect(consoleError).toHaveBeenCalledWith('snackbar manager context not initialized');
    expect(close()).toBeUndefined();
  });
});

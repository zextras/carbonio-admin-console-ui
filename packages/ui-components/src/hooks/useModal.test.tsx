/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { renderHook } from '@testing-library/react';
import React from 'react';
import { beforeEach,describe, expect, it, vi } from 'vitest';

import { ModalManager } from '../components/utilities/ModalManager';
import { ThemeProvider } from '../theme/theme-context-provider';
import { useModal } from './useModal';

vi.mock('react-dom', async () => {
  const actual = await vi.importActual<typeof import('react-dom')>('react-dom');
  return {
    ...actual,
    createPortal: (node: React.ReactNode): React.ReactPortal => node as React.ReactPortal,
  };
});

const modalContextError = 'Modal manager context not initialized';

beforeEach(() => {
  const originalErrorFn = console.error;
  console.error = vi.fn((...args: Parameters<typeof console.error>) => {
    // silence error for snackbar
    if (args[0] !== modalContextError) {
      originalErrorFn(...args);
    }
  });
});

describe('useModal', () => {
  it('should return a defined function which logs an error if no manager has been set', () => {
    const { result } = renderHook(useModal, {
      wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
    });
    expect(result.current).toBeDefined();
    result.current.createModal({ id: 'id' });
    expect(console.error).toHaveBeenCalledWith(modalContextError);
  });

  it('should return a defined function if a manager has been set', () => {
    const { result } = renderHook(useModal, {
      wrapper: ({ children }) => (
        <ThemeProvider>
          <ModalManager>{children}</ModalManager>
        </ThemeProvider>
      ),
    });
    expect(result.current).toBeDefined();
    result.current.createModal({ id: 'id' });
    expect(console.error).not.toHaveBeenCalledWith(modalContextError);
  });
});

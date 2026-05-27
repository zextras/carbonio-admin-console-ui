/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../../../services/use-core-attributes', () => ({
  useCoreAttributes: () => ({
    data: {
      attributes: {
        backupEnabled: [{ value: true }],
        backupSelfUndeleteAllowed: [{ value: false }],
      },
    },
  }),
}));

vi.mock('@zextras/ui-shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@zextras/ui-shared')>();
  return { ...actual, setCoreAttributes: vi.fn() };
});

import { useCosBackupState } from '../use-cos-backup-state';

describe('useCosBackupState', () => {
  it('isDirty is false by default', () => {
    const { result } = renderHook(() =>
      useCosBackupState({ cosName: 'default', isAdvanced: true }),
    );
    expect(result.current.isDirty).toBe(false);
  });

  it('reflects server-side attribute values', () => {
    const { result } = renderHook(() =>
      useCosBackupState({ cosName: 'default', isAdvanced: true }),
    );
    expect(result.current.attributes.backupEnabled).toBe(true);
    expect(result.current.attributes.backupSelfUndeleteAllowed).toBe(false);
  });

  it('isDirty is true after changeAttribute toggles from server value', () => {
    const { result } = renderHook(() =>
      useCosBackupState({ cosName: 'default', isAdvanced: true }),
    );
    act(() => result.current.changeAttribute('backupEnabled'));
    expect(result.current.isDirty).toBe(true);
  });

  it('isDirty is false after toggling back to server value', () => {
    const { result } = renderHook(() =>
      useCosBackupState({ cosName: 'default', isAdvanced: true }),
    );
    act(() => result.current.changeAttribute('backupEnabled')); // toggle away
    act(() => result.current.changeAttribute('backupEnabled')); // toggle back
    expect(result.current.isDirty).toBe(false);
  });

  it('isDirty is false after reset', () => {
    const { result } = renderHook(() =>
      useCosBackupState({ cosName: 'default', isAdvanced: true }),
    );
    act(() => result.current.changeAttribute('backupEnabled'));
    act(() => result.current.reset());
    expect(result.current.isDirty).toBe(false);
  });
});

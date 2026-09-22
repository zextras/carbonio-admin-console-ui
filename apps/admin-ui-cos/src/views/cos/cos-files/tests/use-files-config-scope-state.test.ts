/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../../services/use-invalidate-files-config', () => ({
  useInvalidateFilesConfig: () => vi.fn(),
}));
vi.mock('../../../../services/set-files-config', () => ({ setFilesConfigOverride: vi.fn() }));
vi.mock('../../../../services/delete-files-config', () => ({ deleteFilesConfigOverride: vi.fn() }));

import { deleteFilesConfigOverride } from '../../../../services/delete-files-config';
import { setFilesConfigOverride } from '../../../../services/set-files-config';
import { useFilesConfigScopeState } from '../use-files-config-scope-state';

const baseParams = { scope: 'cos' as const, id: 'cos-1', key: 'shares-enabled' };

describe('useFilesConfigScopeState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(setFilesConfigOverride).mockResolvedValue({ type: 'success' });
    vi.mocked(deleteFilesConfigOverride).mockResolvedValue({ type: 'success' });
  });

  describe('with no override on the server', () => {
    it('is clean and inherited by default', () => {
      const { result } = renderHook(() =>
        useFilesConfigScopeState({ ...baseParams, initialOverride: undefined }),
      );
      expect(result.current.value).toBeUndefined();
      expect(result.current.hasOverride).toBe(false);
      expect(result.current.isDirty).toBe(false);
    });

    it('setValue creates a dirty override', () => {
      const { result } = renderHook(() =>
        useFilesConfigScopeState({ ...baseParams, initialOverride: undefined }),
      );
      act(() => result.current.setValue('true'));
      expect(result.current.value).toBe('true');
      expect(result.current.hasOverride).toBe(true);
      expect(result.current.isDirty).toBe(true);
    });

    it('clear discards a locally-set override without a delete call', () => {
      const { result } = renderHook(() =>
        useFilesConfigScopeState({ ...baseParams, initialOverride: undefined }),
      );
      act(() => result.current.setValue('true'));
      act(() => result.current.clear());
      expect(result.current.value).toBeUndefined();
      expect(result.current.isDirty).toBe(false);
    });

    it('save issues a PUT with the set value', async () => {
      const { result } = renderHook(() =>
        useFilesConfigScopeState({ ...baseParams, initialOverride: undefined }),
      );
      act(() => result.current.setValue('false'));
      await act(async () => {
        await result.current.save();
      });
      expect(setFilesConfigOverride).toHaveBeenCalledWith('cos', 'cos-1', 'shares-enabled', 'false');
      expect(deleteFilesConfigOverride).not.toHaveBeenCalled();
    });
  });

  describe('with an override on the server', () => {
    it('reflects the override and is clean by default', () => {
      const { result } = renderHook(() =>
        useFilesConfigScopeState({ ...baseParams, initialOverride: 'true' }),
      );
      expect(result.current.value).toBe('true');
      expect(result.current.hasOverride).toBe(true);
      expect(result.current.isDirty).toBe(false);
    });

    it('clear marks the override for removal (revert to inherited)', () => {
      const { result } = renderHook(() =>
        useFilesConfigScopeState({ ...baseParams, initialOverride: 'true' }),
      );
      act(() => result.current.clear());
      expect(result.current.value).toBeUndefined();
      expect(result.current.hasOverride).toBe(false);
      expect(result.current.isDirty).toBe(true);
    });

    it('save issues a DELETE after clear', async () => {
      const { result } = renderHook(() =>
        useFilesConfigScopeState({ ...baseParams, initialOverride: 'true' }),
      );
      act(() => result.current.clear());
      await act(async () => {
        await result.current.save();
      });
      expect(deleteFilesConfigOverride).toHaveBeenCalledWith('cos', 'cos-1', 'shares-enabled');
      expect(setFilesConfigOverride).not.toHaveBeenCalled();
    });

    it('reset restores the server value', () => {
      const { result } = renderHook(() =>
        useFilesConfigScopeState({ ...baseParams, initialOverride: 'true' }),
      );
      act(() => result.current.setValue('false'));
      act(() => result.current.reset());
      expect(result.current.value).toBe('true');
      expect(result.current.isDirty).toBe(false);
    });
  });

  it('save is a no-op when not dirty', async () => {
    const { result } = renderHook(() =>
      useFilesConfigScopeState({ ...baseParams, initialOverride: 'true' }),
    );
    let outcome: { type: string } | undefined;
    await act(async () => {
      outcome = await result.current.save();
    });
    await waitFor(() => expect(outcome?.type).toBe('noop'));
    expect(setFilesConfigOverride).not.toHaveBeenCalled();
    expect(deleteFilesConfigOverride).not.toHaveBeenCalled();
  });
});

/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useRef, useState } from 'react';

import { deleteFilesConfigOverride } from '../services/delete-files-config';
import { FilesConfigScope } from '../services/get-files-config-raw';
import { setFilesConfigOverride } from '../services/set-files-config';
import { useInvalidateFilesConfig } from '../services/use-invalidate-files-config';

type Params = {
  scope: FilesConfigScope;
  id: string | undefined;
  key: string;
  /** The value overridden AT this scope on the server, or undefined when there is no override here. */
  initialOverride: string | undefined;
};

type SaveResult = { type: 'success' } | { type: 'error'; error: string } | { type: 'noop' };

type UseFilesConfigScopeState = {
  /** The value persisted for the switch: the effective override at this scope, or undefined when inherited. */
  value: string | undefined;
  /** Whether an override is (or will be) set at this scope — drives the revert affordance. */
  hasOverride: boolean;
  isDirty: boolean;
  setValue: (value: string) => void;
  clear: () => void;
  reset: () => void;
  save: () => Promise<SaveResult>;
};

/**
 * Manages the local edit state of a single per-scope override, mirroring the powerstore
 * quota state hook (`use-cos-quota-state`): a local override that can be a value (set),
 * `null` (revert to inherited) or `undefined` (reflect the server), with its own save.
 */
export function useFilesConfigScopeState({
  scope,
  id,
  key,
  initialOverride,
}: Params): UseFilesConfigScopeState {
  const invalidate = useInvalidateFilesConfig();
  const [override, setOverride] = useState<string | null | undefined>(undefined);
  // Idempotency guard: a single Save must never issue more than one in-flight write.
  const savingRef = useRef(false);

  const effectiveOverride =
    override === undefined ? initialOverride : override === null ? undefined : override;

  const hasOverride = effectiveOverride !== undefined;
  const isDirty = effectiveOverride !== initialOverride;

  function setValue(value: string): void {
    setOverride(value);
  }

  function clear(): void {
    setOverride(initialOverride === undefined ? undefined : null);
  }

  function reset(): void {
    setOverride(undefined);
  }

  async function save(): Promise<SaveResult> {
    if (!id || !isDirty || savingRef.current) {
      return { type: 'noop' };
    }
    savingRef.current = true;
    try {
      const res =
        effectiveOverride === undefined
          ? await deleteFilesConfigOverride(scope, id, key)
          : await setFilesConfigOverride(scope, id, key, effectiveOverride);
      if (res.type === 'success') {
        invalidate(scope, id);
        setOverride(undefined);
      }
      return res;
    } finally {
      savingRef.current = false;
    }
  }

  return { value: effectiveOverride, hasOverride, isDirty, setValue, clear, reset, save };
}

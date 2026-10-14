/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useRef, useState } from 'react';

import { deleteFilesConfigOverride } from '../../../services/delete-files-config';
import { FilesConfigScope } from '../../../services/get-files-config-raw';
import { setFilesConfigOverride } from '../../../services/set-files-config';
import { useInvalidateFilesConfig } from '../../../services/use-invalidate-files-config';

type Params = {
  scope: FilesConfigScope;
  id: string | undefined;
  key: string;
  initialOverride: string | undefined;
};

type SaveResult = { type: 'success' } | { type: 'error'; error: string } | { type: 'noop' };

type UseFilesConfigScopeState = {
  value: string | undefined;
  hasOverride: boolean;
  isDirty: boolean;
  setValue: (value: string) => void;
  clear: () => void;
  reset: () => void;
  save: () => Promise<SaveResult>;
};

export function useFilesConfigScopeState({
  scope,
  id,
  key,
  initialOverride,
}: Params): UseFilesConfigScopeState {
  const invalidate = useInvalidateFilesConfig();
  const [override, setOverride] = useState<string | null | undefined>(undefined);
  // FormPageLayout's Save button fires onSave twice per click; guard against a double write.
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

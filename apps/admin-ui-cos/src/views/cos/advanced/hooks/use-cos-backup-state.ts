/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { setCoreAttributes } from '@zextras/ui-shared';
import { useState } from 'react';

import {
  BACKUP_ENABLED,
  BACKUP_SELF_UNDELETE_ALLOWED,
  COS,
} from '../../../../constants';
import { useCoreAttributes } from '../../../../services/use-core-attributes';

type AdvancedBackupAttributes = {
  [BACKUP_ENABLED]: boolean | undefined;
  [BACKUP_SELF_UNDELETE_ALLOWED]: boolean | undefined;
};

type AdvancedBackupAttributesKeys = keyof AdvancedBackupAttributes;

function isBackupAttribute(key: string): key is AdvancedBackupAttributesKeys {
  return key === BACKUP_ENABLED || key === BACKUP_SELF_UNDELETE_ALLOWED;
}

type Params = {
  cosName: string | undefined;
  isAdvanced: boolean;
};

type Return = {
  attributes: AdvancedBackupAttributes;
  changeAttribute: (key: AdvancedBackupAttributesKeys) => void;
  isDirty: boolean;
  save: (cosName: string | undefined) => void;
  reset: () => void;
};

export function useCosBackupState({ cosName, isAdvanced }: Params): Return {
  const [backupOverrides, setBackupOverrides] = useState<Partial<AdvancedBackupAttributes>>({});

  const coreAttributesBody =
    isAdvanced && cosName
      ? [
          {
            configType: COS,
            configName: [cosName],
            attrName: [BACKUP_SELF_UNDELETE_ALLOWED, BACKUP_ENABLED],
          },
        ]
      : [];

  const { data: coreAttributesData } = useCoreAttributes(coreAttributesBody);

  const attributes: AdvancedBackupAttributes = {
    [BACKUP_ENABLED]:
      backupOverrides[BACKUP_ENABLED] ??
      !!coreAttributesData?.attributes?.[BACKUP_ENABLED]?.[0]?.value,
    [BACKUP_SELF_UNDELETE_ALLOWED]:
      backupOverrides[BACKUP_SELF_UNDELETE_ALLOWED] ??
      !!coreAttributesData?.attributes?.[BACKUP_SELF_UNDELETE_ALLOWED]?.[0]?.value,
  };

  function changeAttribute(key: AdvancedBackupAttributesKeys): void {
    const newValue = !attributes[key];
    const serverValue = !!coreAttributesData?.attributes?.[key]?.[0]?.value;
    if (newValue === serverValue) {
      setBackupOverrides((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } else {
      setBackupOverrides((prev) => ({ ...prev, [key]: newValue }));
    }
  }

  const isDirty = Object.keys(backupOverrides).length > 0;

  function save(name: string | undefined): void {
    const updateBackupAttributes = Object.keys(attributes).reduce(
      (acc, key) => {
        if (isBackupAttribute(key) && attributes[key] !== undefined) {
          return {
            ...acc,
            [key]: { value: attributes[key], objectName: name, configType: COS },
          };
        }
        return acc;
      },
      {} as Record<string, unknown>,
    );
    if (Object.keys(updateBackupAttributes).length > 0) {
      setCoreAttributes(updateBackupAttributes);
    }
  }

  function reset(): void {
    setBackupOverrides({});
  }

  return { attributes, changeAttribute, isDirty, save, reset };
}

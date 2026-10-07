/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PlainSelect } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { isInheritedOverridden } from './is-inherited-overridden';
import { RevertToInheritedIcon } from './revert-to-inherited-icon';

type PrefSelectItem = { value: string; label: string };

type InheritedPrefSelectProps = {
  readonly label: string;
  readonly selectName: string;
  readonly items: Array<PrefSelectItem>;
  readonly values: Record<string, any>;
  readonly cosDetail?: Record<string, any>;
  readonly accSpecificDetail?: Record<string, any>;
  readonly onChange: (value: string) => void;
  readonly setEmptyValue: (keyName: string) => void;
  readonly disabled?: boolean;
};

export const InheritedPrefSelect = ({
  label,
  selectName,
  items,
  values,
  cosDetail,
  accSpecificDetail,
  onChange,
  setEmptyValue,
  disabled,
}: InheritedPrefSelectProps) => {
  const [t] = useTranslation();
  const liveValue = values?.[selectName] as string | undefined;
  const accountValue = accSpecificDetail?.[selectName] as string | undefined;
  const inheritedValue = cosDetail?.[selectName] as string | undefined;
  const isOverridden = isInheritedOverridden(liveValue, accountValue, inheritedValue);

  const effectiveValue = liveValue ?? inheritedValue;
  const selectItems =
    effectiveValue !== undefined && !items.some((item) => item.value === effectiveValue)
      ? [...items, { label: effectiveValue, value: effectiveValue }]
      : items;

  return (
    <PlainSelect
      label={label}
      items={selectItems}
      selection={
        selectItems.find((item) => item.value === liveValue) ??
        selectItems.find((item) => item.value === inheritedValue) ??
        selectItems[0] ?? { label: '', value: '' }
      }
      onChange={onChange}
      disabled={disabled}
      description={
        isOverridden
          ? undefined
          : t('label.inherited_from_cos', 'Inherited from the Class of Service')
      }
      icon={
        isOverridden ? (
          <RevertToInheritedIcon
            label={t('label.click_to_revert', 'Click to revert to the inherited value')}
            onClick={(): void => setEmptyValue(selectName)}
          />
        ) : undefined
      }
    />
  );
};

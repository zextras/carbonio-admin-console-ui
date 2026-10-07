/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { AnyFormApi } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import { PlainInput } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import type { themeConfigStore } from '../../../types';
import { RevertToInheritedIcon } from '../../views/utility/revert-to-inherited-icon';

type ThemeFieldInputProps = {
  form: AnyFormApi;
  name: keyof themeConfigStore;
  label: string;
  globalTheme?: themeConfigStore;
  isGlobalTheme?: boolean;
  hasModifyRights?: boolean;
  /** i18n key shown inline when the field fails schema validation. */
  errorLabel?: string;
  errorLabelDefault?: string;
};

export const ThemeFieldInput = ({
  form,
  name,
  label,
  globalTheme,
  isGlobalTheme = false,
  hasModifyRights = true,
  errorLabel,
  errorLabelDefault,
}: ThemeFieldInputProps) => {
  const [t] = useTranslation();
  const value = useSelector(form.store, (s) => (s.values as themeConfigStore)[name]);
  const hasError = useSelector(
    form.store,
    (s) =>
      ((s.fieldMeta as Record<string, { errors: Array<unknown> }>)[name]?.errors.length ?? 0) > 0,
  );

  const isInheritedMode = globalTheme !== undefined;
  const isOverridden = isInheritedMode && value !== undefined;

  return (
    <PlainInput
      label={label}
      name={name}
      autoComplete="off"
      value={value ?? globalTheme?.[name] ?? ''}
      onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
        form.setFieldValue(name, e.target.value);
      }}
      hasError={hasError}
      description={
        hasError && errorLabel && errorLabelDefault
          ? t(errorLabel, errorLabelDefault)
          : isInheritedMode && !isOverridden
            ? t(
                'label.inherited_from_global_configuration',
                'Inherited from the global configuration',
              )
            : undefined
      }
      disabled={isGlobalTheme && !hasModifyRights}
      icon={
        isOverridden ? (
          <RevertToInheritedIcon
            label={t(
              'label.click_to_revert_to_the_inherited_value',
              'Click to revert to the inherited value',
            )}
            onClick={(): void => {
              form.setFieldValue(name, undefined);
            }}
          />
        ) : undefined
      }
    />
  );
};

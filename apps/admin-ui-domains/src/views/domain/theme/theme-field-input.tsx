/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { AnyFormApi } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import { InheritedInput } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import type { themeConfigStore } from '../../../../types';

type ThemeFieldInputProps = {
  form: AnyFormApi;
  name: keyof themeConfigStore & string;
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

  return (
    <>
      <InheritedInput
        label={label}
        subValue={value}
        inheritedValue={globalTheme?.[name]}
        fromSubValue={globalTheme ? value : ''}
        inputName={name}
        onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
          form.setFieldValue(name, e.target.value);
        }}
        onChangeReset={(): void => {
          form.setFieldValue(name, undefined);
        }}
        hasError={hasError}
        disabled={isGlobalTheme && !hasModifyRights}
      />
      {hasError && errorLabel && errorLabelDefault && (
        <ds-text as="span" size="extrasmall" weight="regular" color="error">
          {t(errorLabel, errorLabelDefault)}
        </ds-text>
      )}
    </>
  );
};

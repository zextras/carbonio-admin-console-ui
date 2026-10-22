/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { AnyFormApi } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import { TextInput } from '@zextras/ui-components';
import { isSameOriginUrlOutsideProxyAllowlist } from '@zextras/ui-shared';
import type { TFunction } from 'i18next';
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
  /** When true, shows a non-blocking warning if the value is a same-origin URL outside the proxy embedded-resource allowlist. */
  warnWhenProxyBlocked?: boolean;
};

function resolveFieldDescription(
  t: TFunction,
  errorLabel: string | undefined,
  errorLabelDefault: string | undefined,
): string | undefined {
  return errorLabel && errorLabelDefault ? t(errorLabel, errorLabelDefault) : undefined;
}

export const ThemeFieldInput = ({
  form,
  name,
  label,
  globalTheme,
  isGlobalTheme = false,
  hasModifyRights = true,
  errorLabel,
  errorLabelDefault,
  warnWhenProxyBlocked = false,
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

  const effectiveValue = value ?? globalTheme?.[name] ?? '';
  const proxyBlocked =
    warnWhenProxyBlocked && isSameOriginUrlOutsideProxyAllowlist(effectiveValue);
  const schemaDescription = hasError
    ? resolveFieldDescription(t, errorLabel, errorLabelDefault)
    : undefined;
  const description =
    schemaDescription ??
    (proxyBlocked
      ? t(
          'label.proxy_blocked_url_blocked_warning',
          'Warning: this URL points to this server outside the allowed asset paths. Move it to an external origin or under /static/, otherwise the proxy will block it and the image will not load.',
        )
      : undefined);
  const chip =
    isInheritedMode && !isOverridden && !description
      ? t('label.inherited', 'Inherited')
      : undefined;

  return (
    <TextInput
      label={label}
      name={name}
      autoComplete="off"
      value={value ?? globalTheme?.[name] ?? ''}
      onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
        form.setFieldValue(name, e.target.value);
      }}
      hasError={hasError}
      description={description}
      chip={chip}
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

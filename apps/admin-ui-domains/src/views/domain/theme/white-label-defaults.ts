/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ConfigAttribute } from '@zextras/ui-shared';

import type { themeConfigStore } from '../../../../types/domain';

/**
 * Global white-label defaults applied to every attribute that is not set in
 * the global config. Also used as the payload that resets the settings.
 */
export const WHITE_LABEL_DEFAULTS = {
  carbonioWebUiDarkMode: 'FALSE',
  carbonioWebUiLoginLogo: '',
  carbonioWebUiDarkLoginLogo: '',
  carbonioWebUiLoginBackground: '',
  carbonioWebUiDarkLoginBackground: '',
  carbonioWebUiAppLogo: '',
  carbonioWebUiDarkAppLogo: '',
  carbonioWebUiFavicon: '',
  carbonioWebUiTitle: '',
  carbonioWebUiDescription: '',
  carbonioAdminUiLoginLogo: '',
  carbonioAdminUiDarkLoginLogo: '',
  carbonioAdminUiAppLogo: '',
  carbonioAdminUiDarkAppLogo: '',
  carbonioAdminUiBackground: '',
  carbonioAdminUiDarkBackground: '',
  carbonioAdminUiFavicon: '',
  carbonioAdminUiTitle: '',
  carbonioAdminUiDescription: '',
  carbonioLogoUrl: '',
  carbonioWebUiPrimaryColor: '',
  carbonioWebUiDarkPrimaryColor: '',
  carbonioWebUILoginURL: '',
  carbonioWebUILogoutURL: '',
  carbonioAdminUILoginURL: '',
  carbonioAdminUILogoutURL: '',
  carbonioAdminDocumentationUrl: '',
} as const;

/**
 * Merges config attributes over the white-label defaults, keeping the
 * default value for attributes that are unset or empty.
 */
export function buildWhiteLabelConfig(items: Array<ConfigAttribute>): themeConfigStore {
  const config: Record<string, string> = { ...WHITE_LABEL_DEFAULTS };
  items.forEach((item) => {
    if (item.n in config && item._content) {
      config[item.n] = item._content;
    }
  });
  return config as themeConfigStore;
}

/** Attributes payload that resets every white-label setting to its default. */
export function buildWhiteLabelResetAttributes(): Array<ConfigAttribute> {
  return Object.entries(WHITE_LABEL_DEFAULTS).map(([n, _content]) => ({ n, _content }));
}

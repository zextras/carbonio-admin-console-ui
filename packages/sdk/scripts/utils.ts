/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const VENDORABLE_DEPS: Record<string, string> = {
  react: 'index.mjs',
  'react-dom': 'client.mjs',
  'lodash-es': 'lodash.mjs',
  'styled-components': 'styled-components.browser.esm.mjs',
  i18next: 'i18next.mjs',
  'react-i18next': 'react-i18next.mjs',
  '@tanstack/react-query': 'react-query.mjs',
  'react-router-dom': 'react-router-dom.mjs',
  zustand: 'zustand.mjs',
};

export function getSharedDependencyPaths(commitHash: string): Record<string, string> {
  return Object.fromEntries(
    Object.entries(VENDORABLE_DEPS).map(([name, file]) => [
      name,
      `/static/iris/shared-dependencies/${commitHash}/${file}`,
    ]),
  );
}

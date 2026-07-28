/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { useTranslation } from 'react-i18next';

import type { CrumbMenuItem } from './page-header';

type TranslateFn = ReturnType<typeof useTranslation>[0];

export type SectionRoute = { id: string; labelKey: string; labelDefault: string };

export function buildSectionMenu(
  basePath: string,
  sections: Array<SectionRoute>,
  t: TranslateFn,
): Array<CrumbMenuItem> {
  return sections
    .filter(({ id }) => id !== '')
    .map(({ id, labelKey, labelDefault }) => ({
      path: `${basePath}/${id}`,
      label: t(labelKey, labelDefault),
    }));
}

export function getSegmentAfterBase(pathname: string, basePath: string): string | undefined {
  const prefix = `${basePath}/`;
  return pathname.startsWith(prefix)
    ? pathname.substring(prefix.length).split('/')[0]
    : undefined;
}

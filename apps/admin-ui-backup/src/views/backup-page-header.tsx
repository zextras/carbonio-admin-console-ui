/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { buildSectionMenu, PageHeader } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

import { SECTION_ROUTES } from './backup/backup-section-routes';

export const BackupPageHeader = () => {
  const [t] = useTranslation();
  const { pathname } = useLocation();
  const appBase = `/${pathname.split('/').filter(Boolean).slice(0, 2).join('/')}`;

  const topLevelRoutes = SECTION_ROUTES.filter((r) => !r.prefix);
  const serverRoutes = SECTION_ROUTES.filter((r) => r.prefix);

  const topLevelSections = buildSectionMenu(appBase, topLevelRoutes, t);

  const relativeSegments = pathname.startsWith(`${appBase}/`)
    ? pathname.substring(appBase.length + 1).split('/')
    : [];
  const segmentAfterBase = relativeSegments[0] || undefined;
  const deeperSegment = relativeSegments[1] || undefined;

  const isServerRoute = Boolean(deeperSegment) && serverRoutes.some((r) => r.id === deeperSegment);
  const isTopLevelSection = topLevelSections.some((s) => s.path === pathname);

  const serverSectionMenu =
    isServerRoute && serverRoutes.length > 1
      ? buildSectionMenu(`${appBase}/${segmentAfterBase}`, serverRoutes, t)
      : undefined;
  const topLevelSectionMenu = isTopLevelSection ? topLevelSections : undefined;
  const sectionMenu = serverSectionMenu ?? topLevelSectionMenu;

  const crumbMenus = sectionMenu ? { [pathname]: sectionMenu } : undefined;
  const nonNavigableSegments = isServerRoute && segmentAfterBase ? [segmentAfterBase] : undefined;
  const labelOverrides =
    isServerRoute && segmentAfterBase ? { [segmentAfterBase]: segmentAfterBase } : undefined;
  const crumbMenuHeaders =
    isServerRoute && segmentAfterBase ? { [pathname]: segmentAfterBase } : undefined;

  return (
    <PageHeader
      crumbMenus={crumbMenus}
      crumbMenuHeaders={crumbMenuHeaders}
      labelOverrides={labelOverrides}
      nonNavigableSegments={nonNavigableSegments}
    />
  );
};

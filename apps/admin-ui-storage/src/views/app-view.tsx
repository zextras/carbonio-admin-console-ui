/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Breadcrumbs, Container, type CrumbMenuItem } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes, useLocation } from 'react-router';

import { SERVERS_LIST } from '../constants';
import { StorageLayout } from './storage-layout';
import { SECTION_ROUTES } from './storage-section-routes';

type SectionRoute = { id: string; labelKey: string; labelDefault: string };

function buildSectionMenu(
  basePath: string,
  sections: Array<SectionRoute>,
  t: ReturnType<typeof useTranslation>[0],
): Array<CrumbMenuItem> {
  return sections.map(({ id, labelKey, labelDefault }) => ({
    path: `${basePath}/${id}`,
    label: t(labelKey, labelDefault),
  }));
}

export const AppView = () => {
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

  const isServerRoute =
    Boolean(deeperSegment) && serverRoutes.some((r) => r.id === deeperSegment);
  const isTopLevelSection = topLevelSections.some((s) => s.path === pathname);

  const sectionMenu =
    isServerRoute && serverRoutes.length > 1
      ? buildSectionMenu(`${appBase}/${segmentAfterBase}`, serverRoutes, t)
    : isTopLevelSection
      ? topLevelSections
      : undefined;

  const crumbMenus = sectionMenu ? { [pathname]: sectionMenu } : undefined;
  const nonNavigableSegments =
    isServerRoute && segmentAfterBase ? [segmentAfterBase] : undefined;

  return (
    <Container>
      <Breadcrumbs crumbMenus={crumbMenus} nonNavigableSegments={nonNavigableSegments} />
      <Routes>
        <Route element={<StorageLayout />}>
          <Route index element={<Navigate to={SERVERS_LIST} replace />} />
          {SECTION_ROUTES.map(({ id, prefix, Component }) => (
            <Route key={id} path={prefix ? `${prefix}/${id}` : id} element={<Component />} />
          ))}
          <Route path="*" element={null} />
        </Route>
      </Routes>
    </Container>
  );
};

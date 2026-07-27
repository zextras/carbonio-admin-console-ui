/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Breadcrumbs, buildSectionMenu, Container } from '@zextras/ui-components';
import { useDetailViewMaxWidth } from '@zextras/ui-shared';
import { FC, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes, useLocation } from 'react-router';

import { MTADetailPanel } from './mta/mta-detail-panel';
import MTAListPanel from './mta/mta-list-panel';
import { SECTION_ROUTES } from './mta/mta-section-routes';

export const AppView: FC = () => {
  const [t] = useTranslation();
  const { pathname } = useLocation();
  const detailViewMaxWidth = useDetailViewMaxWidth();
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

  const serverSectionMenu =
    isServerRoute && serverRoutes.length > 1
      ? buildSectionMenu(`${appBase}/${segmentAfterBase}`, serverRoutes, t)
      : undefined;
  const topLevelSectionMenu = isTopLevelSection ? topLevelSections : undefined;
  const sectionMenu = serverSectionMenu ?? topLevelSectionMenu;

  const crumbMenus = sectionMenu ? { [pathname]: sectionMenu } : undefined;
  const nonNavigableSegments =
    isServerRoute && segmentAfterBase ? [segmentAfterBase] : undefined;

  return (
    <Container height={'fit'}>
      <Breadcrumbs crumbMenus={crumbMenus} nonNavigableSegments={nonNavigableSegments} />
      <Routes>
        <Route
          path={'/*'}
          element={
            <Container orientation="horizontal" mainAlignment="flex-start">
              <Container style={{ maxWidth: '16.563rem' }}>
                <Suspense fallback={<ds-spinner />}>
                  <MTAListPanel />
                </Suspense>
              </Container>
              <Container style={{ maxWidth: '100%' }}>
                <Container
                  style={{ maxWidth: detailViewMaxWidth, transition: 'max-width 300ms' }}
                >
                  <Suspense fallback={<ds-spinner />}>
                    <MTADetailPanel />
                  </Suspense>
                </Container>
              </Container>
            </Container>
          }
        />
      </Routes>
    </Container>
  );
};


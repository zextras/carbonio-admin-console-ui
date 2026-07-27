/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Breadcrumbs, Container, type CrumbMenuItem } from '@zextras/ui-components';
import { useDetailViewMaxWidth } from '@zextras/ui-shared';
import { FC, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes, useLocation } from 'react-router';

import BackupDetailPanel from './backup/backup-detail-panel';
import BackupListPanel from './backup/backup-list-panel';
import { SECTION_ROUTES } from './backup/backup-section-routes';

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
    <Container height={'fit'}>
      <Breadcrumbs crumbMenus={crumbMenus} nonNavigableSegments={nonNavigableSegments} />
      <Routes>
        <Route
          path={'/*'}
          element={
            <Container
              orientation="horizontal"
              mainAlignment="flex-start"
              style={{ overflow: 'hidden' }}
            >
              <Container style={{ maxWidth: '265px' }}>
                <Suspense fallback={<ds-spinner></ds-spinner>}>
                  <BackupListPanel />
                </Suspense>
              </Container>
              <Container style={{ maxWidth: '100%' }}>
                <Container style={{ maxWidth: detailViewMaxWidth, transition: 'width 300ms' }}>
                  <Suspense fallback={<ds-spinner></ds-spinner>}>
                    <BackupDetailPanel />
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


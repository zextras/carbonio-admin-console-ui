/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { buildSectionMenu, PageHeader } from '@zextras/ui-components';
import { useDetailViewMaxWidth } from '@zextras/ui-shared';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes, useLocation } from 'react-router';

import styles from './app-view.module.css';
import { MTADetailPanel } from './mta/mta-detail-panel';
import { MTAListPanel } from './mta/mta-list-panel';
import { SECTION_ROUTES } from './mta/mta-section-routes';

export const AppView = () => {
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

  return (
    <div className={styles.root}>
      <PageHeader
        crumbMenus={crumbMenus}
        labelOverrides={labelOverrides}
        nonNavigableSegments={nonNavigableSegments}
      />
      <Routes>
        <Route
          path={'/*'}
          element={
            <div className={styles.layout}>
              <div className={styles.sidebar}>
                <Suspense fallback={<ds-spinner />}>
                  <MTAListPanel />
                </Suspense>
              </div>
              <div className={styles.detailWrapper}>
                <div className={styles.detailContent} style={{ maxWidth: detailViewMaxWidth }}>
                  <Suspense fallback={<ds-spinner />}>
                    <MTADetailPanel />
                  </Suspense>
                </div>
              </div>
            </div>
          }
        />
      </Routes>
    </div>
  );
};

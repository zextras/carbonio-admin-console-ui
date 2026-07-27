/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Breadcrumbs, type CrumbMenuItem } from '@zextras/ui-components';
import { usePrimaryBarState } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';
import { Route, Routes, useLocation } from 'react-router';

import { COS_LIST, COS_ROUTE_ID, CREATE_NEW_COS_ROUTE_ID, MANAGE_APP_ID } from '../constants';
import { useCosDetail } from '../services/use-cos-detail';
import styles from './app-view.module.css';
import { CosDetailPanel } from './cos/cos-detail-panel';
import { CosListPanel } from './cos/cos-list-panel';
import { SECTION_ROUTES } from './cos/cos-section-routes';

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

function getSegmentAfterBase(pathname: string, basePath: string): string | undefined {
  const prefix = `${basePath}/`;
  return pathname.startsWith(prefix)
    ? pathname.substring(prefix.length).split('/')[0]
    : undefined;
}

const NON_COS_ID_SEGMENTS = new Set([CREATE_NEW_COS_ROUTE_ID, COS_LIST]);

export const AppView = () => {
  const [t] = useTranslation();
  const isPrimaryBarExpanded = usePrimaryBarState();

  const { pathname } = useLocation();
  const isCreateNewCos = pathname.includes(CREATE_NEW_COS_ROUTE_ID);

  const cosAppPath = `/${MANAGE_APP_ID}/${COS_ROUTE_ID}`;
  const segmentAfterBase = getSegmentAfterBase(pathname, cosAppPath);
  const isCosId = Boolean(segmentAfterBase) && !NON_COS_ID_SEGMENTS.has(segmentAfterBase!);

  const { data: cosDetail } = useCosDetail(isCosId ? segmentAfterBase : undefined);
  const cosName = cosDetail?.cos?.[0]?.name;

  const sectionMenu =
    isCosId && SECTION_ROUTES.length > 1
      ? buildSectionMenu(`${cosAppPath}/${segmentAfterBase}`, SECTION_ROUTES, t)
      : undefined;

  const crumbMenus = sectionMenu ? { [pathname]: sectionMenu } : undefined;
  const nonNavigableSegments = isCosId && segmentAfterBase ? [segmentAfterBase] : undefined;
  const labelOverrides = cosName && segmentAfterBase ? { [segmentAfterBase]: cosName } : undefined;

  return (
    <div className={styles.root}>
      <Breadcrumbs
        crumbMenus={crumbMenus}
        nonNavigableSegments={nonNavigableSegments}
        labelOverrides={labelOverrides}
      />
      <Routes>
        <Route
          path={'/*'}
          element={
            <div className={styles.layout}>
              {!isCreateNewCos && (
                <div className={styles.sidebar}>
                  <CosListPanel />
                </div>
              )}
              <div className={styles.detailWrapper}>
                <div className={styles.detailContent} data-expanded={isPrimaryBarExpanded}>
                  <CosDetailPanel />
                </div>
              </div>
            </div>
          }
        />
      </Routes>
    </div>
  );
};

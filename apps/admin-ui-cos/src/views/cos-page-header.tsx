/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { buildSectionMenu, getSegmentAfterBase, PageHeader } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

import { COS_LIST, COS_ROUTE_ID, CREATE_NEW_COS_ROUTE_ID, MANAGE_APP_ID } from '../constants';
import { useCosDetail } from '../services/use-cos-detail';
import { useIsWorkspaceEdition } from '../services/use-is-workspace-edition';
import { getVisibleSectionRoutes } from './cos/cos-section-routes';

const NON_COS_ID_SEGMENTS = new Set([CREATE_NEW_COS_ROUTE_ID, COS_LIST]);

export const CosPageHeader = () => {
  const [t] = useTranslation();
  const { pathname } = useLocation();

  const cosAppPath = `/${MANAGE_APP_ID}/${COS_ROUTE_ID}`;
  const segmentAfterBase = getSegmentAfterBase(pathname, cosAppPath);
  const isCosId = Boolean(segmentAfterBase) && !NON_COS_ID_SEGMENTS.has(segmentAfterBase!);

  const { data: cosDetail } = useCosDetail(isCosId ? segmentAfterBase : undefined);
  const cosName = cosDetail?.cos?.[0]?.name;
  const isWorkspaceEdition = useIsWorkspaceEdition(segmentAfterBase);

  const visibleSectionRoutes = getVisibleSectionRoutes(isWorkspaceEdition);
  const sectionMenu =
    isCosId && visibleSectionRoutes.length > 1
      ? buildSectionMenu(`${cosAppPath}/${segmentAfterBase}`, visibleSectionRoutes, t)
      : undefined;

  const crumbMenus = sectionMenu ? { [pathname]: sectionMenu } : undefined;
  const nonNavigableSegments = isCosId && segmentAfterBase ? [segmentAfterBase] : undefined;
  const labelOverrides =
    isCosId && cosName && segmentAfterBase ? { [segmentAfterBase]: cosName } : undefined;
  const loading = isCosId && !cosName;
  const crumbMenuHeaders = isCosId && cosName ? { [pathname]: cosName } : undefined;

  return (
    <PageHeader
      crumbMenus={crumbMenus}
      crumbMenuHeaders={crumbMenuHeaders}
      nonNavigableSegments={nonNavigableSegments}
      labelOverrides={labelOverrides}
      loading={loading}
    />
  );
};

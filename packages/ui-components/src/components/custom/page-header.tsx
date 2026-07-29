/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { DASHBOARD_ROUTE_ID, useLastLoginTimestamp, useUserSettings } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

import { BreadcrumbComponent } from './breadcrumb-component';
import styles from './page-header.module.css';

type BreadcrumbItem = {
  label: string;
  path: string;
  homePath: string;
  segment: string;
};

export type CrumbMenuItem = {
  path: string;
  label: string;
};

export type PageHeaderProps = {
  crumbMenus?: Record<string, Array<CrumbMenuItem>>;
  crumbMenuHeaders?: Record<string, string>;
  nonNavigableSegments?: Array<string>;
  labelOverrides?: Record<string, string>;
  loading?: boolean;
};

const HOME_PATH = `/${DASHBOARD_ROUTE_ID}`;

function dashboardCrumb(
  rootSegment: string,
  t: ReturnType<typeof useTranslation>[0],
): BreadcrumbItem {
  return {
    label: t('label.dashboard', 'Dashboard'),
    path: `/${rootSegment}/dashboard`,
    homePath: HOME_PATH,
    segment: 'dashboard',
  };
}

function buildSplitRoutes(
  pathname: string,
  t: ReturnType<typeof useTranslation>[0],
  labelOverrides?: Record<string, string>,
): Array<BreadcrumbItem> {
  if (!pathname) return [];

  const segments = pathname.substring(1).split('/');

  const items = segments.map((segment, index) => {
    const path = `/${segments.slice(0, index + 1).join('/')}`;
    return {
      label:
        index === 0
          ? t('label.home', 'Home')
          : labelOverrides?.[segment] ??
            /* i18next-extract-disable-next-line */ t(
              `label.${segment}`,
              segment.charAt(0).toUpperCase() + segment.slice(1),
            ),
      path,
      homePath: HOME_PATH,
      segment,
    };
  });

  return segments.length === 1 ? [...items, dashboardCrumb(segments[0], t)] : items;
}

export const PageHeader = ({
  crumbMenus,
  crumbMenuHeaders,
  nonNavigableSegments,
  labelOverrides,
  loading,
}: Readonly<PageHeaderProps>) => {
  const [t] = useTranslation();
  const location = useLocation();
  const userSetting = useUserSettings();
  const { data: lastLoginTimestamp } = useLastLoginTimestamp({
    accountId: userSetting?.attrs?.zimbraId?.toString(),
    enabled: Boolean(userSetting?.attrs?.zimbraId),
  });
  const splitRoutes = buildSplitRoutes(location?.pathname ?? '', t, labelOverrides);

  return (
    <nav aria-label={t('label.breadcrumb', 'Breadcrumb')} className={styles.breadcrumb}>
      <div className={styles.bar}>
        {loading ? (
          <span aria-hidden="true" className={styles.skeleton} />
        ) : (
          <ol className={styles.list}>
            {splitRoutes.map((item: BreadcrumbItem, index) => (
            <BreadcrumbComponent
              crumbMenus={crumbMenus}
              crumbMenuHeaders={crumbMenuHeaders}
              labelOverrides={labelOverrides}
              key={item.path}
              index={index}
              item={item}
              nonNavigableSegments={nonNavigableSegments}
            />
            ))}
          </ol>
        )}
        {lastLoginTimestamp && (
          <div className={styles.lastAccess}>
            <ds-text as="span" color="secondary" overflow="break-word" weight="light">
              {t('label.last_access', 'Last access')} {lastLoginTimestamp}
            </ds-text>
          </div>
        )}
      </div>
    </nav>
  );
};

/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { DASHBOARD_ROUTE_ID, useLastLoginTimestamp, useUserSettings } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

import styles from './breadcrumb-component.module.css';

type BreadcrumbItem = {
  label: string;
  path: string;
  homePath: string;
};

function buildSplitRoutes(
  pathname: string,
  t: ReturnType<typeof useTranslation>[0],
): Array<BreadcrumbItem> {
  if (!pathname) return [];

  const segments = pathname.split('/').filter(Boolean);

  const items = segments.map((segment, index) => {
    const path = `/${segments.slice(0, index + 1).join('/')}`;
    return {
      label:
        index === 0
          ? t('label.home', 'Home')
          : /* i18next-extract-disable-next-line */ t(
              `label.${segment}`,
              segment.charAt(0).toUpperCase() + segment.slice(1),
            ),
      path,
      homePath: `/${DASHBOARD_ROUTE_ID}`,
    };
  });

  if (segments.length === 1) {
    return [
      ...items,
      {
        label: t('label.dashboard', 'Dashboard'),
        path: `/${segments[0]}/dashboard`,
        homePath: `/${DASHBOARD_ROUTE_ID}`,
      },
    ];
  }

  return items;
}

export function Breadcrumbs() {
  const [t] = useTranslation();
  const location = useLocation();
  const userSetting = useUserSettings();
  const { data: lastLoginTimestamp } = useLastLoginTimestamp({
    accountId: userSetting?.attrs?.zimbraId?.toString(),
    enabled: Boolean(userSetting?.attrs?.zimbraId),
  });
  const splitRoutes = buildSplitRoutes(location?.pathname ?? '', t);

  const isLast = (index: number): boolean => splitRoutes.length - 1 === index;

  return (
    <div className={styles.breadcrumb}>
      <div className={styles.bar}>
        {splitRoutes.map((item: BreadcrumbItem, index) => (
          <div className={styles.item} key={item.path}>
            <ds-text
              as="span"
              size="medium"
              weight="regular"
              className={isLast(index) ? styles.labelCurrent : styles.label}
            >
              {item.label}
            </ds-text>
            {!isLast(index) && (
              <div className={styles.separator}>
                <ds-text as="span" size="medium" weight="regular" color="#cccccc">
                  &nbsp;/&nbsp;
                </ds-text>
              </div>
            )}
          </div>
        ))}
        {lastLoginTimestamp && (
          <div className={styles.lastAccess}>
            <ds-text as="span" color="secondary" overflow="break-word" weight="light">
              {t('label.last_access', 'Last access')} {lastLoginTimestamp}
            </ds-text>
          </div>
        )}
      </div>
    </div>
  );
}

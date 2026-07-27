/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  DASHBOARD_ROUTE_ID,
  useLastLoginTimestamp,
  useModuleCrumbMenu,
  useUserSettings,
} from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import { Dropdown } from '../display/Dropdown';
import styles from './breadcrumb-component.module.css';

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

export type BreadcrumbsProps = {
  crumbMenus?: Record<string, Array<CrumbMenuItem>>;
  nonNavigableSegments?: Array<string>;
  labelOverrides?: Record<string, string>;
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

export const Breadcrumbs = ({
  crumbMenus,
  nonNavigableSegments,
  labelOverrides,
}: Readonly<BreadcrumbsProps>) => {
  const [t] = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const userSetting = useUserSettings();
  const { data: lastLoginTimestamp } = useLastLoginTimestamp({
    accountId: userSetting?.attrs?.zimbraId?.toString(),
    enabled: Boolean(userSetting?.attrs?.zimbraId),
  });
  const splitRoutes = buildSplitRoutes(location?.pathname ?? '', t, labelOverrides);
  const moduleMenu = useModuleCrumbMenu(location?.pathname ?? '');
  const nonNavigableSet = new Set(nonNavigableSegments);

  const isLast = (index: number): boolean => splitRoutes.length - 1 === index;

  return (
    <nav aria-label={t('label.breadcrumb', 'Breadcrumb')} className={styles.breadcrumb}>
      <div className={styles.bar}>
        <ol className={styles.list}>
          {splitRoutes.map((item: BreadcrumbItem, index) => {
            const target = index === 0 ? item.homePath : item.path;
            const isModuleCrumb = index === 1;
            const menu =
              isModuleCrumb && moduleMenu.length > 0 ? moduleMenu : crumbMenus?.[item.path];
            const navigable = !isLast(index) && !nonNavigableSet.has(item.segment);
            const interactive: React.HTMLAttributes<HTMLElement> = navigable
              ? {
                  onClick: () => navigate(target),
                  onKeyDown: (e) => {
                    if (e.key === 'Enter') navigate(target);
                  },
                  role: 'link',
                  tabIndex: 0,
                  style: { cursor: 'pointer' },
                }
              : {};
            return (
              <li
                aria-current={isLast(index) ? 'page' : undefined}
                className={styles.item}
                key={item.path}
              >
                <ds-text
                  {...interactive}
                  as="span"
                  size="medium"
                  weight="regular"
                  className={navigable ? styles.label : styles.labelCurrent}
                >
                  {item.label}
                </ds-text>
                {menu && menu.length > 0 && (
                  <Dropdown
                    items={menu.map((mi) => ({
                      id: mi.path,
                      label: mi.label,
                      selected: mi.path === location.pathname,
                      onClick: () => navigate(mi.path),
                    }))}
                    placement="bottom-start"
                  >
                    <button
                      aria-haspopup="menu"
                      aria-label={t('label.show_sections', 'Show sections')}
                      className={styles.caret}
                      type="button"
                    >
                      <ds-icon color="gray1" icon="ChevronDown" size="small" />
                    </button>
                  </Dropdown>
                )}
                {!isLast(index) && (
                  <div aria-hidden="true" className={styles.separator}>
                    <ds-text as="span" size="medium" weight="regular">
                      &nbsp;/&nbsp;
                    </ds-text>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
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

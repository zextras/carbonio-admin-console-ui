/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { DASHBOARD_ROUTE_ID, useModuleCrumbMenu } from '@zextras/ui-shared';
import { sortBy } from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import { Dropdown } from '../display/Dropdown';
import styles from './breadcrumbs.module.css';

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
  index: number;
  item: BreadcrumbItem;
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
            t(`label.${segment}`, segment.charAt(0).toUpperCase() + segment.slice(1)),
      path,
      homePath: HOME_PATH,
      segment,
    };
  });

  return segments.length === 1 ? [...items, dashboardCrumb(segments[0], t)] : items;
}

export const BreadcrumbComponent = ({
  crumbMenus,
  nonNavigableSegments,
  labelOverrides,
  index,
  item,
}: Readonly<BreadcrumbsProps>) => {
  const [t] = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const splitRoutes = buildSplitRoutes(location?.pathname ?? '', t, labelOverrides);
  const moduleMenu = useModuleCrumbMenu();
  const nonNavigableSet = new Set(nonNavigableSegments);

  const isLast = (index: number): boolean => splitRoutes.length - 1 === index;

  const target = index === 0 ? item.homePath : item.path;
  const isModuleCrumb = index === 1;
  const rawMenu = isModuleCrumb && moduleMenu.length > 0 ? moduleMenu : crumbMenus?.[item.path];
  const menu = rawMenu ? sortBy(rawMenu, (m) => m.label.toLowerCase()) : undefined;
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
    <li aria-current={isLast(index) ? 'page' : undefined} className={styles.item} key={item.path}>
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
          items={menu.map((menuItem) => ({
            id: menuItem.path,
            label: menuItem.label,
            selected: menuItem.path === location.pathname,
            onClick: () => navigate(menuItem.path),
          }))}
          placement="bottom-start"
        >
          <button
            aria-haspopup="menu"
            aria-label={t('label.show_sections', 'Show sections')}
            className={styles.caret}
            type="button"
          >
            <ds-icon color="gray1" icon="IconDown" size="small" />
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
};

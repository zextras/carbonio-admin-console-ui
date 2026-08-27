/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { replaceHistory } from '@zextras/ui-shared';
import { useEffect } from 'react';
import { matchPath, useLocation } from 'react-router';

import {
  DOMAINS_ROUTE_ID,
  GLOBAL_DOMAIN_ROUTE,
  GLOBAL_ROUTE,
  GLOBAL_SETTINGS_ROUTE,
  MANAGE_APP_ID,
} from '../../../constants';

const DOMAINS_BASE = `/${MANAGE_APP_ID}/${DOMAINS_ROUTE_ID}`;

export type UseDomainNavigationReturn = {
  isGlobalRoute: boolean;
  isDomainSelect: boolean;
  selectedDomainId: string;
  domainView: string;
  navigateToView: (view: string) => void;
};

export const useDomainNavigation = (): UseDomainNavigationReturn => {
  const { pathname } = useLocation();

  const globalMatch =
    matchPath(`${DOMAINS_BASE}/${GLOBAL_ROUTE}/*`, pathname) ??
    matchPath(`${DOMAINS_BASE}/${GLOBAL_ROUTE}`, pathname);
  const isGlobalRoute = !!globalMatch;
  const domainMatch = isGlobalRoute
    ? null
    : matchPath(`${DOMAINS_BASE}/:domainId/:operation`, pathname);
  const selectedDomainId = domainMatch?.params.domainId ?? '';
  const isDomainSelect = !!selectedDomainId;
  const globalSub = globalMatch ? (globalMatch.params['*'] ?? '') : '';
  const globalView = globalSub ? `${GLOBAL_ROUTE}/${globalSub}` : GLOBAL_SETTINGS_ROUTE;
  const domainView = isGlobalRoute
    ? globalView
    : (domainMatch?.params.operation ?? GLOBAL_DOMAIN_ROUTE);

  const navigateToView = (view: string) => {
    if (view.startsWith(`${GLOBAL_ROUTE}/`)) {
      replaceHistory(`/${view}`);
    } else if (isDomainSelect && selectedDomainId) {
      replaceHistory(`/${selectedDomainId}/${view}`);
    }
  };

  useEffect(() => {
    if (pathname === DOMAINS_BASE) {
      replaceHistory(`/${GLOBAL_DOMAIN_ROUTE}`);
    }
  }, [pathname]);

  return {
    isGlobalRoute,
    isDomainSelect,
    selectedDomainId,
    domainView,
    navigateToView,
  };
};

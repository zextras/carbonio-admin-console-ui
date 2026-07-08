/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { find, replace, startsWith, trim } from 'lodash-es';
import { useMemo } from 'react';
import { type To, useLocation } from 'react-router';

import { AppRoute, HistoryParams } from '../../types';
import { getRoutes, useAppRoutes } from '../store/app';
import { useContextBridge } from '../store/context-bridge';

export const useCurrentRoute = (): AppRoute | undefined => {
  const location = useLocation();
  const routes = useAppRoutes();
  return useMemo(
    () => find(routes, (r) => startsWith(trim(location.pathname, '/'), r.route)),
    [location.pathname, routes],
  );
};
const getCurrentRoute = (): AppRoute | undefined => {
  const history = useContextBridge.getState().functions.getHistory?.();
  const routes = getRoutes();
  return find(routes, (r) => startsWith(trim(history.location.pathname, '/'), r.route));
};

const parseParams = (params: HistoryParams): To => {
  if (typeof params === 'string') {
    return replace(`/${getCurrentRoute()?.route}/${params}`, '//', '/');
  }
  const routeToApply = params.route
    ? find(getRoutes(), (r) => r.id === params.route || r.route === params.route)
    : getCurrentRoute();
  return typeof params.path === 'string'
    ? replace(`/${routeToApply?.route}/${params.path}`, '//', '/')
    : {
        search: params.path.search,
        hash: params.path.hash,
        pathname: replace(`/${routeToApply?.route}/${params.path.pathname}`, '//', '/'),
      };
};

export const replaceHistory = (params: HistoryParams): void => {
  const history = useContextBridge.getState().functions.getHistory?.();
  history.replace(parseParams(params));
};

/**
 * Returns the current URL pathname relative to the active app's registered
 * route prefix. For example, when the storage app (registered as
 * `manage/storage`) is mounted at `/manage/storage/servers_list`, this returns
 * `/servers_list`.
 *
 * If no registered route matches the current location, the full pathname is
 * returned unchanged.
 *
 * Use this together with react-router's `matchPath` to derive the active
 * selection in a list panel without re-implementing prefix stripping per app.
 */
export const useRelativePathname = (): string => {
  const { pathname } = useLocation();
  const currentRoute = useCurrentRoute();
  const base = currentRoute ? `/${currentRoute.route}` : '';
  return useMemo(() => {
    if (!base || !startsWith(pathname, base)) {
      return pathname;
    }
    const stripped = pathname.slice(base.length);
    return stripped === '' ? '/' : stripped;
  }, [pathname, base]);
};

/**
 * Builds an absolute path from a registered route ID plus optional path
 * segments. The route's prefixed path (e.g. `manage/storage`) is read from the
 * route registry, so callers never need to hard-code the section prefix.
 *
 * Examples (given a registered `storage` route of `manage/storage`):
 *   buildPath('storage', 'servers_list')      -> '/manage/storage/servers_list'
 *   buildPath('storage', server, 'data_volumes') -> '/manage/storage/mail1/data_volumes'
 *   buildPath('storage')                      -> '/manage/storage'
 *
 * Unknown route IDs fall back to using the ID itself as the path.
 */
export const buildPath = (routeId: string, ...segments: Array<string | undefined>): string => {
  const routes = getRoutes();
  const route = routes[routeId]?.route ?? routeId;
  const parts = [route, ...segments.filter((s): s is string => Boolean(s))];
  return `/${parts.join('/')}`.replace(/\/{2,}/g, '/');
};

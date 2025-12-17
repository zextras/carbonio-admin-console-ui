/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { To } from 'history';
import { find, replace, startsWith, trim } from 'lodash-es';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { AppRoute, HistoryParams } from '../../types';
import { getRoutes, useRoutes } from '../store/app';
import { useContextBridge } from '../store/context-bridge';

export const useCurrentRoute = (): AppRoute | undefined => {
	const location = useLocation();
	const routes = useRoutes();
	return useMemo(
		() => find(routes, (r) => startsWith(trim(location.pathname, '/'), r.route)),
		[location.pathname, routes]
	);
};
const getCurrentRoute = (): AppRoute | undefined => {
	const history = useContextBridge.getState().functions.getHistory?.();
	const routes = getRoutes();
	return find(routes, (r) => startsWith(trim(history.location.pathname, '/'), r.route));
};

export const parseParams = (params: HistoryParams): To => {
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
				pathname: replace(`/${routeToApply?.route}/${params.path.pathname}`, '//', '/')
			};
};

export const replaceHistory = (params: HistoryParams): void => {
	const history = useContextBridge.getState().functions.getHistory?.();
	history.replace(parseParams(params));
};

export const pushHistory = (params: HistoryParams): void => {
	const history = useContextBridge.getState().functions.getHistory?.();
	history.push(parseParams(params));
};

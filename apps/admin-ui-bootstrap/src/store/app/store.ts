/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { produce } from 'immer';
import { filter, find, omit, reduce, sortBy, unionWith } from 'lodash-es';
import { create } from 'zustand';

import {
	AppRouteDescriptor,
	AppState,
	AppView,
	CarbonioModule,
	PrimarybarSection,
	PrimaryBarView
} from '../../../types';
import { SHELL_APP_ID } from '../../constants';
import { normalizeApp } from './utils';

const filterById = <T extends { id: string }>(items: Array<T>, id: string): Array<T> =>
	filter(items, (item) => item.id !== id);

export const useAppStore = create<AppState>((set) => ({
	apps: {},
	appContexts: {},
	shell: {
		commit: '',
		description: '',
		js_entrypoint: '',
		name: 'carbonio-admin-ui',
		priority: -1,
		version: '',
		type: 'shell',
		attrKey: '',
		icon: '',
		display: 'Shell'
	},
	entryPoints: {},
	routes: {},
	views: {
		primaryBar: [],
		appView: [],
		utilityBar: [],
		primarybarSections: []
	},
	setters: {
		addApps: (apps: Array<Partial<CarbonioModule>>): void => {
			set((state) => ({
				apps: reduce(
					apps,
					(acc, app) =>
						app.name && app.name !== SHELL_APP_ID
							? {
									...acc,
									[app.name]: normalizeApp(app)
								}
							: acc,
					{}
				),
				shell: {
					...state.shell,
					...(find(apps, (app) => app.name === SHELL_APP_ID) ?? {})
				},
				appContexts: reduce(apps, (acc, val) => (val.name ? { ...acc, [val.name]: {} } : acc), {})
			}));
		},
		// add route (id route primaryBar secondaryBar app)
		addRoute: (routeData: AppRouteDescriptor): string => {
			set(
				produce((state: AppState) => {
					state.routes[routeData.id] = {
						...routeData,
						route: routeData.primarybarSection
							? `${routeData.primarybarSection.id}/${routeData.route}`
							: routeData.route
					};
					if (routeData.primaryBar) {
						state.views.primaryBar = sortBy(
							unionWith<PrimaryBarView>(
								[
									{
										app: routeData.app,
										id: routeData.id,
										route: routeData.primarybarSection
											? `${routeData.primarybarSection.id}/${routeData.route}`
											: routeData.route,
										component: routeData.primaryBar,
										badge: routeData.badge,
										position: routeData.position,
										visible: routeData.visible,
										label: routeData.label,
										section: routeData.primarybarSection,
										tooltip: routeData.tooltip,
										trackerLabel: routeData?.trackerLabel
									}
								],
								state.views.primaryBar,
								(a, b): boolean => a.id === b.id
							),
							'position'
						);

						state.views.primarybarSections = sortBy(
							unionWith<PrimarybarSection>(
								routeData?.primarybarSection
									? [
											{
												id: routeData?.primarybarSection.id,
												position: routeData?.primarybarSection.position,
												label: routeData?.primarybarSection.label
											}
										]
									: [],
								state.views.primarybarSections,
								(a, b): boolean => a.id === b.id
							),
							'position'
						);
					}
					if (routeData.appView) {
						state.views.appView = unionWith<AppView>(
							[
								{
									app: routeData.app,
									id: routeData.id,
									route: routeData.primarybarSection
										? `${routeData.primarybarSection.id}/${routeData.route}`
										: routeData.route,
									component: routeData.appView
								}
							],
							state.views.appView,
							(a, b): boolean => a.id === b.id
						);
					}
				})
			);
			return routeData.id;
		},
		// remove route (id | route)
		removeRoute: (id: string): void => {
			set(
				produce((state: AppState) => {
					state.routes = omit(state.routes, [id]);

					state.views.primaryBar = filterById(state.views.primaryBar, id);

					state.views.appView = filterById(state.views.appView, id);
				})
			);
		}
	}
}));

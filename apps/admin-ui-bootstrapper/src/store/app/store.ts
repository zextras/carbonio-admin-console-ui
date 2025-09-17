/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { produce } from 'immer';
import { filter, find, findIndex, merge, omit, reduce, sortBy, unionBy, unionWith } from 'lodash';
import { create } from 'zustand';

import { normalizeApp } from './utils';
import {
	AppRouteDescriptor,
	AppState,
	AppView,
	BadgeInfo,
	BoardView,
	CarbonioModule,
	PrimaryAccessoryView,
	PrimarybarSection,
	PrimaryBarView,
	SearchView,
	SecondaryAccessoryView,
	SecondaryBarView,
	UtilityView
} from '../../../types';
import { SHELL_APP_ID } from '../../constants';

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
		secondaryBar: [],
		appView: [],
		board: [],
		utilityBar: [],
		search: [],
		primaryBarAccessories: [],
		secondaryBarAccessories: [],
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
		setAppContext:
			(app: string) =>
			(context: unknown): void => {
				set(
					produce((state: AppState) => {
						// eslint-disable-next-line no-param-reassign
						state.appContexts[app] = merge(state.appContexts[app], context);
					})
				);
			},
		// add route (id route primaryBar secondaryBar app)
		// eslint-disable-next-line sonarjs/cognitive-complexity
		addRoute: (routeData: AppRouteDescriptor): string => {
			set(
				produce((state: AppState) => {
					// eslint-disable-next-line no-param-reassign
					state.routes[routeData.id] = {
						...routeData,
						route: routeData.primarybarSection
							? `${routeData.primarybarSection.id}/${routeData.route}`
							: routeData.route
					};
					if (routeData.primaryBar) {
						// eslint-disable-next-line no-param-reassign
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
						// eslint-disable-next-line no-param-reassign
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
					if (routeData.secondaryBar) {
						// eslint-disable-next-line no-param-reassign
						state.views.secondaryBar = unionWith<SecondaryBarView>(
							[
								{
									app: routeData.app,
									id: routeData.id,
									route: routeData.route,
									component: routeData.secondaryBar
								}
							],
							state.views.secondaryBar,
							(a, b): boolean => a.id === b.id
						);
					}
					if (routeData.appView) {
						// eslint-disable-next-line no-param-reassign
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
		setRouteVisibility: (id: string, visible: boolean): void => {
			set(
				produce((state: AppState) => {
					const idx = findIndex(state.views.primaryBar, (view) => view.id === id);
					if (idx >= 0) {
						// eslint-disable-next-line no-param-reassign
						state.views.primaryBar[idx].visible = visible;
					}
				})
			);
		},

		// remove route (id | route)
		removeRoute: (id: string): void => {
			set(
				produce((state: AppState) => {
					// eslint-disable-next-line no-param-reassign
					state.routes = omit(state.routes, [id]);
					// eslint-disable-next-line no-param-reassign
					state.views.primaryBar = filterById(state.views.primaryBar, id);
					// eslint-disable-next-line no-param-reassign
					state.views.secondaryBar = filterById(state.views.secondaryBar, id);
					// eslint-disable-next-line no-param-reassign
					state.views.appView = filterById(state.views.appView, id);
				})
			);
		},
		// add board
		addBoardView: (data: BoardView): string => {
			set(
				produce((state: AppState) => {
					// eslint-disable-next-line no-param-reassign
					state.views.board = unionBy([data], state.views.board, 'id');
				})
			);
			return data.id;
		},

		// remove board
		removeBoardView: (id: string): void => {
			set(
				produce((state: AppState) => {
					// eslint-disable-next-line no-param-reassign
					state.views.board = filterById(state.views.board, id);
				})
			);
		},
		//
		// add search
		addSearchView: (data: SearchView): string => {
			set(
				produce((state: AppState) => {
					// eslint-disable-next-line no-param-reassign
					state.views.search = sortBy(unionBy([data], state.views.search, 'id'), 'position');
				})
			);
			return data.id;
		},
		// remove search
		removeSearchView: (id: string): void => {
			set(
				produce((state: AppState) => {
					// eslint-disable-next-line no-param-reassign
					state.views.search = filterById(state.views.search, id);
				})
			);
		},
		//
		// add utility
		addUtilityView: (data: UtilityView): string => {
			set(
				produce((state: AppState) => {
					// eslint-disable-next-line no-param-reassign
					state.views.utilityBar = sortBy(
						unionBy([data], state.views.utilityBar, 'id'),
						'position'
					);
				})
			);
			return data.id;
		},
		// remove utility
		removeUtilityView: (id: string): void => {
			set(
				produce((state: AppState) => {
					// eslint-disable-next-line no-param-reassign
					state.views.utilityBar = filterById(state.views.utilityBar, id);
				})
			);
		},
		//
		// add primaryAccessory
		addPrimaryAccessoryView: (data: PrimaryAccessoryView): string => {
			set(
				produce((state: AppState) => {
					// eslint-disable-next-line no-param-reassign
					state.views.primaryBarAccessories = unionBy(
						[data],
						state.views.primaryBarAccessories,
						'id'
					);
				})
			);
			return data.id;
		},
		// remove primaryAccessory
		removePrimaryAccessoryView: (id: string): void => {
			set(
				produce((state: AppState) => {
					// eslint-disable-next-line no-param-reassign
					state.views.primaryBarAccessories = filterById(state.views.primaryBarAccessories, id);
				})
			);
		},
		//
		// add secondaryAccessory
		addSecondaryAccessoryView: (data: SecondaryAccessoryView): string => {
			set(
				produce((state: AppState) => {
					// eslint-disable-next-line no-param-reassign
					state.views.secondaryBarAccessories = unionBy(
						[data],
						state.views.secondaryBarAccessories,
						'id'
					);
				})
			);
			return data.id;
		},
		// remove secondaryAccessory
		removeSecondaryAccessoryView: (id: string): void => {
			set(
				produce((state: AppState) => {
					// eslint-disable-next-line no-param-reassign
					state.views.secondaryBarAccessories = filterById(state.views.secondaryBarAccessories, id);
				})
			);
		},
		updatePrimaryBadge: (badge: Partial<BadgeInfo>, id: string): void => {
			set(
				produce((state: AppState) => {
					const idx = findIndex(state.views.primaryBar, (bar) => bar.id === id);
					if (idx >= 0) {
						// eslint-disable-next-line no-param-reassign
						state.views.primaryBar[idx].badge = {
							...state.views.primaryBar[idx].badge,
							...badge
						};
					}
				})
			);
		},
		updateUtilityBadge: (badge: Partial<BadgeInfo>, id: string): void => {
			set(
				produce((state: AppState) => {
					const idx = findIndex(state.views.utilityBar, (bar) => bar.id === id);
					if (idx >= 0) {
						// eslint-disable-next-line no-param-reassign
						state.views.utilityBar[idx].badge = {
							...state.views.utilityBar[idx].badge,
							...badge
						};
					}
				})
			);
		}
	}
}));

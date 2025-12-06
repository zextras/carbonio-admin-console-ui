/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ComponentType, FC } from 'react';

import { QueryChip } from '../search/items';

export type CarbonioModule = {
	commit: string;
	description: string;

	js_entrypoint: string;
	name: string;
	priority: number;
	version: string;
	type: 'carbonio' | 'carbonioAdmin' | 'shell';
	attrKey?: string;
	icon: string;
	display: string;
	sentryDsn?: string;
};

export type AppRoute = {
	// persist?: boolean;
	id: string;
	route: string;
	app: string;
};

export type AppRouteData = AppRoute & {
	primaryBar: PrimaryBarView;
	secondaryBar?: SecondaryBarView;
	appView: AppView;
};

export type BadgeInfo = {
	show: boolean;
	count?: number;
	showCount?: boolean;
	color?: string;
};

export type CarbonioView<P> = {
	id: string;
	app: string;
	route: string;
	component: ComponentType<P>;
};

export type CarbonioAccessoryView<P> = {
	id: string;
	app: string;
	whitelistRoutes?: Array<string>;
	blacklistRoutes?: Array<string>;
	position: number;
	component: ComponentType<P>;
};
export type PrimaryBarComponentProps = { active: boolean };
export type SecondaryBarComponentProps = { expanded: boolean };

export type AppViewComponentProps = {};

export type BoardViewComponentProps = {};
export type SearchViewProps = {
	useQuery: () => [QueryChip[], Function];
	ResultsHeader: FC<{ label: string }>;

	useDisableSearch: () => [boolean, Function];
};

export type PrimaryAccessoryViewProps = {};
export type SecondaryAccessoryViewProps = { expanded: boolean };
export type PanelMode = 'closed' | 'overlap' | 'open';

export type UtilityBarComponentProps = { mode: PanelMode; setMode: (mode: PanelMode) => void };
export type PrimaryBarView = Omit<CarbonioView<PrimaryBarComponentProps>, 'component'> & {
	component: string | ComponentType<PrimaryBarComponentProps>;
	badge: BadgeInfo;
	position: number;
	visible: boolean;
	label: string;
	section?: PrimarybarSection;

	tooltip?: ComponentType<{}>;
	trackerLabel?: string;
};

export type SecondaryBarView = CarbonioView<SecondaryBarComponentProps>;

export type AppView = CarbonioView<AppViewComponentProps>;

export type UtilityView = CarbonioAccessoryView<UtilityBarComponentProps> & {
	button: string | ComponentType<UtilityBarComponentProps>;
	component: ComponentType<UtilityBarComponentProps>;
	badge: BadgeInfo;
	label: string;
};

export type SearchView = CarbonioView<SearchViewProps> & {
	icon: string;
	label: string;
	position: number;
};

export type PrimaryAccessoryView = CarbonioAccessoryView<PrimaryAccessoryViewProps> & {
	component: string | ComponentType;
	onClick?: (ev: any) => void;
	label: string;
};

export type SecondaryAccessoryView = CarbonioAccessoryView<SecondaryAccessoryViewProps>;

export type AppRouteDescriptor = {
	id: string;
	route: string;
	app: string;
	primaryBar: string | ComponentType<PrimaryBarComponentProps>;
	badge: BadgeInfo;
	position: number;
	visible: boolean;
	label: string;
	secondaryBar?: ComponentType<SecondaryBarComponentProps>;
	appView: ComponentType<AppViewComponentProps>;
	primarybarSection: PrimarybarSection | undefined;
	// eslint-disable-next-line sonarjs/no-redundant-optional
	tooltip?: ComponentType<{}> | undefined;
	trackerLabel?: string;
};
export type AppSetters = {
	addApps: (apps: Array<Partial<CarbonioModule>>) => void;
	addRoute: (routeData: AppRouteDescriptor) => string;
	removeRoute: (id: string) => void;
};
export type AppState = {
	apps: Record<string, CarbonioModule>;
	appContexts: Record<string, unknown>;
	entryPoints: Record<string, ComponentType>;
	routes: Record<string, AppRoute>;
	views: {
		primaryBar: Array<PrimaryBarView>;
		secondaryBar: Array<SecondaryBarView>;
		appView: Array<AppView>;
		utilityBar: Array<UtilityView>;
		primaryBarAccessories: Array<PrimaryAccessoryView>;
		secondaryBarAccessories: Array<SecondaryAccessoryView>;
		primarybarSections: Array<PrimarybarSection>;
	};
	setters: AppSetters;
	shell: CarbonioModule;
};

export type PrimarybarSection = {
	id: string;
	label: string;
	position: number;
};

export interface Right {
	type: string;
	all?: {
		right?: {
			n: string;
		}[];
		setAttrs?: {
			all: boolean;
		}[];
		getAttrs?: {
			all: boolean;
		}[];
	}[];
}

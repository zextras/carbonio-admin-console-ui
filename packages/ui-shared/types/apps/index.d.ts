/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ComponentType, FC } from 'react';

import { QueryChip } from '../search/items';

export type CarbonioModule = {
  description: string;
  name: string;
  priority: number;
  type: 'carbonioAdmin' | 'shell';
  icon: string;
  display: string;
  js_entrypoint: string;
};

/**
 * A registered route, as stored in the app store.
 *
 * - `route` is the raw, app-declared route segment (e.g. `'storage'`).
 * - `path` is the full URL path used for mounting/matching/navigation. It is derived by the
 *   store as `${primarybarSection.id}/${route}` when the route belongs to a primary-bar
 *   section, otherwise just `route` (e.g. `'manage/storage'` or `'dashboard'`).
 *
 * Note: `primarybarSection.id` therefore serves double duty — it is both the URL prefix and the
 * primary-bar grouping key. `route` is never mutated; `path` is the computed, prefixed value.
 */
export type AppRoute = {
  // persist?: boolean;
  id: string;
  /** Raw app-declared route segment (e.g. `'storage'`). */
  route: string;
  /** Full prefixed URL path used for mounting/matching (e.g. `'manage/storage'`). */
  path: string;
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
  /** Full prefixed URL path (e.g. `'manage/storage'`); `route` is the raw segment. */
  path: string;

  tooltip?: ComponentType<{}>;
  trackerLabel?: string;
};

export type SecondaryBarView = CarbonioView<SecondaryBarComponentProps>;

export type AppView = CarbonioView<AppViewComponentProps> & {
  /** Full prefixed URL path used to mount the view (e.g. `'manage/storage'`). */
  path: string;
};

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

/**
 * Descriptor passed to `addRoute`. This is the *input* shape: `route` is the raw app-declared
 * segment (e.g. `'storage'`). The store derives the full URL `path` from it (see {@link AppRoute}).
 */
export type AppRouteDescriptor = {
  id: string;
  /** Raw route segment (e.g. `'storage'`). The store prefixes it with `primarybarSection.id`. */
  route: string;
  app: string;
  primaryBar: string | ComponentType<PrimaryBarComponentProps>;
  badge: BadgeInfo;
  position: number;
  visible: boolean;
  label: string;
  appView: ComponentType<AppViewComponentProps>;
  primarybarSection: PrimarybarSection | undefined;
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
    appView: Array<AppView>;
    utilityBar: Array<UtilityView>;
    primarybarSections: Array<PrimarybarSection>;
  };
  setters: AppSetters;
  shell: CarbonioModule;
};

/**
 * A primary-bar grouping section.
 *
 * NOTE: `id` serves double duty — it is both the grouping key for the primary bar AND the URL
 * prefix for every route that belongs to this section (e.g. `id: 'manage'` → `/manage/storage`).
 * See {@link AppRoute.path}.
 */
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

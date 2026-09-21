/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCurrentRoute, useRelativePathname } from '@zextras/ui-shared';
import { useMemo } from 'react';

export type DocumentationContext = {
	module: string;
	context?: string;
	/** i18n key/fallback for the module's own display name (e.g. sidebar label). */
	moduleLabelKey: string;
	moduleLabelFallback: string;
};

/**
 * A subpath entry is checked against every segment of the relative path (left to
 * right); the last matching segment wins, so a generic ancestor (e.g. `global`)
 * can be refined by a more specific descendant (e.g. `administrators`).
 */
type RouteMapping = {
	module: string;
	context?: string;
	subpaths?: Record<string, string>;
	/** Same i18n key/fallback used by the app itself to label its sidebar entry. */
	moduleLabelKey: string;
	moduleLabelFallback: string;
};

const ROUTE_MAPPINGS: Record<string, RouteMapping> = {
	accounts: {
		module: 'account',
		context: 'list',
		moduleLabelKey: 'label.accounts',
		moduleLabelFallback: 'Accounts',
	},
	dashboard: {
		module: 'dashboard',
		moduleLabelKey: 'label.dashboard',
		moduleLabelFallback: 'Dashboard',
	},
	domains: {
		module: 'domains',
		moduleLabelKey: 'label.domains',
		moduleLabelFallback: 'Domains',
		subpaths: {
			'create-new-domain': 'create-domain',
			general_information: 'details',
			general_settings: 'general',
			gal: 'gal',
			authentication: 'authentication',
			virtual_hosts: 'virtual-hosts',
			whitelabel_settings: 'theme',
			'2-factor-authentication': '2fa',
			saml: 'saml',
			disclaimer: 'disclaimer',
			accounts: 'account',
			active_sync: 'manage',
			address_book: 'manage',
			delegates: 'delegate',
			delegates_domain_admins: 'delegated-domain-admins',
			distribution_list: 'distribution-list',
			resources: 'resources',
			restore_account: 'restore-account',
			domains: 'domains-list',
			global: 'global',
			settings: 'settings',
			administrators: 'admins',
			quarantine: 'quarantine',
		},
	},
	cos: {
		module: 'cos',
		moduleLabelKey: 'label.cos',
		moduleLabelFallback: 'COS',
		subpaths: {
			general_information: 'general-information',
			features: 'features',
			wsc: 'chat',
			preferences: 'preferences',
			server_pools: 'server-pools',
			advanced: 'advanced',
		},
	},
	mail_transfer_agent: {
		module: 'mta',
		moduleLabelKey: 'label.mail_trans_agent',
		moduleLabelFallback: 'Mail Trans. Agent',
		subpaths: {
			general_lbl: 'inbound-flow-security',
			postscreen_tuning: 'postscreen-tuning',
			outbound_flow: 'outbound-flow',
			antivirus_and_antispam: 'antivirus-antispam',
			advanced: 'advanced',
			queue: 'queue',
			mta_server_general: 'server-general',
		},
	},
	storage: {
		module: 'storage',
		moduleLabelKey: 'label.storage',
		moduleLabelFallback: 'Storage',
		subpaths: {
			servers_list: 'servers-list',
			s3connector_list: 's3-connectors',
			data_volumes: 'data-volumes',
			hsm_settings: 'hsm-settings',
		},
	},
	backup: {
		module: 'backup',
		moduleLabelKey: 'label.backup',
		moduleLabelFallback: 'Backup',
		subpaths: {
			servers_list: 'servers-list',
			server_config: 'server-config',
			advanced: 'advanced',
			import_an_external_backup: 'import-external-backup',
			configuration_lbl: 'configuration',
			advanced_lbl: 'advanced',
		},
	},
	subscriptions: {
		module: 'subscriptions',
		moduleLabelKey: 'label.subscriptions',
		moduleLabelFallback: 'Subscriptions',
	},
	operations: {
		module: 'operations',
		moduleLabelKey: 'label.operations',
		moduleLabelFallback: 'Operations',
	},
	privacy: {
		module: 'privacy',
		moduleLabelKey: 'label.privacy',
		moduleLabelFallback: 'Privacy',
	},
	legal_hold: {
		module: 'legalhold',
		moduleLabelKey: 'label.legal_hold',
		moduleLabelFallback: 'Legal Hold',
	},
	notifications: {
		module: 'notifications',
		moduleLabelKey: 'label.notifications',
		moduleLabelFallback: 'Notifications',
	},
};

const DEFAULT_CONTEXT: DocumentationContext = {
	module: 'admin',
	moduleLabelKey: 'label.admin',
	moduleLabelFallback: 'Admin',
};

const getContextFromSubpath = (
	mapping: RouteMapping,
	relativePath: string
): string | undefined => {
	if (!mapping.subpaths) {
		return mapping.context;
	}

	const cleanPath = relativePath.replace(/^\//, '');
	const segments = cleanPath.split('/');

	let context = mapping.context;
	for (const segment of segments) {
		context = mapping.subpaths[segment] ?? context;
	}

	return context;
};

export const useDocumentationContext = (): DocumentationContext => {
	const currentRoute = useCurrentRoute();
	const relativePath = useRelativePathname();

	return useMemo(() => {
		if (!currentRoute) {
			return DEFAULT_CONTEXT;
		}

		const { route, path } = currentRoute;

		const mapping = ROUTE_MAPPINGS[path] || ROUTE_MAPPINGS[route];

		if (!mapping) {
			return DEFAULT_CONTEXT;
		}

		return {
			module: mapping.module,
			context: getContextFromSubpath(mapping, relativePath),
			moduleLabelKey: mapping.moduleLabelKey,
			moduleLabelFallback: mapping.moduleLabelFallback,
		};
	}, [currentRoute, relativePath]);
};

/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	CARBONIO_ADMIN_DOCUMENTATION_URL_ATTRIBUTE,
	DEFAULT_ADVANCED_DOCUMENTATION_URL,
	useConfigAttribute,
	useCurrentRoute,
	useDomainById,
	useRelativePathname,
} from '@zextras/ui-shared';
import { useMemo } from 'react';

type DomainAttribute = { n: string; _content: string };

const DOMAINS_ROUTE_ID = 'domains';

/** First-segment values under the domains route that are not a domain id. */
const RESERVED_DOMAIN_SEGMENTS = new Set(['create-new-domain', 'domains', 'global']);

/**
 * Domain id of the domain currently being viewed/edited, or `undefined` when
 * not inside a domain's own pages (e.g. domains list, global settings, or
 * any other app).
 */
const useCurrentDomainId = (): string | undefined => {
	const currentRoute = useCurrentRoute();
	const relativePath = useRelativePathname();

	if (currentRoute?.route !== DOMAINS_ROUTE_ID) {
		return undefined;
	}

	const [firstSegment] = relativePath.replace(/^\//, '').split('/');
	return firstSegment && !RESERVED_DOMAIN_SEGMENTS.has(firstSegment) ? firstSegment : undefined;
};

/**
 * Resolves `carbonioAdminDocumentationUrl` with a Domain -> Global -> Default
 * fallback: the current domain's own override (if any) wins, otherwise the
 * Global config value, otherwise the built-in default.
 */
export const useDocumentationBaseUrl = (): string => {
	const domainId = useCurrentDomainId();
	const { data: globalUrl } = useConfigAttribute(CARBONIO_ADMIN_DOCUMENTATION_URL_ATTRIBUTE);
	// applyConfig: 0 returns the domain's own attributes only, without the
	// server merging Global config into unset ones - otherwise we couldn't
	// tell a real domain override from an inherited Global value.
	const { data: domain } = useDomainById<{ a?: Array<DomainAttribute> }>({
		domainId,
		applyConfig: 0,
	});

	return useMemo(() => {
		const domainUrl = domain?.a?.find(
			(attr) => attr.n === CARBONIO_ADMIN_DOCUMENTATION_URL_ATTRIBUTE,
		)?._content;
		return domainUrl || globalUrl || DEFAULT_ADVANCED_DOCUMENTATION_URL;
	}, [domain, globalUrl]);
};

/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { DEFAULT_ADVANCED_DOCUMENTATION_URL } from '@zextras/ui-shared';

export type DocumentationParams = {
	v?: string;
	m?: string;
	c?: string;
};

const SAFE_PROTOCOLS = new Set(['http:', 'https:']);

function parseSafeUrl(value: string): URL | undefined {
	if (value.includes('\\')) return undefined;
	try {
		const url = new URL(value);
		return SAFE_PROTOCOLS.has(url.protocol) ? url : undefined;
	} catch {
		return undefined;
	}
}

export const buildDocumentationUrl = (
	baseUrl: string,
	params: DocumentationParams
): string => {
	const url = parseSafeUrl(baseUrl) ?? new URL(DEFAULT_ADVANCED_DOCUMENTATION_URL);
	const hasParams = Boolean(params.v || params.m || params.c);
	if (hasParams && !url.pathname.endsWith('/')) url.pathname += '/';
	if (params.v) url.searchParams.set('v', params.v);
	if (params.m) url.searchParams.set('m', params.m);
	if (params.c) url.searchParams.set('c', params.c);
	return url.toString();
};

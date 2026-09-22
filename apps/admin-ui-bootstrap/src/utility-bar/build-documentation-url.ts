/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type DocumentationParams = {
	v?: string;
	m?: string;
	c?: string;
};

export const buildDocumentationUrl = (
	baseUrl: string,
	params: DocumentationParams
): string => {
	let url: URL;
	try {
		url = new URL(baseUrl);
	} catch {
		return baseUrl;
	}
	const hasParams = Boolean(params.v || params.m || params.c);
	if (hasParams && !url.pathname.endsWith('/')) url.pathname += '/';
	if (params.v) url.searchParams.set('v', params.v);
	if (params.m) url.searchParams.set('m', params.m);
	if (params.c) url.searchParams.set('c', params.c);
	return url.toString();
};

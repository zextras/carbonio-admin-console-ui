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
	const url = new URL(baseUrl);
	if (params.v) url.searchParams.set('v', params.v);
	if (params.m) url.searchParams.set('m', params.m);
	if (params.c) url.searchParams.set('c', params.c);
	return url.toString();
};

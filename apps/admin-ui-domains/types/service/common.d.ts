/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Attribute } from '../attribute';

export type ZimbraNamespace = 'urn:zimbraAdmin' | 'urn:zimbraAccount' | 'urn:zimbraMail';

export type SoapAttribute = {
	n: string;
	_content?: string;
};

export type SoapNamedContent = {
	n: string;
	_content: string;
};

export type JsonValue =
	| string
	| number
	| boolean
	| null
	| Array<JsonValue>
	| { [key: string]: JsonValue };

/**
 * Common shape for SOAP entity references (by id or name).
 */
export type SoapEntitySelector = {
	by: string;
	_content: string;
};

/**
 * Common shape for entities returned by Zimbra Admin SOAP APIs.
 */
export type SoapEntity = {
	id: string;
	name: string;
	a?: Array<Attribute>;
};

/**
 * Common paginated search response shape.
 */
export type SearchDirectoryResponse<K extends string, T = SoapEntity> = {
	[key in K]?: Array<T>;
} & {
	more: boolean;
	searchTotal: number;
	_jsns: string;
};

/**
 * Common empty SOAP response for delete or void operations.
 */
export type SoapEmptyResponse = Record<string, never>;

export type SoapFaultResponse = {
	Fault: {
		Reason?: {
			Text?: string;
		};
	};
};

/**
 * Common error-or-success result pattern used in REST services.
 */
export type ServiceResult<T extends Record<string, unknown> = Record<string, never>> =
	| ({ type: 'success' } & T)
	| { type: 'error'; error: string };

/**
 * Generic response shape from postSoapFetchRequest / zextras endpoints.
 * Per-action bodies are intentionally left open: slices that need a typed
 * body should narrow it locally (e.g. via intersection with a Body sub-type).
 */
export type ZextrasRawResponse = {
	ok?: boolean | string;
	error?: string;
	Body?: {
		response?: {
			content?: string;
		};
		Fault?: {
			Reason?: {
				Text?: string;
			};
		};
		[key: string]: unknown;
	};
	response?: {
		content?: unknown;
	};
};

/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { AddressBookZextrasSoapResponse } from '../../types';

export type ZextrasFlatPayload = {
	ok?: boolean;
	message?: string;
	nested?: boolean;
	response?: Record<string, unknown>;
};

export type ZextrasServerResult = {
	ok?: boolean;
	message?: string;
	response?: Record<string, unknown>;
};

export function parseZextrasContent(content: string | undefined): ZextrasFlatPayload | null {
	if (!content) {
		return null;
	}
	return JSON.parse(content) as ZextrasFlatPayload;
}

function isServerResult(value: unknown): value is ZextrasServerResult {
	return typeof value === 'object' && value !== null && ('ok' in value || 'response' in value);
}

export function getFirstZextrasServerResult(
	parsed: ZextrasFlatPayload | null,
): ZextrasServerResult | null {
	const servers = parsed?.response;
	if (!servers || typeof servers !== 'object') {
		return null;
	}

	const first = Object.values(servers).find(isServerResult);
	return first ?? null;
}

export function assertZextrasOk(
	response: AddressBookZextrasSoapResponse,
	fallbackMessage: string,
): ZextrasFlatPayload | null {
	if (response?.Body?.Fault) {
		throw new Error(response.Body.Fault.Reason?.Text ?? fallbackMessage);
	}

	const parsed = parseZextrasContent(response?.Body?.response?.content);
	if (parsed?.ok === false) {
		throw new Error(parsed.message ?? fallbackMessage);
	}

	const hasNestedServers =
		parsed?.nested === true ||
		(parsed?.response != null &&
			Object.values(parsed.response).some(isServerResult));

	if (hasNestedServers) {
		const serverResult = getFirstZextrasServerResult(parsed);
		if (serverResult?.ok === false) {
			throw new Error(serverResult.message ?? fallbackMessage);
		}
	}

	return parsed;
}

export function assertZextrasNestedOk(
	response: AddressBookZextrasSoapResponse,
	fallbackMessage: string,
): ZextrasServerResult | null {
	const parsed = assertZextrasOk(response, fallbackMessage);
	return getFirstZextrasServerResult(parsed);
}

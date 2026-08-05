/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { AddressBookZextrasSoapResponse } from '../../types';

export type ZextrasFlatPayload = {
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

	return parsed;
}

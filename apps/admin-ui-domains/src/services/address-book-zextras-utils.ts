/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { AddressBookZextrasSoapResponse } from '../../types';

type NestedServerPayload = {
	response?: Record<
		string,
		{
			ok?: boolean;
			message?: string;
			response?: Record<string, unknown>;
		}
	>;
	ok?: boolean;
};

export function parseZextrasNestedContent(content: string | undefined): NestedServerPayload | null {
	if (!content) {
		return null;
	}
	return JSON.parse(content) as NestedServerPayload;
}

export function assertZextrasServerOk(
	response: AddressBookZextrasSoapResponse,
	targetServers: string,
	fallbackMessage: string,
): NestedServerPayload | null {
	if (response?.Body?.Fault) {
		throw new Error(response.Body.Fault.Reason?.Text ?? fallbackMessage);
	}

	const parsed = parseZextrasNestedContent(response?.Body?.response?.content);
	const serverResult = parsed?.response?.[targetServers];
	if (serverResult?.ok === false) {
		throw new Error(serverResult.message ?? fallbackMessage);
	}

	return parsed;
}

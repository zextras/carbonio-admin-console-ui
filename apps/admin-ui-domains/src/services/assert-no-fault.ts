/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

type SoapFaultEnvelope = {
	Body?: {
		Fault?: {
			Reason?: {
				Text?: string;
			};
		};
	};
};

export function assertNoFault(res: unknown, fallbackMessage: string): void {
	const envelope = res as SoapFaultEnvelope | null | undefined;
	if (envelope?.Body?.Fault) {
		throw new Error(envelope.Body.Fault.Reason?.Text ?? fallbackMessage);
	}
}

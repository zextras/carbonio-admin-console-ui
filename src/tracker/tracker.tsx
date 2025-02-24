/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useEffect } from 'react';

import { useUserAccount } from '@zextras/carbonio-shell-ui';
import type { CaptureOptions, Properties } from 'posthog-js';
import { usePostHog } from 'posthog-js/react';

import { useAdvanceStore } from '../store/advanced/store';

export interface Tracker {
	capture: (
		event_name: string,
		properties?: Properties | null | undefined,
		options?: CaptureOptions | undefined
	) => void;
}

const hashToSHA256 = async (value: string): Promise<ArrayBuffer> => {
	const encoder = new TextEncoder();
	const data = encoder.encode(value);
	return window.crypto.subtle.digest('SHA-256', data);
};

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
	const bytes = new Uint8Array(buffer);
	const binary = bytes.reduce((res, byte) => res + String.fromCharCode(byte), '');
	return window.btoa(binary);
};

export const useTracker = (): Tracker => {
	const postHog = usePostHog();
	const { isAdvanced } = useAdvanceStore();
	const isCarbonioCE = !isAdvanced;
	const account = useUserAccount();

	useEffect(() => {
		if (isCarbonioCE !== undefined) {
			postHog.setPersonProperties({ is_ce: isCarbonioCE });
		}
	}, [isCarbonioCE, postHog]);

	useEffect(() => {
		if (account?.id) {
			hashToSHA256(account.id).then((arrayBuffer) => {
				const hashUserId = arrayBufferToBase64(arrayBuffer);
				postHog.identify(hashUserId, { is_ce: !isAdvanced });
			});
		}
	}, [account.id, postHog, isAdvanced]);

	const capture = useCallback<Tracker['capture']>(
		(eventName, properties, options) => {
			postHog.capture(eventName, properties, options);
		},
		[postHog]
	);

	return { capture };
};

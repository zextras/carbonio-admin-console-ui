/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useEffect, useState } from 'react';

import { useUserAccount } from '@zextras/carbonio-shell-ui';
import type { CaptureOptions, Properties } from 'posthog-js';
import { usePostHog } from 'posthog-js/react';

import { TRUE } from '../constants';
import { useAdvanceStore } from '../store/advanced/store';
import { useConfigurationAttribute } from '../store/config/store';

export interface Tracker {
	enableTracker: (enable: boolean) => void;
	reset: () => void;
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
	const [isOptedIn, setIsOptedIn] = useState(postHog.has_opted_in_capturing());
	const account = useUserAccount();

	useEffect(() => {
		if (isCarbonioCE !== undefined) {
			postHog.setPersonProperties({ is_ce: isCarbonioCE });
		}
	}, [isCarbonioCE, postHog]);

	useEffect(() => {
		const newValue = !isCarbonioCE || !isOptedIn;
		if (postHog.config.disable_surveys !== newValue && isCarbonioCE !== undefined) {
			postHog.set_config({ disable_surveys: newValue });
		}
	}, [isCarbonioCE, isOptedIn, postHog]);

	const enableTracker = useCallback(
		(enable: boolean) => {
			const currentLocationHost = window.location.host;
			if (
				!currentLocationHost.includes('127.0.0.1') &&
				!currentLocationHost.includes('localhost')
			) {
				if (enable) {
					if (account?.id) {
						hashToSHA256(account.id).then((arrayBuffer) => {
							const hashUserId = arrayBufferToBase64(arrayBuffer);
							postHog.identify(hashUserId, { is_ce: !isAdvanced });
						});
					}
					postHog.opt_in_capturing();
				} else {
					postHog.opt_out_capturing();
				}
				setIsOptedIn(enable);
			}
		},
		[postHog, isAdvanced, account?.id]
	);

	const reset = useCallback(() => {
		postHog.reset();
	}, [postHog]);

	const carbonioSendAnalyticsEnabled = useConfigurationAttribute('carbonioSendAnalytics') === TRUE;

	useEffect(() => {
		if (carbonioSendAnalyticsEnabled) {
			if (account?.id) {
				hashToSHA256(account.id).then((arrayBuffer) => {
					const hashUserId = arrayBufferToBase64(arrayBuffer);
					postHog.identify(hashUserId, { is_ce: !isAdvanced });
				});
			}
			postHog.opt_in_capturing();
		} else {
			postHog.opt_out_capturing();
		}
	}, [carbonioSendAnalyticsEnabled, account?.id]);

	const capture = useCallback<Tracker['capture']>(
		(eventName, properties, options) => {
			postHog.capture(eventName, properties, options);
		},
		[postHog]
	);

	return { enableTracker, reset, capture };
};

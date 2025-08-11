/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect, useState } from 'react';

import { ZIMBRA_ADMIN_URN } from '../../constants';
import { fetchSoap } from '../../services/subscription-service';

export interface WscLicenseHook {
	isLicensed: boolean;
	isLoading: boolean;
	error: string | null;
}

export const useWscLicense = (): WscLicenseHook => {
	const [isLicensed, setIsLicensed] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchSoap('zextras', {
			_jsns: ZIMBRA_ADMIN_URN,
			module: 'ZxCore',
			action: 'getLicenseInfo'
		})
			.then((res) => {
				const response = JSON.parse(res.response.content);
				if (response.ok) {
					const features = response.response?.features || [];
					const wscFeature = features.find(
						(feature: { name: string }) => feature.name === 'wsc_basic'
					);
					setIsLicensed(!!wscFeature?.enabled);
				}
			})
			.finally(() => {
				setIsLoading(false);
			})
			.catch((err) => {
				setError(err?.message);
			});
	}, []);

	return { isLicensed, isLoading, error };
};

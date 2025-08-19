/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect, useState } from 'react';

import { useSnackbar } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { ZIMBRA_ADMIN_URN } from '../../constants';
import { fetchSoap } from '../../services/subscription-service';
import { useAuthIsAdvanced } from '../../store/auth-advanced/store';

export interface WscLicenseHook {
	isLicensed: boolean;
	isLoading: boolean;
	error: string | null;
	requiresLicenseCheck: boolean;
}

export const useWscLicense = (): WscLicenseHook => {
	const isAdvanced = useAuthIsAdvanced((state) => state.isAdvanced);
	const [isLicensed, setIsLicensed] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const [t] = useTranslation();
	const createSnackbar = useSnackbar();

	const wscLicenseErrorLabel = t(
		'wsc.section.license.error',
		'Error fetching license details. Please try again later.'
	);

	useEffect(() => {
		if (isAdvanced) {
			fetchSoap('zextras', {
				_jsns: ZIMBRA_ADMIN_URN,
				module: 'ZxCore',
				action: 'getLicenseInfo'
			})
				.then((res) => {
					const response = JSON.parse(res.response.content);
					if (response.ok) {
						const features = response.response?.features ?? [];
						const wscFeature = features.find(
							(feature: { name: string }) => feature.name === 'wsc_basic'
						);
						setIsLicensed(!!wscFeature?.enabled);
					} else {
						throw new Error(response?.error?.message);
					}
				})
				.catch((err) => {
					setError(err?.message);
					createSnackbar({
						key: 'wsc-license-error',
						label: wscLicenseErrorLabel,
						severity: 'error',
						autoHideTimeout: 5000
					});
				})
				.finally(() => {
					setIsLoading(false);
				});
		}
	}, [createSnackbar, wscLicenseErrorLabel, isAdvanced]);

	return { isLicensed, isLoading, error, requiresLicenseCheck: isAdvanced };
};

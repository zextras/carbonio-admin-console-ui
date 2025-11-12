/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/carbonio-design-system';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { postSoapFetchRequest } from '../../exports';

export const fetchSoap = async (api: string, body: any): Promise<any> =>
	postSoapFetchRequest(`/service/admin/soap/${api}`, body, `${api}`).then((res: any) => res.Body);

const ZIMBRA_ADMIN_URN = 'urn:zimbraAdmin';

type LicenseResponse = {
	ok: boolean;
	message?: string;
	response?: {
		type: string;
		subType?: string;
		endUser?: string;
		customer?: string;
		infrastructureId?: string;
		dateStart?: number;
		dateEnd?: number;
		maintenanceEndDate?: number;
		maintenanceStatus?: 'active' | 'expired' | 'expiring';
		lastValidationCheck?: number;
		nextValidationDeadline?: number;
		accountCount?: number;
		licensedUsers?: number;
		expired?: boolean;
		notYetValid?: boolean;
		authenticationToken?: string;
		features: Array<{
			name: string;
			quantity: string;
			enabled: boolean;
		}>;
	};
};

type VersionResponse = {
	ok: boolean;
	response?: {
		version: string;
	};
};

export const queryKeys = {
	all: ['subscription'] as const,
	license: () => [...queryKeys.all, 'license'] as const,
	version: () => [...queryKeys.all, 'version'] as const
};

const fetchVersion = async (): Promise<VersionResponse> => {
	const res = await fetchSoap('admin-ui-console', {
		_jsns: ZIMBRA_ADMIN_URN,
		module: 'ZxCore',
		action: 'getVersion'
	});
	return JSON.parse(res.response.content);
};

const activateLicense = async (token: string, renewal = false): Promise<LicenseResponse> => {
	const res = await fetchSoap('admin-ui-console', {
		_jsns: ZIMBRA_ADMIN_URN,
		module: 'ZxCore',
		action: 'activate-license',
		token,
		...(renewal && { renewal: true })
	});
	return JSON.parse(res.response.content);
};

const removeLicense = async (): Promise<LicenseResponse> => {
	const res = await fetchSoap('admin-ui-console', {
		_jsns: ZIMBRA_ADMIN_URN,
		module: 'ZxCore',
		action: 'doRemoveLicense',
		iamsure: true
	});
	return JSON.parse(res.response.content);
};

const fetchLicenseInfo = async (): Promise<LicenseResponse> => {
	const res = await fetchSoap('admin-ui-console', {
		_jsns: ZIMBRA_ADMIN_URN,
		module: 'ZxCore',
		action: 'getLicenseInfo'
	});
	return JSON.parse(res.response.content);
};

export const useLicenseInfo = () => {
	return useQuery({
		queryKey: queryKeys.license(),
		queryFn: fetchLicenseInfo,
		retry: 3,
		select: (data) => {
			if (!data.ok || !data.response || data.response.type === 'None') {
				return null;
			}
			return data;
		}
	});
};

export const useVersion = () => {
	return useQuery({
		queryKey: queryKeys.version(),
		queryFn: fetchVersion,
		retry: 3,
		select: (data) => (data.ok ? data.response?.version : undefined)
	});
};

export const useActivateLicense = () => {
	const { t } = useTranslation();
	const createSnackbar = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ token, renewal = false }: { token: string; renewal?: boolean }) =>
			activateLicense(token, renewal),
		onSuccess: (data) => {
			if (data.ok) {
				createSnackbar({
					key: '1',
					severity: 'success',
					label: data.message || t('core.subscription.license_activated_successfully'),
					replace: true
				});
				queryClient.invalidateQueries({ queryKey: queryKeys.license() });
			} else {
				createSnackbar({
					key: '1',
					severity: 'error',
					label:
						data.message ||
						t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					replace: true
				});
			}
		},
		onError: () => {
			createSnackbar({
				key: '1',
				severity: 'error',
				label: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
				replace: true
			});
		}
	});
};

export const useRemoveLicense = () => {
	const { t } = useTranslation();
	const createSnackbar = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: removeLicense,
		onSuccess: (data) => {
			if (data.ok) {
				createSnackbar({
					key: '1',
					severity: 'success',
					label:
						data.message ||
						t(
							'core.subscription.license_deactivated_successfully',
							'License deactivated successfully'
						),
					replace: true
				});
				queryClient.invalidateQueries({ queryKey: queryKeys.license() });
			} else {
				createSnackbar({
					key: '1',
					severity: 'error',
					label:
						data.message ||
						t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					replace: true
				});
			}
		},
		onError: () => {
			createSnackbar({
				key: '1',
				severity: 'error',
				label: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
				replace: true
			});
		}
	});
};

type ModuleLicenseInfo = {
	maintenanceEndDate?: number;
	maintenanceStatus?: 'active' | 'expired' | 'expiring';
	subType?: string;
};

export const useModuleLicenseInfo = () => {
	const { data: licenseData } = useLicenseInfo();
	const [isLicenseBannerOpen, setIsLicenseBannerOpen] = useState(true);

	const moduleLicenseInfo: ModuleLicenseInfo | null = licenseData?.response
		? {
				maintenanceEndDate: licenseData?.response.maintenanceEndDate,
				maintenanceStatus: licenseData?.response.maintenanceStatus,
				subType: licenseData?.response.subType
			}
		: null;

	const licenseBannerShouldBeDisplayed =
		isLicenseBannerOpen &&
		moduleLicenseInfo?.subType === 'PERPETUAL' &&
		moduleLicenseInfo.maintenanceStatus !== 'active';

	return {
		moduleLicenseInfo,
		licenseBannerShouldBeDisplayed,
		setIsLicenseBannerOpen
	};
};

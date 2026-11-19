/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import {
	fetchLicenseV1Info,
	type LicenseV1Error,
	type LicenseV1Info,
} from '../services/license-info-service';

export class LicenseV1QueryError extends Error {
	readonly licenseError: LicenseV1Error;

	constructor(licenseError: LicenseV1Error) {
		super(licenseError.detail);
		this.name = 'LicenseV1QueryError';
		this.licenseError = licenseError;
	}
}

export const licenseV1QueryKeys = {
	all: ['license', 'v1-info'] as const,
};

export const queryFnLicenseV1Info = async (): Promise<LicenseV1Info | null> => {
	const result = await fetchLicenseV1Info();
	switch (result.type) {
		case 'success':
			return result.license;
		case 'no-license':
			// No license installed is a state, not a failure: data becomes null
			// so React Query treats it as success and does not retry.
			return null;
		case 'error':
			throw new LicenseV1QueryError(result.error);
	}
};

export const licenseV1Retry = (failureCount: number, error: unknown): boolean => {
	if (failureCount >= 2) {
		return false;
	}
	if (!(error instanceof LicenseV1QueryError)) {
		return false;
	}
	const { licenseError } = error;
	if (licenseError.kind === 'network-error') {
		return true;
	}
	return licenseError.kind === 'http-error' && licenseError.status >= 500;
};

type UseLicenseV1InfoOptions = Omit<
	UseQueryOptions<LicenseV1Info | null>,
	'queryKey' | 'queryFn'
> & {
	enabled?: boolean;
};

export const useLicenseV1Info = (options?: UseLicenseV1InfoOptions) =>
	useQuery({
		queryKey: licenseV1QueryKeys.all,
		queryFn: queryFnLicenseV1Info,
		retry: licenseV1Retry,
		...options,
	});

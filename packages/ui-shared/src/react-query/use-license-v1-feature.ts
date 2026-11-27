/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useQuery } from '@tanstack/react-query';

import { isLicenseV1FeatureAllowed, type LicenseV1Feature } from '../utils/license-v1-features';
import { licenseV1QueryKeys, licenseV1Retry, queryFnLicenseV1Info } from './use-license-v1-info';

export const useLicenseV1Feature = (feature: LicenseV1Feature) =>
  useQuery({
    queryKey: licenseV1QueryKeys.all,
    queryFn: queryFnLicenseV1Info,
    retry: licenseV1Retry,
    select: (license) => isLicenseV1FeatureAllowed(license, feature),
  });

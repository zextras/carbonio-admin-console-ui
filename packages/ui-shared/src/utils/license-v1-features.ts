/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { LicenseV1Info, LicenseV1SeatStatus } from '../services/license-info-service';

export type LicenseV1Feature = 'Chats' | 'Files';

const WORKSPACE_EDITION = 'Workspace';

const UNUSABLE_SEAT_STATUSES: ReadonlySet<LicenseV1SeatStatus> = new Set(['not active', 'red']);

/**
 * Mirrors the backend subscription check (`licenseValid && WORKSPACE && notOverQuota`) at license
 * level: the license must be valid, then usage-based licenses (metered, isp) grant a feature
 * through the bundle with the same name, while seat-based licenses (regular, trial, perpetual)
 * grant it through a Workspace edition that is active and not over quota.
 */
export function isLicenseV1FeatureAllowed(
  license: LicenseV1Info | null | undefined,
  feature: LicenseV1Feature,
): boolean {
  if (license?.status !== 'valid') {
    return false;
  }
  if (license.licenseType === 'metered' || license.licenseType === 'isp') {
    return license.bundles.some((bundle) => bundle.name === feature);
  }
  return license.editions.some(
    (edition) =>
      edition.name === WORKSPACE_EDITION && !UNUSABLE_SEAT_STATUSES.has(edition.status),
  );
}

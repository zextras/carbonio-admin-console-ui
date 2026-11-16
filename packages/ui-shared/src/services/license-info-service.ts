/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type LicenseV1Status = 'valid' | 'expired' | 'not yet valid';

export type LicenseV1Type = 'regular' | 'trial' | 'perpetual' | 'metered' | 'isp';

export type LicenseV1SeatStatus = 'green' | 'yellow' | 'red' | 'not active';

export type LicenseV1MaintenanceStatus = 'active' | 'expired' | 'expiring' | 'invalid';

export type LicenseV1SeatItem = {
  name: string;
  status: LicenseV1SeatStatus;
  assignedSeats: number;
  totalSeats: number;
};

type LicenseV1Common = {
  status: LicenseV1Status;
  companyName: string;
  partner: string;
  orderId: string;
  carbonioVersion: string;
  activationToken: string;
  startDate: string;
  endDate: string;
};

export type LicenseV1RegularInfo = LicenseV1Common & {
  licenseType: 'regular';
  editions: Array<LicenseV1SeatItem>;
  addOns: Array<LicenseV1SeatItem>;
};

export type LicenseV1TrialInfo = LicenseV1Common & {
  licenseType: 'trial';
  editions: Array<LicenseV1SeatItem>;
  addOns: Array<LicenseV1SeatItem>;
};

export type LicenseV1PerpetualInfo = LicenseV1Common & {
  licenseType: 'perpetual';
  maxCarbonioVersion: string;
  maintenanceEndDate: string;
  maintenanceStatus: LicenseV1MaintenanceStatus;
  editions: Array<LicenseV1SeatItem>;
  addOns: Array<LicenseV1SeatItem>;
};

export type LicenseV1MeteredInfo = LicenseV1Common & {
  licenseType: 'metered' | 'isp';
  lastValidationCheck: string;
  nextValidationDeadline: string;
  renewTimeLeft: number;
  maxTotalSeats: number;
  addOns: Array<{ name: string; status: LicenseV1SeatStatus; assignedSeats: number }>;
  bundles: Array<{ name: string; assignedSeats: number }>;
};

export type LicenseV1Info =
  | LicenseV1RegularInfo
  | LicenseV1TrialInfo
  | LicenseV1PerpetualInfo
  | LicenseV1MeteredInfo;

export type LicenseV1Result =
  | { type: 'success'; license: LicenseV1Info }
  | { type: 'no-license' }
  | { type: 'error'; error: string };

const KNOWN_LICENSE_TYPES = new Set<string>(['regular', 'trial', 'perpetual', 'metered', 'isp']);

function isLicenseV1Payload(value: unknown): value is LicenseV1Info {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.licenseType === 'string' &&
    KNOWN_LICENSE_TYPES.has(record.licenseType) &&
    typeof record.status === 'string'
  );
}

function parseLicenseV1Payload(text: string): LicenseV1Info | null {
  try {
    const payload: unknown = JSON.parse(text);
    return isLicenseV1Payload(payload) ? payload : null;
  } catch {
    return null;
  }
}

export const fetchLicenseV1Info = async (): Promise<LicenseV1Result> => {
  try {
    const response = await fetch('/license/v1/info');

    if (response.status === 404) {
      return { type: 'no-license' };
    }

    if (response.status === 401) {
      return { type: 'error', error: 'Unauthorized' };
    }

    if (!response.ok) {
      return { type: 'error', error: `License info request failed: ${response.status}` };
    }

    const license = parseLicenseV1Payload(await response.text());
    if (license === null) {
      return { type: 'error', error: 'Invalid license payload' };
    }

    return { type: 'success', license };
  } catch (error) {
    return {
      type: 'error',
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

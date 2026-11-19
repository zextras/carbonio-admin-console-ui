/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type LicenseV1Status = 'valid' | 'expired' | 'not yet valid';

export type LicenseV1SeatStatus = 'green' | 'yellow' | 'red' | 'not active';

export type LicenseV1MaintenanceStatus = 'active' | 'expired' | 'expiring' | 'invalid';

export type LicenseV1AssignedSeatItem = {
  name: string;
  status: LicenseV1SeatStatus;
  assignedSeats: number;
};

export type LicenseV1SeatItem = LicenseV1AssignedSeatItem & {
  totalSeats: number;
};

export type LicenseV1BundleItem = {
  name: string;
  assignedSeats: number;
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
  totalActiveAccountsNumber: number;
  // The backend sends null when no license update time is recorded
  lastSyncTime: string | null;
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

type LicenseV1UsageCommon = LicenseV1Common & {
  lastValidationCheck: string;
  nextValidationDeadline: string;
  renewTimeLeft: number;
  maxTotalSeats: number;
  addOns: Array<LicenseV1AssignedSeatItem>;
  bundles: Array<LicenseV1BundleItem>;
};

export type LicenseV1MeteredInfo = LicenseV1UsageCommon & { licenseType: 'metered' };

export type LicenseV1IspInfo = LicenseV1UsageCommon & { licenseType: 'isp' };

export type LicenseV1Info =
  | LicenseV1RegularInfo
  | LicenseV1TrialInfo
  | LicenseV1PerpetualInfo
  | LicenseV1MeteredInfo
  | LicenseV1IspInfo;

// Discriminant values derived from the union so the alias cannot drift from the members
export type LicenseV1Type = LicenseV1Info['licenseType'];

export type LicenseV1Error =
  | { kind: 'http-error'; status: number; detail: string }
  | { kind: 'invalid-payload'; detail: string }
  | { kind: 'network-error'; detail: string };

export type LicenseV1Result =
  | { type: 'success'; license: LicenseV1Info }
  | { type: 'no-license' }
  | { type: 'error'; error: LicenseV1Error };

const KNOWN_LICENSE_TYPES = {
  regular: true,
  trial: true,
  perpetual: true,
  metered: true,
  isp: true,
} as const satisfies Record<LicenseV1Type, true>;

function isLicenseV1Payload(value: unknown): value is LicenseV1Info {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.licenseType === 'string' &&
    Object.hasOwn(KNOWN_LICENSE_TYPES, record.licenseType) &&
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

function describeInvalidPayload(text: string): string {
  try {
    const payload: unknown = JSON.parse(text);
    if (typeof payload === 'object' && payload !== null) {
      const licenseType = (payload as Record<string, unknown>).licenseType;
      if (typeof licenseType === 'string' && licenseType.length > 0) {
        return `Invalid license payload: unknown licenseType '${licenseType.slice(0, 100)}'`;
      }
    }
  } catch {
    // the body is not JSON at all
  }
  return 'Invalid license payload: response is not valid JSON';
}

export const fetchLicenseV1Info = async (): Promise<LicenseV1Result> => {
  try {
    const response = await fetch('/license/v1/info');

    if (response.status === 404) {
      return { type: 'no-license' };
    }

    if (!response.ok) {
      const body = (await response.text()).trim().slice(0, 200);
      return {
        type: 'error',
        error: {
          kind: 'http-error',
          status: response.status,
          detail: body.length > 0 ? body : `License info request failed: ${response.status}`,
        },
      };
    }

    const text = await response.text();
    const license = parseLicenseV1Payload(text);
    if (license === null) {
      return {
        type: 'error',
        error: { kind: 'invalid-payload', detail: describeInvalidPayload(text) },
      };
    }

    return { type: 'success', license };
  } catch (error) {
    return {
      type: 'error',
      error: {
        kind: 'network-error',
        detail: error instanceof Error ? error.message : String(error),
      },
    };
  }
};

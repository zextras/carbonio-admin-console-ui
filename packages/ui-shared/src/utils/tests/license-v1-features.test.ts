/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type {
  LicenseV1Info,
  LicenseV1SeatItem,
  LicenseV1SeatStatus,
  LicenseV1Type,
} from '../../services/license-info-service';
import { isLicenseV1FeatureAllowed } from '../license-v1-features';

const COMMON = {
  status: 'valid',
  companyName: 'Acme',
  partner: 'Partner',
  orderId: 'order-1',
  carbonioVersion: '25.12.0',
  activationToken: 'token',
  startDate: '2026-01-01',
  endDate: '2027-01-01',
  totalActiveAccountsNumber: 10,
  lastSyncTime: null,
} as const;

function usageLicense(
  licenseType: Extract<LicenseV1Type, 'metered' | 'isp'>,
  bundleNames: Array<string>,
): LicenseV1Info {
  return {
    ...COMMON,
    licenseType,
    lastValidationCheck: '2026-11-01',
    nextValidationDeadline: '2026-12-01',
    renewTimeLeft: 30,
    maxTotalSeats: 100,
    addOns: [],
    bundles: bundleNames.map((name) => ({ name, assignedSeats: 1 })),
  };
}

function seatLicense(
  licenseType: Extract<LicenseV1Type, 'regular' | 'trial'>,
  workspaceStatus?: LicenseV1SeatStatus,
): LicenseV1Info {
  const editions: Array<LicenseV1SeatItem> = [
    { name: 'Email', status: 'green', assignedSeats: 5, totalSeats: 50 },
  ];
  if (workspaceStatus) {
    editions.push({ name: 'Workspace', status: workspaceStatus, assignedSeats: 2, totalSeats: 20 });
  }
  return { ...COMMON, licenseType, editions, addOns: [] };
}

function perpetualLicense(workspaceStatus: LicenseV1SeatStatus): LicenseV1Info {
  return {
    ...COMMON,
    licenseType: 'perpetual',
    maxCarbonioVersion: '26.0.0',
    maintenanceEndDate: '2027-01-01',
    maintenanceStatus: 'active',
    editions: [{ name: 'Workspace', status: workspaceStatus, assignedSeats: 2, totalSeats: 20 }],
    addOns: [],
  };
}

describe('isLicenseV1FeatureAllowed', () => {
  it('returns false when there is no license', () => {
    expect(isLicenseV1FeatureAllowed(null, 'Chats')).toBe(false);
    expect(isLicenseV1FeatureAllowed(undefined, 'Files')).toBe(false);
  });

  it.each(['metered', 'isp'] as const)(
    'allows a feature on a %s license when its bundle is present',
    (licenseType) => {
      const license = usageLicense(licenseType, ['Email', 'Chats']);
      expect(isLicenseV1FeatureAllowed(license, 'Chats')).toBe(true);
      expect(isLicenseV1FeatureAllowed(license, 'Files')).toBe(false);
    },
  );

  it('denies every feature on a usage license without bundles', () => {
    const license = usageLicense('metered', []);
    expect(isLicenseV1FeatureAllowed(license, 'Chats')).toBe(false);
    expect(isLicenseV1FeatureAllowed(license, 'Files')).toBe(false);
  });

  it.each(['regular', 'trial'] as const)(
    'allows every feature on a %s license with an active Workspace edition',
    (licenseType) => {
      const license = seatLicense(licenseType, 'green');
      expect(isLicenseV1FeatureAllowed(license, 'Chats')).toBe(true);
      expect(isLicenseV1FeatureAllowed(license, 'Files')).toBe(true);
    },
  );

  it('allows features on a perpetual license with an active Workspace edition', () => {
    expect(isLicenseV1FeatureAllowed(perpetualLicense('yellow'), 'Files')).toBe(true);
  });

  it('denies features when the Workspace edition is over quota', () => {
    expect(isLicenseV1FeatureAllowed(seatLicense('regular', 'red'), 'Chats')).toBe(false);
    expect(isLicenseV1FeatureAllowed(perpetualLicense('red'), 'Files')).toBe(false);
  });

  it.each(['expired', 'not yet valid'] as const)(
    'denies features when the license is %s',
    (status) => {
      expect(
        isLicenseV1FeatureAllowed({ ...seatLicense('regular', 'green'), status }, 'Chats'),
      ).toBe(false);
      expect(
        isLicenseV1FeatureAllowed({ ...usageLicense('metered', ['Files']), status }, 'Files'),
      ).toBe(false);
    },
  );

  it('denies features when the Workspace edition is not active', () => {
    expect(isLicenseV1FeatureAllowed(seatLicense('regular', 'not active'), 'Chats')).toBe(false);
    expect(isLicenseV1FeatureAllowed(perpetualLicense('not active'), 'Files')).toBe(false);
  });

  it('denies features when only the Email edition is licensed', () => {
    expect(isLicenseV1FeatureAllowed(seatLicense('regular'), 'Chats')).toBe(false);
  });
});

/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAPIInterceptor } from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';

import { fetchLicenseV1Info } from '../license-info-service';

describe('fetchLicenseV1Info', () => {
  describe('regular license', () => {
    const license = {
      licenseType: 'regular',
      status: 'valid',
      companyName: 'Acme Corp',
      partner: 'Zextras Partner',
      orderId: 'ORD-123',
      carbonioVersion: '25.1.2',
      activationToken: 'activation-token',
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2027-01-01T00:00:00.000Z',
      totalActiveAccountsNumber: 42,
      lastSyncTime: '2026-11-16T10:30:00.000Z',
      editions: [{ name: 'Email', status: 'green', assignedSeats: 5, totalSeats: 10 }],
      addOns: [{ name: 'ActiveSync', status: 'green', assignedSeats: 3, totalSeats: 10 }],
    };

    it('should return success with the parsed license', async () => {
      createAPIInterceptor('get', '/services/license/v1/info', () => HttpResponse.json(license));

      const result = await fetchLicenseV1Info();

      expect(result).toEqual({ type: 'success', license });
    });
  });

  describe('trial license', () => {
    const license = {
      licenseType: 'trial',
      status: 'valid',
      companyName: 'Acme Corp',
      partner: 'Zextras Partner',
      orderId: 'ORD-TRIAL',
      carbonioVersion: '25.1.2',
      activationToken: 'activation-token',
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2026-12-01T00:00:00.000Z',
      totalActiveAccountsNumber: 7,
      lastSyncTime: null,
      editions: [{ name: 'Workspace', status: 'green', assignedSeats: 2, totalSeats: 5 }],
      addOns: [],
    };

    it('should return success with the parsed license', async () => {
      createAPIInterceptor('get', '/services/license/v1/info', () => HttpResponse.json(license));

      const result = await fetchLicenseV1Info();

      expect(result).toEqual({ type: 'success', license });
    });
  });

  describe('perpetual license', () => {
    const license = {
      licenseType: 'perpetual',
      status: 'valid',
      companyName: 'Acme Corp',
      partner: 'Zextras Partner',
      orderId: 'ORD-999',
      carbonioVersion: '25.1.2',
      activationToken: 'activation-token',
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2027-01-01T00:00:00.000Z',
      maxCarbonioVersion: '25.X.X',
      maintenanceEndDate: '2027-06-30T00:00:00.000Z',
      maintenanceStatus: 'active',
      totalActiveAccountsNumber: 100,
      lastSyncTime: '2026-11-15T08:00:00.000Z',
      editions: [{ name: 'Email', status: 'green', assignedSeats: 5, totalSeats: 10 }],
      addOns: [],
    };

    it('should return success with the maintenance fields', async () => {
      createAPIInterceptor('get', '/services/license/v1/info', () => HttpResponse.json(license));

      const result = await fetchLicenseV1Info();

      expect(result).toEqual({ type: 'success', license });
    });
  });

  describe('metered license', () => {
    const license = {
      licenseType: 'metered',
      status: 'valid',
      companyName: 'Acme Corp',
      partner: 'Zextras Partner',
      orderId: 'ORD-456',
      carbonioVersion: '25.1.2',
      activationToken: 'activation-token',
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2027-01-01T00:00:00.000Z',
      lastValidationCheck: '2026-11-01T00:00:00.000Z',
      nextValidationDeadline: '2026-11-08T00:00:00.000Z',
      renewTimeLeft: 123456789,
      maxTotalSeats: 500,
      totalActiveAccountsNumber: 250,
      lastSyncTime: '2026-11-17T12:00:00.000Z',
      addOns: [{ name: 'ActiveSync', status: 'green', assignedSeats: 3 }],
      bundles: [{ name: 'Files', assignedSeats: 12 }],
    };

    it('should return success with bundles, maxTotalSeats and validation dates', async () => {
      createAPIInterceptor('get', '/services/license/v1/info', () => HttpResponse.json(license));

      const result = await fetchLicenseV1Info();

      expect(result).toEqual({ type: 'success', license });
    });
  });

  describe('isp license', () => {
    const license = {
      licenseType: 'isp',
      status: 'valid',
      companyName: 'Acme ISP',
      partner: 'Zextras Partner',
      orderId: 'ORD-ISP',
      carbonioVersion: '25.1.2',
      activationToken: 'activation-token',
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2027-01-01T00:00:00.000Z',
      lastValidationCheck: '2026-11-01T00:00:00.000Z',
      nextValidationDeadline: '2026-11-08T00:00:00.000Z',
      renewTimeLeft: 987654321,
      maxTotalSeats: 1000,
      totalActiveAccountsNumber: 900,
      lastSyncTime: '2026-11-17T09:45:00.000Z',
      addOns: [{ name: 'ActiveSync', status: 'not active', assignedSeats: 0 }],
      bundles: [{ name: 'Chats', assignedSeats: 40 }],
    };

    it('should return success with the parsed license', async () => {
      createAPIInterceptor('get', '/services/license/v1/info', () => HttpResponse.json(license));

      const result = await fetchLicenseV1Info();

      expect(result).toEqual({ type: 'success', license });
    });
  });

  describe('no license', () => {
    it('should return no-license on 404', async () => {
      createAPIInterceptor('get', '/services/license/v1/info', () =>
        HttpResponse.json({}, { status: 404 }),
      );

      const result = await fetchLicenseV1Info();

      expect(result).toEqual({ type: 'no-license' });
    });
  });

  describe('error handling', () => {
    it('should return an error on 401 without redirecting to login', async () => {
      createAPIInterceptor('get', '/services/license/v1/info', () =>
        HttpResponse.json({}, { status: 401 }),
      );

      const result = await fetchLicenseV1Info();

      expect(result).toMatchObject({
        type: 'error',
        error: { kind: 'http-error', status: 401 },
      });
    });

    it('should return an error on server failure', async () => {
      createAPIInterceptor('get', '/services/license/v1/info', () =>
        HttpResponse.json({}, { status: 500 }),
      );
      const failure = await fetchLicenseV1Info();
      expect(failure).toMatchObject({
        type: 'error',
        error: { kind: 'http-error', status: 500 },
      });

      createAPIInterceptor('get', '/services/license/v1/info', () => HttpResponse.error());
      const networkFailure = await fetchLicenseV1Info();
      expect(networkFailure).toMatchObject({
        type: 'error',
        error: { kind: 'network-error' },
      });
    });

    it('should return an error when the body is not JSON', async () => {
      createAPIInterceptor('get', '/services/license/v1/info', () =>
        HttpResponse.text('<html>Bad Gateway</html>', { status: 200 }),
      );

      const result = await fetchLicenseV1Info();

      expect(result).toMatchObject({ type: 'error', error: { kind: 'invalid-payload' } });
      if (result.type !== 'error') return;
      expect(result.error.detail).toMatch(/invalid license payload/i);
    });

    it('should return an error for an unknown licenseType', async () => {
      createAPIInterceptor('get', '/services/license/v1/info', () =>
        HttpResponse.json({ licenseType: 'quantum', status: 'valid' }),
      );

      const result = await fetchLicenseV1Info();

      expect(result).toMatchObject({ type: 'error', error: { kind: 'invalid-payload' } });
      if (result.type !== 'error') return;
      expect(result.error.detail).toContain("licenseType 'quantum'");
    });
  });
});

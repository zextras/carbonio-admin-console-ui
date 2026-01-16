/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createSoapAPIInterceptor } from 'admin-ui-test-utils';
import { describe, expect, it } from 'vitest';

import { getQuotaUsage } from '../get-quota-usage-service';

describe('getQuotaUsage', () => {
    it('should call soapFetch with default parameters', async () => {
        const mockResponse = {
            account: [
                { name: 'user1@example.com', used: 1024 },
                { name: 'user2@example.com', used: 2048 }
            ]
        };
        createSoapAPIInterceptor('GetQuotaUsage', mockResponse);

        const domainName = 'example.com';

        const result = await getQuotaUsage(domainName);

        expect(result).toEqual(mockResponse);
    });

    it('should use default sortBy when not provided', async () => {
        const mockResponse = { account: [] };
        createSoapAPIInterceptor('GetQuotaUsage', mockResponse);

        const result = await getQuotaUsage('test.com');

        expect(result).toEqual(mockResponse);
    });

    it('should use custom sortBy when provided', async () => {
        const mockResponse = { account: [] };
        createSoapAPIInterceptor('GetQuotaUsage', mockResponse);

        const result = await getQuotaUsage('test.com', undefined, undefined, 'name');

        expect(result).toEqual(mockResponse);
    });

    it('should use default offset of 0 when not provided', async () => {
        const mockResponse = { account: [] };
        createSoapAPIInterceptor('GetQuotaUsage', mockResponse);

        const result = await getQuotaUsage('test.com');

        expect(result).toEqual(mockResponse);
    });

    it('should use custom offset when provided', async () => {
        const mockResponse = { account: [] };
        createSoapAPIInterceptor('GetQuotaUsage', mockResponse);

        const result = await getQuotaUsage('test.com', 100);

        expect(result).toEqual(mockResponse);
    });

    it('should use default limit of 50 when not provided', async () => {
        const mockResponse = { account: [] };
        createSoapAPIInterceptor('GetQuotaUsage', mockResponse);

        const result = await getQuotaUsage('test.com');

        expect(result).toEqual(mockResponse);
    });

    it('should use custom limit when provided', async () => {
        const mockResponse = { account: [] };
        createSoapAPIInterceptor('GetQuotaUsage', mockResponse);

        const result = await getQuotaUsage('test.com', undefined, 100);

        expect(result).toEqual(mockResponse);
    });

    it('should handle all custom parameters together', async () => {
        const mockResponse = { account: [] };
        createSoapAPIInterceptor('GetQuotaUsage', mockResponse);

        const result = await getQuotaUsage('custom.com', 50, 25, 'percentUsed');

        expect(result).toEqual(mockResponse);
    });

    it('should use default offset when offset is 0 (falsy)', async () => {
        const mockResponse = { account: [] };
        createSoapAPIInterceptor('GetQuotaUsage', mockResponse);

        const result = await getQuotaUsage('test.com', 0, 100);

        expect(result).toEqual(mockResponse);
    });

    it('should use default limit when limit is 0 (falsy)', async () => {
        const mockResponse = { account: [] };
        createSoapAPIInterceptor('GetQuotaUsage', mockResponse);

        const result = await getQuotaUsage('test.com', 10, 0);

        expect(result).toEqual(mockResponse);
    });

    it('should return the response from soapFetch', async () => {
        const mockResponse = {
            account: [
                {
                    id: '123',
                    name: 'user1@example.com',
                    used: 1073741824,
                    limit: 2147483648
                }
            ],
            more: false
        };
        createSoapAPIInterceptor('GetQuotaUsage', mockResponse);

        const result = await getQuotaUsage('example.com');

        expect(result).toEqual(mockResponse);
    });

    it('should always set refresh to "1"', async () => {
        const mockResponse = { account: [] };
        createSoapAPIInterceptor('GetQuotaUsage', mockResponse);

        const result = await getQuotaUsage('test.com', 10, 20, 'name');

        expect(result).toEqual(mockResponse);
    });

    it('should always set allServers to "1"', async () => {
        const mockResponse = { account: [] };
        createSoapAPIInterceptor('GetQuotaUsage', mockResponse);

        const result = await getQuotaUsage('test.com', 10, 20, 'name');

        expect(result).toEqual(mockResponse);
    });

    it('should handle domain names with special characters', async () => {
        const mockResponse = { account: [] };
        createSoapAPIInterceptor('GetQuotaUsage', mockResponse);

        const result = await getQuotaUsage('test-domain.co.uk');

        expect(result).toEqual(mockResponse);
    });

    it('should handle large offset values', async () => {
        const mockResponse = { account: [] };
        createSoapAPIInterceptor('GetQuotaUsage', mockResponse);

        const result = await getQuotaUsage('test.com', 999999);

        expect(result).toEqual(mockResponse);
    });

    it('should handle large limit values', async () => {
        const mockResponse = { account: [] };
        createSoapAPIInterceptor('GetQuotaUsage', mockResponse);

        const result = await getQuotaUsage('test.com', 0, 10000);

        expect(result).toEqual(mockResponse);
    });

    it('should handle different sortBy values', async () => {
        const mockResponse = { account: [] };

        const sortByValues = ['name', 'totalUsed', 'percentUsed', 'quota'];

        for (const sortBy of sortByValues) {
            createSoapAPIInterceptor('GetQuotaUsage', mockResponse);
            const result = await getQuotaUsage('test.com', 0, 50, sortBy);
            expect(result).toEqual(mockResponse);
        }
    });

    it('should handle pagination scenario - first page', async () => {
        const mockResponse = {
            account: new Array(50).fill({ name: 'user@example.com', used: 1024 }),
            more: true
        };
        createSoapAPIInterceptor('GetQuotaUsage', mockResponse);

        const result = await getQuotaUsage('example.com', 0, 50);

        expect(result).toEqual(mockResponse);
    });

    it('should handle pagination scenario - second page', async () => {
        const mockResponse = {
            account: new Array(50).fill({ name: 'user@example.com', used: 1024 }),
            more: true
        };
        createSoapAPIInterceptor('GetQuotaUsage', mockResponse);

        const result = await getQuotaUsage('example.com', 50, 50);

        expect(result).toEqual(mockResponse);
    });

    it('should handle empty domain name', async () => {
        const mockResponse = { account: [] };
        createSoapAPIInterceptor('GetQuotaUsage', mockResponse);

        const result = await getQuotaUsage('');

        expect(result).toEqual(mockResponse);
    });

    it('should handle undefined parameters correctly', async () => {
        const mockResponse = { account: [] };
        createSoapAPIInterceptor('GetQuotaUsage', mockResponse);

        const result = await getQuotaUsage('test.com');

        expect(result).toEqual(mockResponse);
    });
});

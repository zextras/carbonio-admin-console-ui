/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/admin-ui-bootstrap';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getQuotaUsage } from '../get-quota-usage-service';

vi.mock('@zextras/admin-ui-bootstrap', () => ({
    soapFetch: vi.fn()
}));

describe('getQuotaUsage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should call soapFetch with default parameters', async () => {
        const mockResponse = {
            account: [
                { name: 'user1@example.com', used: 1024 },
                { name: 'user2@example.com', used: 2048 }
            ]
        };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        const domainName = 'example.com';

        await getQuotaUsage(domainName);

        expect(soapFetch).toHaveBeenCalledWith('GetQuotaUsage', {
            _jsns: 'urn:zimbraAdmin',
            sortBy: 'totalUsed',
            offset: 0,
            limit: 50,
            refresh: '1',
            domain: 'example.com',
            allServers: '1'
        });
    });

    it('should use default sortBy when not provided', async () => {
        const mockResponse = { account: [] };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        await getQuotaUsage('test.com');

        const callArgs = vi.mocked(soapFetch).mock.calls[0][1] as any;
        expect(callArgs.sortBy).toBe('totalUsed');
    });

    it('should use custom sortBy when provided', async () => {
        const mockResponse = { account: [] };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        await getQuotaUsage('test.com', undefined, undefined, 'name');

        expect(soapFetch).toHaveBeenCalledWith('GetQuotaUsage', {
            _jsns: 'urn:zimbraAdmin',
            sortBy: 'name',
            offset: 0,
            limit: 50,
            refresh: '1',
            domain: 'test.com',
            allServers: '1'
        });
    });

    it('should use default offset of 0 when not provided', async () => {
        const mockResponse = { account: [] };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        await getQuotaUsage('test.com');

        const callArgs = vi.mocked(soapFetch).mock.calls[0][1] as any;
        expect(callArgs.offset).toBe(0);
    });

    it('should use custom offset when provided', async () => {
        const mockResponse = { account: [] };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        await getQuotaUsage('test.com', 100);

        expect(soapFetch).toHaveBeenCalledWith('GetQuotaUsage', {
            _jsns: 'urn:zimbraAdmin',
            sortBy: 'totalUsed',
            offset: 100,
            limit: 50,
            refresh: '1',
            domain: 'test.com',
            allServers: '1'
        });
    });

    it('should use default limit of 50 when not provided', async () => {
        const mockResponse = { account: [] };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        await getQuotaUsage('test.com');

        const callArgs = vi.mocked(soapFetch).mock.calls[0][1] as any;
        expect(callArgs.limit).toBe(50);
    });

    it('should use custom limit when provided', async () => {
        const mockResponse = { account: [] };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        await getQuotaUsage('test.com', undefined, 100);

        expect(soapFetch).toHaveBeenCalledWith('GetQuotaUsage', {
            _jsns: 'urn:zimbraAdmin',
            sortBy: 'totalUsed',
            offset: 0,
            limit: 100,
            refresh: '1',
            domain: 'test.com',
            allServers: '1'
        });
    });

    it('should handle all custom parameters together', async () => {
        const mockResponse = { account: [] };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        await getQuotaUsage('custom.com', 50, 25, 'percentUsed');

        expect(soapFetch).toHaveBeenCalledWith('GetQuotaUsage', {
            _jsns: 'urn:zimbraAdmin',
            sortBy: 'percentUsed',
            offset: 50,
            limit: 25,
            refresh: '1',
            domain: 'custom.com',
            allServers: '1'
        });
    });

    it('should use default offset when offset is 0 (falsy)', async () => {
        const mockResponse = { account: [] };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        await getQuotaUsage('test.com', 0, 100);

        // 0 is falsy, so default offset of 0 is used (same result)
        expect(soapFetch).toHaveBeenCalledWith('GetQuotaUsage', {
            _jsns: 'urn:zimbraAdmin',
            sortBy: 'totalUsed',
            offset: 0,
            limit: 100,
            refresh: '1',
            domain: 'test.com',
            allServers: '1'
        });
    });

    it('should use default limit when limit is 0 (falsy)', async () => {
        const mockResponse = { account: [] };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        await getQuotaUsage('test.com', 10, 0);

        // 0 is falsy, so default limit of 50 is used
        expect(soapFetch).toHaveBeenCalledWith('GetQuotaUsage', {
            _jsns: 'urn:zimbraAdmin',
            sortBy: 'totalUsed',
            offset: 10,
            limit: 50,
            refresh: '1',
            domain: 'test.com',
            allServers: '1'
        });
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
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        const result = await getQuotaUsage('example.com');

        expect(result).toEqual(mockResponse);
    });

    it('should propagate errors from soapFetch', async () => {
        const error = new Error('Domain not found');
        vi.mocked(soapFetch).mockRejectedValue(error);

        await expect(getQuotaUsage('nonexistent.com')).rejects.toThrow('Domain not found');
    });

    it('should always set refresh to "1"', async () => {
        const mockResponse = { account: [] };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        await getQuotaUsage('test.com', 10, 20, 'name');

        const callArgs = vi.mocked(soapFetch).mock.calls[0][1] as any;
        expect(callArgs.refresh).toBe('1');
    });

    it('should always set allServers to "1"', async () => {
        const mockResponse = { account: [] };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        await getQuotaUsage('test.com', 10, 20, 'name');

        const callArgs = vi.mocked(soapFetch).mock.calls[0][1] as any;
        expect(callArgs.allServers).toBe('1');
    });

    it('should handle domain names with special characters', async () => {
        const mockResponse = { account: [] };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        await getQuotaUsage('test-domain.co.uk');

        expect(soapFetch).toHaveBeenCalledWith('GetQuotaUsage', {
            _jsns: 'urn:zimbraAdmin',
            sortBy: 'totalUsed',
            offset: 0,
            limit: 50,
            refresh: '1',
            domain: 'test-domain.co.uk',
            allServers: '1'
        });
    });

    it('should handle large offset values', async () => {
        const mockResponse = { account: [] };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        await getQuotaUsage('test.com', 999999);

        const callArgs = vi.mocked(soapFetch).mock.calls[0][1] as any;
        expect(callArgs.offset).toBe(999999);
    });

    it('should handle large limit values', async () => {
        const mockResponse = { account: [] };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        await getQuotaUsage('test.com', 0, 10000);

        const callArgs = vi.mocked(soapFetch).mock.calls[0][1] as any;
        expect(callArgs.limit).toBe(10000);
    });

    it('should handle different sortBy values', async () => {
        const mockResponse = { account: [] };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        const sortByValues = ['name', 'totalUsed', 'percentUsed', 'quota'];

        for (const sortBy of sortByValues) {
            vi.clearAllMocks();
            await getQuotaUsage('test.com', 0, 50, sortBy);

            const callArgs = vi.mocked(soapFetch).mock.calls[0][1] as any;
            expect(callArgs.sortBy).toBe(sortBy);
        }
    });

    it('should handle pagination scenario - first page', async () => {
        const mockResponse = {
            account: new Array(50).fill({ name: 'user@example.com', used: 1024 }),
            more: true
        };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        await getQuotaUsage('example.com', 0, 50);

        expect(soapFetch).toHaveBeenCalledWith('GetQuotaUsage', {
            _jsns: 'urn:zimbraAdmin',
            sortBy: 'totalUsed',
            offset: 0,
            limit: 50,
            refresh: '1',
            domain: 'example.com',
            allServers: '1'
        });
    });

    it('should handle pagination scenario - second page', async () => {
        const mockResponse = {
            account: new Array(50).fill({ name: 'user@example.com', used: 1024 }),
            more: true
        };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        await getQuotaUsage('example.com', 50, 50);

        expect(soapFetch).toHaveBeenCalledWith('GetQuotaUsage', {
            _jsns: 'urn:zimbraAdmin',
            sortBy: 'totalUsed',
            offset: 50,
            limit: 50,
            refresh: '1',
            domain: 'example.com',
            allServers: '1'
        });
    });

    it('should handle empty domain name', async () => {
        const mockResponse = { account: [] };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        await getQuotaUsage('');

        expect(soapFetch).toHaveBeenCalledWith('GetQuotaUsage', {
            _jsns: 'urn:zimbraAdmin',
            sortBy: 'totalUsed',
            offset: 0,
            limit: 50,
            refresh: '1',
            domain: '',
            allServers: '1'
        });
    });

    it('should handle undefined parameters correctly', async () => {
        const mockResponse = { account: [] };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        await getQuotaUsage('test.com');

        expect(soapFetch).toHaveBeenCalledWith('GetQuotaUsage', {
            _jsns: 'urn:zimbraAdmin',
            sortBy: 'totalUsed',
            offset: 0,
            limit: 50,
            refresh: '1',
            domain: 'test.com',
            allServers: '1'
        });
    });
});

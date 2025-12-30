/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/admin-ui-bootstrap';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { modifyAccountRequest } from '../modify-account';

vi.mock('@zextras/admin-ui-bootstrap', () => ({
    soapFetch: vi.fn()
}));

describe('modifyAccountRequest', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should call soapFetch with correct parameters for simple attributes', async () => {
        const mockResponse = { success: true };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        const id = 'account-123';
        const modifiedData = {
            displayName: 'John Doe',
            zimbraAccountStatus: 'active'
        };

        await modifyAccountRequest(id, modifiedData);

        expect(soapFetch).toHaveBeenCalledWith('ModifyAccount', {
            _jsns: 'urn:zimbraAdmin',
            id: 'account-123',
            a: [
                { n: 'displayName', _content: 'John Doe' },
                { n: 'zimbraAccountStatus', _content: 'active' }
            ]
        });
    });

    it('should split zimbraMailForwardingAddress by comma and space', async () => {
        const mockResponse = { success: true };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        const id = 'account-456';
        const modifiedData = {
            zimbraMailForwardingAddress: 'user1@example.com, user2@example.com, user3@example.com'
        };

        await modifyAccountRequest(id, modifiedData);

        expect(soapFetch).toHaveBeenCalledWith('ModifyAccount', {
            _jsns: 'urn:zimbraAdmin',
            id: 'account-456',
            a: [
                { n: 'zimbraMailForwardingAddress', _content: 'user1@example.com' },
                { n: 'zimbraMailForwardingAddress', _content: 'user2@example.com' },
                { n: 'zimbraMailForwardingAddress', _content: 'user3@example.com' }
            ]
        });
    });

    it('should split zimbraPrefCalendarForwardInvitesTo by comma and space', async () => {
        const mockResponse = { success: true };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        const id = 'account-789';
        const modifiedData = {
            zimbraPrefCalendarForwardInvitesTo: 'cal1@example.com, cal2@example.com'
        };

        await modifyAccountRequest(id, modifiedData);

        expect(soapFetch).toHaveBeenCalledWith('ModifyAccount', {
            _jsns: 'urn:zimbraAdmin',
            id: 'account-789',
            a: [
                { n: 'zimbraPrefCalendarForwardInvitesTo', _content: 'cal1@example.com' },
                { n: 'zimbraPrefCalendarForwardInvitesTo', _content: 'cal2@example.com' }
            ]
        });
    });

    it('should split zimbraAllowFromAddress by comma and space', async () => {
        const mockResponse = { success: true };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        const id = 'account-999';
        const modifiedData = {
            zimbraAllowFromAddress: 'alias1@example.com, alias2@example.com'
        };

        await modifyAccountRequest(id, modifiedData);

        expect(soapFetch).toHaveBeenCalledWith('ModifyAccount', {
            _jsns: 'urn:zimbraAdmin',
            id: 'account-999',
            a: [
                { n: 'zimbraAllowFromAddress', _content: 'alias1@example.com' },
                { n: 'zimbraAllowFromAddress', _content: 'alias2@example.com' }
            ]
        });
    });

    it('should handle empty string for special attributes', async () => {
        const mockResponse = { success: true };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        const id = 'account-empty';
        const modifiedData = {
            zimbraMailForwardingAddress: ''
        };

        await modifyAccountRequest(id, modifiedData);

        expect(soapFetch).toHaveBeenCalledWith('ModifyAccount', {
            _jsns: 'urn:zimbraAdmin',
            id: 'account-empty',
            a: [{ n: 'zimbraMailForwardingAddress', _content: '' }]
        });
    });

    it('should handle whitespace-only string for special attributes', async () => {
        const mockResponse = { success: true };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        const id = 'account-whitespace';
        const modifiedData = {
            zimbraMailForwardingAddress: '   '
        };

        await modifyAccountRequest(id, modifiedData);

        expect(soapFetch).toHaveBeenCalledWith('ModifyAccount', {
            _jsns: 'urn:zimbraAdmin',
            id: 'account-whitespace',
            a: [{ n: 'zimbraMailForwardingAddress', _content: '   ' }]
        });
    });

    it('should handle mixed attributes (special and normal)', async () => {
        const mockResponse = { success: true };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        const id = 'account-mixed';
        const modifiedData = {
            displayName: 'Jane Smith',
            zimbraMailForwardingAddress: 'forward@example.com, backup@example.com',
            zimbraAccountStatus: 'active',
            zimbraAllowFromAddress: 'alias@example.com'
        };

        await modifyAccountRequest(id, modifiedData);

        expect(soapFetch).toHaveBeenCalledWith('ModifyAccount', {
            _jsns: 'urn:zimbraAdmin',
            id: 'account-mixed',
            a: [
                { n: 'displayName', _content: 'Jane Smith' },
                { n: 'zimbraMailForwardingAddress', _content: 'forward@example.com' },
                { n: 'zimbraMailForwardingAddress', _content: 'backup@example.com' },
                { n: 'zimbraAccountStatus', _content: 'active' },
                { n: 'zimbraAllowFromAddress', _content: 'alias@example.com' }
            ]
        });
    });

    it('should handle single email for special attributes (no split)', async () => {
        const mockResponse = { success: true };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        const id = 'account-single';
        const modifiedData = {
            zimbraMailForwardingAddress: 'single@example.com'
        };

        await modifyAccountRequest(id, modifiedData);

        expect(soapFetch).toHaveBeenCalledWith('ModifyAccount', {
            _jsns: 'urn:zimbraAdmin',
            id: 'account-single',
            a: [{ n: 'zimbraMailForwardingAddress', _content: 'single@example.com' }]
        });
    });

    it('should handle empty modifiedData object', async () => {
        const mockResponse = { success: true };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        const id = 'account-empty-data';
        const modifiedData = {};

        await modifyAccountRequest(id, modifiedData);

        expect(soapFetch).toHaveBeenCalledWith('ModifyAccount', {
            _jsns: 'urn:zimbraAdmin',
            id: 'account-empty-data',
            a: []
        });
    });

    it('should return the response from soapFetch', async () => {
        const mockResponse = {
            account: {
                id: 'account-123',
                name: 'test@example.com'
            }
        };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        const result = await modifyAccountRequest('account-123', { displayName: 'Test' });

        expect(result).toEqual(mockResponse);
    });

    it('should propagate errors from soapFetch', async () => {
        const error = new Error('Network error');
        vi.mocked(soapFetch).mockRejectedValue(error);

        await expect(
            modifyAccountRequest('account-error', { displayName: 'Test' })
        ).rejects.toThrow('Network error');
    });

    it('should handle undefined values in modifiedData', async () => {
        const mockResponse = { success: true };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        const id = 'account-undefined';
        const modifiedData = {
            displayName: 'Test',
            description: undefined
        };

        await modifyAccountRequest(id, modifiedData);

        expect(soapFetch).toHaveBeenCalledWith('ModifyAccount', {
            _jsns: 'urn:zimbraAdmin',
            id: 'account-undefined',
            a: [
                { n: 'displayName', _content: 'Test' },
                { n: 'description', _content: undefined }
            ]
        });
    });

    it('should handle multiple special attributes at once', async () => {
        const mockResponse = { success: true };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        const id = 'account-multi-special';
        const modifiedData = {
            zimbraMailForwardingAddress: 'fw1@example.com, fw2@example.com',
            zimbraPrefCalendarForwardInvitesTo: 'cal1@example.com, cal2@example.com',
            zimbraAllowFromAddress: 'alias1@example.com, alias2@example.com'
        };

        await modifyAccountRequest(id, modifiedData);

        expect(soapFetch).toHaveBeenCalledWith('ModifyAccount', {
            _jsns: 'urn:zimbraAdmin',
            id: 'account-multi-special',
            a: [
                { n: 'zimbraMailForwardingAddress', _content: 'fw1@example.com' },
                { n: 'zimbraMailForwardingAddress', _content: 'fw2@example.com' },
                { n: 'zimbraPrefCalendarForwardInvitesTo', _content: 'cal1@example.com' },
                { n: 'zimbraPrefCalendarForwardInvitesTo', _content: 'cal2@example.com' },
                { n: 'zimbraAllowFromAddress', _content: 'alias1@example.com' },
                { n: 'zimbraAllowFromAddress', _content: 'alias2@example.com' }
            ]
        });
    });

    it('should handle emails with extra spaces in comma-separated list', async () => {
        const mockResponse = { success: true };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        const id = 'account-spaces';
        const modifiedData = {
            zimbraMailForwardingAddress: 'email1@example.com,  email2@example.com,   email3@example.com'
        };

        await modifyAccountRequest(id, modifiedData);

        // Split by ', ' will split each occurrence, leaving extra spaces in the results
        expect(soapFetch).toHaveBeenCalledWith('ModifyAccount', {
            _jsns: 'urn:zimbraAdmin',
            id: 'account-spaces',
            a: [
                { n: 'zimbraMailForwardingAddress', _content: 'email1@example.com' },
                { n: 'zimbraMailForwardingAddress', _content: ' email2@example.com' },
                { n: 'zimbraMailForwardingAddress', _content: '  email3@example.com' }
            ]
        });
    });

    it('should handle null values in special attributes', async () => {
        const mockResponse = { success: true };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        const id = 'account-null';
        const modifiedData = {
            zimbraMailForwardingAddress: null
        };

        await modifyAccountRequest(id, modifiedData);

        expect(soapFetch).toHaveBeenCalledWith('ModifyAccount', {
            _jsns: 'urn:zimbraAdmin',
            id: 'account-null',
            a: [{ n: 'zimbraMailForwardingAddress', _content: null }]
        });
    });
});

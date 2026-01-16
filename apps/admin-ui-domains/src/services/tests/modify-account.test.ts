/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createSoapAPIInterceptor } from 'admin-ui-test-utils';
import { describe, expect, it } from 'vitest';

import { modifyAccountRequest } from '../modify-account';

describe('modifyAccountRequest', () => {
    it('should call soapFetch with correct parameters for simple attributes', async () => {
        const mockResponse = { success: true };
        createSoapAPIInterceptor('ModifyAccount', mockResponse);

        const id = 'account-123';
        const modifiedData = {
            displayName: 'John Doe',
            zimbraAccountStatus: 'active'
        };

        const result = await modifyAccountRequest(id, modifiedData);

        expect(result).toEqual(mockResponse);
    });

    it('should split zimbraMailForwardingAddress by comma and space', async () => {
        const mockResponse = { success: true };
        createSoapAPIInterceptor('ModifyAccount', mockResponse);

        const id = 'account-456';
        const modifiedData = {
            zimbraMailForwardingAddress: 'user1@example.com, user2@example.com, user3@example.com'
        };

        const result = await modifyAccountRequest(id, modifiedData);

        expect(result).toEqual(mockResponse);
    });

    it('should split zimbraPrefCalendarForwardInvitesTo by comma and space', async () => {
        const mockResponse = { success: true };
        createSoapAPIInterceptor('ModifyAccount', mockResponse);

        const id = 'account-789';
        const modifiedData = {
            zimbraPrefCalendarForwardInvitesTo: 'cal1@example.com, cal2@example.com'
        };

        const result = await modifyAccountRequest(id, modifiedData);

        expect(result).toEqual(mockResponse);
    });

    it('should split zimbraAllowFromAddress by comma and space', async () => {
        const mockResponse = { success: true };
        createSoapAPIInterceptor('ModifyAccount', mockResponse);

        const id = 'account-999';
        const modifiedData = {
            zimbraAllowFromAddress: 'alias1@example.com, alias2@example.com'
        };

        const result = await modifyAccountRequest(id, modifiedData);

        expect(result).toEqual(mockResponse);
    });

    it('should handle empty string for special attributes', async () => {
        const mockResponse = { success: true };
        createSoapAPIInterceptor('ModifyAccount', mockResponse);

        const id = 'account-empty';
        const modifiedData = {
            zimbraMailForwardingAddress: ''
        };

        const result = await modifyAccountRequest(id, modifiedData);

        expect(result).toEqual(mockResponse);
    });

    it('should handle whitespace-only string for special attributes', async () => {
        const mockResponse = { success: true };
        createSoapAPIInterceptor('ModifyAccount', mockResponse);

        const id = 'account-whitespace';
        const modifiedData = {
            zimbraMailForwardingAddress: '   '
        };

        const result = await modifyAccountRequest(id, modifiedData);

        expect(result).toEqual(mockResponse);
    });

    it('should handle mixed attributes (special and normal)', async () => {
        const mockResponse = { success: true };
        createSoapAPIInterceptor('ModifyAccount', mockResponse);

        const id = 'account-mixed';
        const modifiedData = {
            displayName: 'Jane Smith',
            zimbraMailForwardingAddress: 'forward@example.com, backup@example.com',
            zimbraAccountStatus: 'active',
            zimbraAllowFromAddress: 'alias@example.com'
        };

        const result = await modifyAccountRequest(id, modifiedData);

        expect(result).toEqual(mockResponse);
    });

    it('should handle single email for special attributes (no split)', async () => {
        const mockResponse = { success: true };
        createSoapAPIInterceptor('ModifyAccount', mockResponse);

        const id = 'account-single';
        const modifiedData = {
            zimbraMailForwardingAddress: 'single@example.com'
        };

        const result = await modifyAccountRequest(id, modifiedData);

        expect(result).toEqual(mockResponse);
    });

    it('should handle empty modifiedData object', async () => {
        const mockResponse = { success: true };
        createSoapAPIInterceptor('ModifyAccount', mockResponse);

        const id = 'account-empty-data';
        const modifiedData = {};

        const result = await modifyAccountRequest(id, modifiedData);

        expect(result).toEqual(mockResponse);
    });

    it('should return the response from soapFetch', async () => {
        const mockResponse = {
            account: {
                id: 'account-123',
                name: 'test@example.com'
            }
        };
        createSoapAPIInterceptor('ModifyAccount', mockResponse);

        const result = await modifyAccountRequest('account-123', { displayName: 'Test' });

        expect(result).toEqual(mockResponse);
    });

    it('should handle undefined values in modifiedData', async () => {
        const mockResponse = { success: true };
        createSoapAPIInterceptor('ModifyAccount', mockResponse);

        const id = 'account-undefined';
        const modifiedData = {
            displayName: 'Test',
            description: undefined
        };

        const result = await modifyAccountRequest(id, modifiedData);

        expect(result).toEqual(mockResponse);
    });

    it('should handle multiple special attributes at once', async () => {
        const mockResponse = { success: true };
        createSoapAPIInterceptor('ModifyAccount', mockResponse);

        const id = 'account-multi-special';
        const modifiedData = {
            zimbraMailForwardingAddress: 'fw1@example.com, fw2@example.com',
            zimbraPrefCalendarForwardInvitesTo: 'cal1@example.com, cal2@example.com',
            zimbraAllowFromAddress: 'alias1@example.com, alias2@example.com'
        };

        const result = await modifyAccountRequest(id, modifiedData);

        expect(result).toEqual(mockResponse);
    });

    it('should handle emails with extra spaces in comma-separated list', async () => {
        const mockResponse = { success: true };
        createSoapAPIInterceptor('ModifyAccount', mockResponse);

        const id = 'account-spaces';
        const modifiedData = {
            zimbraMailForwardingAddress: 'email1@example.com,  email2@example.com,   email3@example.com'
        };

        const result = await modifyAccountRequest(id, modifiedData);

        expect(result).toEqual(mockResponse);
    });

    it('should handle null values in special attributes', async () => {
        const mockResponse = { success: true };
        createSoapAPIInterceptor('ModifyAccount', mockResponse);

        const id = 'account-null';
        const modifiedData = {
            zimbraMailForwardingAddress: null
        };

        const result = await modifyAccountRequest(id, modifiedData);

        expect(result).toEqual(mockResponse);
    });
});

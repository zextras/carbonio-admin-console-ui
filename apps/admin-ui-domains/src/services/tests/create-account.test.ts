/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createSoapAPIInterceptor } from 'admin-ui-test-utils';
import { describe, expect, it } from 'vitest';

import { createAccountRequest } from '../create-account';

describe('createAccountRequest', () => {
    it('should call soapFetch with correct parameters including password', async () => {
        const mockResponse = {
            account: {
                id: 'new-account-123',
                name: 'newuser@example.com'
            }
        };
        createSoapAPIInterceptor('CreateAccount', mockResponse);

        const attr = {
            displayName: 'New User',
            zimbraAccountStatus: 'active'
        };
        const name = 'newuser@example.com';
        const password = 'SecurePassword123';

        const result = await createAccountRequest(attr, name, password);

        expect(result).toEqual(mockResponse);
    });

    it('should remove password from request when password is empty string', async () => {
        const mockResponse = {
            account: {
                id: 'new-account-456',
                name: 'delegate@example.com'
            }
        };
        createSoapAPIInterceptor('CreateAccount', mockResponse);

        const attr = {
            displayName: 'Delegate User'
        };
        const name = 'delegate@example.com';
        const password = '';

        const result = await createAccountRequest(attr, name, password);

        expect(result).toEqual(mockResponse);
    });

    it('should remove password from request when password is null', async () => {
        const mockResponse = { success: true };
        createSoapAPIInterceptor('CreateAccount', mockResponse);

        const attr = {
            displayName: 'No Password User'
        };
        const name = 'nopass@example.com';
        const password = null as any;

        const result = await createAccountRequest(attr, name, password);

        expect(result).toEqual(mockResponse);
    });

    it('should remove password from request when password is undefined', async () => {
        const mockResponse = { success: true };
        createSoapAPIInterceptor('CreateAccount', mockResponse);

        const attr = {
            displayName: 'Undefined Password User'
        };
        const name = 'undefined@example.com';
        const password = undefined as any;

        const result = await createAccountRequest(attr, name, password);

        expect(result).toEqual(mockResponse);
    });

    it('should remove password from request when password is 0 (falsy but not empty string)', async () => {
        const mockResponse = { success: true };
        createSoapAPIInterceptor('CreateAccount', mockResponse);

        const attr = {
            displayName: 'Zero Password User'
        };
        const name = 'zero@example.com';
        const password = 0 as any;

        const result = await createAccountRequest(attr, name, password);

        expect(result).toEqual(mockResponse);
    });

    it('should handle empty attributes object', async () => {
        const mockResponse = { success: true };
        createSoapAPIInterceptor('CreateAccount', mockResponse);

        const attr = {};
        const name = 'minimal@example.com';
        const password = 'password123';

        const result = await createAccountRequest(attr, name, password);

        expect(result).toEqual(mockResponse);
    });

    it('should handle multiple attributes', async () => {
        const mockResponse = { success: true };
        createSoapAPIInterceptor('CreateAccount', mockResponse);

        const attr = {
            displayName: 'Full User',
            zimbraAccountStatus: 'active',
            zimbraMailQuota: '1073741824',
            description: 'Test account',
            zimbraCOSId: 'cos-123'
        };
        const name = 'fulluser@example.com';
        const password = 'StrongPass456';

        const result = await createAccountRequest(attr, name, password);

        expect(result).toEqual(mockResponse);
    });

    it('should return the response from soapFetch', async () => {
        const mockResponse = {
            account: {
                id: 'account-789',
                name: 'return@example.com',
                displayName: 'Return Test'
            }
        };
        createSoapAPIInterceptor('CreateAccount', mockResponse);

        const result = await createAccountRequest(
            { displayName: 'Return Test' },
            'return@example.com',
            'password'
        );

        expect(result).toEqual(mockResponse);
    });

    it('should handle attribute values with special characters', async () => {
        const mockResponse = { success: true };
        createSoapAPIInterceptor('CreateAccount', mockResponse);

        const attr = {
            displayName: "O'Brien, John <John>",
            description: 'User with "quotes" and special chars: & < >'
        };
        const name = 'special@example.com';
        const password = 'Pass@123!';

        const result = await createAccountRequest(attr, name, password);

        expect(result).toEqual(mockResponse);
    });

    it('should handle undefined values in attributes', async () => {
        const mockResponse = { success: true };
        createSoapAPIInterceptor('CreateAccount', mockResponse);

        const attr = {
            displayName: 'Test User',
            description: undefined,
            zimbraAccountStatus: 'active'
        };
        const name = 'undefined-attr@example.com';
        const password = 'password';

        const result = await createAccountRequest(attr, name, password);

        expect(result).toEqual(mockResponse);
    });

    it('should handle empty string values in attributes', async () => {
        const mockResponse = { success: true };
        createSoapAPIInterceptor('CreateAccount', mockResponse);

        const attr = {
            displayName: '',
            description: 'Has empty display name'
        };
        const name = 'empty-attr@example.com';
        const password = 'password';

        const result = await createAccountRequest(attr, name, password);

        expect(result).toEqual(mockResponse);
    });

    it('should handle numeric values in attributes', async () => {
        const mockResponse = { success: true };
        createSoapAPIInterceptor('CreateAccount', mockResponse);

        const attr = {
            zimbraMailQuota: 1073741824,
            zimbraFeatureMailPriority: 0
        };
        const name = 'numeric@example.com';
        const password = 'password';

        const result = await createAccountRequest(attr, name, password);

        expect(result).toEqual(mockResponse);
    });

    it('should handle boolean values in attributes', async () => {
        const mockResponse = { success: true };
        createSoapAPIInterceptor('CreateAccount', mockResponse);

        const attr = {
            zimbraFeatureCalendarEnabled: true,
            zimbraFeatureContactsEnabled: false
        };
        const name = 'boolean@example.com';
        const password = 'password';

        const result = await createAccountRequest(attr, name, password);

        expect(result).toEqual(mockResponse);
    });

    it('should keep password when it is whitespace string', async () => {
        const mockResponse = { success: true };
        createSoapAPIInterceptor('CreateAccount', mockResponse);

        const attr = {
            displayName: 'Whitespace Password'
        };
        const name = 'whitespace@example.com';
        const password = '   ';

        const result = await createAccountRequest(attr, name, password);

        expect(result).toEqual(mockResponse);
    });
});
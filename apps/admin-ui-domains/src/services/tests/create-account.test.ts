/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/admin-ui-bootstrap';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createAccountRequest } from '../create-account';

vi.mock('@zextras/admin-ui-bootstrap', () => ({
    soapFetch: vi.fn()
}));

describe('createAccountRequest', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should call soapFetch with correct parameters including password', async () => {
        const mockResponse = {
            account: {
                id: 'new-account-123',
                name: 'newuser@example.com'
            }
        };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        const attr = {
            displayName: 'New User',
            zimbraAccountStatus: 'active'
        };
        const name = 'newuser@example.com';
        const password = 'SecurePassword123';

        await createAccountRequest(attr, name, password);

        expect(soapFetch).toHaveBeenCalledWith('CreateAccount', {
            _jsns: 'urn:zimbraAdmin',
            name: 'newuser@example.com',
            password: 'SecurePassword123',
            a: [
                { n: 'displayName', _content: 'New User' },
                { n: 'zimbraAccountStatus', _content: 'active' }
            ]
        });
    });

    it('should remove password from request when password is empty string', async () => {
        const mockResponse = {
            account: {
                id: 'new-account-456',
                name: 'delegate@example.com'
            }
        };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        const attr = {
            displayName: 'Delegate User'
        };
        const name = 'delegate@example.com';
        const password = '';

        await createAccountRequest(attr, name, password);

        expect(soapFetch).toHaveBeenCalledWith('CreateAccount', {
            _jsns: 'urn:zimbraAdmin',
            name: 'delegate@example.com',
            a: [
                { n: 'displayName', _content: 'Delegate User' }
            ]
        });

        // Verify password is not in the request
        const callArgs = vi.mocked(soapFetch).mock.calls[0][1];
        expect(callArgs).not.toHaveProperty('password');
    });

    it('should remove password from request when password is null', async () => {
        const mockResponse = { success: true };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        const attr = {
            displayName: 'No Password User'
        };
        const name = 'nopass@example.com';
        const password = null as any;

        await createAccountRequest(attr, name, password);

        const callArgs = vi.mocked(soapFetch).mock.calls[0][1];
        expect(callArgs).not.toHaveProperty('password');
    });

    it('should remove password from request when password is undefined', async () => {
        const mockResponse = { success: true };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        const attr = {
            displayName: 'Undefined Password User'
        };
        const name = 'undefined@example.com';
        const password = undefined as any;

        await createAccountRequest(attr, name, password);

        const callArgs = vi.mocked(soapFetch).mock.calls[0][1];
        expect(callArgs).not.toHaveProperty('password');
    });

    it('should remove password from request when password is 0 (falsy but not empty string)', async () => {
        const mockResponse = { success: true };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        const attr = {
            displayName: 'Zero Password User'
        };
        const name = 'zero@example.com';
        const password = 0 as any;

        await createAccountRequest(attr, name, password);

        const callArgs = vi.mocked(soapFetch).mock.calls[0][1];
        expect(callArgs).not.toHaveProperty('password');
    });

    it('should handle empty attributes object', async () => {
        const mockResponse = { success: true };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        const attr = {};
        const name = 'minimal@example.com';
        const password = 'password123';

        await createAccountRequest(attr, name, password);

        expect(soapFetch).toHaveBeenCalledWith('CreateAccount', {
            _jsns: 'urn:zimbraAdmin',
            name: 'minimal@example.com',
            password: 'password123',
            a: []
        });
    });

    it('should handle multiple attributes', async () => {
        const mockResponse = { success: true };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        const attr = {
            displayName: 'Full User',
            zimbraAccountStatus: 'active',
            zimbraMailQuota: '1073741824',
            description: 'Test account',
            zimbraCOSId: 'cos-123'
        };
        const name = 'fulluser@example.com';
        const password = 'StrongPass456';

        await createAccountRequest(attr, name, password);

        expect(soapFetch).toHaveBeenCalledWith('CreateAccount', {
            _jsns: 'urn:zimbraAdmin',
            name: 'fulluser@example.com',
            password: 'StrongPass456',
            a: [
                { n: 'displayName', _content: 'Full User' },
                { n: 'zimbraAccountStatus', _content: 'active' },
                { n: 'zimbraMailQuota', _content: '1073741824' },
                { n: 'description', _content: 'Test account' },
                { n: 'zimbraCOSId', _content: 'cos-123' }
            ]
        });
    });

    it('should return the response from soapFetch', async () => {
        const mockResponse = {
            account: {
                id: 'account-789',
                name: 'return@example.com',
                displayName: 'Return Test'
            }
        };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        const result = await createAccountRequest(
            { displayName: 'Return Test' },
            'return@example.com',
            'password'
        );

        expect(result).toEqual(mockResponse);
    });

    it('should propagate errors from soapFetch', async () => {
        const error = new Error('Account already exists');
        vi.mocked(soapFetch).mockRejectedValue(error);

        await expect(
            createAccountRequest({ displayName: 'Error User' }, 'error@example.com', 'pass')
        ).rejects.toThrow('Account already exists');
    });

    it('should handle attribute values with special characters', async () => {
        const mockResponse = { success: true };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        const attr = {
            displayName: "O'Brien, John <John>",
            description: 'User with "quotes" and special chars: & < >'
        };
        const name = 'special@example.com';
        const password = 'Pass@123!';

        await createAccountRequest(attr, name, password);

        expect(soapFetch).toHaveBeenCalledWith('CreateAccount', {
            _jsns: 'urn:zimbraAdmin',
            name: 'special@example.com',
            password: 'Pass@123!',
            a: [
                { n: 'displayName', _content: "O'Brien, John <John>" },
                { n: 'description', _content: 'User with "quotes" and special chars: & < >' }
            ]
        });
    });

    it('should handle undefined values in attributes', async () => {
        const mockResponse = { success: true };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        const attr = {
            displayName: 'Test User',
            description: undefined,
            zimbraAccountStatus: 'active'
        };
        const name = 'undefined-attr@example.com';
        const password = 'password';

        await createAccountRequest(attr, name, password);

        expect(soapFetch).toHaveBeenCalledWith('CreateAccount', {
            _jsns: 'urn:zimbraAdmin',
            name: 'undefined-attr@example.com',
            password: 'password',
            a: [
                { n: 'displayName', _content: 'Test User' },
                { n: 'description', _content: undefined },
                { n: 'zimbraAccountStatus', _content: 'active' }
            ]
        });
    });

    it('should handle empty string values in attributes', async () => {
        const mockResponse = { success: true };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        const attr = {
            displayName: '',
            description: 'Has empty display name'
        };
        const name = 'empty-attr@example.com';
        const password = 'password';

        await createAccountRequest(attr, name, password);

        expect(soapFetch).toHaveBeenCalledWith('CreateAccount', {
            _jsns: 'urn:zimbraAdmin',
            name: 'empty-attr@example.com',
            password: 'password',
            a: [
                { n: 'displayName', _content: '' },
                { n: 'description', _content: 'Has empty display name' }
            ]
        });
    });

    it('should handle numeric values in attributes', async () => {
        const mockResponse = { success: true };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        const attr = {
            zimbraMailQuota: 1073741824,
            zimbraFeatureMailPriority: 0
        };
        const name = 'numeric@example.com';
        const password = 'password';

        await createAccountRequest(attr, name, password);

        expect(soapFetch).toHaveBeenCalledWith('CreateAccount', {
            _jsns: 'urn:zimbraAdmin',
            name: 'numeric@example.com',
            password: 'password',
            a: [
                { n: 'zimbraMailQuota', _content: 1073741824 },
                { n: 'zimbraFeatureMailPriority', _content: 0 }
            ]
        });
    });

    it('should handle boolean values in attributes', async () => {
        const mockResponse = { success: true };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        const attr = {
            zimbraFeatureCalendarEnabled: true,
            zimbraFeatureContactsEnabled: false
        };
        const name = 'boolean@example.com';
        const password = 'password';

        await createAccountRequest(attr, name, password);

        expect(soapFetch).toHaveBeenCalledWith('CreateAccount', {
            _jsns: 'urn:zimbraAdmin',
            name: 'boolean@example.com',
            password: 'password',
            a: [
                { n: 'zimbraFeatureCalendarEnabled', _content: true },
                { n: 'zimbraFeatureContactsEnabled', _content: false }
            ]
        });
    });

    it('should keep password when it is whitespace string', async () => {
        const mockResponse = { success: true };
        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        const attr = {
            displayName: 'Whitespace Password'
        };
        const name = 'whitespace@example.com';
        const password = '   ';

        await createAccountRequest(attr, name, password);

        expect(soapFetch).toHaveBeenCalledWith('CreateAccount', {
            _jsns: 'urn:zimbraAdmin',
            name: 'whitespace@example.com',
            password: '   ',
            a: [{ n: 'displayName', _content: 'Whitespace Password' }]
        });
    });
});

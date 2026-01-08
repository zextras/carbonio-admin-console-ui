/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/admin-ui-bootstrap';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { deleteAccount } from '../delete-account-service';

vi.mock('@zextras/admin-ui-bootstrap', () => ({
    soapFetch: vi.fn()
}));

describe('deleteAccount', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should delete account successfully with valid account ID', async () => {
        // Arrange
        const accountId = 'test-account-id-123';
        const mockResponse = {
            DeleteAccountResponse: {
                _jsns: 'urn:zimbraAdmin'
            }
        };

        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        // Act
        const result = await deleteAccount(accountId);

        // Assert
        expect(soapFetch).toHaveBeenCalledTimes(1);
        expect(soapFetch).toHaveBeenCalledWith('DeleteAccount', {
            _jsns: 'urn:zimbraAdmin',
            id: accountId
        });
        expect(result).toEqual(mockResponse);
    });

    it('should handle API error when account does not exist', async () => {
        // Arrange
        const accountId = 'non-existent-account-id';
        const mockError = new Error('account.NO_SUCH_ACCOUNT');

        vi.mocked(soapFetch).mockRejectedValue(mockError);

        // Act & Assert
        await expect(deleteAccount(accountId)).rejects.toThrow('account.NO_SUCH_ACCOUNT');
        expect(soapFetch).toHaveBeenCalledWith('DeleteAccount', {
            _jsns: 'urn:zimbraAdmin',
            id: accountId
        });
    });

    it('should handle network error', async () => {
        // Arrange
        const accountId = 'test-account-id';
        const networkError = new Error('Network error: Unable to reach server');

        vi.mocked(soapFetch).mockRejectedValue(networkError);

        // Act & Assert
        await expect(deleteAccount(accountId)).rejects.toThrow('Network error');
        expect(soapFetch).toHaveBeenCalledTimes(1);
    });

    it('should handle permission denied error', async () => {
        // Arrange
        const accountId = 'protected-account-id';
        const permissionError = new Error('service.PERM_DENIED');

        vi.mocked(soapFetch).mockRejectedValue(permissionError);

        // Act & Assert
        await expect(deleteAccount(accountId)).rejects.toThrow('service.PERM_DENIED');
        expect(soapFetch).toHaveBeenCalledWith('DeleteAccount', {
            _jsns: 'urn:zimbraAdmin',
            id: accountId
        });
    });

    it('should handle empty account ID', async () => {
        // Arrange
        const accountId = '';
        const mockError = new Error('Invalid account ID');

        vi.mocked(soapFetch).mockRejectedValue(mockError);

        // Act & Assert
        await expect(deleteAccount(accountId)).rejects.toThrow();
        expect(soapFetch).toHaveBeenCalledWith('DeleteAccount', {
            _jsns: 'urn:zimbraAdmin',
            id: accountId
        });
    });

    it('should handle UUID format account ID', async () => {
        // Arrange
        const accountId = '550e8400-e29b-41d4-a716-446655440000';
        const mockResponse = {
            DeleteAccountResponse: {
                _jsns: 'urn:zimbraAdmin'
            }
        };

        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        // Act
        const result = await deleteAccount(accountId);

        // Assert
        expect(soapFetch).toHaveBeenCalledWith('DeleteAccount', {
            _jsns: 'urn:zimbraAdmin',
            id: accountId
        });
        expect(result).toEqual(mockResponse);
    });

    it('should handle timeout error', async () => {
        // Arrange
        const accountId = 'test-account-id';
        const timeoutError = new Error('Request timeout');

        vi.mocked(soapFetch).mockRejectedValue(timeoutError);

        // Act & Assert
        await expect(deleteAccount(accountId)).rejects.toThrow('Request timeout');
        expect(soapFetch).toHaveBeenCalledTimes(1);
    });

    it('should handle account with special characters in ID', async () => {
        // Arrange
        const accountId = 'test-account-!@#$%';
        const mockResponse = {
            DeleteAccountResponse: {
                _jsns: 'urn:zimbraAdmin'
            }
        };

        vi.mocked(soapFetch).mockResolvedValue(mockResponse);

        // Act
        const result = await deleteAccount(accountId);

        // Assert
        expect(soapFetch).toHaveBeenCalledWith('DeleteAccount', {
            _jsns: 'urn:zimbraAdmin',
            id: accountId
        });
        expect(result).toEqual(mockResponse);
    });

    it('should handle malformed response from server', async () => {
        // Arrange
        const accountId = 'test-account-id';
        const malformedResponse = null;

        vi.mocked(soapFetch).mockResolvedValue(malformedResponse);

        // Act
        const result = await deleteAccount(accountId);

        // Assert
        expect(result).toBeNull();
        expect(soapFetch).toHaveBeenCalledTimes(1);
    });
});

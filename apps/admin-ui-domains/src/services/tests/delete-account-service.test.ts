/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createSoapAPIInterceptor } from 'admin-ui-test-utils';
import { describe, expect, it } from 'vitest';

import { deleteAccount } from '../delete-account-service';

describe('deleteAccount', () => {
    it('should delete account successfully with valid account ID', async () => {
        // Arrange
        const accountId = 'test-account-id-123';
        const mockResponse = {
            DeleteAccountResponse: {
                _jsns: 'urn:zimbraAdmin'
            }
        };

        createSoapAPIInterceptor('DeleteAccount', mockResponse);

        // Act
        const result = await deleteAccount(accountId);

        // Assert
        expect(result).toEqual(mockResponse);
    });

    it('should handle UUID format account ID', async () => {
        // Arrange
        const accountId = '550e8400-e29b-41d4-a716-446655440000';
        const mockResponse = {
            DeleteAccountResponse: {
                _jsns: 'urn:zimbraAdmin'
            }
        };

        createSoapAPIInterceptor('DeleteAccount', mockResponse);

        // Act
        const result = await deleteAccount(accountId);

        // Assert
        expect(result).toEqual(mockResponse);
    });

    it('should handle account with special characters in ID', async () => {
        // Arrange
        const accountId = 'test-account-!@#$%';
        const mockResponse = {
            DeleteAccountResponse: {
                _jsns: 'urn:zimbraAdmin'
            }
        };

        createSoapAPIInterceptor('DeleteAccount', mockResponse);

        // Act
        const result = await deleteAccount(accountId);

        // Assert
        expect(result).toEqual(mockResponse);
    });

    it('should handle malformed response from server', async () => {
        // Arrange
        const accountId = 'test-account-id';
        const malformedResponse = null;

        createSoapAPIInterceptor('DeleteAccount', malformedResponse);

        // Act
        const result = await deleteAccount(accountId);

        // Assert
        expect(result).toEqual({});
    });
});
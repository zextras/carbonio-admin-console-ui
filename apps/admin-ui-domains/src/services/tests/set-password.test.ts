/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createSoapAPIInterceptor } from 'admin-ui-test-utils';
import { describe, expect, it } from 'vitest';

import { setPasswordRequest } from '../set-password';

describe('setPasswordRequest', () => {
	it('should set password successfully with valid account ID and password', async () => {
		// Arrange
		const accountId = 'test-account-id-123';
		const newPassword = 'SecureP@ssw0rd123';
		const mockResponse = {
			SetPasswordResponse: {
				_jsns: 'urn:zimbraAdmin'
			}
		};

		createSoapAPIInterceptor('SetPassword', mockResponse);

		// Act
		const result = await setPasswordRequest(accountId, newPassword);

		// Assert
		expect(result).toEqual(mockResponse);
	});

	it('should handle empty password', async () => {
		// Arrange
		const accountId = 'test-account-id';
		const newPassword = '';
		const mockResponse = {
			SetPasswordResponse: {
				_jsns: 'urn:zimbraAdmin'
			}
		};

		createSoapAPIInterceptor('SetPassword', mockResponse);

		// Act
		const result = await setPasswordRequest(accountId, newPassword);

		// Assert
		expect(result).toEqual(mockResponse);
	});

	it('should handle complex password with special characters', async () => {
		// Arrange
		const accountId = 'test-account-id';
		const newPassword = 'C0mpl3x!@#$%^&*()_+-=[]{}|;:,.<>?P@ssw0rd';
		const mockResponse = {
			SetPasswordResponse: {
				_jsns: 'urn:zimbraAdmin'
			}
		};

		createSoapAPIInterceptor('SetPassword', mockResponse);

		// Act
		const result = await setPasswordRequest(accountId, newPassword);

		// Assert
		expect(result).toEqual(mockResponse);
	});

	it('should handle password with unicode characters', async () => {
		// Arrange
		const accountId = 'test-account-id';
		const newPassword = 'Pāśśwørd123™';
		const mockResponse = {
			SetPasswordResponse: {
				_jsns: 'urn:zimbraAdmin'
			}
		};

		createSoapAPIInterceptor('SetPassword', mockResponse);

		// Act
		const result = await setPasswordRequest(accountId, newPassword);

		// Assert
		expect(result).toEqual(mockResponse);
	});

	it('should handle very long password', async () => {
		// Arrange
		const accountId = 'test-account-id';
		const newPassword = 'A'.repeat(256);
		const mockResponse = {
			SetPasswordResponse: {
				_jsns: 'urn:zimbraAdmin'
			}
		};

		createSoapAPIInterceptor('SetPassword', mockResponse);

		// Act
		const result = await setPasswordRequest(accountId, newPassword);

		// Assert
		expect(result).toEqual(mockResponse);
	});

	it('should handle UUID format account ID', async () => {
		// Arrange
		const accountId = '550e8400-e29b-41d4-a716-446655440000';
		const newPassword = 'NewP@ssw0rd123';
		const mockResponse = {
			SetPasswordResponse: {
				_jsns: 'urn:zimbraAdmin'
			}
		};

		createSoapAPIInterceptor('SetPassword', mockResponse);

		// Act
		const result = await setPasswordRequest(accountId, newPassword);

		// Assert
		expect(result).toEqual(mockResponse);
	});

	it('should handle malformed response from server', async () => {
		// Arrange
		const accountId = 'test-account-id';
		const newPassword = 'NewP@ssw0rd123';
		const malformedResponse = null;

		createSoapAPIInterceptor('SetPassword', malformedResponse);

		// Act
		const result = await setPasswordRequest(accountId, newPassword);

		// Assert
		expect(result).toEqual({});
	});
});

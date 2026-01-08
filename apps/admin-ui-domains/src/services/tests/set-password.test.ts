/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/admin-ui-bootstrap';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { setPasswordRequest } from '../set-password';

vi.mock('@zextras/admin-ui-bootstrap', () => ({
	soapFetch: vi.fn()
}));

describe('setPasswordRequest', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should set password successfully with valid account ID and password', async () => {
		// Arrange
		const accountId = 'test-account-id-123';
		const newPassword = 'SecureP@ssw0rd123';
		const mockResponse = {
			SetPasswordResponse: {
				_jsns: 'urn:zimbraAdmin'
			}
		};

		vi.mocked(soapFetch).mockResolvedValue(mockResponse);

		// Act
		const result = await setPasswordRequest(accountId, newPassword);

		// Assert
		expect(soapFetch).toHaveBeenCalledTimes(1);
		expect(soapFetch).toHaveBeenCalledWith('SetPassword', {
			_jsns: 'urn:zimbraAdmin',
			id: accountId,
			newPassword: newPassword
		});
		expect(result).toEqual(mockResponse);
	});

	it('should handle API error when account does not exist', async () => {
		// Arrange
		const accountId = 'non-existent-account-id';
		const newPassword = 'SecureP@ssw0rd123';
		const mockError = new Error('account.NO_SUCH_ACCOUNT');

		vi.mocked(soapFetch).mockRejectedValue(mockError);

		// Act & Assert
		await expect(setPasswordRequest(accountId, newPassword)).rejects.toThrow(
			'account.NO_SUCH_ACCOUNT'
		);
		expect(soapFetch).toHaveBeenCalledWith('SetPassword', {
			_jsns: 'urn:zimbraAdmin',
			id: accountId,
			newPassword: newPassword
		});
	});

	it('should handle permission denied error', async () => {
		// Arrange
		const accountId = 'protected-account-id';
		const newPassword = 'NewP@ssw0rd123';
		const permissionError = new Error('service.PERM_DENIED');

		vi.mocked(soapFetch).mockRejectedValue(permissionError);

		// Act & Assert
		await expect(setPasswordRequest(accountId, newPassword)).rejects.toThrow(
			'service.PERM_DENIED'
		);
		expect(soapFetch).toHaveBeenCalledTimes(1);
	});

	it('should handle network error', async () => {
		// Arrange
		const accountId = 'test-account-id';
		const newPassword = 'NewP@ssw0rd123';
		const networkError = new Error('Network error: Unable to reach server');

		vi.mocked(soapFetch).mockRejectedValue(networkError);

		// Act & Assert
		await expect(setPasswordRequest(accountId, newPassword)).rejects.toThrow('Network error');
		expect(soapFetch).toHaveBeenCalledTimes(1);
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

		vi.mocked(soapFetch).mockResolvedValue(mockResponse);

		// Act
		const result = await setPasswordRequest(accountId, newPassword);

		// Assert
		expect(soapFetch).toHaveBeenCalledWith('SetPassword', {
			_jsns: 'urn:zimbraAdmin',
			id: accountId,
			newPassword: ''
		});
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

		vi.mocked(soapFetch).mockResolvedValue(mockResponse);

		// Act
		const result = await setPasswordRequest(accountId, newPassword);

		// Assert
		expect(soapFetch).toHaveBeenCalledWith('SetPassword', {
			_jsns: 'urn:zimbraAdmin',
			id: accountId,
			newPassword: newPassword
		});
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

		vi.mocked(soapFetch).mockResolvedValue(mockResponse);

		// Act
		const result = await setPasswordRequest(accountId, newPassword);

		// Assert
		expect(soapFetch).toHaveBeenCalledWith('SetPassword', {
			_jsns: 'urn:zimbraAdmin',
			id: accountId,
			newPassword: newPassword
		});
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

		vi.mocked(soapFetch).mockResolvedValue(mockResponse);

		// Act
		const result = await setPasswordRequest(accountId, newPassword);

		// Assert
		expect(soapFetch).toHaveBeenCalledWith('SetPassword', {
			_jsns: 'urn:zimbraAdmin',
			id: accountId,
			newPassword: newPassword
		});
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

		vi.mocked(soapFetch).mockResolvedValue(mockResponse);

		// Act
		const result = await setPasswordRequest(accountId, newPassword);

		// Assert
		expect(soapFetch).toHaveBeenCalledWith('SetPassword', {
			_jsns: 'urn:zimbraAdmin',
			id: accountId,
			newPassword: newPassword
		});
		expect(result).toEqual(mockResponse);
	});

	it('should handle timeout error', async () => {
		// Arrange
		const accountId = 'test-account-id';
		const newPassword = 'NewP@ssw0rd123';
		const timeoutError = new Error('Request timeout');

		vi.mocked(soapFetch).mockRejectedValue(timeoutError);

		// Act & Assert
		await expect(setPasswordRequest(accountId, newPassword)).rejects.toThrow('Request timeout');
		expect(soapFetch).toHaveBeenCalledTimes(1);
	});

	it('should handle weak password policy error', async () => {
		// Arrange
		const accountId = 'test-account-id';
		const weakPassword = '123456';
		const policyError = new Error('account.PASSWORD_POLICY_VIOLATION');

		vi.mocked(soapFetch).mockRejectedValue(policyError);

		// Act & Assert
		await expect(setPasswordRequest(accountId, weakPassword)).rejects.toThrow(
			'account.PASSWORD_POLICY_VIOLATION'
		);
		expect(soapFetch).toHaveBeenCalledWith('SetPassword', {
			_jsns: 'urn:zimbraAdmin',
			id: accountId,
			newPassword: weakPassword
		});
	});

	it('should handle password same as current', async () => {
		// Arrange
		const accountId = 'test-account-id';
		const newPassword = 'CurrentP@ssw0rd';
		const samePasswordError = new Error('account.PASSWORD_RECENTLY_USED');

		vi.mocked(soapFetch).mockRejectedValue(samePasswordError);

		// Act & Assert
		await expect(setPasswordRequest(accountId, newPassword)).rejects.toThrow(
			'account.PASSWORD_RECENTLY_USED'
		);
		expect(soapFetch).toHaveBeenCalledTimes(1);
	});

	it('should handle malformed response from server', async () => {
		// Arrange
		const accountId = 'test-account-id';
		const newPassword = 'NewP@ssw0rd123';
		const malformedResponse = null;

		vi.mocked(soapFetch).mockResolvedValue(malformedResponse);

		// Act
		const result = await setPasswordRequest(accountId, newPassword);

		// Assert
		expect(result).toBeNull();
		expect(soapFetch).toHaveBeenCalledTimes(1);
	});
});

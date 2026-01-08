/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/admin-ui-bootstrap';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renameAccountRequest } from '../rename-account';

vi.mock('@zextras/admin-ui-bootstrap', () => ({
	soapFetch: vi.fn()
}));

describe('renameAccountRequest', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should rename account successfully with valid account ID and new name', async () => {
		// Arrange
		const accountId = 'test-account-id-123';
		const newName = 'newuser@example.com';
		const mockResponse = {
			RenameAccountResponse: {
				_jsns: 'urn:zimbraAdmin',
				account: {
					id: accountId,
					name: newName
				}
			}
		};

		vi.mocked(soapFetch).mockResolvedValue(mockResponse);

		// Act
		const result = await renameAccountRequest(accountId, newName);

		// Assert
		expect(soapFetch).toHaveBeenCalledTimes(1);
		expect(soapFetch).toHaveBeenCalledWith('RenameAccount', {
			_jsns: 'urn:zimbraAdmin',
			id: accountId,
			newName: newName
		});
		expect(result).toEqual(mockResponse);
	});

	it('should handle API error when account does not exist', async () => {
		// Arrange
		const accountId = 'non-existent-account-id';
		const newName = 'newuser@example.com';
		const mockError = new Error('account.NO_SUCH_ACCOUNT');

		vi.mocked(soapFetch).mockRejectedValue(mockError);

		// Act & Assert
		await expect(renameAccountRequest(accountId, newName)).rejects.toThrow(
			'account.NO_SUCH_ACCOUNT'
		);
		expect(soapFetch).toHaveBeenCalledWith('RenameAccount', {
			_jsns: 'urn:zimbraAdmin',
			id: accountId,
			newName: newName
		});
	});

	it('should handle error when new name already exists', async () => {
		// Arrange
		const accountId = 'test-account-id';
		const newName = 'existing@example.com';
		const duplicateError = new Error('account.ACCOUNT_EXISTS');

		vi.mocked(soapFetch).mockRejectedValue(duplicateError);

		// Act & Assert
		await expect(renameAccountRequest(accountId, newName)).rejects.toThrow(
			'account.ACCOUNT_EXISTS'
		);
		expect(soapFetch).toHaveBeenCalledWith('RenameAccount', {
			_jsns: 'urn:zimbraAdmin',
			id: accountId,
			newName: newName
		});
	});

	it('should handle invalid email format error', async () => {
		// Arrange
		const accountId = 'test-account-id';
		const invalidName = 'invalid-email-format';
		const formatError = new Error('account.INVALID_NAME');

		vi.mocked(soapFetch).mockRejectedValue(formatError);

		// Act & Assert
		await expect(renameAccountRequest(accountId, invalidName)).rejects.toThrow(
			'account.INVALID_NAME'
		);
		expect(soapFetch).toHaveBeenCalledTimes(1);
	});

	it('should handle permission denied error', async () => {
		// Arrange
		const accountId = 'protected-account-id';
		const newName = 'newname@example.com';
		const permissionError = new Error('service.PERM_DENIED');

		vi.mocked(soapFetch).mockRejectedValue(permissionError);

		// Act & Assert
		await expect(renameAccountRequest(accountId, newName)).rejects.toThrow(
			'service.PERM_DENIED'
		);
		expect(soapFetch).toHaveBeenCalledTimes(1);
	});

	it('should handle network error', async () => {
		// Arrange
		const accountId = 'test-account-id';
		const newName = 'newuser@example.com';
		const networkError = new Error('Network error: Unable to reach server');

		vi.mocked(soapFetch).mockRejectedValue(networkError);

		// Act & Assert
		await expect(renameAccountRequest(accountId, newName)).rejects.toThrow('Network error');
		expect(soapFetch).toHaveBeenCalledTimes(1);
	});

	it('should handle rename to email with different domain', async () => {
		// Arrange
		const accountId = 'test-account-id';
		const newName = 'user@different-domain.com';
		const mockResponse = {
			RenameAccountResponse: {
				_jsns: 'urn:zimbraAdmin',
				account: {
					id: accountId,
					name: newName
				}
			}
		};

		vi.mocked(soapFetch).mockResolvedValue(mockResponse);

		// Act
		const result = await renameAccountRequest(accountId, newName);

		// Assert
		expect(soapFetch).toHaveBeenCalledWith('RenameAccount', {
			_jsns: 'urn:zimbraAdmin',
			id: accountId,
			newName: newName
		});
		expect(result).toEqual(mockResponse);
	});

	it('should handle rename with email containing special characters', async () => {
		// Arrange
		const accountId = 'test-account-id';
		const newName = 'user.name+tag@example.com';
		const mockResponse = {
			RenameAccountResponse: {
				_jsns: 'urn:zimbraAdmin',
				account: {
					id: accountId,
					name: newName
				}
			}
		};

		vi.mocked(soapFetch).mockResolvedValue(mockResponse);

		// Act
		const result = await renameAccountRequest(accountId, newName);

		// Assert
		expect(soapFetch).toHaveBeenCalledWith('RenameAccount', {
			_jsns: 'urn:zimbraAdmin',
			id: accountId,
			newName: newName
		});
		expect(result).toEqual(mockResponse);
	});

	it('should handle UUID format account ID', async () => {
		// Arrange
		const accountId = '550e8400-e29b-41d4-a716-446655440000';
		const newName = 'renamed@example.com';
		const mockResponse = {
			RenameAccountResponse: {
				_jsns: 'urn:zimbraAdmin',
				account: {
					id: accountId,
					name: newName
				}
			}
		};

		vi.mocked(soapFetch).mockResolvedValue(mockResponse);

		// Act
		const result = await renameAccountRequest(accountId, newName);

		// Assert
		expect(soapFetch).toHaveBeenCalledWith('RenameAccount', {
			_jsns: 'urn:zimbraAdmin',
			id: accountId,
			newName: newName
		});
		expect(result).toEqual(mockResponse);
	});

	it('should handle timeout error', async () => {
		// Arrange
		const accountId = 'test-account-id';
		const newName = 'newuser@example.com';
		const timeoutError = new Error('Request timeout');

		vi.mocked(soapFetch).mockRejectedValue(timeoutError);

		// Act & Assert
		await expect(renameAccountRequest(accountId, newName)).rejects.toThrow('Request timeout');
		expect(soapFetch).toHaveBeenCalledTimes(1);
	});

	it('should handle empty new name', async () => {
		// Arrange
		const accountId = 'test-account-id';
		const newName = '';
		const emptyError = new Error('account.INVALID_NAME');

		vi.mocked(soapFetch).mockRejectedValue(emptyError);

		// Act & Assert
		await expect(renameAccountRequest(accountId, newName)).rejects.toThrow(
			'account.INVALID_NAME'
		);
		expect(soapFetch).toHaveBeenCalledWith('RenameAccount', {
			_jsns: 'urn:zimbraAdmin',
			id: accountId,
			newName: newName
		});
	});

	it('should handle rename with subdomain', async () => {
		// Arrange
		const accountId = 'test-account-id';
		const newName = 'user@subdomain.example.com';
		const mockResponse = {
			RenameAccountResponse: {
				_jsns: 'urn:zimbraAdmin',
				account: {
					id: accountId,
					name: newName
				}
			}
		};

		vi.mocked(soapFetch).mockResolvedValue(mockResponse);

		// Act
		const result = await renameAccountRequest(accountId, newName);

		// Assert
		expect(soapFetch).toHaveBeenCalledWith('RenameAccount', {
			_jsns: 'urn:zimbraAdmin',
			id: accountId,
			newName: newName
		});
		expect(result).toEqual(mockResponse);
	});

	it('should handle malformed response from server', async () => {
		// Arrange
		const accountId = 'test-account-id';
		const newName = 'newuser@example.com';
		const malformedResponse = null;

		vi.mocked(soapFetch).mockResolvedValue(malformedResponse);

		// Act
		const result = await renameAccountRequest(accountId, newName);

		// Assert
		expect(result).toBeNull();
		expect(soapFetch).toHaveBeenCalledTimes(1);
	});
});

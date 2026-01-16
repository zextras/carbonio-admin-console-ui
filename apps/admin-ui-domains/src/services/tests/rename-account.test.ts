/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createSoapAPIInterceptor } from 'admin-ui-test-utils';
import { describe, expect, it } from 'vitest';

import { renameAccountRequest } from '../rename-account';

describe('renameAccountRequest', () => {
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

		createSoapAPIInterceptor('RenameAccount', mockResponse);

		// Act
		const result = await renameAccountRequest(accountId, newName);

		// Assert
		expect(result).toEqual(mockResponse);
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

		createSoapAPIInterceptor('RenameAccount', mockResponse);

		// Act
		const result = await renameAccountRequest(accountId, newName);

		// Assert
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

		createSoapAPIInterceptor('RenameAccount', mockResponse);

		// Act
		const result = await renameAccountRequest(accountId, newName);

		// Assert
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

		createSoapAPIInterceptor('RenameAccount', mockResponse);

		// Act
		const result = await renameAccountRequest(accountId, newName);

		// Assert
		expect(result).toEqual(mockResponse);
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

		createSoapAPIInterceptor('RenameAccount', mockResponse);

		// Act
		const result = await renameAccountRequest(accountId, newName);

		// Assert
		expect(result).toEqual(mockResponse);
	});

	it('should handle malformed response from server', async () => {
		// Arrange
		const accountId = 'test-account-id';
		const newName = 'newuser@example.com';
		const malformedResponse = null;

		createSoapAPIInterceptor('RenameAccount', malformedResponse);

		// Act
		const result = await renameAccountRequest(accountId, newName);

		// Assert
		expect(result).toEqual({});
	});
});

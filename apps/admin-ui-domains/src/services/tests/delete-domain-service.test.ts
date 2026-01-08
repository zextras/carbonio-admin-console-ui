/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/admin-ui-bootstrap';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { deleteDomain } from '../delete-domain-service';

vi.mock('@zextras/admin-ui-bootstrap', () => ({
	soapFetch: vi.fn()
}));

describe('deleteDomain', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should delete domain successfully with valid domain ID', async () => {
		// Arrange
		const domainId = 'test-domain-id-123';
		const mockResponse = {
			DeleteDomainResponse: {
				_jsns: 'urn:zimbraAdmin'
			}
		};

		vi.mocked(soapFetch).mockResolvedValue(mockResponse);

		// Act
		const result = await deleteDomain(domainId);

		// Assert
		expect(soapFetch).toHaveBeenCalledTimes(1);
		expect(soapFetch).toHaveBeenCalledWith('DeleteDomain', {
			_jsns: 'urn:zimbraAdmin',
			id: domainId
		});
		expect(result).toEqual(mockResponse);
	});

	it('should handle API error when domain does not exist', async () => {
		// Arrange
		const domainId = 'non-existent-domain-id';
		const mockError = new Error('account.NO_SUCH_DOMAIN');

		vi.mocked(soapFetch).mockRejectedValue(mockError);

		// Act & Assert
		await expect(deleteDomain(domainId)).rejects.toThrow('account.NO_SUCH_DOMAIN');
		expect(soapFetch).toHaveBeenCalledWith('DeleteDomain', {
			_jsns: 'urn:zimbraAdmin',
			id: domainId
		});
	});

	it('should handle error when domain has existing accounts', async () => {
		// Arrange
		const domainId = 'domain-with-accounts-id';
		const hasAccountsError = new Error('account.DOMAIN_NOT_EMPTY');

		vi.mocked(soapFetch).mockRejectedValue(hasAccountsError);

		// Act & Assert
		await expect(deleteDomain(domainId)).rejects.toThrow('account.DOMAIN_NOT_EMPTY');
		expect(soapFetch).toHaveBeenCalledWith('DeleteDomain', {
			_jsns: 'urn:zimbraAdmin',
			id: domainId
		});
	});

	it('should handle permission denied error', async () => {
		// Arrange
		const domainId = 'protected-domain-id';
		const permissionError = new Error('service.PERM_DENIED');

		vi.mocked(soapFetch).mockRejectedValue(permissionError);

		// Act & Assert
		await expect(deleteDomain(domainId)).rejects.toThrow('service.PERM_DENIED');
		expect(soapFetch).toHaveBeenCalledTimes(1);
	});

	it('should handle network error', async () => {
		// Arrange
		const domainId = 'test-domain-id';
		const networkError = new Error('Network error: Unable to reach server');

		vi.mocked(soapFetch).mockRejectedValue(networkError);

		// Act & Assert
		await expect(deleteDomain(domainId)).rejects.toThrow('Network error');
		expect(soapFetch).toHaveBeenCalledTimes(1);
	});

	it('should handle UUID format domain ID', async () => {
		// Arrange
		const domainId = '550e8400-e29b-41d4-a716-446655440000';
		const mockResponse = {
			DeleteDomainResponse: {
				_jsns: 'urn:zimbraAdmin'
			}
		};

		vi.mocked(soapFetch).mockResolvedValue(mockResponse);

		// Act
		const result = await deleteDomain(domainId);

		// Assert
		expect(soapFetch).toHaveBeenCalledWith('DeleteDomain', {
			_jsns: 'urn:zimbraAdmin',
			id: domainId
		});
		expect(result).toEqual(mockResponse);
	});

	it('should handle timeout error', async () => {
		// Arrange
		const domainId = 'test-domain-id';
		const timeoutError = new Error('Request timeout');

		vi.mocked(soapFetch).mockRejectedValue(timeoutError);

		// Act & Assert
		await expect(deleteDomain(domainId)).rejects.toThrow('Request timeout');
		expect(soapFetch).toHaveBeenCalledTimes(1);
	});

	it('should handle empty domain ID', async () => {
		// Arrange
		const domainId = '';
		const mockError = new Error('Invalid domain ID');

		vi.mocked(soapFetch).mockRejectedValue(mockError);

		// Act & Assert
		await expect(deleteDomain(domainId)).rejects.toThrow();
		expect(soapFetch).toHaveBeenCalledWith('DeleteDomain', {
			_jsns: 'urn:zimbraAdmin',
			id: domainId
		});
	});

	it('should handle domain with special characters in ID', async () => {
		// Arrange
		const domainId = 'domain-!@#$%-id';
		const mockResponse = {
			DeleteDomainResponse: {
				_jsns: 'urn:zimbraAdmin'
			}
		};

		vi.mocked(soapFetch).mockResolvedValue(mockResponse);

		// Act
		const result = await deleteDomain(domainId);

		// Assert
		expect(soapFetch).toHaveBeenCalledWith('DeleteDomain', {
			_jsns: 'urn:zimbraAdmin',
			id: domainId
		});
		expect(result).toEqual(mockResponse);
	});

	it('should handle default domain deletion error', async () => {
		// Arrange
		const domainId = 'default-domain-id';
		const defaultDomainError = new Error('account.CANNOT_DELETE_DEFAULT_DOMAIN');

		vi.mocked(soapFetch).mockRejectedValue(defaultDomainError);

		// Act & Assert
		await expect(deleteDomain(domainId)).rejects.toThrow(
			'account.CANNOT_DELETE_DEFAULT_DOMAIN'
		);
		expect(soapFetch).toHaveBeenCalledWith('DeleteDomain', {
			_jsns: 'urn:zimbraAdmin',
			id: domainId
		});
	});

	it('should handle domain in use by resources error', async () => {
		// Arrange
		const domainId = 'domain-with-resources-id';
		const resourcesError = new Error('account.DOMAIN_HAS_ACTIVE_RESOURCES');

		vi.mocked(soapFetch).mockRejectedValue(resourcesError);

		// Act & Assert
		await expect(deleteDomain(domainId)).rejects.toThrow('account.DOMAIN_HAS_ACTIVE_RESOURCES');
		expect(soapFetch).toHaveBeenCalledTimes(1);
	});

	it('should handle domain with distribution lists error', async () => {
		// Arrange
		const domainId = 'domain-with-dl-id';
		const dlError = new Error('account.DOMAIN_HAS_DISTRIBUTION_LISTS');

		vi.mocked(soapFetch).mockRejectedValue(dlError);

		// Act & Assert
		await expect(deleteDomain(domainId)).rejects.toThrow('account.DOMAIN_HAS_DISTRIBUTION_LISTS');
		expect(soapFetch).toHaveBeenCalledTimes(1);
	});

	it('should handle malformed response from server', async () => {
		// Arrange
		const domainId = 'test-domain-id';
		const malformedResponse = null;

		vi.mocked(soapFetch).mockResolvedValue(malformedResponse);

		// Act
		const result = await deleteDomain(domainId);

		// Assert
		expect(result).toBeNull();
		expect(soapFetch).toHaveBeenCalledTimes(1);
	});

	it('should handle concurrent deletion error', async () => {
		// Arrange
		const domainId = 'test-domain-id';
		const concurrentError = new Error('service.FAILURE: Domain already being deleted');

		vi.mocked(soapFetch).mockRejectedValue(concurrentError);

		// Act & Assert
		await expect(deleteDomain(domainId)).rejects.toThrow('Domain already being deleted');
		expect(soapFetch).toHaveBeenCalledTimes(1);
	});
});

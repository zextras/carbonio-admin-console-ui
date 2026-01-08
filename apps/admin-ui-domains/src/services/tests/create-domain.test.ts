/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/admin-ui-bootstrap';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createDomain } from '../create-domain';

vi.mock('@zextras/admin-ui-bootstrap', () => ({
	soapFetch: vi.fn()
}));

describe('createDomain', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should create domain successfully with domain name only', async () => {
		// Arrange
		const domainName = 'example.com';
		const mockResponse = {
			CreateDomainResponse: {
				_jsns: 'urn:zimbraAdmin',
				domain: {
					id: 'domain-id-123',
					name: domainName
				}
			}
		};

		vi.mocked(soapFetch).mockResolvedValue(mockResponse);

		// Act
		const result = await createDomain(domainName);

		// Assert
		expect(soapFetch).toHaveBeenCalledTimes(1);
		expect(soapFetch).toHaveBeenCalledWith('CreateDomain', {
			_jsns: 'urn:zimbraAdmin',
			name: domainName
		});
		expect(result).toEqual(mockResponse);
	});

	it('should create domain successfully with attributes', async () => {
		// Arrange
		const domainName = 'example.com';
		const attributes = [
			{ n: 'zimbraPublicServiceHostname', _content: 'mail.example.com' },
			{ n: 'zimbraMailStatus', _content: 'enabled' },
			{ n: 'description', _content: 'Test domain' }
		];
		const mockResponse = {
			CreateDomainResponse: {
				_jsns: 'urn:zimbraAdmin',
				domain: {
					id: 'domain-id-123',
					name: domainName,
					a: attributes
				}
			}
		};

		vi.mocked(soapFetch).mockResolvedValue(mockResponse);

		// Act
		const result = await createDomain(domainName, attributes);

		// Assert
		expect(soapFetch).toHaveBeenCalledTimes(1);
		expect(soapFetch).toHaveBeenCalledWith('CreateDomain', {
			_jsns: 'urn:zimbraAdmin',
			name: domainName,
			a: attributes
		});
		expect(result).toEqual(mockResponse);
	});

	it('should handle error when domain already exists', async () => {
		// Arrange
		const domainName = 'existing.com';
		const duplicateError = new Error('account.DOMAIN_EXISTS');

		vi.mocked(soapFetch).mockRejectedValue(duplicateError);

		// Act & Assert
		await expect(createDomain(domainName)).rejects.toThrow('account.DOMAIN_EXISTS');
		expect(soapFetch).toHaveBeenCalledWith('CreateDomain', {
			_jsns: 'urn:zimbraAdmin',
			name: domainName
		});
	});

	it('should handle invalid domain name error', async () => {
		// Arrange
		const invalidDomain = 'invalid domain name';
		const formatError = new Error('account.INVALID_NAME');

		vi.mocked(soapFetch).mockRejectedValue(formatError);

		// Act & Assert
		await expect(createDomain(invalidDomain)).rejects.toThrow('account.INVALID_NAME');
		expect(soapFetch).toHaveBeenCalledTimes(1);
	});

	it('should handle permission denied error', async () => {
		// Arrange
		const domainName = 'newdomain.com';
		const permissionError = new Error('service.PERM_DENIED');

		vi.mocked(soapFetch).mockRejectedValue(permissionError);

		// Act & Assert
		await expect(createDomain(domainName)).rejects.toThrow('service.PERM_DENIED');
		expect(soapFetch).toHaveBeenCalledTimes(1);
	});

	it('should handle network error', async () => {
		// Arrange
		const domainName = 'example.com';
		const networkError = new Error('Network error: Unable to reach server');

		vi.mocked(soapFetch).mockRejectedValue(networkError);

		// Act & Assert
		await expect(createDomain(domainName)).rejects.toThrow('Network error');
		expect(soapFetch).toHaveBeenCalledTimes(1);
	});

	it('should create subdomain successfully', async () => {
		// Arrange
		const domainName = 'subdomain.example.com';
		const mockResponse = {
			CreateDomainResponse: {
				_jsns: 'urn:zimbraAdmin',
				domain: {
					id: 'subdomain-id-123',
					name: domainName
				}
			}
		};

		vi.mocked(soapFetch).mockResolvedValue(mockResponse);

		// Act
		const result = await createDomain(domainName);

		// Assert
		expect(soapFetch).toHaveBeenCalledWith('CreateDomain', {
			_jsns: 'urn:zimbraAdmin',
			name: domainName
		});
		expect(result).toEqual(mockResponse);
	});

	it('should create domain with multiple subdomain levels', async () => {
		// Arrange
		const domainName = 'mail.subdomain.example.com';
		const mockResponse = {
			CreateDomainResponse: {
				_jsns: 'urn:zimbraAdmin',
				domain: {
					id: 'multi-subdomain-id-123',
					name: domainName
				}
			}
		};

		vi.mocked(soapFetch).mockResolvedValue(mockResponse);

		// Act
		const result = await createDomain(domainName);

		// Assert
		expect(soapFetch).toHaveBeenCalledWith('CreateDomain', {
			_jsns: 'urn:zimbraAdmin',
			name: domainName
		});
		expect(result).toEqual(mockResponse);
	});

	it('should create domain with international characters (IDN)', async () => {
		// Arrange
		const domainName = 'münchen.de';
		const mockResponse = {
			CreateDomainResponse: {
				_jsns: 'urn:zimbraAdmin',
				domain: {
					id: 'idn-domain-id-123',
					name: domainName
				}
			}
		};

		vi.mocked(soapFetch).mockResolvedValue(mockResponse);

		// Act
		const result = await createDomain(domainName);

		// Assert
		expect(soapFetch).toHaveBeenCalledWith('CreateDomain', {
			_jsns: 'urn:zimbraAdmin',
			name: domainName
		});
		expect(result).toEqual(mockResponse);
	});

	it('should create domain with empty attributes array', async () => {
		// Arrange
		const domainName = 'example.com';
		const attributes: Array<any> = [];
		const mockResponse = {
			CreateDomainResponse: {
				_jsns: 'urn:zimbraAdmin',
				domain: {
					id: 'domain-id-123',
					name: domainName
				}
			}
		};

		vi.mocked(soapFetch).mockResolvedValue(mockResponse);

		// Act
		const result = await createDomain(domainName, attributes);

		// Assert
		expect(soapFetch).toHaveBeenCalledWith('CreateDomain', {
			_jsns: 'urn:zimbraAdmin',
			name: domainName,
			a: attributes
		});
		expect(result).toEqual(mockResponse);
	});

	it('should create domain with complex attributes', async () => {
		// Arrange
		const domainName = 'company.com';
		const attributes = [
			{ n: 'zimbraPublicServiceHostname', _content: 'mail.company.com' },
			{ n: 'zimbraMailStatus', _content: 'enabled' },
			{ n: 'description', _content: 'Corporate domain' },
			{ n: 'zimbraDomainMaxAccounts', _content: '1000' },
			{ n: 'zimbraDomainAggregateQuota', _content: '107374182400' },
			{ n: 'zimbraGalMode', _content: 'zimbra' }
		];
		const mockResponse = {
			CreateDomainResponse: {
				_jsns: 'urn:zimbraAdmin',
				domain: {
					id: 'domain-id-456',
					name: domainName,
					a: attributes
				}
			}
		};

		vi.mocked(soapFetch).mockResolvedValue(mockResponse);

		// Act
		const result = await createDomain(domainName, attributes);

		// Assert
		expect(soapFetch).toHaveBeenCalledWith('CreateDomain', {
			_jsns: 'urn:zimbraAdmin',
			name: domainName,
			a: attributes
		});
		expect(result).toEqual(mockResponse);
	});

	it('should handle timeout error', async () => {
		// Arrange
		const domainName = 'example.com';
		const timeoutError = new Error('Request timeout');

		vi.mocked(soapFetch).mockRejectedValue(timeoutError);

		// Act & Assert
		await expect(createDomain(domainName)).rejects.toThrow('Request timeout');
		expect(soapFetch).toHaveBeenCalledTimes(1);
	});

	it('should handle empty domain name', async () => {
		// Arrange
		const domainName = '';
		const emptyError = new Error('account.INVALID_NAME');

		vi.mocked(soapFetch).mockRejectedValue(emptyError);

		// Act & Assert
		await expect(createDomain(domainName)).rejects.toThrow('account.INVALID_NAME');
		expect(soapFetch).toHaveBeenCalledWith('CreateDomain', {
			_jsns: 'urn:zimbraAdmin',
			name: domainName
		});
	});

	it('should handle malformed response from server', async () => {
		// Arrange
		const domainName = 'example.com';
		const malformedResponse = null;

		vi.mocked(soapFetch).mockResolvedValue(malformedResponse);

		// Act
		const result = await createDomain(domainName);

		// Assert
		expect(result).toBeNull();
		expect(soapFetch).toHaveBeenCalledTimes(1);
	});

	it('should create domain with hyphenated name', async () => {
		// Arrange
		const domainName = 'my-company.com';
		const mockResponse = {
			CreateDomainResponse: {
				_jsns: 'urn:zimbraAdmin',
				domain: {
					id: 'hyphen-domain-id-123',
					name: domainName
				}
			}
		};

		vi.mocked(soapFetch).mockResolvedValue(mockResponse);

		// Act
		const result = await createDomain(domainName);

		// Assert
		expect(soapFetch).toHaveBeenCalledWith('CreateDomain', {
			_jsns: 'urn:zimbraAdmin',
			name: domainName
		});
		expect(result).toEqual(mockResponse);
	});
});

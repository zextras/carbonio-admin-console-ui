/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createSoapAPIInterceptor } from 'admin-ui-test-utils';
import { describe, expect, it } from 'vitest';

import { deleteDomain } from '../delete-domain-service';

describe('deleteDomain', () => {
	it('should delete domain successfully with valid domain ID', async () => {
		// Arrange
		const domainId = 'test-domain-id-123';
		const mockResponse = {
			DeleteDomainResponse: {
				_jsns: 'urn:zimbraAdmin'
			}
		};

		createSoapAPIInterceptor('DeleteDomain', mockResponse);

		// Act
		const result = await deleteDomain(domainId);

		// Assert
		expect(result).toEqual(mockResponse);
	});

	it('should handle UUID format domain ID', async () => {
		// Arrange
		const domainId = '550e8400-e29b-41d4-a716-446655440000';
		const mockResponse = {
			DeleteDomainResponse: {
				_jsns: 'urn:zimbraAdmin'
			}
		};

		createSoapAPIInterceptor('DeleteDomain', mockResponse);

		// Act
		const result = await deleteDomain(domainId);

		// Assert
		expect(result).toEqual(mockResponse);
	});

	it('should handle domain with special characters in ID', async () => {
		// Arrange
		const domainId = 'domain-!@#$%-id';
		const mockResponse = {
			DeleteDomainResponse: {
				_jsns: 'urn:zimbraAdmin'
			}
		};

		createSoapAPIInterceptor('DeleteDomain', mockResponse);

		// Act
		const result = await deleteDomain(domainId);

		// Assert
		expect(result).toEqual(mockResponse);
	});

	it('should handle malformed response from server', async () => {
		// Arrange
		const domainId = 'test-domain-id';
		const malformedResponse = null;

		createSoapAPIInterceptor('DeleteDomain', malformedResponse);

		// Act
		const result = await deleteDomain(domainId);

		// Assert
		expect(result).toEqual({});
	});
});

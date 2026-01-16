/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createSoapAPIInterceptor } from 'admin-ui-test-utils';
import { describe, expect, it } from 'vitest';

import { createDomain } from '../create-domain';

describe('createDomain', () => {
  it('should create domain successfully with domain name only', async () => {
    const domainName = 'example.com';
    const mockResponse = {
      domain: {
        id: 'domain-id-123',
        name: domainName,
      },
    };
    createSoapAPIInterceptor('CreateDomain', mockResponse);

    const result = await createDomain(domainName);

    // Assert
    expect(result).toEqual(mockResponse);
  });

  it('should create domain successfully with attributes', async () => {
    // Arrange
    const domainName = 'example.com';
    const attributes = [
      { n: 'zimbraPublicServiceHostname', _content: 'mail.example.com' },
      { n: 'zimbraMailStatus', _content: 'enabled' },
      { n: 'description', _content: 'Test domain' },
    ];
    const mockResponse = {
      CreateDomainResponse: {
        _jsns: 'urn:zimbraAdmin',
        domain: {
          id: 'domain-id-123',
          name: domainName,
          a: attributes,
        },
      },
    };

    createSoapAPIInterceptor('CreateDomain', mockResponse);

    const result = await createDomain(domainName, attributes);

    expect(result).toEqual(mockResponse);
  });

  it('should create subdomain successfully', async () => {
    // Arrange
    const domainName = 'subdomain.example.com';
    const mockResponse = {
      CreateDomainResponse: {
        _jsns: 'urn:zimbraAdmin',
        domain: {
          id: 'subdomain-id-123',
          name: domainName,
        },
      },
    };

    createSoapAPIInterceptor('CreateDomain', mockResponse);

    // Act
    const result = await createDomain(domainName);

    // Assert
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
          name: domainName,
        },
      },
    };

    createSoapAPIInterceptor('CreateDomain', mockResponse);

    // Act
    const result = await createDomain(domainName);

    // Assert
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
          name: domainName,
        },
      },
    };

    createSoapAPIInterceptor('CreateDomain', mockResponse);

    // Act
    const result = await createDomain(domainName);

    // Assert
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
          name: domainName,
        },
      },
    };

    createSoapAPIInterceptor('CreateDomain', mockResponse);

    // Act
    const result = await createDomain(domainName, attributes);

    // Assert
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
      { n: 'zimbraGalMode', _content: 'zimbra' },
    ];
    const mockResponse = {
      CreateDomainResponse: {
        _jsns: 'urn:zimbraAdmin',
        domain: {
          id: 'domain-id-456',
          name: domainName,
          a: attributes,
        },
      },
    };

    createSoapAPIInterceptor('CreateDomain', mockResponse);

    // Act
    const result = await createDomain(domainName, attributes);

    // Assert
    expect(result).toEqual(mockResponse);
  });

  it('should handle malformed response from server', async () => {
    // Arrange
    const domainName = 'example.com';
    const malformedResponse = null;

    createSoapAPIInterceptor('CreateDomain', malformedResponse);

    // Act
    const result = await createDomain(domainName);

    // Assert
    expect(result).toEqual({});
  });

  it('should create domain with hyphenated name', async () => {
    // Arrange
    const domainName = 'my-company.com';
    const mockResponse = {
      CreateDomainResponse: {
        _jsns: 'urn:zimbraAdmin',
        domain: {
          id: 'hyphen-domain-id-123',
          name: domainName,
        },
      },
    };

    createSoapAPIInterceptor('CreateDomain', mockResponse);

    // Act
    const result = await createDomain(domainName);

    // Assert
    expect(result).toEqual(mockResponse);
  });
})
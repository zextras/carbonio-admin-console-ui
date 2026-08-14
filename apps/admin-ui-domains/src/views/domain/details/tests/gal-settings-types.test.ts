/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'vitest';

import {
	buildGalDomainAttributes,
	formatPollingInterval,
	GalFormState,
	isGalFormDirty,
	parseGalFormFromAttributes,
	parsePollingInterval
} from '../schemas/gal-settings-types';

describe('parsePollingInterval', () => {
	it('should parse "1d" as {value: "1", unit: "d"}', () => {
		const result = parsePollingInterval('1d');
		expect(result).toEqual({ value: '1', unit: 'd' });
	});

	it('should parse "30m" as {value: "30", unit: "m"}', () => {
		const result = parsePollingInterval('30m');
		expect(result).toEqual({ value: '30', unit: 'm' });
	});

	it('should parse "12h" as {value: "12", unit: "h"}', () => {
		const result = parsePollingInterval('12h');
		expect(result).toEqual({ value: '12', unit: 'h' });
	});

	it('should parse "60s" as {value: "60", unit: "s"}', () => {
		const result = parsePollingInterval('60s');
		expect(result).toEqual({ value: '60', unit: 's' });
	});

	it('should return default for empty string', () => {
		const result = parsePollingInterval('');
		expect(result).toEqual({ value: '1', unit: 'm' });
	});

	it('should return default for undefined', () => {
		const result = parsePollingInterval(undefined);
		expect(result).toEqual({ value: '1', unit: 'm' });
	});

	it('should return default for invalid format', () => {
		const result = parsePollingInterval('invalid');
		expect(result).toEqual({ value: '1', unit: 'm' });
	});

	it('should return default for missing unit', () => {
		const result = parsePollingInterval('123');
		expect(result).toEqual({ value: '1', unit: 'm' });
	});
});

describe('formatPollingInterval', () => {
	it('should format {value: "1", unit: "d"} as "1d"', () => {
		const result = formatPollingInterval({ value: '1', unit: 'd' });
		expect(result).toBe('1d');
	});

	it('should format {value: "30", unit: "m"} as "30m"', () => {
		const result = formatPollingInterval({ value: '30', unit: 'm' });
		expect(result).toBe('30m');
	});

	it('should format {value: "12", unit: "h"} as "12h"', () => {
		const result = formatPollingInterval({ value: '12', unit: 'h' });
		expect(result).toBe('12h');
	});
});

describe('parseGalFormFromAttributes', () => {
	it('should return null for undefined', () => {
		const result = parseGalFormFromAttributes(undefined);
		expect(result).toBeNull();
	});

	it('should parse zimbra mode correctly', () => {
		const attrs = [
			{ n: 'zimbraId', _content: 'domain-123' },
			{ n: 'zimbraGalMode', _content: 'zimbra' },
			{ n: 'zimbraGalMaxResults', _content: '100' },
			{ n: 'zimbraGalLdapPageSize', _content: '1000' }
		];
		const result = parseGalFormFromAttributes(attrs);
		expect(result?.galMode).toBe('zimbra');
		expect(result?.zimbraId).toBe('domain-123');
		expect(result?.maxResults).toBe('100');
		expect(result?.ldapPageSize).toBe('1000');
	});

	it('should parse ldap mode correctly', () => {
		const attrs = [
			{ n: 'zimbraId', _content: 'domain-123' },
			{ n: 'zimbraGalMode', _content: 'ldap' },
			{ n: 'zimbraGalLdapURL', _content: 'ldap://server:389' },
			{ n: 'zimbraGalLdapFilter', _content: '(objectClass=*)' },
			{ n: 'zimbraGalLdapSearchBase', _content: 'dc=example,dc=com' },
			{ n: 'zimbraGalLdapBindDn', _content: 'cn=admin' },
			{ n: 'zimbraGalLdapBindPassword', _content: 'secret' }
		];
		const result = parseGalFormFromAttributes(attrs);
		expect(result?.galMode).toBe('ldap');
		expect(result?.ldapUrl).toBe('ldap://server:389');
		expect(result?.ldapFilter).toBe('(objectClass=*)');
		expect(result?.ldapSearchBase).toBe('dc=example,dc=com');
		expect(result?.ldapBindDn).toBe('cn=admin');
		expect(result?.ldapBindPassword).toBe('secret');
	});

	it('should parse both mode correctly', () => {
		const attrs = [
			{ n: 'zimbraId', _content: 'domain-123' },
			{ n: 'zimbraGalMode', _content: 'both' }
		];
		const result = parseGalFormFromAttributes(attrs);
		expect(result?.galMode).toBe('both');
	});

	it('should parse boolean fields', () => {
		const attrsTrue = [
			{ n: 'zimbraId', _content: 'domain-123' },
			{ n: 'zimbraGalLdapStartTlsEnabled', _content: 'TRUE' }
		];
		const resultTrue = parseGalFormFromAttributes(attrsTrue);
		expect(resultTrue?.ldapStartTlsEnabled).toBe(true);

		const attrsFalse = [
			{ n: 'zimbraId', _content: 'domain-123' },
			{ n: 'zimbraGalLdapStartTlsEnabled', _content: 'FALSE' }
		];
		const resultFalse = parseGalFormFromAttributes(attrsFalse);
		expect(resultFalse?.ldapStartTlsEnabled).toBe(false);
	});

	it('should parse ldap auth mech', () => {
		const attrsSimple = [
			{ n: 'zimbraId', _content: 'domain-123' },
			{ n: 'zimbraGalLdapAuthMech', _content: 'simple' }
		];
		const resultSimple = parseGalFormFromAttributes(attrsSimple);
		expect(resultSimple?.ldapAuthMech).toBe('simple');

		const attrsNone = [
			{ n: 'zimbraId', _content: 'domain-123' },
			{ n: 'zimbraGalLdapAuthMech', _content: 'none' }
		];
		const resultNone = parseGalFormFromAttributes(attrsNone);
		expect(resultNone?.ldapAuthMech).toBe('none');
	});

	it('should parse polling interval', () => {
		const attrs = [
			{ n: 'zimbraId', _content: 'domain-123' },
			{ n: 'zimbraDataSourceGalPollingInterval', _content: '2h' }
		];
		const result = parseGalFormFromAttributes(attrs);
		expect(result?.galPollingInterval).toEqual({ value: '2', unit: 'h' });
	});

	it('should default missing fields', () => {
		const attrs = [{ n: 'zimbraId', _content: 'domain-123' }];
		const result = parseGalFormFromAttributes(attrs);
		expect(result?.galMode).toBe('zimbra');
		expect(result?.maxResults).toBe('');
		expect(result?.ldapUrl).toBe('');
		expect(result?.ldapStartTlsEnabled).toBe(false);
		expect(result?.ldapAuthMech).toBe('none');
	});
});

describe('buildGalDomainAttributes', () => {
	it('should build attributes from form state', () => {
		const state: GalFormState = {
			zimbraId: 'domain-123',
			galMode: 'ldap',
			maxResults: '100',
			ldapPageSize: '1000',
			ldapUrl: 'ldap://server:389',
			ldapStartTlsEnabled: true,
			ldapSearchBase: 'dc=example,dc=com',
			ldapFilter: '(objectClass=*)',
			ldapBindDn: 'cn=admin',
			ldapBindPassword: 'secret',
			ldapAuthMech: 'simple',
			galPollingInterval: { value: '1', unit: 'd' },
			galAccountId: 'account-123'
		};

		const result = buildGalDomainAttributes(state);

		expect(result).toContainEqual({ n: 'zimbraGalMaxResults', _content: '100' });
		expect(result).toContainEqual({ n: 'zimbraGalLdapPageSize', _content: '1000' });
		expect(result).toContainEqual({ n: 'zimbraGalMode', _content: 'ldap' });
		expect(result).toContainEqual({ n: 'zimbraGalLdapURL', _content: 'ldap://server:389' });
		expect(result).toContainEqual({
			n: 'zimbraGalLdapStartTlsEnabled',
			_content: 'TRUE'
		});
		expect(result).toContainEqual({ n: 'zimbraGalLdapFilter', _content: '(objectClass=*)' });
		expect(result).toContainEqual({
			n: 'zimbraGalLdapSearchBase',
			_content: 'dc=example,dc=com'
		});
		expect(result).toContainEqual({ n: 'zimbraGalLdapBindDn', _content: 'cn=admin' });
		expect(result).toContainEqual({ n: 'zimbraGalLdapBindPassword', _content: 'secret' });
		expect(result).toContainEqual({ n: 'zimbraGalLdapAuthMech', _content: 'simple' });
	});

	it('should set FALSE for disabled TLS', () => {
		const state: GalFormState = {
			zimbraId: 'domain-123',
			galMode: 'zimbra',
			maxResults: '100',
			ldapPageSize: '1000',
			ldapUrl: '',
			ldapStartTlsEnabled: false,
			ldapSearchBase: '',
			ldapFilter: '',
			ldapBindDn: '',
			ldapBindPassword: '',
			ldapAuthMech: 'none',
			galPollingInterval: { value: '1', unit: 'd' },
			galAccountId: ''
		};

		const result = buildGalDomainAttributes(state);
		expect(result).toContainEqual({
			n: 'zimbraGalLdapStartTlsEnabled',
			_content: 'FALSE'
		});
	});
});

describe('isGalFormDirty', () => {
	const baseState: GalFormState = {
		zimbraId: 'domain-123',
		galMode: 'zimbra',
		maxResults: '100',
		ldapPageSize: '1000',
		ldapUrl: '',
		ldapStartTlsEnabled: false,
		ldapSearchBase: '',
		ldapFilter: '',
		ldapBindDn: '',
		ldapBindPassword: '',
		ldapAuthMech: 'none',
		galPollingInterval: { value: '1', unit: 'd' },
		galAccountId: ''
	};

	it('should return false when states are equal', () => {
		const result = isGalFormDirty(baseState, { ...baseState });
		expect(result).toBe(false);
	});

	it('should return false when both are null', () => {
		const result = isGalFormDirty(null, null);
		expect(result).toBe(false);
	});

	it('should return false when original is null', () => {
		const result = isGalFormDirty(null, baseState);
		expect(result).toBe(false);
	});

	it('should return false when current is null', () => {
		const result = isGalFormDirty(baseState, null);
		expect(result).toBe(false);
	});

	it('should return true when galMode differs', () => {
		const result = isGalFormDirty(baseState, { ...baseState, galMode: 'ldap' });
		expect(result).toBe(true);
	});

	it('should return true when maxResults differs', () => {
		const result = isGalFormDirty(baseState, { ...baseState, maxResults: '200' });
		expect(result).toBe(true);
	});

	it('should return true when ldapPageSize differs', () => {
		const result = isGalFormDirty(baseState, { ...baseState, ldapPageSize: '500' });
		expect(result).toBe(true);
	});

	it('should return true when ldapUrl differs', () => {
		const result = isGalFormDirty(baseState, { ...baseState, ldapUrl: 'ldap://new' });
		expect(result).toBe(true);
	});

	it('should return true when ldapStartTlsEnabled differs', () => {
		const result = isGalFormDirty(baseState, { ...baseState, ldapStartTlsEnabled: true });
		expect(result).toBe(true);
	});

	it('should return true when ldapSearchBase differs', () => {
		const result = isGalFormDirty(baseState, { ...baseState, ldapSearchBase: 'dc=new' });
		expect(result).toBe(true);
	});

	it('should return true when ldapFilter differs', () => {
		const result = isGalFormDirty(baseState, { ...baseState, ldapFilter: '(cn=*)' });
		expect(result).toBe(true);
	});

	it('should return true when ldapBindDn differs', () => {
		const result = isGalFormDirty(baseState, { ...baseState, ldapBindDn: 'cn=new' });
		expect(result).toBe(true);
	});

	it('should return true when ldapBindPassword differs', () => {
		const result = isGalFormDirty(baseState, { ...baseState, ldapBindPassword: 'newpass' });
		expect(result).toBe(true);
	});

	it('should return true when ldapAuthMech differs', () => {
		const result = isGalFormDirty(baseState, { ...baseState, ldapAuthMech: 'simple' });
		expect(result).toBe(true);
	});

	it('should return true when pollingInterval value differs', () => {
		const result = isGalFormDirty(baseState, {
			...baseState,
			galPollingInterval: { value: '2', unit: 'd' }
		});
		expect(result).toBe(true);
	});

	it('should return true when pollingInterval unit differs', () => {
		const result = isGalFormDirty(baseState, {
			...baseState,
			galPollingInterval: { value: '1', unit: 'h' }
		});
		expect(result).toBe(true);
	});
});

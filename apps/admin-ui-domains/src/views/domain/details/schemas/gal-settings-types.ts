/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Attribute } from '../../../../../types';

// === GAL Mode types ===
export type GalMode = 'zimbra' | 'ldap' | 'both';
export type LdapAuthMech = 'none' | 'simple';
export type PollingUnit = 'd' | 'h' | 'm' | 's';

// === Polling interval ===
export interface PollingInterval {
	value: string;
	unit: PollingUnit;
}

// === Main form state ===
export interface GalFormState {
	zimbraId: string;
	galMode: GalMode;
	maxResults: string;
	ldapPageSize: string;
	ldapUrl: string;
	ldapStartTlsEnabled: boolean;
	ldapSearchBase: string;
	ldapFilter: string;
	ldapBindDn: string;
	ldapBindPassword: string;
	ldapAuthMech: LdapAuthMech;
	galPollingInterval: PollingInterval;
	galAccountId: string;
}

// === Server state ===
export interface GalServerState {
	servers: GalServerItem[];
	selectedIndex: number | null;
	isLoading: boolean;
}

export interface GalServerItem {
	id: string;
	name: string;
	galAccount: {
		id: string;
		name: string;
		server: string;
	} | null;
}

// === Modal state ===
export interface GalModalState {
	createOpen: boolean;
	destroyOpen: boolean;
}

// === Parser functions ===

export function parsePollingInterval(raw: string | undefined): PollingInterval {
	if (!raw) return { value: '1', unit: 'm' };
	const match = raw.match(/^(\d+)([dhms])$/);
	if (!match) return { value: '1', unit: 'm' };
	return { value: match[1], unit: match[2] as PollingUnit };
}

export function formatPollingInterval(interval: PollingInterval): string {
	return `${interval.value}${interval.unit}`;
}

export function parseGalFormFromAttributes(attrs: Attribute[] | undefined): GalFormState | null {
	if (!attrs) return null;

	const attrMap = new Map(attrs.map((a) => [a.n, a._content]));

	const rawMode = attrMap.get('zimbraGalMode') ?? 'zimbra';
	const galMode: GalMode = rawMode === 'ldap' || rawMode === 'both' ? rawMode : 'zimbra';

	const rawAuthMech = attrMap.get('zimbraGalLdapAuthMech') ?? 'none';
	const ldapAuthMech: LdapAuthMech = rawAuthMech === 'simple' ? 'simple' : 'none';

	return {
		zimbraId: attrMap.get('zimbraId') ?? '',
		galMode,
		maxResults: attrMap.get('zimbraGalMaxResults') ?? '',
		ldapPageSize: attrMap.get('zimbraGalLdapPageSize') ?? '',
		ldapUrl: attrMap.get('zimbraGalLdapURL') ?? '',
		ldapStartTlsEnabled: attrMap.get('zimbraGalLdapStartTlsEnabled') === 'TRUE',
		ldapSearchBase: attrMap.get('zimbraGalLdapSearchBase') ?? '',
		ldapFilter: attrMap.get('zimbraGalLdapFilter') ?? '',
		ldapBindDn: attrMap.get('zimbraGalLdapBindDn') ?? '',
		ldapBindPassword: attrMap.get('zimbraGalLdapBindPassword') ?? '',
		ldapAuthMech,
		galPollingInterval: parsePollingInterval(attrMap.get('zimbraDataSourceGalPollingInterval')),
		galAccountId: attrMap.get('zimbraGalAccountId') ?? ''
	};
}

export function buildGalDomainAttributes(state: GalFormState): Attribute[] {
	return [
		{ n: 'zimbraGalMaxResults', _content: state.maxResults },
		{ n: 'zimbraGalLdapPageSize', _content: state.ldapPageSize },
		{ n: 'zimbraGalMode', _content: state.galMode },
		{ n: 'zimbraGalLdapURL', _content: state.ldapUrl },
		{ n: 'zimbraGalLdapStartTlsEnabled', _content: state.ldapStartTlsEnabled ? 'TRUE' : 'FALSE' },
		{ n: 'zimbraGalLdapFilter', _content: state.ldapFilter },
		{ n: 'zimbraGalLdapSearchBase', _content: state.ldapSearchBase },
		{ n: 'zimbraGalLdapBindDn', _content: state.ldapBindDn },
		{ n: 'zimbraGalLdapBindPassword', _content: state.ldapBindPassword },
		{ n: 'zimbraGalLdapAuthMech', _content: state.ldapAuthMech }
	];
}

export function isGalFormDirty(
	original: GalFormState | null,
	current: GalFormState | null
): boolean {
	if (!original || !current) return false;

	return (
		original.galMode !== current.galMode ||
		original.maxResults !== current.maxResults ||
		original.ldapPageSize !== current.ldapPageSize ||
		original.ldapUrl !== current.ldapUrl ||
		original.ldapStartTlsEnabled !== current.ldapStartTlsEnabled ||
		original.ldapSearchBase !== current.ldapSearchBase ||
		original.ldapFilter !== current.ldapFilter ||
		original.ldapBindDn !== current.ldapBindDn ||
		original.ldapBindPassword !== current.ldapBindPassword ||
		original.ldapAuthMech !== current.ldapAuthMech ||
		formatPollingInterval(original.galPollingInterval) !==
			formatPollingInterval(current.galPollingInterval)
	);
}

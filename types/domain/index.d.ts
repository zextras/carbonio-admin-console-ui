/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Attribute } from '../attribute';

export type Domain = {
	id?: string;
	name?: string;
	a?: Array<Attribute>;
};

export interface ICertificateContent {
	fileName: string;
	content: string;
}

export interface CreateSnackbarType {
	key: string;
	type: 'error' | 'success' | 'warning';
	label: string;
	autoHideTimeout: number;
	hideButton: boolean;
	replace: boolean;
}

export interface IntervalType {
	label?: string;
	value?: string;
}

export interface GalAccountType {
	id: string;
	name: string;
	server: string;
}

export interface AccountDataType {
	id?: string;
	name?: string;
	galAccount?: GalAccountType | null;
}

export interface DomainDataType {
	zimbraGalMaxResults: string;
	zimbraGalAccountId?: string;
	zimbraGalMode?: string;
	zimbraDataSourcePollingInterval?: string;
	zimbraGalLdapPageSize: string;
	zimbraGalLdapURL?: string;
	zimbraGalLdapStartTlsEnabled?: string;
	zimbraGalLdapSearchBase?: string;
	zimbraGalLdapFilter?: string;
	zimbraGalLdapBindDn?: string;
	zimbraGalLdapBindPassword?: string;
	zimbraGalLdapAuthMech?: string;
	zimbraDataSourceGalPollingInterval?: string;
	zimbraId?: string;
	zimbraGalLdapPageSizets?: string;
}

export type themeConfigStore = {
	carbonioWebUiDarkMode?: boolean;
	carbonioWebUiLoginLogo?: string;
	carbonioWebUiDarkLoginLogo?: string;
	carbonioWebUiLoginBackground?: string;
	carbonioWebUiDarkLoginBackground?: string;
	carbonioWebUiAppLogo?: string;
	carbonioWebUiDarkAppLogo?: string;
	carbonioWebUiFavicon?: string;
	carbonioWebUiTitle?: string;
	carbonioWebUiDescription?: string;
	carbonioAdminUiLoginLogo?: string;
	carbonioAdminUiDarkLoginLogo?: string;
	carbonioAdminUiAppLogo?: string;
	carbonioAdminUiDarkAppLogo?: string;
	carbonioAdminUiBackground?: string;
	carbonioAdminUiDarkBackground?: string;
	carbonioAdminUiFavicon?: string;
	carbonioAdminUiTitle?: string;
	carbonioAdminUiDescription?: string;
	carbonioLogoUrl?: string;
	carbonioWebUiPrimaryColor?: string;
	carbonioWebUiDarkPrimaryColor?: string;
};

export interface IpRangeValue {
	label?: string;
	value?: string;
}

interface ChildObject {
	trustedIpRange?: string[];
	trustedDevice?: number;
}

type TwoFactorAuthPolicyValues = {
	[key: string]: ChildObject;
};

type TwoFactorPolicy = {
	label: string;
	keyToGet: string;
};

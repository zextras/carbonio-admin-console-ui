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

export type ICertificateContent = {
	fileName: string;
	content: string;
};

export type CreateSnackbarType = {
	key: string;
	type: 'error' | 'success' | 'warning';
	label: string;
	autoHideTimeout: number;
	hideButton: boolean;
	replace: boolean;
};

export type IntervalType = {
	label?: string;
	value?: string;
};

export type GalAccountType = {
	id: string;
	name: string;
	server: string;
};

export type AccountDataType = {
	id?: string;
	name?: string;
	galAccount?: GalAccountType | null;
};

export type DomainDataType = {
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
};

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
	carbonioWebUILoginURL?: string;
	carbonioWebUILogoutURL?: string;
	carbonioAdminUILoginURL?: string;
	carbonioAdminUILogoutURL?: string;
	carbonioAdminDocumentationUrl?: string;
};

export type IpRangeValue = {
	label?: string;
	value?: string;
};

type ChildObject = {
	trustedIpRange?: string[];
	trustedDevice?: number;
};

type TwoFactorAuthPolicyValues = {
	[key: string]: ChildObject;
};

type TwoFactorPolicy = {
	label: string;
	keyToGet: string;
};

export type CosMaxAccountValues = {
	id: string;
	name?: string;
	value: string;
};

type DomainResponse = {
	domain: {
		name: string;
		id: string;
		a: { n: string; _content: string }[];
	}[];
	more: boolean;
	searchTotal: number;
	_jsns: string;
};

export type DomainDisclaimerType = {
	zimbraDomainMandatoryMailSignatureEnabled: boolean;
	zimbraAmavisDomainDisclaimerText: string;
	zimbraAmavisDomainDisclaimerHTML: string;
};

type SelectItem<T = string> = {
	label: string;
	value: T;
	disabled?: boolean;
	customComponent?: React.ReactElement;
};

export type DomainsByFeature = {
	label?: string;
	value?: string;
};

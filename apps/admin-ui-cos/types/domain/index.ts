/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

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

export type TwoFactorPolicy = {
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

export interface DomainsByFeature {
	label?: string;
	value?: string;
}

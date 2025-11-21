/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type Attribute = {
	n: string;
	_content: string;
	c?: boolean;
};

export type ConfigAttributesState = {
	globalAttributes: Array<Attribute>;
	domainInformation: DomainInformationState;
	getConfigAttribute: (key: string) => string;
};

export type DomainInformationState = {
	id: string;
	name: string;
	a: Array<Attribute>;
};

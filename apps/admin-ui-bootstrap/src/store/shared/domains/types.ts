/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Attribute type for domain and COS objects
 */
interface Attribute {
	n: string;
	_content: string;
}

/**
 * Domain type representing a Zimbra domain
 */
export type Domain = {
	id?: string;
	name?: string;
	a?: Array<Attribute>;
};

/**
 * Class of Service (COS) type
 */
export type Cos = {
	id?: string;
	name?: string;
	isDefaultCos?: boolean;
	a?: Array<Attribute>;
};

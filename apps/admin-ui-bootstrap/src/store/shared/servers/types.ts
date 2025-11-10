/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Attribute type for server objects
 */
export interface Attribute {
	n: string;
	_content: string;
}

/**
 * Server type representing a Zimbra server
 */
export type Server = {
	id?: string;
	name?: string;
	a?: Array<Attribute>;
};

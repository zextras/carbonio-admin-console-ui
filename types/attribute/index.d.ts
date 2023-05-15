/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type Attribute = {
	n: string;
	_content: string;
};

export type objectType = { [key: string]: string };

export type objAll = { [key: string]: string | boolean | number };

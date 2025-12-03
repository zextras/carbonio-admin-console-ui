/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type DomainResponse = {
	domain: {
		name: string;
		id: string;
		a: { n: string; _content: string }[];
	}[];
	more: boolean;
	searchTotal: number;
	_jsns: string;
};

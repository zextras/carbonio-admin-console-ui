/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type TRow = {
	id: string | unknown;
	columns: Array<string | React.ReactElement>;
	highlight?: boolean;
	clickable?: boolean;
	onClick?: React.ReactEventHandler;
	index?: number;
};

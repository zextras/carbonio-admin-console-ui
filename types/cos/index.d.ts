/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Attribute } from '../attribute';

export type Cos = {
	id?: string;
	name?: string;
	isDefaultCos?: boolean;
	a?: Array<Attribute>;
};

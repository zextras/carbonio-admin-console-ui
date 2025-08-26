/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createContext } from 'react';

type AclListContext = {
	aclListDetail: any;
	setAclListDetail: (arg: any) => void;
};
export const AclListContext = createContext({} as AclListContext);

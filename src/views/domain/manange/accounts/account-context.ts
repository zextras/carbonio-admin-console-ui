/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createContext } from 'react';

type AccountContext = {
	accountDetail: any;
	directMemberList: any[];
	inDirectMemberList: any[];
	setSignatureItems: (arg: any) => void;
	setSignatureList: (arg: any) => void;
	setAccountDetail: (arg: any) => void;
	setDirectMemberList: (arg: any) => void;
	setInDirectMemberList: (arg: any) => void;
	setInitAccountDetail: (arg: any) => void;
	initAccountDetail: any;
};
export const AccountContext = createContext({} as AccountContext);

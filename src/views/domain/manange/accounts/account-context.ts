/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createContext } from 'react';

type AccountContext = {
	accountDetail: any;
	cosDetail: any;
	accSpecificDetail: any;
	directMemberList: any[];
	inDirectMemberList: any[];
	setSignatureItems: (arg: any) => void;
	setSignatureList: (arg: any) => void;
	setAccountDetail: (arg: any) => void;
	setAccSpecificDetail: (arg: any) => void;
	setDirectMemberList: (arg: any) => void;
	setInDirectMemberList: (arg: any) => void;
	setInitAccountDetail: (arg: any) => void;
	initAccountDetail: any;
	otpList: any;
	identitiesList: any[];
	folderList: any[];
	setFolderList: (arg: any) => void;
	getListOtp: any;
	getIdentitiesList: any;
	deligateDetail: any;
	setDeligateDetail: (arg: any) => void;
	credentialList: any;
	getCredentialList: any;
	initialGlobalRights: any;
	setinitialGlobalRights: (arg: any) => void;
	globalRights: any;
	setGlobalRights: (arg: any) => void;
	deleteAdministrationRights: any[];
	setDeleteAdministrationRights: (arg: any) => void;
	userSessionList: any[];
	setAllUserSessionList: (arg: any) => void;
	allUserSessionList: any[];
	setUserSessionList: (arg: any) => void;
};
export const AccountContext = createContext({} as AccountContext);

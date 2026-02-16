/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createContext, Dispatch, SetStateAction } from 'react';

import { TOTAL_COMPUTED_QUOTA_LIMIT } from '../../../../constants';

export type AccountDetail = Record<string, any> & {
	[TOTAL_COMPUTED_QUOTA_LIMIT]?: number;
}

type AccountContext = {
	accountDetail: AccountDetail;
	setAccountDetail: Dispatch<SetStateAction<AccountDetail>>;
	initAccountDetail: AccountDetail;
	setInitAccountDetail: Dispatch<SetStateAction<AccountDetail>>;
	accSpecificDetail: any;
	setAccSpecificDetail: (arg: any) => void;
	cosDetail: any;
	directMemberList: any[];
	inDirectMemberList: any[];
	setSignatureItems: (arg: any) => void;
	setSignatureList: (arg: any) => void;
	setDirectMemberList: (arg: any) => void;
	setInDirectMemberList: (arg: any) => void;
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
	defaultCOS: any;
	setDefaultCOS: (arg: any) => void;
	allowedDeletePassword: boolean;
	setAllowedDeletePassword: (arg: boolean) => void;
};
export const AccountContext = createContext({} as AccountContext);

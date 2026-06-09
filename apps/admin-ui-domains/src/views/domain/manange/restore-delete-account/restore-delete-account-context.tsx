/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createContext, Dispatch, SetStateAction } from 'react';

export type RestoreAccountDetail = {
	name: string;
	id: string;
	createDate: string;
	status: string;
	copyAccount: string;
	dateTime: string | null;
	lastAvailableStatus: boolean;
	hsmApply: boolean;
	dataSource: boolean;
	isEmailNotificationEnable: boolean;
	notificationReceiver: string;
	copyDomain: string;
	serverName: string;
};

type RestoreDeleteAccountContextValue = {
	restoreAccountDetail: RestoreAccountDetail | null;
	setRestoreAccountDetail: Dispatch<SetStateAction<RestoreAccountDetail>>;
};
export const RestoreDeleteAccountContext = createContext({} as RestoreDeleteAccountContextValue);

/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createContext } from 'react';

type RestoreDeleteAccountContext = {
	restoreAccountDetail: any;
	setRestoreAccountDetail: (arg: any) => void;
};
export const RestoreDeleteAccountContext = createContext({} as RestoreDeleteAccountContext);

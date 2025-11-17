/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { goTo, goToLogin } from './go-to-login';
import { useLoginConfigStore } from '../store/login/store';

export const logout = (): Promise<void> =>
	fetch('/logout', { redirect: 'manual' })
		.then(() => {
			const customLogoutUrl = useLoginConfigStore.getState().carbonioAdminUiLogoutURL;
			customLogoutUrl ? goTo(customLogoutUrl) : goToLogin();
		})
		.catch((error) => {
			console.error(error);
		});

/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TFunction } from 'i18next';
import { produce } from 'immer';

import { AppState } from '../../../types';
import { SHELL_APP_ID } from '../../constants';
import DevBoardTrigger from '../../dev/dev-board-trigger';
import { useAppStore } from '../../store/app';

const devModeTrigger = {
	id: 'dev-mode-t',
	component: DevBoardTrigger,
	label: 'Dev Tools',
	app: SHELL_APP_ID,
	position: 100
};
export const registerDefaultViews = (t: TFunction): void => {
	useAppStore.setState(
		produce((s: AppState) => {
			if (__CARBONIO_DEV__) {
				s.views.primaryBarAccessories.push(devModeTrigger);
			}
		})
	);
};

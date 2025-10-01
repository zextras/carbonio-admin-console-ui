/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';

import { Button } from '@zextras/carbonio-design-system';

import { SHELL_APP_ID } from '../constants';
import { useContextBridge } from '../store/context-bridge';

const DevBoardTrigger: FC = () => (
	<Button
		type="ghost"
		color={'text'}
		icon="Code"
		size="large"
		onClick={(): void =>
			useContextBridge.getState().packageDependentFunctions?.addBoard(SHELL_APP_ID)('/devtools/', {
				title: 'Dev Tools'
			})
		}
	/>
);

export default DevBoardTrigger;

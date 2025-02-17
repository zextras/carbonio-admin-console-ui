/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable react-hooks/rules-of-hooks */
/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';

import { Container } from '@zextras/carbonio-design-system';

import { WscSettings } from './wsc-settings';

const WscCosSettings: FC = () => (
	<Container mainAlignment="flex-start" background="gray6" padding={{ all: 'large' }}>
		<WscSettings />
	</Container>
);

export default WscCosSettings;
